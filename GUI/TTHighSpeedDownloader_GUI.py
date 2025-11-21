import ctypes
import os
import pathlib
import sys
import time
from turtle import onclick
from typing import Literal, TypedDict
import json
import webview
import uuid
import threading
# from watchdog.observers import Observer
# from watchdog.events import FileSystemEventHandler
import logging


# class FileChangeHandler(FileSystemEventHandler):
#     def __init__(self, window):
#         self.window = window
        
#     def on_modified(self, event):
#         if not event.is_directory and event.src_path.startswith('./files'):
#             # print(f"检测到文件变化: {event.src_path}")
#             # 刷新页面
#             self.window.evaluate_js("location.reload();")


# 定义回调函数类型
PROGRESS_CALLBACK = ctypes.CFUNCTYPE(None, ctypes.c_void_p, ctypes.c_void_p)

# 加载 DLL/SO
if os.name == 'nt':  # Windows
    lib = ctypes.CDLL('./TTHighSpeedDownloader.dll')
else:  # Linux/Mac
    lib = ctypes.CDLL('./TTHighSpeedDownloader.so')

class Task(TypedDict):
    URL: str
    SavePath: str
    ID: uuid.UUID

# 定义函数签名
lib.startDownload.argtypes = [
    ctypes.c_int,           # threadCount
    ctypes.c_int,           # chunkSizeMB
    ctypes.c_char_p,        # urlStr
    ctypes.c_char_p,        # savePath
    PROGRESS_CALLBACK,      # callback
    ctypes.c_bool,          # useCallbackURL
    ctypes.c_char_p,        # remoteCallbackUrl
    ctypes.POINTER(ctypes.c_bool),  # useSocket
]
lib.startMultiDownload.argtypes = [
    ctypes.POINTER(ctypes.c_char_p), # urls - URL数组
    ctypes.c_int,                    # urlCount - URL数量
    ctypes.POINTER(ctypes.c_char_p), # savePaths - 保存路径数组
    ctypes.c_int,                    # pathCount - 路径数量
    ctypes.c_int,                    # threadCount
    ctypes.c_int,                    # chunkSizeMB
    PROGRESS_CALLBACK,               # callback
    ctypes.c_bool,                   # useCallbackURL
    ctypes.c_char_p,                 # remoteCallbackUrl
    ctypes.POINTER(ctypes.c_bool),   # useSocket
]
lib.getDownloader.argtypes = [
    ctypes.POINTER(ctypes.c_char_p), # urls - URL数组
    ctypes.c_int,                    # urlCount - URL数量
    ctypes.POINTER(ctypes.c_char_p), # savePaths - 保存路径数组
    ctypes.c_int,                    # pathCount - 路径数量
    ctypes.c_int,                    # threadCount
    ctypes.c_int,                    # chunkSizeMB
]
lib.getDownloader.restype = ctypes.c_int

lib.pauseDownload.argtypes = [ctypes.c_int]  # id
lib.pauseDownload.restype = ctypes.c_int

lib.resumeDownload.argtypes = [ctypes.c_int]  # id
lib.resumeDownload.restype = ctypes.c_int
lib.startDownload.restype, lib.startMultiDownload.restype = ctypes.c_int, ctypes.c_int

# 定义进度回调函数
last_downloaded = 0
# 为回调函数添加窗口引用
callback_window = None

class Event(TypedDict):
    Type: Literal['start', 'startOne', 'update', 'end', 'endOne', 'msg']
    Name: str

