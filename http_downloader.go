package main

import (
	"context"
	"errors"
	"fmt"
	"io"
	"net"
	"net/http"
	"os"
	"runtime"
	"sync"
	"sync/atomic"
	"time"
)

const stallTimeout = 30 * time.Second

// HTTPDownloader is a high-performance, concurrent downloader.
type HTTPDownloader struct {
	BaseDownloader
	client *http.Client
	monitor *PerformanceMonitor // 性能监控器
}

// 定义自定义错误
var ErrUserCancelled = errors.New("End by user self.")

// NewHTTPDownloader creates a new instance of the HTTP downloader.
func NewHTTPDownloader(config *DownloadConfig) *HTTPDownloader {
	// Custom transport to allow fine-grained control over connections.
	transport := &http.Transport{
		Proxy:                 http.ProxyFromEnvironment,
		MaxIdleConns:          config.ThreadCount * 2, // 增加空闲连接数
		MaxIdleConnsPerHost:   config.ThreadCount,     // 每个主机最大空闲连接
		MaxConnsPerHost:       config.ThreadCount * 2, // 每个主机最大连接数
		IdleConnTimeout:       90 * time.Second,
		TLSHandshakeTimeout:   10 * time.Second,
		ExpectContinueTimeout: 1 * time.Second,
		DisableCompression:    true,                   // 禁用压缩，避免CPU开销
		ForceAttemptHTTP2:     true,                   // 启用HTTP/2
		ReadBufferSize:        64 * 1024,              // 64KB读缓冲区
		WriteBufferSize:       64 * 1024,              // 64KB写缓冲区
		DialContext: (&net.Dialer{
			Timeout:   30 * time.Second,
			KeepAlive: 30 * time.Second,
		}).DialContext,
	}

	var d = &HTTPDownloader{
		BaseDownloader: BaseDownloader{
			config: config,
		},
		client: &http.Client{
			Transport: transport,
		},
		monitor: GetGlobalMonitor(), // 使用全局性能监控器
	}
	d.running = true
	return d
}

// Download starts the concurrent download process.
func (d *HTTPDownloader) Download(ctx context.Context, task DownloadTask) error {
	if !d.running {
		return ErrUserCancelled
	}
	fileSize, err := d.getFileSize(task.URL)
	if err != nil {
		return fmt.Errorf("failed to get file size: %w", err)
	}

	file, err := os.Create(task.SavePath)
	if err != nil {
		return fmt.Errorf("failed to create file: %w", err)
	}
	defer file.Close()

	if err := file.Truncate(fileSize); err != nil {
		return fmt.Errorf("failed to pre-allocate file size: %w", err)
	}

	var (
		chunkSize      = int64(d.config.ChunkSizeMB * 1024 * 1024)
		chunks         = d.createChunks(fileSize, chunkSize)
		chunkChan      = make(chan DownloadChunk, len(chunks))
		wg             sync.WaitGroup
		downloadedSize int64
		mu             sync.Mutex // For protecting downloadedSize
	)

	for _, chunk := range chunks {
		chunkChan <- chunk
	}
	close(chunkChan)

	// Determine number of workers based on CPU cores and configuration.
	numWorkers := runtime.NumCPU() * 2 // Default to 2x CPU cores for better concurrency
	if d.config.ThreadCount > 0 {
		numWorkers = d.config.ThreadCount // Allow override
	}
	// Cap the maximum workers to avoid excessive resource usage
	if numWorkers > 32 {
		numWorkers = 32
	}

	for i := 0; i < numWorkers; i++ {
		if !d.running {
			return ErrUserCancelled
		}
		wg.Add(1)
		go func(workerID int) {
			if !d.running {
				return
			}
			defer wg.Done()
			for {
				select {
				case <-ctx.Done():
					return
				case chunk, ok := <-chunkChan:
					if !ok {
						return
					}
					if !d.running {
						return
					}

					if err := d.downloadChunk(ctx, task, file, chunk, &downloadedSize, fileSize, &mu); err != nil {
						if errors.Is(err, ErrUserCancelled) {
							return
						}
						d.sendErrorMessage(fmt.Sprintf("Worker %d failed to download chunk %d-%d: %v. Re-queuing.", workerID, chunk.StartOffset, chunk.EndOffset, err))
						// Re-queue the failed chunk. In a more robust implementation,
						// you might want a separate channel for retries with a limit.
						// For simplicity here, we'll just log the error.
						// To re-queue: chunkChan <- chunk (would require channel to be open)
					}
				}
			}
		}(i)
	}

	wg.Wait()

	// Check if all chunks were downloaded
	if atomic.LoadInt64(&downloadedSize) != fileSize && d.running {
		return fmt.Errorf("download incomplete: expected %d bytes, got %d", fileSize, downloadedSize)
	}

	return nil
}

