package main

import (
    "context"
    "crypto/tls"
    "fmt"
    "io"
    "net/http"
    "os"
    "strconv"
    "sync"
    "sync/atomic"
    "time"
)

// ProgressCallback 定义进度回调函数类型
type ProgressCallback func(Event, map[string]interface{})

// DownloadTask 下载任务信息
type DownloadTask struct {
    URL      string // 下载链接
    SavePath string // 保存路径
    ShowName string // 显示名称
}

// DownloadConfig 下载配置
type DownloadConfig struct {
    Tasks          []DownloadTask    // 下载任务列表
    ThreadCount    int
    ChunkSizeMB    int
    CallbackFunc   ProgressCallback
    useCallbackURL bool
    CallbackURL    *string
    useSocket      *bool
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
)

// Event 下载事件
type Event struct {
    Type EventType
    Name string
}

// ProgressEvent 用于传输进度更新的数据
type ProgressEvent struct {
    Total      int64
    Downloaded int64
}

// FastDownloader 高速下载器
type FastDownloader struct {
    config         *DownloadConfig
    totalSize      int64
    downloaded     int64
    lastDownloaded int64
    startTime      time.Time
    chunks         []DownloadChunk
    client         *http.Client
    wsClient       *WebSocketClient
    socketClient   *SocketClient
    mutex          sync.Mutex
    cancel         context.CancelFunc
    currentTaskIndex int           // 当前下载的任务索引
}

// GetDownloader 创建新的下载器实例（支持多个任务）
func GetDownloader(tasks []DownloadTask, threadCount int, chunkSizeMB int) *FastDownloader {
    config := &DownloadConfig{
        Tasks:       tasks,
        ThreadCount: threadCount,
        ChunkSizeMB: chunkSizeMB,
    }
    
    return NewFastDownloader(config)
}

// NewFastDownloader 创建新的下载器实例
func NewFastDownloader(config *DownloadConfig) *FastDownloader {
    transport := &http.Transport{
        TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
    }
    
    client := &http.Client{
        Transport: transport, 
    }
    
    fd := &FastDownloader{
        config: config,
        client: client,
    }
    
    // 增加更安全的空值检查
    if config.useCallbackURL && config.CallbackURL != nil && config.useSocket != nil {
        if *config.useSocket {
            fd.socketClient = NewSocketClient(*config.CallbackURL)
        } else {
            fd.wsClient = NewWebSocketClient(*config.CallbackURL)
        }
    }
    
    return fd
}

// StartDownload 启动下载任务（支持多个任务顺序下载）
func (fd *FastDownloader) StartDownload() error {
    SendMessage(fd, Event{
        Type: EventTypeStart,
        Name: "开始下载",
    }, map[string]interface{}{})

    // 顺序下载每个任务
    for i, task := range fd.config.Tasks {
        fd.currentTaskIndex = i
        
        // 通知开始下载当前文件
        SendMessage(fd, Event{
            Type: EventTypeStartOne,
            Name: "开始一个下载",
        }, map[string]interface{}{
            "URL": task.URL,
            "SavePath": task.SavePath,
            "ShowName": task.ShowName,
            "Index": i + 1,
            "Total": len(fd.config.Tasks),
        })
        
        // 执行单个文件下载
        if err := fd.startSingleDownload(task); err != nil {
            SendMessage(fd, Event{
                Type: EventTypeMsg,
                Name: "错误",
            }, map[string]interface{}{
                "Text": fmt.Sprintf("下载文件失败 %s: %v", task.URL, err),
            })
            return err
        }
        
        // 重置下载状态为下一个文件做准备
        fd.downloaded = 0
        fd.lastDownloaded = 0
        fd.totalSize = 0
        fd.chunks = nil
        SendMessage(fd, Event{
            Type: EventTypeEndOne,
            Name: "结束一个下载",
        }, map[string]interface{}{
            "URL": task.URL,
            "SavePath": task.SavePath,
            "ShowName": task.ShowName,
            "Index": i + 1,
            "Total": len(fd.config.Tasks),
        })
    }

    SendMessage(fd, Event{
        Type: EventTypeEnd,
        Name: "结束所有下载",
    }, map[string]interface{}{})
    
    return nil
}

