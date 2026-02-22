package main

import (
	"context"
	"time"
	"sync"
)

// Downloader 接口定义了所有下载器的通用方法
type Downloader interface {
    Download(ctx context.Context, task DownloadTask) error
    GetType() string
    Cancel(event Downloader)
}

// BaseDownloader 包含下载器的公共属性
type BaseDownloader struct {
    totalSize      int64
    downloaded     int64
    lastDownloaded int64
    startTime      time.Time
    chunks         []DownloadChunk
    client         interface{} // 可能是http.Client或其他客户端
    wsClient       *WebSocketClient
    socketClient   *SocketClient
    mutex          sync.Mutex
    config         *DownloadConfig
    running        bool
    Downloader     Downloader
}



// Cancel 基础的取消方法
func (bd *BaseDownloader) Cancel(downloader Downloader) {
    bd.mutex.Lock()
    defer bd.mutex.Unlock()
    bd.running = false
}
