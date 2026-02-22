package main

import (
	"fmt"
)

// sendMessage 发送消息
func sendMessage(event Event, msg interface{}, config *DownloadConfig, wsClient *WebSocketClient, socketClient *SocketClient) error {
	// 类型断言，确保 msg 是 map[string]interface{} 类型
	if data, ok := msg.(map[string]interface{}); ok {
		var isCalled bool = false

		// 使用单个goroutine处理所有回调，避免频繁创建goroutine的开销
		go func() {
			// 调用回调函数
			if config.CallbackFunc != nil {
				config.CallbackFunc(event, data)
				isCalled = true
			}

			// 发送WebSocket消息
			if wsClient != nil && config.CallbackURL != nil {
				wsClient.SendMessage(event, data)
				isCalled = true
			}

			// 发送Socket消息
			if socketClient != nil && config.CallbackURL != nil {
				socketClient.SendMessage(event, data)
				isCalled = true
			}

			if !isCalled && event.Type != EventTypeUpdate { // 进度更新事件不打印警告
				fmt.Printf("警告: 没有回调函数（ event %s, data %v）\n", event.Name, data)
			}
		}()

		return nil
	} else {
		fmt.Println("错误：sendMessage 的 参数 msg 类型不正确。")
		return fmt.Errorf("sendMessage 的 参数 msg 类型不正确。")
	}
}
