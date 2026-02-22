package main

/*
#include <stdlib.h>
#include <string.h>

// 定义C兼容的回调函数类型，使用void*传递数据
typedef void (*progress_callback_t)(void*, void*);

// 声明外部函数用于调用回调
static void call_progress_callback(progress_callback_t callback, void* event, void* msg) {
    if (callback != NULL) {
        callback(event, msg);
    }
}
*/
import "C"
import (
    // "context"
    "encoding/json"
    "fmt"
    "sync"
    "unsafe"
)

// 全局下载器映射
var (
    downloaders   = make(map[int]*HSDownloader)
    downloaderID  = 0
    downloaderMux sync.Mutex
)

//export startDownload
func startDownload(
    tasksData *C.char,
    taskCount C.int,
    threadCount C.int,
    chunkSizeMB C.int,
    callback C.progress_callback_t,
    useCallbackURL C._Bool,
    userAgent *C.char,
    remoteCallbackUrl *C.char,
    useSocket *C._Bool,
    isMultiple *C._Bool,
) C.int {
    if tasksData == nil || taskCount <= 0 {
        fmt.Printf("无效的参数：tasksData=%v, taskCount=%d\n", tasksData, taskCount)
        return -1
    }
    tasksJSON := C.GoString(tasksData)
    
    var tasks []DownloadTask
    if err := json.Unmarshal([]byte(tasksJSON), &tasks); err != nil {
        fmt.Printf("解析任务数据失败：%v\n", err)
        return -1
    }
    
    var callbackURL *string
    if remoteCallbackUrl != nil && C.GoString(remoteCallbackUrl) != "" {
        urlStr := C.GoString(remoteCallbackUrl)
        callbackURL = &urlStr
    }
    
    var useSocketVal *bool
    if useSocket != nil {
        boolVal := bool(*useSocket)
        useSocketVal = &boolVal
    }
    
    config := &DownloadConfig{
        Tasks:          tasks,
        ThreadCount:    int(threadCount),
        ChunkSizeMB:    int(chunkSizeMB),
        useCallbackURL: bool(useCallbackURL),
        CallbackURL:    callbackURL,
        useSocket:      useSocketVal,
        userAgent:      C.GoString(userAgent),
    }
    
    var isMultiple_go bool
    if isMultiple != nil {
        isMultiple_go = bool(*isMultiple)
    } else {
        isMultiple_go = false
    }

    // 设置回调函数
    if callback != nil {
        config.CallbackFunc = func(event Event, msg map[string]interface{}) {
            // 将Go对象序列化为JSON字符串
            eventBytes, _ := json.Marshal(event)
            msgBytes, _ := json.Marshal(msg)
            
            // 转换为C字符串（以null结尾的字符串）
            eventStr := C.CString(string(eventBytes))
            msgStr := C.CString(string(msgBytes))
            defer C.free(unsafe.Pointer(eventStr))
            defer C.free(unsafe.Pointer(msgStr))
            
            // 调用C回调函数
            C.call_progress_callback(
                (C.progress_callback_t)(callback),
                unsafe.Pointer(eventStr),
                unsafe.Pointer(msgStr),
            )
        }
    }
    
    downloader := NewHSDownloader(config)
    downloaderMux.Lock()
    downloaderID++
    currentID := downloaderID
    downloaders[currentID] = downloader
    downloaderMux.Unlock()
    
    go func() {
        defer func() {
            // 确保无论如何都会清理资源
            downloaderMux.Lock()
            delete(downloaders, currentID)
            downloaderMux.Unlock()
            
            // 清理网络连接
            if downloader.wsClient != nil {
                downloader.wsClient.Close()
            }
            if downloader.socketClient != nil {
                downloader.socketClient.Close()
            }
        }()
    
        var err error
        if isMultiple_go {
            err = downloader.StartMultipleDownloads()
        } else {
            err = downloader.StartDownload()
        }
        if err != nil {
            // 发送错误信息
            sendMessage(Event{
                Type:     EventTypeErr,
                Name:     "错误",
                ShowName: "全局",
            }, map[string]interface{}{
                "Error": err.Error(),
            }, downloader.config, downloader.wsClient, downloader.socketClient)
        }
        // 下载完成后清理资源
        downloaderMux.Lock()
        delete(downloaders, currentID)
        downloaderMux.Unlock()
    }()
    
    return C.int(currentID)
}

