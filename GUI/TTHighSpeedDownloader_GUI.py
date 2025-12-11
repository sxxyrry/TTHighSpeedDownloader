import ctypes
import os
import pathlib
import sys
import time
from typing import Literal, TypedDict
import json
import webview
import uuid
import threading
import logging
import configparser
# from watchdog.observers import Observer
# from watchdog.events import FileSystemEventHandler


# class FileChangeHandler(FileSystemEventHandler):
#     def __init__(self, window):
#         self.window = window
        
#     def on_modified(self, event):
#         if not event.is_directory and event.src_path.startswith('./files'):
#             # print(f"检测到文件变化: {event.src_path}")
#             # 刷新页面
#             self.window.evaluate_js("location.reload();")

def get_config_path():
    """获取配置文件路径"""
    if getattr(sys, 'frozen', False):
        # 如果是打包后的exe文件
        application_path = os.path.dirname(sys.executable)
    else:
        # 如果是开发环境的脚本文件
        application_path = os.path.dirname(os.path.abspath(__file__))
    return os.path.join(application_path, './config.cfg')

def load_config():
    """加载配置"""
    config = configparser.ConfigParser()
    config_path = get_config_path()
    
    # 如果配置文件不存在，创建默认配置
    if not os.path.exists(config_path):
        config['DOWNLOAD'] = {
            'thread_count': '64',
            'chunk_size_mb': '10'
        }
        with open(config_path, 'w') as configfile:
            config.write(configfile)
    else:
        
        config.read(config_path)
        
    return config

def save_config(thread_count, chunk_size_mb):
    """保存配置"""
    config = configparser.ConfigParser()
    config_path = get_config_path()
    
    # 如果配置文件已存在，先读取现有配置
    if os.path.exists(config_path):
        config.read(config_path)
    
    # 确保有 DOWNLOAD section
    if 'DOWNLOAD' not in config:
        config['DOWNLOAD'] = {}
        
    config['DOWNLOAD']['thread_count'] = str(thread_count)
    config['DOWNLOAD']['chunk_size_mb'] = str(chunk_size_mb)
    
    with open(config_path, 'w') as configfile:
        config.write(configfile)


# 定义回调函数类型
PROGRESS_CALLBACK = ctypes.CFUNCTYPE(None, ctypes.c_void_p, ctypes.c_void_p)

# 加载 DLL/SO
if os.name == 'nt':  # Windows
    lib = ctypes.CDLL('./TTHighSpeedDownloader.dll')
elif sys.platform == 'darwin':  # MacOS
    lib = ctypes.CDLL('./TTHighSpeedDownloader.dylib')
else:  # Linux/Mac
    lib = ctypes.CDLL('./TTHighSpeedDownloader.so')

class Task(TypedDict):
    URL: str
    SavePath: str
    ID: uuid.UUID

# 定义函数签名
lib.startDownload.argtypes = [
    ctypes.c_char_p,        # tasksData - JSON格式的任务数据
    ctypes.c_int,           # taskCount - 任务数量
    ctypes.c_int,           # threadCount
    ctypes.c_int,           # chunkSizeMB
    PROGRESS_CALLBACK,      # callback
    ctypes.c_bool,          # useCallbackURL
    ctypes.c_char_p,        # remoteCallbackUrl
    ctypes.POINTER(ctypes.c_bool),  # useSocket
]
lib.getDownloader.argtypes = [
    ctypes.c_char_p,                 # tasksData - JSON格式的任务数据
    ctypes.c_int,                    # taskCount - 任务数量
    ctypes.c_int,                    # threadCount
    ctypes.c_int,                    # chunkSizeMB
]
lib.getDownloader.restype = ctypes.c_int

lib.pauseDownload.argtypes = [ctypes.c_int]  # id
lib.pauseDownload.restype = ctypes.c_int

lib.resumeDownload.argtypes = [ctypes.c_int]  # id
lib.resumeDownload.restype = ctypes.c_int
lib.startDownload.restype = ctypes.c_int

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
        
        # 加载配置
        config = load_config()
        thread_count = config.getint('DOWNLOAD', 'thread_count', fallback=64)
        chunk_size_mb = config.getint('DOWNLOAD', 'chunk_size_mb', fallback=10)
        
        # 构造任务数据
        tasks = []
        for i in range(len(urls)):
            task = {
                "URL": urls[i],
                "SavePath": savepaths[i],
                "ShowName": savepaths[i].split('/')[-1] if '/' in savepaths[i] else savepaths[i].split('\\')[-1],
                "ID": str(uuid.uuid4())
            }
            tasks.append(task)
        
        # 将任务数据转换为JSON字符串
        tasks_json = json.dumps(tasks, ensure_ascii=False)
        b_tasks_json = tasks_json.encode('utf-8')
        
        # 准备参数
        tasks_data = ctypes.c_char_p(b_tasks_json)
        task_count = ctypes.c_int(len(tasks))

        # 调用Go函数（新的接口）
        result = lib.startDownload(
            tasks_data,         # tasksData - JSON格式的任务数据
            task_count,         # taskCount - 任务数量
            ctypes.c_int(thread_count),    # threadCount
            ctypes.c_int(chunk_size_mb),   # chunkSizeMB
            progress_cb,        # callback
            False,              # useCallbackURL
            None,               # remoteCallbackUrl
            ctypes.byref(use_socket_val)  # useSocket
        )
        print()
        end_time = time.time()
        print(f"下载结果：{result}")
        print(f"下载时间：{end_time - start_time:.2f} 秒")
        if result > 0:
            # 调用pauseDownload来清理资源
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

    with open(os.path.join(pathlib.Path(__file__).parent.resolve(), './VersionHistory.txt'), 'r', encoding='utf-8') as file:
        versionHistory: str = file.read()
    
        version = ''

        for item in versionHistory.split('\n'):
            if item.endswith(' V:'):
                version: str = item.split(' V:')[0]

    class Api:
        def download(self, urls, savepaths):
            print("开始下载...")
            
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

        def get_Version(self):
            return version
        
        def get_VersionHistory(self):
            return versionHistory

        def get_Config(self):
            """获取配置"""
            config = load_config()
            return {
                'thread_count': config.getint('DOWNLOAD', 'thread_count', fallback=64),
                'chunk_size_mb': config.getint('DOWNLOAD', 'chunk_size_mb', fallback=10)
            }

        def save_Config(self, thread_count, chunk_size_mb):
            """保存配置"""
            save_config(thread_count, chunk_size_mb)
            return True


    # 在创建webview窗口时注册API
    api = Api()
    window: webview.Window = webview.create_window( # pyright: ignore[reportUnknownMemberType, reportAssignmentType]
        'TT High Speed Downloader TT 高速下载器',
        './files/index.html',
        width=850,
        height=850,
        js_api=api,
        # frameless=True,
        # text_select=False,
        text_select=True,
    )
    
    # 设置回调窗口引用
    global callback_window
    callback_window = window
    # window

    running = True
    # # 启动文件监控线程
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
    
    load_config()

    webview.start(
        icon=os.path.join(pathlib.Path(__file__).parent.resolve(), './files/assets/TTHSD.ico'),
        debug=True,
    )

    os._exit(0)

    # webview.overrideredirect(True)
       
if __name__ == '__main__':
    main()