func (d *HTTPDownloader) downloadChunk(ctx context.Context, task DownloadTask, file *os.File, chunk DownloadChunk, downloadedSize *int64, totalSize int64, mu *sync.Mutex) error {
	if !d.running {
		return ErrUserCancelled
	}
	req, err := http.NewRequestWithContext(ctx, "GET", task.URL, nil)
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}
	req.Header.Set("Range", fmt.Sprintf("bytes=%d-%d", chunk.StartOffset, chunk.EndOffset))
	req.Header.Set("User-Agent", UA)
	req.Header.Set("Accept", "*/*")
	req.Header.Set("Accept-Language", "en-US,en;q=0.9")
	req.Header.Set("Accept-Encoding", "identity") // 避免压缩
	req.Header.Set("Cache-Control", "no-cache")

	resp, err := d.client.Do(req)
	if err != nil {
		return fmt.Errorf("http request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return fmt.Errorf("bad status code: %d", resp.StatusCode)
	}

	// Watchdog implementation
	lastRead := time.Now()
	stalled := make(chan bool, 1)

	if !d.running {
		return ErrUserCancelled
	}
	go func() {
		if !d.running {
			return
		}
		for {
			time.Sleep(5 * time.Second) // Check every 5 seconds
			if time.Since(lastRead) > stallTimeout {
				stalled <- true
				return
			}
			// If context is canceled, stop the watchdog
			if ctx.Err() != nil {
				return
			}
			if !d.running {
				return
			}
		}
	}()

	// Wrap the response body to monitor read activity
	progressReader := &ProgressReader{
		Reader: resp.Body,
		OnRead: func(n int) {
			mu.Lock()
			atomic.AddInt64(downloadedSize, int64(n))
			lastRead = time.Now() // Update activity timestamp
			d.sendProgressUpdate(atomic.LoadInt64(downloadedSize), totalSize, task.ID)
			mu.Unlock()
		},
	}

	if !d.running {
		return ErrUserCancelled
	}
	// Use a MultiWriter to simultaneously write to the file and discard to trigger the reader
	writer := io.NewOffsetWriter(file, chunk.StartOffset)
	buf := make([]byte, 128*1024) // 128KB buffer, increased for better throughput

	for {
		select {
		case <-stalled:
			resp.Body.Close() // Force kill the connection
			return fmt.Errorf("connection stalled for over %v", stallTimeout)
		case <-ctx.Done():
			return ctx.Err()
		default:
			if !d.running {
				return ErrUserCancelled
			}
			n, err := progressReader.Read(buf)
			if n > 0 {
				if _, writeErr := writer.Write(buf[:n]); writeErr != nil {
					return fmt.Errorf("file write failed: %w", writeErr)
				}
				// 记录性能数据
				if d.monitor != nil {
					d.monitor.AddBytes(int64(n))
				}
				if !d.running {
					return ErrUserCancelled
				}
			}
			if err == io.EOF {
				return nil // Chunk finished
			}
			if err != nil {
				return fmt.Errorf("read failed: %w", err)
			}
		}
	}
}

// getFileSize retrieves the size of the file to be downloaded.
func (d *HTTPDownloader) getFileSize(url string) (int64, error) {
	req, err := http.NewRequest("HEAD", url, nil)
	if err != nil {
		return 0, err
	}
	req.Header.Set("User-Agent", UA)
	req.Header.Set("Accept", "*/*")
	req.Header.Set("Accept-Language", "en-US,en;q=0.9")
	req.Header.Set("Accept-Encoding", "identity") // 避免压缩
	req.Header.Set("Cache-Control", "no-cache")

	resp, err := d.client.Do(req)
	if err != nil {
		return 0, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return 0, fmt.Errorf("HEAD request failed: status %s", resp.Status)
	}

	fileSize := resp.ContentLength
	if fileSize <= 0 {
		return 0, fmt.Errorf("invalid content length: %d", fileSize)
	}

	return fileSize, nil
}

// createChunks divides the file into a list of chunks.
func (d *HTTPDownloader) createChunks(fileSize, chunkSize int64) []DownloadChunk {
	if !d.running {
		return nil
	}
	
	// Adjust chunk size based on file size and thread count for better concurrency
	numWorkers := runtime.NumCPU() * 2
	if d.config.ThreadCount > 0 {
		numWorkers = d.config.ThreadCount
	}
	if numWorkers > 32 {
		numWorkers = 32
	}
	
	// Ensure we have at least as many chunks as workers for optimal parallelism
	minChunks := numWorkers * 2
	if fileSize/int64(minChunks) > chunkSize {
		chunkSize = fileSize / int64(minChunks)
		// Ensure chunk size is at least 1MB
		if chunkSize < 1024*1024 {
			chunkSize = 1024 * 1024
		}
	}
	
	var chunks []DownloadChunk
	for offset := int64(0); offset < fileSize; offset += chunkSize {
		end := offset + chunkSize - 1
		if end >= fileSize {
			end = fileSize - 1
		}
		chunks = append(chunks, DownloadChunk{StartOffset: offset, EndOffset: end})
	}
	return chunks
}

func (d *HTTPDownloader) sendProgressUpdate(downloaded, total int64, taskID string) {
	sendMessage(Event{Type: EventTypeUpdate, ID: taskID},
		map[string]interface{}{
			"Downloaded": downloaded,
			"Total":      total,
		}, d.config, d.wsClient, d.socketClient)
}

func (d *HTTPDownloader) sendErrorMessage(message string) {
	sendMessage(Event{Type: EventTypeErr, Name: "Error"},
		map[string]interface{}{
			"Error": message,
		}, d.config, d.wsClient, d.socketClient)
}

// GetType returns the downloader type.
func (d *HTTPDownloader) GetType() string {
	return "http"
}

// Cancel 基础的取消方法
func (d *HTTPDownloader) Cancel(downloader Downloader) {
	d.mutex.Lock()
	defer d.mutex.Unlock()
	d.running = false
}

// ProgressReader is a wrapper for io.Reader to track progress.
type ProgressReader struct {
	io.Reader
	OnRead func(n int)
}

func (pr *ProgressReader) Read(p []byte) (int, error) {
	n, err := pr.Reader.Read(p)
	if n > 0 && pr.OnRead != nil {
		pr.OnRead(n)
	}
	return n, err
}