def callback_func(event_ptr, msg_ptr):
    global last_downloaded, callback_window
    
    # 将 ctypes 指针转换为字节数据，然后解码为 JSON
    try:
        # 从指针获取事件数据
        if event_ptr:
            event_data = ctypes.cast(event_ptr, ctypes.c_char_p).value
            event_dict: Event = json.loads(event_data.decode('utf-8')) if event_data else {}
        else:
            event_dict = {}
        
        # 从指针获取消息数据
        if msg_ptr:
            msg_data = ctypes.cast(msg_ptr, ctypes.c_char_p).value
            msg_dict: dict[Literal["Total", "Added", "Speed"], int | float] | \
                dict[Literal["Text"], str] | \
                dict[Literal["Index", "Total", "URL"], str | int] | \
                dict[None, None] = json.loads(msg_data.decode('utf-8')) if msg_data else {}
        else:
            msg_dict = {}
        
        # 处理不同类型的消息
        event_type = event_dict.get('Type', '')
        event_name = event_dict.get('Name', '')
        
        # 构造发送给前端的数据
        progress_data = {
            "type": event_type,
            "name": event_name,
            "data": msg_dict
        }
        
        if event_type == 'update':
            total = msg_dict.get('Total', 0)
            added = msg_dict.get('Added', 0)
            speed = msg_dict.get('Speed', 0.0)
            
            # 更新进度显示
            print(f"速度：{speed:.2f} B/s {last_downloaded + added}/{total} 字节\r\b", end='', flush=True)
            last_downloaded += added
            
            # 添加进度信息
            progress_data["progress"] = {
                "downloaded": last_downloaded,
                "total": total,
                "speed": speed,
                "added": added
            }
            
        elif event_type == 'msg':
            text = msg_dict.get('Text', '')
            print(f"\n{event_name}：{text}")
            
        elif event_type == 'startOne':
            last_downloaded = 0
            url = msg_dict.get('URL', '')
            index = msg_dict.get('Index', 0)
            total = msg_dict.get('Total', 0)
            print(f"\n开始下载：{url}，这是第 {index} 个下载，总共 {total} 个。")
            
        elif event_type == 'start':
            last_downloaded = 0
            print(f"\n开始下载")
            
        elif event_type == 'endOne':
            last_downloaded = 0
            url = msg_dict.get('URL', '')
            index = msg_dict.get('Index', 0)
            total = msg_dict.get('Total', 0)
            print(f"\n下载完成：{url}，这是第 {index} 个下载，总共 {total} 个。")
            
        elif event_type == 'end':
            last_downloaded = 0
            print(f"\n下载完成！")
            
        # 通过evaluate_js向页面发送进度更新
        if callback_window:
            try:
                # 将数据转换为JSON字符串并发送到前端
                json_data = json.dumps(progress_data, ensure_ascii=False)
                callback_window.evaluate_js(f"""
                    if (typeof handleProgressUpdate === 'function') {{
                        handleProgressUpdate({json_data});
                    }}
                """)
            except Exception as e:
                print(f"发送进度更新到前端时出错: {e}")
            
    except Exception as e:
        print(f"\n错误于回调函数中：{e}")
        # 发送错误信息到前端
        if callback_window:
            try:
                error_data = {
                    "type": "error",
                    "message": str(e)
                }
                json_data = json.dumps(error_data, ensure_ascii=False)
                callback_window.evaluate_js(f"""
                    if (typeof handleProgressUpdate === 'function') {{
                        handleProgressUpdate({json_data});
                    }}
                """)
            except Exception as send_error:
                print(f"发送错误信息到前端时出错: {send_error}")

