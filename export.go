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
    "encoding/json"
    "fmt"
    "unsafe"
)

var downloaders = make(map[int]*FastDownloader)
var downloaderID = 0

// //export startMultiDownload
// func startMultiDownload(
//     urls **C.char,           // URL数组
//     urlCount C.int,          // URL数量
//     savePaths **C.char,      // 保存路径数组
//     pathCount C.int,         // 路径数量
//     ShowName *C.char,
//     threadCount C.int,
//     chunkSizeMB C.int,
//     callback unsafe.Pointer,
//     useCallbackURL C._Bool,
//     remoteCallbackUrl *C.char,
//     useSocket *C._Bool,
// ) C.int {
//     // 为了向后兼容，仍然支持URL和保存路径数组
//     urlsSlice := make([]string, int(urlCount))
//     urlPtr := uintptr(unsafe.Pointer(urls))
//     for i := 0; i < int(urlCount); i++ {
//         ptr := *(**C.char)(unsafe.Pointer(urlPtr + uintptr(i)*unsafe.Sizeof((*C.char)(nil))))
//         urlStr := C.GoString(ptr)
//         urlsSlice[i] = urlStr
//     }
    
//     pathsSlice := make([]string, int(pathCount))
//     pathPtr := uintptr(unsafe.Pointer(savePaths))
//     for i := 0; i < int(pathCount); i++ {
//         ptr := *(**C.char)(unsafe.Pointer(pathPtr + uintptr(i)*unsafe.Sizeof((*C.char)(nil))))
//         pathStr := C.GoString(ptr)
//         pathsSlice[i] = pathStr
//     }
    
//     // 创建任务列表，ShowName默认使用URL
//     tasks := make([]DownloadTask, len(urlsSlice))
//     for i := 0; i < len(urlsSlice); i++ {
//         showName := urlsSlice[i]
//         if i < len(pathsSlice) {
//             // 尝试从保存路径提取文件名作为显示名称
//             showName = pathsSlice[i]
//         }
//         tasks[i] = DownloadTask{
//             URL:      urlsSlice[i],
//             SavePath: pathsSlice[i],
//             ShowName: showName,
//         }
//     }
    
//     var callbackURL *string
//     if remoteCallbackUrl != nil && C.GoString(remoteCallbackUrl) != "" {
//         urlStr := C.GoString(remoteCallbackUrl)
//         callbackURL = &urlStr
//     }
    
//     var useSocketVal *bool
//     if useSocket != nil {
//         boolVal := bool(*useSocket)
//         useSocketVal = &boolVal
//     }
    
//     config := &DownloadConfig{
//         Tasks:          tasks,
//         ThreadCount:    int(threadCount),
//         ChunkSizeMB:    int(chunkSizeMB),
//         useCallbackURL: bool(useCallbackURL),
//         CallbackURL:    callbackURL,
//         useSocket:      useSocketVal,
//         ShowName:       C.GoString(ShowName),
//     }
    
//     // 设置回调函数
//     if callback != nil {
//         config.CallbackFunc = func(event Event, msg map[string]interface{}) {
//             // 将Go对象序列化为JSON字符串
//             eventBytes, _ := json.Marshal(event)
//             msgBytes, _ := json.Marshal(msg)
            
//             // 转换为C字符串（以null结尾的字符串）
//             eventStr := C.CString(string(eventBytes))
//             msgStr := C.CString(string(msgBytes))
//             defer C.free(unsafe.Pointer(eventStr))
//             defer C.free(unsafe.Pointer(msgStr))
            
//             // 调用C回调函数
//             C.call_progress_callback(
//                 (C.progress_callback_t)(callback),
//                 unsafe.Pointer(eventStr),
//                 unsafe.Pointer(msgStr),
//             )
//         }
//     }
    
//     downloader := NewFastDownloader(config)
//     downloaderID++
//     downloaders[downloaderID] = downloader
    
//     err := downloader.StartDownload()
//     if err != nil {
//         fmt.Printf("下载错误：%v\n", err)
//         return -1
//     }
    
//     return C.int(downloaderID)
// }

// //export startDownload
// func startDownload(
//     threadCount C.int,
//     chunkSizeMB C.int,
//     ShowName *C.char,
//     urlStr *C.char,
//     savePath *C.char,
//     callback unsafe.Pointer,
//     useCallbackURL C._Bool,
//     remoteCallbackUrl *C.char,
//     useSocket *C._Bool,
// ) C.int {
//     // 为了向后兼容，将单个URL转换为数组形式调用
//     url := C.GoString(urlStr)
//     path := C.GoString(savePath)
    
//     tasks := []DownloadTask{
//         {
//             URL:      url,
//             SavePath: path,
//             ShowName: path, // 默认使用保存路径作为显示名称
//         },
//     }
    
