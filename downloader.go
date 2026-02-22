package main

import (
	"context"
	"fmt"
	"runtime"
	// "strings"
	"sync"
	// "time"
)

// ProgressCallback 定义进度回调函数类型
type ProgressCallback func(Event, map[string]interface{})

const UA string = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"

// DownloadTask 下载任务信息
type DownloadTask struct {
	URL      string // 下载链接
	SavePath string // 保存路径
	ShowName string // 显示名称
	ID       string // ID
}

// DownloadConfig 下载配置
type DownloadConfig struct {
	Tasks          []DownloadTask // 下载任务列表
	ThreadCount    int
	ChunkSizeMB    int
	CallbackFunc   ProgressCallback
	useCallbackURL bool
	CallbackURL    *string
	useSocket      *bool
	ShowName       string
	userAgent      string
}

// DownloadChunk 下载块信息
type DownloadChunk struct {
	StartOffset int64
	EndOffset   int64
	Done        bool
}

// EventType 定义事件类型枚举
type EventType string

// 定义可用的事件类型常量
const (
	EventTypeStart     EventType = "start"
	EventTypeStartOne  EventType = "startOne"
	EventTypeUpdate    EventType = "update"
	EventTypeEnd       EventType = "end"
	EventTypeEndOne    EventType = "endOne"
	EventTypeMsg       EventType = "msg"
	EventTypeErr       EventType = "err"
)

// Event 下载事件
type Event struct {
	Type     EventType
	Name     string
	ShowName string
	ID       string
}

// ProgressEvent 用于传输进度更新的数据
type ProgressEvent struct {
	Total      int64
	Downloaded int64
}

// FastDownloader 高速下载器（支持多种下载协议）
type HSDownloader struct {
	config           *DownloadConfig
	wsClient         *WebSocketClient
	socketClient     *SocketClient
	mutex            sync.Mutex
	cancel           context.CancelFunc
	currentTaskIndex int // 当前下载的任务索引
	Downloader       Downloader
}

// GetDownloader 创建新的下载器实例（支持多个任务）
func GetDownloader(tasks []DownloadTask, threadCount int, chunkSizeMB int) *HSDownloader {
	// 如果threadCount为0或负数，则根据CPU核心数自动分配
	if threadCount <= 0 {
		threadCount = runtime.NumCPU() * 2 // 默认线程数为CPU核心数的2倍
	}
	// // 限制最大线程数避免资源过度占用
	// if threadCount > 32 {
	// 	threadCount = 32
	// }

	// 如果chunkSizeMB为0或负数，则根据文件大小自动计算
	if chunkSizeMB <= 0 {
		chunkSizeMB = 10 // 默认10MB分块
	}

	config := &DownloadConfig{
		Tasks:       tasks,
		ThreadCount: threadCount,
		ChunkSizeMB: chunkSizeMB,
	}

	return NewHSDownloader(config)
}

// NewHSDownloader 创建新的下载器实例
func NewHSDownloader(config *DownloadConfig) *HSDownloader {
	hsd := &HSDownloader{
		config: config,
	}

	// 增加更安全的空值检查
	if config.useCallbackURL && config.CallbackURL != nil && config.useSocket != nil {
		if *config.useSocket {
			hsd.socketClient = NewSocketClient(*config.CallbackURL)
		} else {
			hsd.wsClient = NewWebSocketClient(*config.CallbackURL)
		}
	}

	return hsd
}

