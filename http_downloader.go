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

var ErrUserCancelled = errors.New("download cancelled by user")

// HTTPDownloader 高性能 HTTP 下载器
type HTTPDownloader struct {
	BaseDownloader
	client  *http.Client
	monitor *PerformanceMonitor
}

// NewHTTPDownloader 创建 HTTP 下载器实例
func NewHTTPDownloader(config *DownloadConfig) *HTTPDownloader {
	transport := &http.Transport{
		Proxy:                 http.ProxyFromEnvironment,
		MaxIdleConns:          config.ThreadCount * 2,
		MaxIdleConnsPerHost:   config.ThreadCount,
		MaxConnsPerHost:       config.ThreadCount * 2,
		IdleConnTimeout:       90 * time.Second,
		TLSHandshakeTimeout:   10 * time.Second,
		ExpectContinueTimeout: 1 * time.Second,
		DisableCompression:    true,
		ForceAttemptHTTP2:     true,
		ReadBufferSize:        64 * 1024,
		WriteBufferSize:       64 * 1024,
		DialContext: (&net.Dialer{
			Timeout:   30 * time.Second,
			KeepAlive: 30 * time.Second,
		}).DialContext,
	}

	return &HTTPDownloader{
		BaseDownloader: BaseDownloader{
			config:  config,
			running: true,
		},
		client: &http.Client{
			Transport: transport,
		},
		monitor: GetGlobalMonitor(),
	}
}

// Download 开始下载
func (d *HTTPDownloader) Download(ctx context.Context, task DownloadTask) error {
	select {
	case <-ctx.Done():
		return ctx.Err()
	default:
	}

	fileSize, err := d.getFileSize(ctx, task.URL)
	if err != nil {
		return fmt.Errorf("failed to get file size: %w", err)
	}

	file, err := os.Create(task.SavePath)
	if err != nil {
		return fmt.Errorf("failed to create file: %w", err)
	}
	defer file.Close()

	if err := file.Truncate(fileSize); err != nil {
		return fmt.Errorf("failed to pre-allocate file: %w", err)
	}

	chunkSize := int64(d.config.ChunkSizeMB * 1024 * 1024)
	chunks := d.createChunks(fileSize, chunkSize, d.config.ThreadCount)
	chunkChan := make(chan DownloadChunk, len(chunks))
	for _, chunk := range chunks {
		chunkChan <- chunk
	}
	close(chunkChan)

	var (
		wg             sync.WaitGroup
		downloadedSize int64
		mu             sync.Mutex
	)

	numWorkers := d.config.ThreadCount
	if numWorkers <= 0 {
		numWorkers = runtime.NumCPU() * 2
	}
	if numWorkers > 32 {
		numWorkers = 32
	}

	for i := 0; i < numWorkers; i++ {
		wg.Add(1)
		go func(workerID int) {
			defer wg.Done()
			for chunk := range chunkChan {
				select {
				case <-ctx.Done():
					return
				default:
				}
				err := d.downloadChunk(ctx, task, file, chunk, &downloadedSize, fileSize, &mu)
				if err != nil && !errors.Is(err, context.Canceled) {
					d.sendErrorMessage(fmt.Sprintf("worker %d failed: %v", workerID, err))
				}
			}
		}(i)
	}

	wg.Wait()

	if atomic.LoadInt64(&downloadedSize) != fileSize && ctx.Err() == nil {
		return fmt.Errorf("download incomplete: %d/%d bytes", downloadedSize, fileSize)
	}
	return ctx.Err()
}