def RunDownload(urls: list[str], savepaths: list[str]):
    global last_downloaded
    # 重置全局变量
    last_downloaded = 0
    
    # 创建回调函数实例
    progress_cb = PROGRESS_CALLBACK(callback_func)

    # 调用下载函数
    try:
        start_time = time.time()
        # 正确处理useSocket参数
        use_socket_val = ctypes.c_bool(False)
        
        burls: list[bytes] = [bytes(url, encoding='utf-8') for url in urls]
        bsavepaths: list[bytes] = [bytes(path, encoding='utf-8') for path in savepaths]

        # 创建 ctypes 字符串数组
        url_array = (ctypes.c_char_p * len(burls))(*burls)
        path_array = (ctypes.c_char_p * len(bsavepaths))(*bsavepaths)

        # 修改 startMultiDownload 调用部分
        result = lib.startMultiDownload(
            url_array,  # urlStrs
            len(burls),  # urlCount
            path_array,  # savePaths
            len(bsavepaths),  # pathCount
            64,  # threadCount
            10,  # chunkSizeMB
            progress_cb,  # callback
            False, # useCallbackURL
            None,  # remoteCallbackUrl
            ctypes.byref(use_socket_val), # useSocket
        )
        print()
        end_time = time.time()
        print(f"下载结果：{result}")
        print(f"下载时间：{end_time - start_time:.2f} 秒")
        if result > 0:
            # 调用pauseDownload来清理资源（根据FastDownloader实现，pauseDownload会清理下载器）
            
            cleanup_result = lib.pauseDownload(result)
            if cleanup_result != 0:
                print(f"警告：清理下载器资源失败，ID: {result}")

    except Exception as e:
        print(f"错误发生：{e}")
        # 发送错误信息到前端
        if callback_window:
            try:
                error_data = {
                    "type": "error",
                    "message": str(e)
                }
                json_data = json.dumps(error_data, ensure_ascii=False)
                callback_window.evaluate_js(f"""
                    if (typeof handleProgressUpdate === 'function') {{
                        handleProgressUpdate({json_data});
                    }}
                """)
            except Exception as send_error:
                print(f"发送错误信息到前端时出错: {send_error}")

def main():

    with open(os.path.join(pathlib.Path(__file__).parent.resolve(), './VersionLog.txt'), 'r', encoding='utf-8') as file:
        versionLog: str = file.read()
    
        version = ''

        for item in versionLog.split('\n'):
            if item.endswith(' V:'):
                version: str = item.split(' V:')[0]
                break

    class Api:
        def download(self, urls, savepaths):
            print("开始下载...")
            # 添加实际下载逻辑
            # 示例下载地址和路径
            # urls = ["https://httpbin.org/json"]  # 替换为实际URL
            # savepaths = ["./downloaded_file.json"]  # 替换为实际保存路径
            
            # 在新线程中运行下载，避免阻塞UI
            def run_download():
                RunDownload(urls, savepaths)
            
            download_thread = threading.Thread(target=run_download, daemon=True)
            download_thread.start()

        def minimize(self):
            """最小化窗口"""
            window.minimize()

        def maximize(self):
            """最大化窗口"""
            window.maximize()

        def restore(self):
            """恢复窗口（最小化时）"""
            window.restore()

        def exit(self, status: int = 0):
            running = False
            window.destroy()
            os._exit(status=status)

        def get_version(self):
            return version
        
        def get_versionLog(self):
            return versionLog

    # 在创建webview窗口时注册API
    api = Api()
    window: webview.Window = webview.create_window( # pyright: ignore[reportUnknownMemberType, reportAssignmentType]
        'TT High Speed Downloader TT 高速下载器',
        './files/index.html',
        width=850,
        height=850,
        js_api=api,
        frameless=True,
        text_select=False
    )
    
    # 设置回调窗口引用
    global callback_window
    callback_window = window
    # window

    running = True

    # 启动文件监控线程
    # def start_file_watcher():
    #     event_handler = FileChangeHandler(window)
    #     observer = Observer()
    #     observer.schedule(event_handler, './files', recursive=True)
    #     observer.start()
    #     try:
    #         while running:
    #             time.sleep(0.5)
    #     except KeyboardInterrupt:
    #         observer.stop()
    #     observer.join()
    
    # # 在后台线程中启动文件监控
    # watcher_thread = threading.Thread(target=start_file_watcher, daemon=True)
    # watcher_thread.start()
    
    webview.start(icon=os.path.join(pathlib.Path(__file__).parent.resolve(), './files/assets/TTHSD.ico'))

    # webview.overrideredirect(True)
       
if __name__ == '__main__':
    main()