//     var callbackURL *string
//     if remoteCallbackUrl != nil && C.GoString(remoteCallbackUrl) != "" {
//         urlStr := C.GoString(remoteCallbackUrl)
//         callbackURL = &urlStr
//     }
    
//     var useSocketVal *bool
//     if useSocket != nil {
//         boolVal := bool(*useSocket)
//         useSocketVal = &boolVal
//     }
    
//     config := &DownloadConfig{
//         Tasks:          tasks,
//         ThreadCount:    int(threadCount),
//         ChunkSizeMB:    int(chunkSizeMB),
//         useCallbackURL: bool(useCallbackURL),
//         CallbackURL:    callbackURL,
//         useSocket:      useSocketVal,
//         ShowName:       C.GoString(ShowName),
//     }
    
//     // 设置回调函数
//     if callback != nil {
//         config.CallbackFunc = func(event Event, msg map[string]interface{}) {
//             // 将Go对象序列化为JSON字符串
//             eventBytes, _ := json.Marshal(event)
//             msgBytes, _ := json.Marshal(msg)
            
//             // 转换为C字符串（以null结尾的字符串）
//             eventStr := C.CString(string(eventBytes))
//             msgStr := C.CString(string(msgBytes))
//             defer C.free(unsafe.Pointer(eventStr))
//             defer C.free(unsafe.Pointer(msgStr))
            
//             // 调用C回调函数
//             C.call_progress_callback(
//                 (C.progress_callback_t)(callback),
//                 unsafe.Pointer(eventStr),
//                 unsafe.Pointer(msgStr),
//             )
//         }
//     }
    
//     downloader := NewFastDownloader(config)
//     downloaderID++
//     downloaders[downloaderID] = downloader
    
//     err := downloader.StartDownload()
//     if err != nil {
//         fmt.Printf("下载错误：%v\n", err)
//         return -1
//     }
    
//     return C.int(downloaderID)
// }

//export startDownload
func startDownload(
    tasksData *C.char,       // JSON格式的任务数据
    taskCount C.int,         // 任务数量
    threadCount C.int,
    chunkSizeMB C.int,
    callback unsafe.Pointer,
    useCallbackURL C._Bool,
    userAgent *C.char,
    remoteCallbackUrl *C.char,
    useSocket *C._Bool,
) C.int {
    downloaderID := getDownloader(tasksData, taskCount, threadCount, chunkSizeMB, callback, useCallbackURL, userAgent, remoteCallbackUrl, useSocket)
    
    downloader, exists := downloaders[int(downloaderID)]
    if !exists {
        return -1
    }

    go func() {
        err := downloader.StartDownload()
        if err != nil {
            // fmt.Printf("下载错误：%v\n", err)
            downloader.SendMessage(Event{
                Type: EventTypeMsg,
                Name: "错误",
                ShowName: "全局",
            }, map[string]interface{}{
                "Error": err.Error(),
            })
        }
    }()
    
    return C.int(downloaderID)
}

//export getDownloader
func getDownloader(
    tasksData *C.char,       // JSON格式的任务数据
    taskCount C.int,         // 任务数量
    threadCount C.int,
    chunkSizeMB C.int,
    callback unsafe.Pointer,
    useCallbackURL C._Bool,
    userAgent *C.char,
    remoteCallbackUrl *C.char,
    useSocket *C._Bool,
) C.int {
    // 解析JSON任务数据
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
        Tasks:           tasks,
        ThreadCount:     int(threadCount),
        ChunkSizeMB:     int(chunkSizeMB),
        useCallbackURL:  bool(useCallbackURL),
        CallbackURL:     callbackURL,
        useSocket:       useSocketVal,
        userAgent:       C.GoString(userAgent),
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
    
    downloader := NewFastDownloader(config)
    downloaderID++
    downloaders[downloaderID] = downloader
    
    return C.int(downloaderID)
}

//export startDownload_ID
func startDownload_ID(id C.int) C.int {
    downloader, exists := downloaders[int(id)]
    if !exists {
        return -1
    }

    go func() {
        err := downloader.StartDownload()
        if err != nil {
            // fmt.Printf("下载错误：%v\n", err)
            downloader.SendMessage(Event{
                Type: EventTypeMsg,
                Name: "错误",
                ShowName: "全局",
            }, map[string]interface{}{
                "Error": err.Error(),
            })
        }
    }()
    return 0
}

//export pauseDownload
func pauseDownload(id C.int) C.int {
    downloader, exists := downloaders[int(id)]
    if !exists {
        return -1
    }

    downloader.PauseDownload()
    downloaderID -= 1
    return 0
}

//export resumeDownload
func resumeDownload(id C.int) C.int {
    downloader, exists := downloaders[int(id)]
    if !exists {
        return -1
    }

    err := downloader.ResumeDownload()
    if err != nil {
        return -1
    }

    return 0
}

func main() {}