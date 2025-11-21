package main

import (
    "encoding/json"
    "fmt"
    "net"
    "time"
)

// SocketClient Socket客户端
type SocketClient struct {
    address    string
    connection net.Conn
    connected  bool
}

// ProgressMessage 进度消息结构
type ProgressMessage_S struct {
    Type  string  `json:"Type"`
    Msg   string  `json:"Msg"`
}

// NewSocketClient 创建新的Socket客户端
func NewSocketClient(address string) *SocketClient {
    if address == "" {
        return nil
    }
    
    client := &SocketClient{
        address: address,
    }
    
    // 尝试连接
    client.connect()
    return client
}

// connect 连接到Socket服务器
func (sc *SocketClient) connect() {
    if sc.address == "" {
        return
    }
    
    conn, err := net.DialTimeout("tcp", sc.address, 5*time.Second)
    if err != nil {
        fmt.Printf("Socket连接失败: %v\n", err)
        return
    }
    
    sc.connection = conn
    sc.connected = true
}

// SendMessage 发送进度消息
func (sc *SocketClient) SendMessage(event Event, data map[string]interface{}) {
    if !sc.connected || sc.connection == nil {
        return
    }

    message := ProgressMessage_S{
        Type: fmt.Sprintf("%v", event.Type),
        Msg:  fmt.Sprintf("%v", data),
    }

    jsonData, err := json.Marshal(message) // 使用新的变量名 jsonData
    if err != nil {
        fmt.Printf("序列化消息失败: %v\n", err)
        return
    }

    // 添加换行符作为消息分隔符
    jsonData = append(jsonData, '\n')

    _, err = sc.connection.Write(jsonData)
    if err != nil {
        fmt.Printf("发送Socket消息失败: %v\n", err)
        sc.connected = false
    }
}

// Close 关闭连接
func (sc *SocketClient) Close() {
    if sc.connection != nil {
        sc.connection.Close()
        sc.connected = false
    }
}