// StartDownload 启动下载任务（支持多个任务顺序下载）
func (hsd *HSDownloader) StartDownload() error {
	sendMessage(Event{
		Type:     EventTypeStart,
		Name:     "开始下载",
		ShowName: "全局",
	}, map[string]interface{}{}, hsd.config, hsd.wsClient, hsd.socketClient)

	// 顺序下载每个任务
	monitor := GetGlobalMonitor()
	for i, task := range hsd.config.Tasks {
		hsd.currentTaskIndex = i

		// 通知开始下载当前文件
		sendMessage(Event{
			Type:     EventTypeStartOne,
			Name:     "开始一个下载",
			ShowName: task.ShowName,
			ID:       task.ID,
		}, map[string]interface{}{
			"URL":      task.URL,
			"SavePath": task.SavePath,
			"ShowName": task.ShowName,
			"Index":    i + 1,
			"Total":    len(hsd.config.Tasks),
		}, hsd.config, hsd.wsClient, hsd.socketClient)

		// 根据任务类型选择相应的下载器
		var downloader Downloader
		// if strings.HasPrefix(task.URL, "ed2k://") {
		// 	downloader = NewEd2kDownloader(hsd.config)
		// } else {
		// 	downloader = NewHTTPDownloader(hsd.config)
		// }
		// if strings.HasPrefix(task.URL, "ed2k://") {
		// 	downloader = NewED2KDownloader(hsd.config)
		// } else if strings.HasPrefix(task.URL, "magnet:") || strings.HasSuffix(task.URL, ".torrent") {
		// 	downloader = NewBTDownloader(hsd.config)
		// } else if strings.HasPrefix(task.URL, "ftp://") {
		// 	downloader = NewFTPDownloader(hsd.config)
		// } else {
		// 	downloader = NewHTTPDownloader(hsd.config)
		// }
		downloader = NewHTTPDownloader(hsd.config)

		hsd.Downloader = downloader

		// 执行单个文件下载
		ctx := context.Background()
		if err := downloader.Download(ctx, task); err != nil {
			sendMessage(Event{
				Type:     EventTypeErr,
				Name:     "错误",
				ShowName: task.ShowName,
				ID:       task.ID,
			}, map[string]interface{}{
				"Text": fmt.Sprintf("下载文件失败 %s: %v", task.URL, err),
			}, hsd.config, hsd.wsClient, hsd.socketClient)

			// 即使下载失败也要发送 endOne 事件
			sendMessage(Event{
				Type:     EventTypeEndOne,
				Name:     "结束一个下载",
				ShowName: task.ShowName,
				ID:       task.ID,
			}, map[string]interface{}{
				"URL":      task.URL,
				"SavePath": task.SavePath,
				"ShowName": task.ShowName,
				"Index":    i + 1,
				"Total":    len(hsd.config.Tasks),
			}, hsd.config, hsd.wsClient, hsd.socketClient)

			// 继续下一个任务，不要中断整个下载流程
			continue
		}

		// 成功下载后发送 endOne 事件
		sendMessage(Event{
			Type:     EventTypeEndOne,
			Name:     "结束一个下载",
			ShowName: task.ShowName,
			ID:       task.ID,
		}, map[string]interface{}{
			"URL":      task.URL,
			"SavePath": task.SavePath,
			"ShowName": task.ShowName,
			"Index":    i + 1,
			"Total":    len(hsd.config.Tasks),
		}, hsd.config, hsd.wsClient, hsd.socketClient)
	}

	// 发送全局结束事件
	sendMessage(Event{
		Type:     EventTypeEnd,
		Name:     "结束所有下载",
		ShowName: "全局",
	}, map[string]interface{}{}, hsd.config, hsd.wsClient, hsd.socketClient)

	// 打印性能统计
	if monitor != nil {
		monitor.PrintStats()
	}
	return nil
}

// StopDownload 停止下载并清理所有资源
func (hsd *HSDownloader) StopDownload() error {
    // 首先暂停下载
    hsd.PauseDownload()
    
    // 发送停止消息
    sendMessage(Event{
        Type:     EventTypeMsg,
        Name:     "停止",
        ShowName: "全局",
    }, map[string]interface{}{
        "Text": "下载已停止",
    }, hsd.config, hsd.wsClient, hsd.socketClient)
    
    // 清理WebSocket客户端
    if hsd.wsClient != nil {
        hsd.wsClient.Close()
    }
    
    // 清理Socket客户端
    if hsd.socketClient != nil {
        hsd.socketClient.Close()
    }
    
    // 重置下载器状态
    hsd.currentTaskIndex = 0
    
    return nil
}

