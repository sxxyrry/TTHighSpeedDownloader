import pytest
import json
import threading
import time
import socket
import struct
import uuid
from platform_utils import is_windows, is_linux, is_macos
import ctypes
from else_utils import get_download_dir, check_file_content_is_correct

class MockTCPServer:
    """模拟TCP服务器用于测试Socket回调"""
    def __init__(self, host='localhost', port=8766):
        self.host = host
        self.port = port
        self.messages_received = []
        self.server_socket = None
        self.running = False
        self.client_sockets = []
        self.started = threading.Event()
        
    def handle_client(self, client_socket):
        """处理客户端连接"""
        self.client_sockets.append(client_socket)
        try:
            while self.running:
                # 设置超时以允许优雅关闭
                client_socket.settimeout(1.0)
                try:
                    # 接收数据长度（4字节）
                    length_bytes = client_socket.recv(4)
                    if not length_bytes:
                        break
                        
                    # 解析数据长度
                    data_length = struct.unpack('!I', length_bytes)[0]
                    
                    # 接收实际数据
                    data = client_socket.recv(data_length)
                    if data:
                        message_data = {
                            'data': data.decode('utf-8'),
                            'timestamp': time.time(),
                            'client_address': client_socket.getpeername()
                        }
                        self.messages_received.append(message_data)
                        
                        # 发送确认响应
                        response = json.dumps({
                            "status": "received",
                            "timestamp": time.time()
                        }).encode('utf-8')
                        response_length = struct.pack('!I', len(response))
                        client_socket.send(response_length + response)
                        
                except socket.timeout:
                    continue
                except Exception as e:
                    break
                    
        except Exception as e:
            pass
        finally:
            if client_socket in self.client_sockets:
                self.client_sockets.remove(client_socket)
            try:
                client_socket.close()
            except:
                pass
            
    def start_server(self):
        """启动TCP服务器"""
        try:
            self.server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            self.server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            self.server_socket.bind((self.host, self.port))
            self.server_socket.listen(5)
            self.running = True
            self.started.set()
            
            while self.running:
                try:
                    self.server_socket.settimeout(1.0)
                    client_socket, addr = self.server_socket.accept()
                    client_thread = threading.Thread(target=self.handle_client, args=(client_socket,))
                    client_thread.daemon = True
                    client_thread.start()
                except socket.timeout:
                    continue
                except Exception as e:
                    if self.running:  # 只在非正常关闭时报告错误
                        print(f"服务器接受连接时出错: {e}")
                    break
        except Exception as e:
            print(f"TCP服务器启动失败: {e}")
        finally:
            self.started.set()  # 确保事件被设置
                
    def stop_server(self):
        """停止TCP服务器"""
        self.running = False
        # 关闭所有客户端连接
        for client_socket in self.client_sockets[:]:
            try:
                client_socket.close()
            except:
                pass
        # 关闭服务器socket
        if self.server_socket:
            try:
                self.server_socket.close()
            except:
                pass

@pytest.fixture
def tcp_server():
    """TCP服务器fixture"""
    server = MockTCPServer()
    return server

def test_socket_callback(downloader_lib: ctypes.CDLL | None, sample_tasks: list[dict[str, str]], tcp_server: MockTCPServer):
    """测试Socket回调功能（跨平台）"""
    if not downloader_lib:
        pytest.skip("共享库未找到")
        
    # 启动TCP服务器
    def run_server():
        tcp_server.start_server()
        
    server_thread = threading.Thread(target=run_server)
    server_thread.daemon = True
    server_thread.start()
    
    # 等待服务器启动
    tcp_server.started.wait(timeout=5)
    time.sleep(1)
    
    if not tcp_server.started.is_set():
        pytest.skip("TCP服务器启动超时")
    
    try:
        # 准备任务数据
        tasks_json = json.dumps(sample_tasks)
        tasks_data = tasks_json.encode('utf-8')
        task_count = len(sample_tasks)
        thread_count = 2
        chunk_size_mb = 1
        socket_url = f"tcp://{tcp_server.host}:{tcp_server.port}"
        
        # 检查函数是否存在
        if hasattr(downloader_lib, 'startDownload'):
            # 注意：根据API说明，useSocket参数是bool*类型，需要传递指针
            use_socket = ctypes.c_bool(True)
            
            get_download_dir()

            # 调用 startDownload 函数，使用Socket回调
            downloader_id = downloader_lib.startDownload(
                tasks_data,
                task_count,
                thread_count,
                chunk_size_mb,
                None,  # callback (不使用直接回调)
                True,  # useCallbackURL
                socket_url.encode('utf-8'),  # remoteCallbackUrl
                ctypes.byref(use_socket)  # useSocket
            )
            
            check_file_content_is_correct(sample_tasks=sample_tasks)

            # 验证返回值
            assert downloader_id != -1, "startDownload 应该成功返回下载器实例ID"
            
            # # 等待一段时间让Socket消息到达
            # time.sleep(3)
            
            # 验证TCP服务器收到了消息
            assert len(tcp_server.messages_received) > 0, "TCP服务器应该收到消息"
            
            # 验证消息格式
            for msg in tcp_server.messages_received:
                try:
                    json_data = json.loads(msg['data'])
                    assert isinstance(json_data, dict), "Socket消息应该是JSON格式的字典"
                except json.JSONDecodeError:
                    pytest.fail("Socket消息应该是有效的JSON格式")
            
    finally:
        # 停止服务器
        tcp_server.stop_server()

@pytest.mark.parametrize("platform_name", ["windows", "linux", "macos"])
def test_socket_callback_on_platform(downloader_lib, sample_tasks, tcp_server, platform_name):
    """在特定平台测试Socket回调"""
    from platform_utils import get_platform_name
    current_platform = get_platform_name()
    
    if current_platform != platform_name:
        pytest.skip(f"当前平台是 {current_platform}，跳过 {platform_name} 测试")
    
    test_socket_callback(downloader_lib, sample_tasks, tcp_server)