// startSingleDownload 执行单个文件下载
func (fd *FastDownloader) startSingleDownload(task DownloadTask) error {
    // 获取文件大小
    size, err := fd.getFileSize(task.URL)
    if err != nil {
        SendMessage(fd, Event{
            Type: EventTypeMsg,
            Name: "错误",
        }, map[string]interface{}{
            "Text": fmt.Sprintf("获取文件大小失败: %v", err),
        })
        return fmt.Errorf("获取文件大小失败: %v", err)
    }
    fd.totalSize = size
    
    // 初始化下载块
    fd.initChunks()
    
    // 确保线程数不超过块数
    actualThreadCount := fd.config.ThreadCount
    if actualThreadCount > len(fd.chunks) {
        actualThreadCount = len(fd.chunks)
    }
    if actualThreadCount <= 0 {
        actualThreadCount = 1
    }
    
    // 检查分块大小是否超过文件大小
    chunkSize := int64(fd.config.ChunkSizeMB) * 1024 * 1024
    if chunkSize > fd.totalSize && fd.config.ChunkSizeMB > 0 {
        SendMessage(fd, Event{
            Type: EventTypeMsg,
            Name: "警告",
        }, map[string]interface{}{
            "Text": fmt.Sprintf("警告: 分块大小(%d MB)超过文件大小(%d bytes)，切换为单线程运行", fd.config.ChunkSizeMB, fd.totalSize),
        })
        actualThreadCount = 1
        // 重新初始化chunks为单个块
        fd.chunks = []DownloadChunk{{
            StartOffset: 0,
            EndOffset:   fd.totalSize - 1,
            Done:        false,
        }}
    }
    
    // 创建目标文件
    file, err := os.Create(task.SavePath)
    if err != nil {
        SendMessage(fd, Event{
            Type: EventTypeMsg,
            Name: "错误",
        }, map[string]interface{}{
            "Text": fmt.Sprintf("创建文件失败: %v", err),
        })
        return fmt.Errorf("创建文件失败: %v", err)
    }
    defer file.Close()
    
    // 设置文件大小
    if err := file.Truncate(fd.totalSize); err != nil {
        SendMessage(fd, Event{
            Type: EventTypeMsg,
            Name: "错误",
        }, map[string]interface{}{
            "Text": fmt.Sprintf("设置文件大小失败: %v", err),
        })
        return fmt.Errorf("设置文件大小失败: %v", err)
    }
    
    // 通知开始下载
    fd.startTime = time.Now()
    fd.notifyProgress(0, 0)
    
    // 移除超时控制，直接创建上下文
    ctx := context.Background()
    
    // 并发下载
    var wg sync.WaitGroup
    errChan := make(chan error, actualThreadCount)
    
    for i := 0; i < actualThreadCount; i++ {
        wg.Add(1)
        go func(chunkIndex int) {
            defer wg.Done()
            if err := fd.downloadChunk(ctx, file, chunkIndex, task.URL); err != nil {
                select {
                case errChan <- err:
                default:
                }
            }
        }(i)
    }
    
    // 等待所有goroutine完成
    wg.Wait()
    close(errChan)
    
    // 检查是否有错误
    if len(errChan) > 0 {
        return <-errChan
    }
    
    // 通知下载完成
    fd.notifyProgress(fd.totalSize, fd.downloaded)
    return nil
}

// getFileSize 获取文件大小
func (fd *FastDownloader) getFileSize(url string) (int64, error) {
    req, err := http.NewRequest("HEAD", url, nil)
    if err != nil {
        return 0, err
    }
    
    resp, err := fd.client.Do(req)
    if err != nil {
        return 0, err
    }
    defer resp.Body.Close()
    
    if resp.StatusCode != http.StatusOK {
        SendMessage(fd, Event {
            Type: EventTypeMsg,
            Name: "错误",
        }, map[string]interface{}{
            "Text": fmt.Sprintf("HTTP错误: %d\n", resp.StatusCode),
        })
        return 0, fmt.Errorf("HTTP错误: %d", resp.StatusCode)
    }
    
    contentLength := resp.Header.Get("Content-Length")
    if contentLength == "" {
        SendMessage(fd, Event {
            Type: EventTypeMsg,
            Name: "错误",
        }, map[string]interface{}{
            "Text": fmt.Sprintf("无法获取文件大小:%d\n", resp.StatusCode),
        })
        return 0, fmt.Errorf("无法获取文件大小")
    }
    
    size, err := strconv.ParseInt(contentLength, 10, 64)
    if err != nil {
        SendMessage(fd, Event {
            Type: EventTypeMsg,
            Name: "错误",
        }, map[string]interface{}{
            "Text": fmt.Sprintf("解析文件大小失败:%v\n", err),
        })
        return 0, fmt.Errorf("解析文件大小失败: %v", err)
    }
    
    return size, nil
}

// initChunks 初始化下载块
func (fd *FastDownloader) initChunks() {
    chunkSize := int64(fd.config.ChunkSizeMB) * 1024 * 1024
    if chunkSize <= 0 {
        chunkSize = fd.totalSize / int64(fd.config.ThreadCount)
        if chunkSize == 0 {
            chunkSize = fd.totalSize
        }
    }
    
    var chunks []DownloadChunk
    for i := int64(0); i < fd.totalSize; i += chunkSize {
        end := i + chunkSize - 1
        if end >= fd.totalSize {
            end = fd.totalSize - 1
        }
        chunks = append(chunks, DownloadChunk{
            StartOffset: i,
            EndOffset:   end,
            Done:        false,
        })
    }
    
    fd.chunks = chunks
}

