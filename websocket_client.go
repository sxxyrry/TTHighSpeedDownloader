// websocket_client.go
package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

const wsSendQueueSize = 1024 // 增加队列大小，提高高并发处理能力

// WebSocketClient WebSocket客户端
type WebSocketClient struct {
	url        string
	connection *websocket.Conn
	connected  bool
	sendQueue  chan []byte
	done       chan struct{}
	closeOnce  sync.Once
	mutex      sync.RWMutex
}

// ProgressMessage 进度消息结构
type ProgressMessage_WS struct {
	Type string `json:"Type"`
	Msg  string `json:"Msg"`
}

// NewWebSocketClient 创建新的WebSocket客户端
func NewWebSocketClient(url string) *WebSocketClient {
	if url == "" {
		return nil
	}

	client := &WebSocketClient{
		url:       url,
		sendQueue: make(chan []byte, wsSendQueueSize),
		done:      make(chan struct{}),
	}

	client.connect()
	return client
}

// connect 连接到WebSocket服务器
func (wsc *WebSocketClient) connect() {
	if wsc.url == "" {
		return
	}

	wsURL := normalizeWebSocketURL(wsc.url)
	if wsURL == "" {
		return
	}

	dialer := websocket.Dialer{
		HandshakeTimeout: 10 * time.Second,
		ReadBufferSize:   64 * 1024,  // 64KB读缓冲区
		WriteBufferSize:  64 * 1024,  // 64KB写缓冲区
	}

	conn, _, err := dialer.Dial(wsURL, http.Header{})
	if err != nil {
		fmt.Printf("WebSocket连接失败: %v\n", err)
		return
	}

	wsc.mutex.Lock()
	wsc.connection = conn
	wsc.connected = true
	wsc.mutex.Unlock()

	go wsc.writeLoop()
}

func normalizeWebSocketURL(raw string) string {
	wsURL := strings.TrimSpace(raw)
	if wsURL == "" {
		return ""
	}
	if strings.HasPrefix(wsURL, "http://") {
		wsURL = "ws://" + strings.TrimPrefix(wsURL, "http://")
	} else if strings.HasPrefix(wsURL, "https://") {
		wsURL = "wss://" + strings.TrimPrefix(wsURL, "https://")
	}
	if !strings.HasSuffix(wsURL, "/") {
		wsURL += "/"
	}
	return wsURL + "websocket"
}

func (wsc *WebSocketClient) writeLoop() {
	for {
		select {
		case <-wsc.done:
			return
		case msg, ok := <-wsc.sendQueue:
			if !ok {
				return
			}
			if err := wsc.writeRaw(msg); err != nil {
				return
			}
		}
	}
}

func (wsc *WebSocketClient) writeRaw(payload []byte) error {
	wsc.mutex.RLock()
	conn := wsc.connection
	connected := wsc.connected
	wsc.mutex.RUnlock()

	if !connected || conn == nil {
		return fmt.Errorf("websocket not connected")
	}

	_ = conn.SetWriteDeadline(time.Now().Add(3 * time.Second))
	if err := conn.WriteMessage(websocket.TextMessage, payload); err != nil {
		wsc.mutex.Lock()
		wsc.connected = false
		wsc.mutex.Unlock()
		fmt.Printf("发送WebSocket消息失败: %v\n", err)
		return err
	}
	return nil
}

// SendMessage 发送进度消息
func (wsc *WebSocketClient) SendMessage(event Event, data map[string]interface{}) {
	select {
	case <-wsc.done:
		return
	default:
	}

	wsc.mutex.RLock()
	connected := wsc.connected
	wsc.mutex.RUnlock()
	if !connected {
		return
	}

	dataBytes, err := json.Marshal(data)
	if err != nil {
		fmt.Printf("序列化额外数据失败: %v\n", err)
		return
	}

	message := ProgressMessage_WS{
		Type: string(event.Type),
		Msg:  string(dataBytes),
	}

	jsonData, err := json.Marshal(message)
	if err != nil {
		fmt.Printf("序列化消息失败: %v\n", err)
		return
	}

	if event.Type == EventTypeUpdate {
		select {
		case wsc.sendQueue <- jsonData:
		default:
		}
		return
	}

	select {
	case wsc.sendQueue <- jsonData:
	case <-time.After(2 * time.Second):
		fmt.Println("WebSocket发送队列阻塞，丢弃非进度消息")
	}
}

// Close 关闭连接
func (wsc *WebSocketClient) Close() {
	wsc.closeOnce.Do(func() {
		close(wsc.done)
		wsc.mutex.Lock()
		if wsc.connection != nil {
			_ = wsc.connection.Close()
		}
		wsc.connected = false
		wsc.mutex.Unlock()
	})
}
