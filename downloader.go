package main

import (
	"context"
	"fmt"
	"runtime"
	"sync"
)

// ProgressCallback 定义进度回调函数类型
type ProgressCallback func(Event, map[string]interface{})

const UA string = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"

// DownloadTask 下载任务信息
type DownloadTask struct {
	URL      string // 下载链接
	SavePath string // 保存路径
	ShowName string // 显示名称
	ID       string // 任务ID
}

// DownloadConfig 下载配置
type DownloadConfig struct {
	Tasks          []DownloadTask
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

// ProgressEvent 用于传输进度更新的数据（仅作为参考，实际通过 map 传递）
type ProgressEvent struct {
	Total      int64
	Downloaded int64
}

// HSDownloader 高速下载器
type HSDownloader struct {
	config           *DownloadConfig
	wsClient         *WebSocketClient
	socketClient     *SocketClient
	mutex            sync.Mutex
	ctx              context.Context
	cancel           context.CancelFunc
	currentTaskIndex int
	activeTasks      sync.WaitGroup // 跟踪所有活动任务
}

// GetDownloader 创建新的下载器实例（支持多个任务）
func GetDownloader(tasks []DownloadTask, threadCount int, chunkSizeMB int) *HSDownloader {
	if threadCount <= 0 {
		threadCount = runtime.NumCPU() * 2
	}
	if chunkSizeMB <= 0 {
		chunkSizeMB = 10
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
	if config.useCallbackURL && config.CallbackURL != nil && config.useSocket != nil {
		if *config.useSocket {
			hsd.socketClient = NewSocketClient(*config.CallbackURL)
		} else {
			hsd.wsClient = NewWebSocketClient(*config.CallbackURL)
		}
	}
	return hsd
}

// StartDownload 启动顺序下载
func (hsd *HSDownloader) StartDownload() error {
	hsd.mutex.Lock()
	if hsd.cancel != nil {
		hsd.mutex.Unlock()
		return fmt.Errorf("downloader already running")
	}
	hsd.ctx, hsd.cancel = context.WithCancel(context.Background())
	hsd.mutex.Unlock()

	// 发送全局开始事件
	sendMessage(Event{
		Type:     EventTypeStart,
		Name:     "开始下载",
		ShowName: "全局",
	}, map[string]interface{}{}, hsd.config, hsd.wsClient, hsd.socketClient)

	for i, task := range hsd.config.Tasks {
		select {
		case <-hsd.ctx.Done():
			return hsd.ctx.Err()
		default:
		}

		hsd.activeTasks.Add(1)
		go func(task DownloadTask, index int) {
			defer hsd.activeTasks.Done()
			hsd.downloadTask(task, index, len(hsd.config.Tasks))
		}(task, i)
	}

	// 等待所有任务完成
	hsd.activeTasks.Wait()

	// 发送全局结束事件
	sendMessage(Event{
		Type:     EventTypeEnd,
		Name:     "结束所有下载",
		ShowName: "全局",
	}, map[string]interface{}{}, hsd.config, hsd.wsClient, hsd.socketClient)

	// 打印性能统计
	if monitor := GetGlobalMonitor(); monitor != nil {
		monitor.PrintStats()
	}
	return nil
}

// StartMultipleDownloads 启动并行下载
func (hsd *HSDownloader) StartMultipleDownloads() error {
	hsd.mutex.Lock()
	if hsd.cancel != nil {
		hsd.mutex.Unlock()
		return fmt.Errorf("downloader already running")
	}
	hsd.ctx, hsd.cancel = context.WithCancel(context.Background())
	hsd.mutex.Unlock()

	// 发送批量开始事件
	sendMessage(Event{
		Type:     EventTypeStart,
		Name:     "开始批量下载",
		ShowName: "全局",
	}, map[string]interface{}{}, hsd.config, hsd.wsClient, hsd.socketClient)

	for i, task := range hsd.config.Tasks {
		hsd.activeTasks.Add(1)
		go func(task DownloadTask, index int) {
			defer hsd.activeTasks.Done()
			hsd.downloadTask(task, index, len(hsd.config.Tasks))
		}(task, i)
	}

	// 等待所有任务完成
	hsd.activeTasks.Wait()

	// 发送结束事件
	sendMessage(Event{
		Type:     EventTypeEnd,
		Name:     "结束批量下载",
		ShowName: "全局",
	}, map[string]interface{}{}, hsd.config, hsd.wsClient, hsd.socketClient)

	return nil
}

// downloadTask 执行单个任务的下载
func (hsd *HSDownloader) downloadTask(task DownloadTask, index, total int) {
	// 发送 startOne 事件
	sendMessage(Event{
		Type:     EventTypeStartOne,
		Name:     "开始一个下载",
		ShowName: task.ShowName,
		ID:       task.ID,
	}, map[string]interface{}{
		"URL":      task.URL,
		"SavePath": task.SavePath,
		"ShowName": task.ShowName,
		"Index":    index + 1,
		"Total":    total,
	}, hsd.config, hsd.wsClient, hsd.socketClient)

	// 根据协议选择下载器（此处简化为 HTTP）
	var downloader Downloader
	downloader = NewHTTPDownloader(hsd.config)

	// 执行下载（传递可取消的 context）
	err := downloader.Download(hsd.ctx, task)

	// 准备 endOne 事件的基础数据
	endData := map[string]interface{}{
		"URL":      task.URL,
		"SavePath": task.SavePath,
		"ShowName": task.ShowName,
		"Index":    index + 1,
		"Total":    total,
	}

	if err != nil && err != context.Canceled {
		// 发送错误事件
		sendMessage(Event{
			Type:     EventTypeErr,
			Name:     "错误",
			ShowName: task.ShowName,
			ID:       task.ID,
		}, map[string]interface{}{
			"Error": fmt.Sprintf("下载文件失败 %s: %v", task.URL, err),
		}, hsd.config, hsd.wsClient, hsd.socketClient)
	}

	// 无论成功或失败，都发送 endOne 事件
	sendMessage(Event{
		Type:     EventTypeEndOne,
		Name:     "结束一个下载",
		ShowName: task.ShowName,
		ID:       task.ID,
	}, endData, hsd.config, hsd.wsClient, hsd.socketClient)
}

// PauseDownload 暂停下载
func (hsd *HSDownloader) PauseDownload() {
	hsd.mutex.Lock()
	if hsd.cancel != nil {
		hsd.cancel()
		hsd.cancel = nil
	}
	hsd.mutex.Unlock()

	// 发送暂停消息
	sendMessage(Event{
		Type:     EventTypeMsg,
		Name:     "暂停",
		ShowName: "全局",
	}, map[string]interface{}{
		"Text": "下载已暂停",
	}, hsd.config, hsd.wsClient, hsd.socketClient)
}

// ResumeDownload 恢复下载（重新启动）
func (hsd *HSDownloader) ResumeDownload() error {
	// 重新创建 context 并开始下载
	// 注意：恢复前需确保所有旧任务已结束（通过 activeTasks.Wait 等待）
	hsd.activeTasks.Wait()
	return hsd.StartDownload()
}

// StopDownload 停止下载并清理资源
func (hsd *HSDownloader) StopDownload() error {
	hsd.PauseDownload() // 取消 context，停止所有任务
	hsd.activeTasks.Wait() // 等待所有任务退出

	// 关闭网络连接
	if hsd.wsClient != nil {
		hsd.wsClient.Close()
	}
	if hsd.socketClient != nil {
		hsd.socketClient.Close()
	}

	// 发送停止消息
	sendMessage(Event{
		Type:     EventTypeMsg,
		Name:     "停止",
		ShowName: "全局",
	}, map[string]interface{}{
		"Text": "下载已停止",
	}, hsd.config, hsd.wsClient, hsd.socketClient)

	return nil
}

// GetSnapshot 获取当前下载状态快照
func (hsd *HSDownloader) GetSnapshot(taskID string) interface{} {
	// 这里可以返回当前活动的下载器状态
	// 由于当前架构中每个任务都是独立的下载器实例，
	// 这个方法可以扩展为返回所有任务的状态或特定任务的状态
	if monitor := GetGlobalMonitor(); monitor != nil {
		return monitor.GetStats()
	}
	return nil
}