// downloadChunk 下载单个分块
func (d *HTTPDownloader) downloadChunk(ctx context.Context, task DownloadTask, file *os.File, chunk DownloadChunk, downloadedSize *int64, totalSize int64, mu *sync.Mutex) error {
	req, err := http.NewRequestWithContext(ctx, "GET", task.URL, nil)
	if err != nil {
		return err
	}
	req.Header.Set("Range", fmt.Sprintf("bytes=%d-%d", chunk.StartOffset, chunk.EndOffset))
	req.Header.Set("User-Agent", UA)
	req.Header.Set("Accept", "*/*")
	req.Header.Set("Accept-Language", "en-US,en;q=0.9")
	req.Header.Set("Accept-Encoding", "identity")
	req.Header.Set("Cache-Control", "no-cache")

	resp, err := d.client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return fmt.Errorf("bad status: %d", resp.StatusCode)
	}

	lastRead := time.Now()
	stalled := make(chan bool, 1)
	go func() {
		ticker := time.NewTicker(5 * time.Second)
		defer ticker.Stop()
		for {
			select {
			case <-ctx.Done():
				return
			case <-ticker.C:
				if time.Since(lastRead) > stallTimeout {
					select {
					case stalled <- true:
					default:
					}
					return
				}
			}
		}
	}()

	progressReader := &ProgressReader{
		Reader: resp.Body,
		OnRead: func(n int) {
			atomic.AddInt64(downloadedSize, int64(n))
			lastRead = time.Now()
			d.sendProgressUpdate(atomic.LoadInt64(downloadedSize), totalSize, task.ID)
			if d.monitor != nil {
				d.monitor.AddBytes(int64(n))
			}
		},
	}

	writer := io.NewOffsetWriter(file, chunk.StartOffset)
	buf := make([]byte, 128*1024)

	for {
		select {
		case <-stalled:
			return fmt.Errorf("connection stalled")
		case <-ctx.Done():
			return ctx.Err()
		default:
			n, err := progressReader.Read(buf)
			if n > 0 {
				if _, writeErr := writer.Write(buf[:n]); writeErr != nil {
					return writeErr
				}
			}
			if err == io.EOF {
				return nil
			}
			if err != nil {
				return err
			}
		}
	}
}

// getFileSize 获取文件大小
func (d *HTTPDownloader) getFileSize(ctx context.Context, url string) (int64, error) {
	req, err := http.NewRequestWithContext(ctx, "HEAD", url, nil)
	if err != nil {
		return 0, err
	}
	req.Header.Set("User-Agent", UA)

	resp, err := d.client.Do(req)
	if err != nil {
		return 0, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return 0, fmt.Errorf("HEAD failed: %s", resp.Status)
	}
	if resp.ContentLength <= 0 {
		return 0, fmt.Errorf("invalid content length: %d", resp.ContentLength)
	}
	return resp.ContentLength, nil
}

// createChunks 生成分块列表
func (d *HTTPDownloader) createChunks(fileSize, chunkSize int64, threadCount int) []DownloadChunk {
	// 根据线程数动态调整分块大小，确保至少有 threadCount*2 个分块
	minChunks := threadCount * 2
	if fileSize/int64(minChunks) > chunkSize {
		chunkSize = fileSize / int64(minChunks)
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

// sendProgressUpdate 发送进度更新
func (d *HTTPDownloader) sendProgressUpdate(downloaded, total int64, taskID string) {
	sendMessage(Event{
		Type: EventTypeUpdate,
		ID:   taskID,
	}, map[string]interface{}{
		"Downloaded": downloaded,
		"Total":      total,
	}, d.config, d.wsClient, d.socketClient)
}

// sendErrorMessage 发送错误消息
func (d *HTTPDownloader) sendErrorMessage(msg string) {
	sendMessage(Event{
		Type: EventTypeErr,
		Name: "Error",
	}, map[string]interface{}{
		"Error": msg,
	}, d.config, d.wsClient, d.socketClient)
}

// GetType 返回下载器类型
func (d *HTTPDownloader) GetType() string {
	return "http"
}

// Cancel 取消下载（实现 Downloader 接口）
func (d *HTTPDownloader) Cancel(downloader Downloader) {
	d.mutex.Lock()
	defer d.mutex.Unlock()
	d.running = false
}

// ProgressReader 包装 io.Reader 以跟踪进度
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
