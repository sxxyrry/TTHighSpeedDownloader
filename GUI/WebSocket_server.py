# WebSocket_server.py
import asyncio
import websockets
import json
from typing import Set

class WebSocketServer:
    def __init__(self, host: str = "localhost", port: int = 8765):
        self.host = host
        self.port = port
        self.connected_clients: Set[websockets.WebSocketServerProtocol] = set()
    
    async def register_client(self, websocket: websockets.WebSocketServerProtocol):
        """注册新客户端连接"""
        self.connected_clients.add(websocket)
        print(f"客户端已连接: {websocket.remote_address}")
        
    async def unregister_client(self, websocket: websockets.WebSocketServerProtocol):
        """注销断开的客户端"""
        self.connected_clients.discard(websocket)
        print(f"客户端已断开: {websocket.remote_address}")
        
    async def broadcast_message(self, message: dict):
        """向所有连接的客户端广播消息"""
        if self.connected_clients:
            # 确保消息是JSON格式
            json_message = json.dumps(message, ensure_ascii=False)
            # 向所有客户端发送消息
            await asyncio.gather(
                *[client.send(json_message) for client in self.connected_clients],
                return_exceptions=True
            )
    
    async def handle_client(self, websocket: websockets.WebSocketServerProtocol, path: str):
        """处理单个客户端连接"""
        await self.register_client(websocket)
        try:
            async for message in websocket:
                # 处理接收到的消息（可根据需要自定义）
                print(f"收到来自 {websocket.remote_address} 的消息: {message}")
                # 回显消息给发送者
                await websocket.send(f"服务器收到: {message}")
        except websockets.exceptions.ConnectionClosed:
            pass
        finally:
            await self.unregister_client(websocket)
    
    async def start_server(self):
        """启动WebSocket服务器"""
        server = await websockets.serve(
            self.handle_client,
            self.host,
            self.port
        )
        print(f"WebSocket服务器启动在 ws://{self.host}:{self.port}")
        await server.wait_closed()

# def CreateWebSocketServer(port: int):


# 使用示例
async def main():
    # 可以创建多个服务器实例
    server1 = WebSocketServer("localhost", 8765)
    server2 = WebSocketServer("localhost", 8766)
    
    # 并行运行多个服务器
    await asyncio.gather(
        server1.start_server(),
        server2.start_server()
    )

if __name__ == "__main__":
    asyncio.run(main())