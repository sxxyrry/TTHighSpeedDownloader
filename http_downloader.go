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

// DownloadSnapshot 实时进度快照（类似 Rust 的 DownloadSnapshot）
type DownloadSnapshot struct {
	Downloaded           int64   `json:"downloaded"`
	TotalSize            int64   `json:"total_size"`
	ProgressPercentage   float64 `json:"progress_percentage"`
	IsFinished           bool    `json:"is_finished"`
	ErrorMessage         string  `json:"error_message,omitempty"`
	CurrentSpeedBPS      float64 `json:"current_speed_bps"`
	AverageSpeedBPS      float64 `json:"average_speed_bps"`
	ElapsedSeconds       float64 `json:"elapsed_seconds"`
}

// DownloadStatus 状态管理（类似 Rust 的 DownloadStatus）
type DownloadStatus struct {
	totalSize    int64
	downloaded   int64
	errorMessage string
	startTime    time.Time
	mu           sync.RWMutex
}

func NewDownloadStatus(totalSize int64) *DownloadStatus {
	return &DownloadStatus{
		totalSize: totalSize,
		startTime: time.Now(),
	}
}

func (ds *DownloadStatus) SetError(msg string) {
	ds.mu.Lock()
	defer ds.mu.Unlock()
	ds.errorMessage = msg
}

func (ds *DownloadStatus) GetError() string {
	ds.mu.RLock()
	defer ds.mu.RUnlock()
	return ds.errorMessage
}

func (ds *DownloadStatus) AddDownloaded(bytes int64) {
	ds.mu.Lock()
	defer ds.mu.Unlock()
	ds.downloaded += bytes
}

func (ds *DownloadStatus) GetDownloaded() int64 {
	ds.mu.RLock()
	defer ds.mu.RUnlock()
	return ds.downloaded
}

func (ds *DownloadStatus) Snapshot(currentSpeed, averageSpeed float64) DownloadSnapshot {
	ds.mu.RLock()
	defer ds.mu.RUnlock()

	progressPercentage := 0.0
	if ds.totalSize > 0 {
		progressPercentage = (float64(ds.downloaded) / float64(ds.totalSize)) * 100.0
	}

	isFinished := ds.downloaded >= ds.totalSize || ds.errorMessage != ""

	return DownloadSnapshot{
		Downloaded:         ds.downloaded,
		TotalSize:          ds.totalSize,
		ProgressPercentage: progressPercentage,
		IsFinished:         isFinished,
		ErrorMessage:       ds.errorMessage,
		CurrentSpeedBPS:    currentSpeed,
		AverageSpeedBPS:    averageSpeed,
		ElapsedSeconds:     time.Since(ds.startTime).Seconds(),
	}
}

// HTTPDownloader 高性能 HTTP 下载器
type HTTPDownloader struct {
	BaseDownloader
	client  *http.Client
	monitor *PerformanceMonitor
	status  *DownloadStatus
}

// NewHTTPDownloader 创建 HTTP 下载器实例
func NewHTTPDownloader(config *DownloadConfig) *HTTPDownloader {
	// 优化超时设置，参考 Rust 实现：连接 15s，读取数据块 30s
	transport := &http.Transport{
		Proxy:                 http.ProxyFromEnvironment,
		MaxIdleConns:          config.ThreadCount * 2,
		MaxIdleConnsPerHost:   config.ThreadCount,
		MaxConnsPerHost:       config.ThreadCount * 2,
		IdleConnTimeout:       90 * time.Second,
		TLSHandshakeTimeout:   15 * time.Second,
		ExpectContinueTimeout: 1 * time.Second,
		DisableCompression:    true,
		ForceAttemptHTTP2:     true,
		ReadBufferSize:        64 * 1024,
		WriteBufferSize:       64 * 1024,
		DialContext: (&net.Dialer{
			Timeout:   15 * time.Second,
			KeepAlive: 30 * time.Second,
		}).DialContext,
		ResponseHeaderTimeout: 30 * time.Second,
	}

	return &HTTPDownloader{
		BaseDownloader: BaseDownloader{
			config:  config,
			running: true,
		},
		client: &http.Client{
			Transport: transport,
			Timeout:   0, // 使用 context 控制超时
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

	// 初始化 DownloadStatus
	d.status = NewDownloadStatus(fileSize)

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
		lastUpdateTime time.Time
	)

	numWorkers := d.config.ThreadCount
	if numWorkers <= 0 {
		numWorkers = runtime.NumCPU() * 2
	}
	if numWorkers > 32 {
		numWorkers = 32
	}

	lastUpdateTime = time.Now()

	// 启动错误监控
	errorsChan := make(chan error, numWorkers)
	go func() {
		for err := range errorsChan {
			if err != nil && !errors.Is(err, context.Canceled) {
				d.status.SetError(err.Error())
				d.sendErrorMessage(fmt.Sprintf("worker error: %v", err))
			}
		}
	}()

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
				err := d.downloadChunk(ctx, task, file, chunk, &downloadedSize, fileSize, &mu, &lastUpdateTime)
				if err != nil {
					errorsChan <- fmt.Errorf("worker %d failed: %w", workerID, err)
				}
			}
		}(i)
	}

	wg.Wait()
	close(errorsChan)

	currentSize := atomic.LoadInt64(&downloadedSize)
	if currentSize != fileSize && ctx.Err() == nil && d.status.GetError() == "" {
		return fmt.Errorf("download incomplete: %d/%d bytes", currentSize, fileSize)
	}
	return ctx.Err()
}

// downloadChunk 下载单个分块
func (d *HTTPDownloader) downloadChunk(ctx context.Context, task DownloadTask, file *os.File, chunk DownloadChunk, downloadedSize *int64, totalSize int64, mu *sync.Mutex, lastUpdateTime *time.Time) error {
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

	// 批量更新阈值（类似 Rust 的 512KB）
	const batchUpdateThreshold = 512 * 1024

	// 本地累积下载量，减少原子操作频率
	localDownloaded := int64(0)

	progressReader := &ProgressReader{
		Reader: resp.Body,
		OnRead: func(n int) {
			localDownloaded += int64(n)
			lastRead = time.Now()

			// 降低原子操作频率：只在大块下载后更新
			if localDownloaded >= batchUpdateThreshold {
				atomic.AddInt64(downloadedSize, localDownloaded)
				if d.monitor != nil {
					d.monitor.AddBytes(localDownloaded)
				}
				localDownloaded = 0
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
				// 写入剩余的累积下载量
				if localDownloaded > 0 {
					atomic.AddInt64(downloadedSize, localDownloaded)
					if d.monitor != nil {
						d.monitor.AddBytes(localDownloaded)
					}
				}
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

// GetSnapshot 获取下载状态快照（类似 Rust 的 snapshot 方法）
func (d *HTTPDownloader) GetSnapshot() interface{} {
	if d.status == nil {
		return DownloadSnapshot{}
	}

	var currentSpeed, averageSpeed float64
	if d.monitor != nil {
		stats := d.monitor.GetStats()
		currentSpeed = stats["current_speed_bps"].(float64)
		averageSpeed = stats["average_speed_bps"].(float64)
	}

	return d.status.Snapshot(currentSpeed, averageSpeed)
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
