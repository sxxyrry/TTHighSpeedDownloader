# 请阅读 [Python Test Case](/docs/Python test case.md) 文档，此 Py 文件 已经过时！

import ctypes
from hashlib import md5
import os
import time
from typing import Literal, TypedDict
import json

# 定义回调函数类型
PROGRESS_CALLBACK = ctypes.CFUNCTYPE(None, ctypes.c_void_p, ctypes.c_void_p)

# 加载 DLL/SO
if os.name == 'nt':  # Windows
    lib = ctypes.CDLL('../build/Windows/TTHighSpeedDownloader.dll')
else:  # Linux/Mac
    lib = ctypes.CDLL('../build/Linux/TTHighSpeedDownloader.so')

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

lib.startDownloadWithTasks.argtypes = [
    ctypes.c_char_p,        # tasksData - JSON格式的任务数据
    ctypes.c_int,           # taskCount
    ctypes.c_int,           # threadCount
    ctypes.c_int,           # chunkSizeMB
    PROGRESS_CALLBACK,      # callback
    ctypes.c_bool,          # useCallbackURL
    ctypes.c_char_p,        # remoteCallbackUrl
    ctypes.POINTER(ctypes.c_bool),  # useSocket
]
lib.startDownloadWithTasks.restype = ctypes.c_int

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

lib.getDownloaderWithTasks.argtypes = [
    ctypes.c_char_p,        # tasksData - JSON格式的任务数据
    ctypes.c_int,           # taskCount
    ctypes.c_int,           # threadCount
    ctypes.c_int,           # chunkSizeMB
]
lib.getDownloaderWithTasks.restype = ctypes.c_int

lib.pauseDownload.argtypes = [ctypes.c_int]  # id
lib.pauseDownload.restype = ctypes.c_int

lib.resumeDownload.argtypes = [ctypes.c_int]  # id
lib.resumeDownload.restype = ctypes.c_int
lib.startDownload.restype, lib.startMultiDownload.restype = ctypes.c_int, ctypes.c_int

# 定义进度回调函数
last_downloaded = 0

class Event(TypedDict):
    Type: Literal['start', 'startOne', 'update', 'end', 'endOne', 'msg']
    Name: str

def callback_func(event_ptr, msg_ptr):
    global last_downloaded
    
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
                dict[Literal["Index", "Total", "URL", "SavePath", "ShowName"], str | int] | \
                dict[None, None] = json.loads(msg_data.decode('utf-8')) if msg_data else {}
        else:
            msg_dict = {}
        
        # 处理不同类型的消息
        event_type = event_dict.get('Type', '')
        event_name = event_dict.get('Name', '')
        
        if event_type == 'update':
            total = msg_dict.get('Total', 0)
            added = msg_dict.get('Added', 0)
            speed = msg_dict.get('Speed', 0.0)
            
            # 更新进度显示
            print(f"速度：{speed:.2f} B/s {last_downloaded + added}/{total} 字节\r\b", end='', flush=True)
            last_downloaded += added
            
        elif event_type == 'msg':
            text = msg_dict.get('Text', '')
            print(f"\n{event_name}：{text}")
        
        elif event_type == 'startOne':
            last_downloaded = 0
            url = msg_dict.get('URL', '')
            show_name = msg_dict.get('ShowName', url)
            index = msg_dict.get('Index', 0)
            total = msg_dict.get('Total', 0)
            print(f"\n开始下载：{show_name}，这是第 {index} 个下载，总共 {total} 个。")
        elif event_type == 'start':
            last_downloaded = 0
            print(f"\n开始下载")
        elif event_type == 'endOne':
            last_downloaded = 0
            url = msg_dict.get('URL', '')
            show_name = msg_dict.get('ShowName', url)
            index = msg_dict.get('Index', 0)
            total = msg_dict.get('Total', 0)
            print(f"\n下载完成：{show_name}，这是第 {index} 个下载，总共 {total} 个。")
        elif event_type == 'end':
            last_downloaded = 0
            print(f"\n下载完成！")

            
    except Exception as e:
        print(f"\n错误于回调函数中：{e}")

# 创建回调函数实例
progress_cb = PROGRESS_CALLBACK(callback_func)

# 调用下载函数
try:
    start_time = time.time()
    # 正确处理useSocket参数
    use_socket_val = ctypes.c_bool(False)
    
    # 使用任务数据的下载示例
    tasks = [
        {
            "URL": "https://httpbin.org/json",
            "SavePath": "downloaded_file.json",
            "ShowName": "JSON测试文件"
        }
    ]
    
    tasks_json = json.dumps(tasks)
    tasks_data = tasks_json.encode('utf-8')
    
    result = lib.startDownloadWithTasks(
        tasks_data,  # tasksData
        len(tasks),  # taskCount
        64,          # threadCount
        10,          # chunkSizeMB
        progress_cb, # callback
        False,       # useCallbackURL
        None,        # remoteCallbackUrl
        ctypes.byref(use_socket_val),  # useSocket
    )
    
    print()
    end_time = time.time()

    print(f"下载结果：{result}")
    print(f"下载时间：{end_time - start_time:.2f} 秒")
    
    # 下载文件的 MD5 值
    save_paths = ["downloaded_file.json"]
    for i in save_paths:
        if os.path.exists(i):
            md5_hash = md5()
            with open(i, "rb") as f:
                for chunk in iter(lambda: f.read(4096), b""):
                    md5_hash.update(chunk)
            print(f"{i} 的 MD5 值为：{md5_hash.hexdigest()}")

except Exception as e:
    print(f"错误发生：{e}")