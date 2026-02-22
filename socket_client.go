package main

import (
	"encoding/json"
	"fmt"
	"net"
	"sync"
	"time"
)

const socketSendQueueSize = 1024 // 增加队列大小，提高高并发处理能力

// SocketClient Socket客户端
type SocketClient struct {
	address    string
	connection net.Conn
	connected  bool
	sendQueue  chan []byte
	done       chan struct{}
	closeOnce  sync.Once
	mutex      sync.RWMutex
}

// ProgressMessage 进度消息结构
type ProgressMessage_S struct {
	Type string `json:"Type"`
	Msg  string `json:"Msg"`
}

// NewSocketClient 创建新的Socket客户端
func NewSocketClient(address string) *SocketClient {
	if address == "" {
		return nil
	}

	client := &SocketClient{
		address:   address,
		sendQueue: make(chan []byte, socketSendQueueSize),
		done:      make(chan struct{}),
	}

	client.connect()
	return client
}

// connect 连接到Socket服务器
func (sc *SocketClient) connect() {
	if sc.address == "" {
		return
	}

	conn, err := net.DialTimeout("tcp", sc.address, 10*time.Second)
	if err != nil {
		fmt.Printf("Socket连接失败: %v\n", err)
		return
	}

	sc.mutex.Lock()
	sc.connection = conn
	sc.connected = true
	sc.mutex.Unlock()

	go sc.writeLoop()
}

func (sc *SocketClient) writeLoop() {
	for {
		select {
		case <-sc.done:
			return
		case payload, ok := <-sc.sendQueue:
			if !ok {
				return
			}
			if err := sc.writeRaw(payload); err != nil {
				return
			}
		}
	}
}

func (sc *SocketClient) writeRaw(payload []byte) error {
	sc.mutex.RLock()
	conn := sc.connection
	connected := sc.connected
	sc.mutex.RUnlock()

	if !connected || conn == nil {
		return fmt.Errorf("socket not connected")
	}

	_ = conn.SetWriteDeadline(time.Now().Add(3 * time.Second))
	if _, err := conn.Write(payload); err != nil {
		sc.mutex.Lock()
		sc.connected = false
		sc.mutex.Unlock()
		fmt.Printf("发送Socket消息失败: %v\n", err)
		return err
	}
	return nil
}

// SendMessage 发送进度消息
func (sc *SocketClient) SendMessage(event Event, data map[string]interface{}) {
	select {
	case <-sc.done:
		return
	default:
	}

	sc.mutex.RLock()
	connected := sc.connected
	sc.mutex.RUnlock()
	if !connected {
		return
	}

	dataBytes, err := json.Marshal(data)
	if err != nil {
		fmt.Printf("序列化额外数据失败: %v\n", err)
		return
	}

	message := ProgressMessage_S{
		Type: string(event.Type),
		Msg:  string(dataBytes),
	}

	jsonData, err := json.Marshal(message)
	if err != nil {
		fmt.Printf("序列化消息失败: %v\n", err)
		return
	}
	jsonData = append(jsonData, '\n')

	if event.Type == EventTypeUpdate {
		select {
		case sc.sendQueue <- jsonData:
		default:
		}
		return
	}

	select {
	case sc.sendQueue <- jsonData:
	case <-time.After(2 * time.Second):
		fmt.Println("Socket发送队列阻塞，丢弃非进度消息")
	}
}

// Close 关闭连接
func (sc *SocketClient) Close() {
	sc.closeOnce.Do(func() {
		close(sc.done)
		sc.mutex.Lock()
		if sc.connection != nil {
			_ = sc.connection.Close()
		}
		sc.connected = false
		sc.mutex.Unlock()
	})
}
