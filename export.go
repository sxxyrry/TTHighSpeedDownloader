package main

/*
#include <stdlib.h>
#include <string.h>

typedef void (*progress_callback_t)(void*, void*);

static void call_progress_callback(progress_callback_t callback, void* event, void* msg) {
    if (callback != NULL) {
        callback(event, msg);
    }
}
*/
import "C"
import (
    "context"
	"encoding/json"
	"fmt"
	"sync"
	"unsafe"
)

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
		fmt.Printf("无效参数: tasksData=%v, taskCount=%d\n", tasksData, taskCount)
		return -1
	}
	tasksJSON := C.GoString(tasksData)

	var tasks []DownloadTask
	if err := json.Unmarshal([]byte(tasksJSON), &tasks); err != nil {
		fmt.Printf("解析任务数据失败: %v\n", err)
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
			eventBytes, _ := json.Marshal(event)
			msgBytes, _ := json.Marshal(msg)
			eventStr := C.CString(string(eventBytes))
			msgStr := C.CString(string(msgBytes))
			defer C.free(unsafe.Pointer(eventStr))
			defer C.free(unsafe.Pointer(msgStr))
			C.call_progress_callback(callback, unsafe.Pointer(eventStr), unsafe.Pointer(msgStr))
		}
	}

	isMultiple_go := false
	if isMultiple != nil {
		isMultiple_go = bool(*isMultiple)
	}

	downloader := NewHSDownloader(config)

	downloaderMux.Lock()
	downloaderID++
	currentID := downloaderID
	downloaders[currentID] = downloader
	downloaderMux.Unlock()

	go func() {
		var err error
		if isMultiple_go {
			err = downloader.StartMultipleDownloads()
		} else {
			err = downloader.StartDownload()
		}
		if err != nil && err != context.Canceled {
			sendMessage(Event{
				Type: EventTypeErr,
				Name: "错误",
			}, map[string]interface{}{
				"Error": err.Error(),
			}, downloader.config, downloader.wsClient, downloader.socketClient)
		}
		// 下载完成后自动从映射中移除（但如果是被 stop 移除的，这里会忽略）
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
	// 与 startDownload 类似，但不启动下载
	if tasksData == nil || taskCount <= 0 {
		return -1
	}
	tasksJSON := C.GoString(tasksData)

	var tasks []DownloadTask
	if err := json.Unmarshal([]byte(tasksJSON), &tasks); err != nil {
		fmt.Printf("解析任务数据失败: %v\n", err)
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

	if callback != nil {
		config.CallbackFunc = func(event Event, msg map[string]interface{}) {
			eventBytes, _ := json.Marshal(event)
			msgBytes, _ := json.Marshal(msg)
			eventStr := C.CString(string(eventBytes))
			msgStr := C.CString(string(msgBytes))
			defer C.free(unsafe.Pointer(eventStr))
			defer C.free(unsafe.Pointer(msgStr))
			C.call_progress_callback(callback, unsafe.Pointer(eventStr), unsafe.Pointer(msgStr))
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
		if err != nil && err != context.Canceled {
			sendMessage(Event{
				Type: EventTypeErr,
				Name: "错误",
			}, map[string]interface{}{
				"Error": err.Error(),
			}, downloader.config, downloader.wsClient, downloader.socketClient)
		}
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
		if err != nil && err != context.Canceled {
			sendMessage(Event{
				Type: EventTypeErr,
				Name: "错误",
			}, map[string]interface{}{
				"Error": err.Error(),
			}, downloader.config, downloader.wsClient, downloader.socketClient)
		}
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
		delete(downloaders, int(id)) // 立即从映射中移除，防止后续调用
	}
	downloaderMux.Unlock()
	if !exists {
		return -1
	}
	downloader.StopDownload()
	return 0
}

func main() {}