// downloadChunk 下载指定块
func (fd *FastDownloader) downloadChunk(ctx context.Context, file *os.File, chunkIndex int, url string) error {
    chunk := &fd.chunks[chunkIndex]
    if chunk.Done {
        return nil
    }
    
    req, err := http.NewRequest("GET", url, nil)
    if err != nil {
        SendMessage(fd, Event {
            Type: EventTypeMsg,
            Name: "错误",
        }, map[string]interface{}{
            "Text": fmt.Sprintf("创建块请求失败:%d: %v\n", chunkIndex, err),
        })
        return err
    }
    
    rangeHeader := fmt.Sprintf("bytes=%d-%d", chunk.StartOffset, chunk.EndOffset)
    req.Header.Set("Range", rangeHeader)
    
    resp, err := fd.client.Do(req)
    if err != nil {
        SendMessage(fd, Event {
            Type: EventTypeMsg,
            Name: "错误",
        }, map[string]interface{}{
            "Text": fmt.Sprintf("下载块失败:%d: %v\n", chunkIndex, err),
        })
        return err
    }
    defer resp.Body.Close()
    
    if resp.StatusCode != http.StatusPartialContent && resp.StatusCode != http.StatusOK {
        SendMessage(fd, Event {
            Type: EventTypeMsg,
            Name: "错误",
        }, map[string]interface{}{
            "Text": fmt.Sprintf("下载块失败:%d: HTTP错误: %d\n", chunkIndex, resp.StatusCode),
        })
        return fmt.Errorf("HTTP错误: %d", resp.StatusCode)
    }
    
    // 写入文件
    buffer := make([]byte, 64*1024) // 64KB缓冲区
    offset := chunk.StartOffset
    
    for {
        select {
        case <-ctx.Done():
            return ctx.Err()
        default:
        }
        
        n, err := resp.Body.Read(buffer)
        if n > 0 {
            fd.mutex.Lock()
            _, writeErr := file.WriteAt(buffer[:n], offset)
            fd.mutex.Unlock()
            
            if writeErr != nil {
                return writeErr
            }
            
            offset += int64(n)
            atomic.AddInt64(&fd.downloaded, int64(n))
            
            // 通知进度更新
            currentDownloaded := atomic.LoadInt64(&fd.downloaded)
            if currentDownloaded > fd.totalSize {
                currentDownloaded = fd.totalSize
            }
            fd.notifyProgress(fd.totalSize, currentDownloaded)
        }
        
        if err == io.EOF {
            break
        }
        if err != nil {
            return err
        }
    }
    
    chunk.Done = true
    return nil
}

// notifyProgress 通知进度更新
func (fd *FastDownloader) notifyProgress(total int64, downloaded int64) {
    var speed float64
    elapsed := time.Since(fd.startTime).Seconds()

    if elapsed > 0 {
        speed = float64(downloaded) / elapsed
    }
    
    // 添加检查，防止超过总量
    if downloaded > total {
        downloaded = total
    }

    added := downloaded - fd.lastDownloaded
    fd.lastDownloaded = downloaded
    
    SendMessage(fd, Event {
        Type: EventTypeUpdate,
        Name: "update",
    }, map[string]interface{}{
        "Total": total,
        "Added": added,
        "Speed": speed,
    })
    
}

// SendMessage 发送消息
func SendMessage(fd *FastDownloader, event Event, msg interface{}) error {
    // 类型断言，确保 msg 是 map[string]interface{} 类型
    if data, ok := msg.(map[string]interface{}); ok {
        var isCalled bool = false
        // 调用回调函数
        if fd.config.CallbackFunc != nil {
            fd.config.CallbackFunc(event, data)
            isCalled = true
        }

        // 发送WebSocket消息
        if fd.wsClient != nil && fd.config.CallbackURL != nil {
            fd.wsClient.SendMessage(event, data)
            isCalled = true
        }

        // 发送Socket消息
        if fd.socketClient != nil && fd.config.CallbackURL != nil {
            fd.socketClient.SendMessage(event, data)
            isCalled = true
        }

        if !isCalled {
            fmt.Printf("警告: 没有回调函数（ event %s, data %v）\n", event.Name, data)
        }

        return nil
    } else {
        fmt.Println("错误：SendMessage 的 参数 msg 类型不正确。")
        return fmt.Errorf("SendMessage 的 参数 msg 类型不正确。")
    }
}

// PauseDownload 暂停下载
func (fd *FastDownloader) PauseDownload() {
    if fd.cancel != nil {
        fd.cancel()
    }
}

// ResumeDownload 恢复下载
func (fd *FastDownloader) ResumeDownload() error {
    return fd.StartDownload()
}