//export getDownloader
func getDownloader(
    tasksData *C.char,
    taskCount C.int,
    threadCount C.int,
    chunkSizeMB C.int,
    callback C.progress_callback_t,
    useCallbackURL C._Bool,
    userAgent *C.char,
    remoteCallbackUrl *C.char,
    useSocket *C._Bool,
) C.int {
    if tasksData == nil || taskCount <= 0 {
        fmt.Printf("无效的参数：tasksData=%v, taskCount=%d\n", tasksData, taskCount)
        return -1
    }
    tasksJSON := C.GoString(tasksData)
    
    var tasks []DownloadTask
    if err := json.Unmarshal([]byte(tasksJSON), &tasks); err != nil {
        fmt.Printf("解析任务数据失败：%v\n", err)
        return -1
    }
    
    var callbackURL *string
    if remoteCallbackUrl != nil && C.GoString(remoteCallbackUrl) != "" {
        urlStr := C.GoString(remoteCallbackUrl)
        callbackURL = &urlStr
    }
    
    var useSocketVal *bool
    if useSocket != nil {
        boolVal := bool(*useSocket)
        useSocketVal = &boolVal
    }
    
    config := &DownloadConfig{
        Tasks:          tasks,
        ThreadCount:    int(threadCount),
        ChunkSizeMB:    int(chunkSizeMB),
        useCallbackURL: bool(useCallbackURL),
        CallbackURL:    callbackURL,
        useSocket:      useSocketVal,
        userAgent:      C.GoString(userAgent),
    }
    
    // 设置回调函数
    if callback != nil {
        config.CallbackFunc = func(event Event, msg map[string]interface{}) {
            // 将Go对象序列化为JSON字符串
            eventBytes, _ := json.Marshal(event)
            msgBytes, _ := json.Marshal(msg)
            
            // 转换为C字符串（以null结尾的字符串）
            eventStr := C.CString(string(eventBytes))
            msgStr := C.CString(string(msgBytes))
            defer C.free(unsafe.Pointer(eventStr))
            defer C.free(unsafe.Pointer(msgStr))
            
            // 调用C回调函数
            C.call_progress_callback(
                (C.progress_callback_t)(callback),
                unsafe.Pointer(eventStr),
                unsafe.Pointer(msgStr),
            )
        }
    }
    
    downloader := NewHSDownloader(config)
    downloaderMux.Lock()
    downloaderID++
    currentID := downloaderID
    downloaders[currentID] = downloader
    downloaderMux.Unlock()
    
    return C.int(currentID)
}

//export startDownload_ID
func startDownload_ID(id C.int) C.int {
    downloaderMux.Lock()
    downloader, exists := downloaders[int(id)]
    downloaderMux.Unlock()
    
    if !exists {
        return -1
    }

    go func() {
        err := downloader.StartDownload()
        if err != nil {
            // 发送错误信息
            sendMessage(Event{
                Type:     EventTypeMsg,
                Name:     "错误",
                ShowName: "全局",
            }, map[string]interface{}{
                "Error": err.Error(),
            }, downloader.config, downloader.wsClient, downloader.socketClient)
        }
        // 下载完成后清理资源
        downloaderMux.Lock()
        delete(downloaders, int(id))
        downloaderMux.Unlock()
    }()
    return 0
}

//export startMultipleDownloads_ID
func startMultipleDownloads_ID(id C.int) C.int {
    downloaderMux.Lock()
    downloader, exists := downloaders[int(id)]
    downloaderMux.Unlock()
    
    if !exists {
        return -1
    }

    go func() {
        err := downloader.StartMultipleDownloads()
        if err != nil {
            // 发送错误信息
            sendMessage(Event{
                Type:     EventTypeMsg,
                Name:     "错误",
                ShowName: "全局",
            }, map[string]interface{}{
                "Error": err.Error(),
            }, downloader.config, downloader.wsClient, downloader.socketClient)
        }
        // 下载完成后清理资源
        downloaderMux.Lock()
        delete(downloaders, int(id))
        downloaderMux.Unlock()
    }()
    return 0
}

//export pauseDownload
func pauseDownload(id C.int) C.int {
    downloaderMux.Lock()
    downloader, exists := downloaders[int(id)]
    if exists {
        // 从map中删除下载器，防止重复操作
        delete(downloaders, int(id))
    }
    downloaderMux.Unlock()
    
    if !exists {
        return -1
    }

    downloader.PauseDownload()
    return 0
}

//export resumeDownload
func resumeDownload(id C.int) C.int {
    downloaderMux.Lock()
    downloader, exists := downloaders[int(id)]
    downloaderMux.Unlock()
    
    if !exists {
        return -1
    }

    err := downloader.ResumeDownload()
    if err != nil {
        return -1
    }

    return 0
}

//export stopDownload
func stopDownload(id C.int) C.int {
    downloaderMux.Lock()
    downloader, exists := downloaders[int(id)]
    if exists {
        // 从map中删除下载器，防止重复操作
        delete(downloaders, int(id))
    }
    downloaderMux.Unlock()
    
    if !exists {
        return -1
    }

    // 调用下载器的StopDownload方法
    err := downloader.StopDownload()
    if err != nil {
        return -1
    }

    return 0
}

func main() {}