// StartMultipleDownloads 并行启动多个下载任务
func (hsd *HSDownloader) StartMultipleDownloads() error {
	// 发送批量开始事件
	sendMessage(Event{
		Type:     EventTypeStart,
		Name:     "开始批量下载",
		ShowName: "全局",
	}, map[string]interface{}{}, hsd.config, hsd.wsClient, hsd.socketClient)

	var wg sync.WaitGroup
	// 增加错误通道缓冲区，避免阻塞
	errChan := make(chan error, len(hsd.config.Tasks)*2)

	for i, task := range hsd.config.Tasks {
		wg.Add(1)
		go func(taskIndex int, t DownloadTask) {
			defer wg.Done()

			// 通知开始下载当前文件
			sendMessage(Event{
				Type:     EventTypeStartOne,
				Name:     "开始一个下载",
				ShowName: t.ShowName,
				ID:       t.ID,
			}, map[string]interface{}{
				"URL":      t.URL,
				"SavePath": t.SavePath,
				"ShowName": t.ShowName,
				"Index":    taskIndex + 1,
				"Total":    len(hsd.config.Tasks),
			}, hsd.config, hsd.wsClient, hsd.socketClient)

			// 根据任务类型选择相应的下载器
			var downloader Downloader
			// if strings.HasPrefix(t.URL, "ed2k://") {
			// 	downloader = NewEd2kDownloader(hsd.config)
			// } else {
			// 	downloader = NewHTTPDownloader(hsd.config)
			// }

			downloader = NewHTTPDownloader(hsd.config)

			hsd.Downloader = downloader

			// 执行单个文件下载
			ctx, cancel := context.WithCancel(context.Background())
			defer cancel()

			if err := downloader.Download(ctx, t); err != nil {
				sendMessage(Event{
					Type:     EventTypeErr,
					Name:     "错误",
					ShowName: t.ShowName,
					ID:       t.ID,
				}, map[string]interface{}{
					"Error": fmt.Sprintf("下载文件失败 %s: %v", t.URL, err),
				}, hsd.config, hsd.wsClient, hsd.socketClient)

				// 即使下载失败也要发送 endOne 事件
				sendMessage(Event{
					Type:     EventTypeEndOne,
					Name:     "结束一个下载",
					ShowName: t.ShowName,
					ID:       t.ID,
				}, map[string]interface{}{
					"URL":      t.URL,
					"SavePath": t.SavePath,
					"ShowName": t.ShowName,
					"Index":    taskIndex + 1,
					"Total":    len(hsd.config.Tasks),
				}, hsd.config, hsd.wsClient, hsd.socketClient)

				select {
				case errChan <- err:
				default:
				}
				return
			}

			// 成功下载后发送 endOne 事件
			sendMessage(Event{
				Type:     EventTypeEndOne,
				Name:     "结束一个下载",
				ShowName: t.ShowName,
				ID:       t.ID,
			}, map[string]interface{}{
				"URL":      t.URL,
				"SavePath": t.SavePath,
				"ShowName": t.ShowName,
				"Index":    taskIndex + 1,
				"Total":    len(hsd.config.Tasks),
			}, hsd.config, hsd.wsClient, hsd.socketClient)
		}(i, task)
	}

	wg.Wait()
	close(errChan)

	// 检查是否有错误
	var finalErr error
	for err := range errChan {
		if err != nil {
			finalErr = err
		}
	}

	// 发送结束事件
	sendMessage(Event{
		Type:     EventTypeEnd,
		Name:     "结束批量下载",
		ShowName: "全局",
	}, map[string]interface{}{}, hsd.config, hsd.wsClient, hsd.socketClient)

	return finalErr
}

// PauseDownload 暂停下载
func (hsd *HSDownloader) PauseDownload() {
	if hsd.cancel != nil {
		hsd.cancel()
	}
	if hsd.Downloader != nil {
		hsd.Downloader.Cancel(hsd.Downloader)
	}
	sendMessage(Event{
		Type:     EventTypeMsg,
		Name:     "暂停",
		ShowName: "全局",
	}, map[string]interface{}{
		"Text": "下载已暂停",
	}, hsd.config, hsd.wsClient, hsd.socketClient)
}

// ResumeDownload 恢复下载
func (hsd *HSDownloader) ResumeDownload() error {
	sendMessage(Event{
		Type:     EventTypeMsg,
		Name:     "恢复",
		ShowName: "全局",
	}, map[string]interface{}{
		"Text": "下载已恢复",
	}, hsd.config, hsd.wsClient, hsd.socketClient)
	return hsd.StartDownload()
}
