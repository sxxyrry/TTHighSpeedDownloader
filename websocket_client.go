// websocket_client.go
package main

import (
    "encoding/json"
    "fmt"
    "net/http"
    "time"
    
    "github.com/gorilla/websocket"
)

// WebSocketClient WebSocket客户端
type WebSocketClient struct {
    url        string
    connection *websocket.Conn
    connected  bool
}

// ProgressMessage 进度消息结构
type ProgressMessage_WS struct {
    Type  string  `json:"Type"`
    Msg   string  `json:"Msg"`
}

// NewWebSocketClient 创建新的WebSocket客户端
func NewWebSocketClient(url string) *WebSocketClient {
    if url == "" {
        return nil
    }
    
    client := &WebSocketClient{
        url: url,
    }
    
    // 尝试连接
    client.connect()
    return client
}

// connect 连接到WebSocket服务器
func (wsc *WebSocketClient) connect() {
    if wsc.url == "" {
        return
    }
    
    // 将HTTP URL转换为WebSocket URL
    wsURL := wsc.url
    if len(wsURL) > 4 && wsURL[:4] == "http" {
        wsURL = "ws" + wsURL[4:]
    }
    
    // 添加WebSocket路径
    if wsURL[len(wsURL)-1] != '/' {
        wsURL += "/"
    }
    wsURL += "websocket"
    
    dialer := websocket.Dialer{
        HandshakeTimeout: 5 * time.Second,
    }
    
    conn, _, err := dialer.Dial(wsURL, http.Header{})
    if err != nil {
        fmt.Printf("WebSocket连接失败: %v\n", err)
        return
    }
    
    wsc.connection = conn
    wsc.connected = true
}

// SendMessage 发送进度消息
func (wsc *WebSocketClient) SendMessage(event Event, data map[string]interface{}) {
    if !wsc.connected || wsc.connection == nil {
        return
    }

    message := ProgressMessage_WS{
        Type: fmt.Sprintf("%v", event.Type),
        Msg:  fmt.Sprintf("%v", data),
    }

    jsonData, err := json.Marshal(message)
    if err != nil {
        fmt.Printf("序列化消息失败: %v\n", err)
        return
    }

    err = wsc.connection.WriteMessage(websocket.TextMessage, jsonData)
    if err != nil {
        fmt.Printf("发送WebSocket消息失败: %v\n", err)
        wsc.connected = false
    }
}

// Close 关闭连接
func (wsc *WebSocketClient) Close() {
    if wsc.connection != nil {
        wsc.connection.Close()
        wsc.connected = false
    }
}