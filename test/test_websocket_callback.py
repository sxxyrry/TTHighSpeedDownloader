from ctypes import CDLL
import pytest
import json
import threading
import time
import asyncio
import websockets
import uuid
from platform_utils import is_windows, is_linux, is_macos

class MockWebSocketServer:
    """模拟WebSocket服务器用于测试"""
    def __init__(self, host='localhost', port=8765):
        self.host = host
        self.port = port
        self.messages_received = []
        self.server = None
        self.connections = set()
        self.started = threading.Event()
        
    async def handler(self, websocket, path):
        """处理WebSocket连接"""
        self.connections.add(websocket)
        try:
            async for message in websocket:
                self.messages_received.append({
                    'message': message,
                    'timestamp': time.time()
                })
                # 发送确认响应
                response = json.dumps({
                    "status": "received", 
                    "data": message,
                    "timestamp": time.time()
                })
                await websocket.send(response)
        except websockets.exceptions.ConnectionClosed:
            pass
        finally:
            self.connections.discard(websocket)
            
    async def start_server(self):
        """启动WebSocket服务器"""
        try:
            self.server = await websockets.serve(self.handler, self.host, self.port)
            self.started.set()
            await self.server.wait_closed()
        except Exception as e:
            print(f"WebSocket服务器启动失败: {e}")
            
    def stop_server(self):
        """停止WebSocket服务器"""
        if self.server:
            self.server.close()

@pytest.fixture
def websocket_server():
    """WebSocket服务器fixture"""
    server = MockWebSocketServer()
    return server

def test_websocket_callback(downloader_lib: CDLL | None, sample_tasks: list[dict[str, str]], websocket_server: MockWebSocketServer):
    """测试WebSocket回调功能（跨平台）"""
    if not downloader_lib:
        pytest.skip("共享库未找到")
        
    # 启动WebSocket服务器
    def run_server():
        asyncio.run(websocket_server.start_server())
        
    server_thread = threading.Thread(target=run_server)
    server_thread.daemon = True
    server_thread.start()
    
    # 等待服务器启动
    websocket_server.started.wait(timeout=5)
    time.sleep(1)
    
    if not websocket_server.started.is_set():
        pytest.skip("WebSocket服务器启动超时")
    
    try:
        # 准备任务数据
        tasks_json = json.dumps(sample_tasks)
        tasks_data = tasks_json.encode('utf-8')
        task_count = len(sample_tasks)
        thread_count = 2
        chunk_size_mb = 1
        websocket_url = f"ws://{websocket_server.host}:{websocket_server.port}"
        
        # 检查函数是否存在
        if hasattr(downloader_lib, 'startDownload'):
            # 调用 startDownload 函数，使用WebSocket回调
            downloader_id = downloader_lib.startDownload(
                tasks_data,
                task_count,
                thread_count,
                chunk_size_mb,
                None,  # callback (不使用直接回调)
                True,  # useCallbackURL
                websocket_url.encode('utf-8'),  # remoteCallbackUrl
                None   # useSocket
            )
            
            # 验证返回值
            assert downloader_id != -1, "startDownload 应该成功返回下载器实例ID"
            
            # 等待一段时间让WebSocket消息到达
            time.sleep(3)
            
            # 验证WebSocket服务器收到了消息
            assert len(websocket_server.messages_received) > 0, "WebSocket服务器应该收到消息"
            
            # 验证消息格式
            for msg in websocket_server.messages_received:
                try:
                    json_data = json.loads(msg['message'])
                    assert isinstance(json_data, dict), "WebSocket消息应该是JSON格式的字典"
                except json.JSONDecodeError:
                    pytest.fail("WebSocket消息应该是有效的JSON格式")
            
    finally:
        # 停止服务器
        websocket_server.stop_server()

@pytest.mark.parametrize("platform_name", ["windows", "linux", "macos"])
def test_websocket_callback_on_platform(downloader_lib, sample_tasks, websocket_server, platform_name):
    """在特定平台测试WebSocket回调"""
    from platform_utils import get_platform_name
    current_platform = get_platform_name()
    
    if current_platform != platform_name:
        pytest.skip(f"当前平台是 {current_platform}，跳过 {platform_name} 测试")
    
    test_websocket_callback(downloader_lib, sample_tasks, websocket_server)
