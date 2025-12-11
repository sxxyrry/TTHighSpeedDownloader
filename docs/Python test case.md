# Python 测试用例

``` python
import ctypes
import os
import time
import json
from typing import Literal, TypedDict
import uuid

# 定义回调函数类型
PROGRESS_CALLBACK = ctypes.CFUNCTYPE(None, ctypes.c_void_p, ctypes.c_void_p)

# 加载 DLL/SO
if os.name == 'nt':  # Windows
    lib = ctypes.CDLL('./TTHighSpeedDownloader.dll')
else:  # Linux/Mac
    lib = ctypes.CDLL('./TTHighSpeedDownloader.so')

# 定义函数签名
lib.startDownload.argtypes = [
    ctypes.c_char_p,        # tasksData
    ctypes.c_int,           # taskCount
    ctypes.c_int,           # threadCount
    ctypes.c_int,           # chunkSizeMB
    PROGRESS_CALLBACK,      # callback
    ctypes.c_bool,          # useCallbackURL
    ctypes.c_char_p,        # remoteCallbackUrl
    ctypes.POINTER(ctypes.c_bool),  # useSocket
]
lib.startDownload.restype = ctypes.c_int

lib.getDownloader.argtypes = [
    ctypes.c_char_p,        # tasksData
    ctypes.c_int,           # taskCount
    ctypes.c_int,           # threadCount
    ctypes.c_int,           # chunkSizeMB
]
lib.getDownloader.restype = ctypes.c_int

lib.pauseDownload.argtypes = [ctypes.c_int]  # id
lib.pauseDownload.restype = ctypes.c_int

lib.resumeDownload.argtypes = [ctypes.c_int]  # id
lib.resumeDownload.restype = ctypes.c_int

# 定义进度回调函数
last_downloaded = 0

class Event(TypedDict):
    Type: Literal['start', 'startOne', 'update', 'end', 'endOne', 'msg']
    Name: str
    ShowName: str | None
    ID: str | None

class Task(TypedDict):
    URL: str
    SavePath: str
    ShowName: str
    ID: str

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

try:
    start_time = time.time()
    
    # 创建任务数据
    tasks: list[Task] = [
        {
            "URL": "https://example.com/file1.zip",
            "SavePath": "file1.zip",
            "ShowName": "文件1.zip",
            "ID": str(uuid.uuid4()),
        },
        {
            "URL": "https://example.com/file2.zip",
            "SavePath": "file2.zip",
            "ShowName": "文件2.zip",
            "ID": str(uuid.uuid4()),
        }
    ]
    
    tasks_json = json.dumps(tasks)
    tasks_data = tasks_json.encode('utf-8')
    
    # 正确处理useSocket参数
    use_socket_val = ctypes.c_bool(False)

    result = lib.startDownload(
        tasks_data,  # tasksData
        len(tasks),  # taskCount
        64,  # threadCount
        10,  # chunkSizeMB
        progress_cb,  # callback
        False, # useCallbackURL
        None,  # remoteCallbackUrl
        ctypes.byref(use_socket_val),  # useSocket
    )
    
    print()
    end_time = time.time()
    print(f"下载结果：{result}")
    print(f"下载时间：{end_time - start_time:.2f} 秒")
except Exception as e:
    print(f"错误发生：{e}")

# 使用 getDownloader 创建下载器实例示例
try:
    # 使用任务数据创建下载器
    tasks: list[Task] = [
        {
            "URL": "https://example.com/file1.zip",
            "SavePath": "file1.zip",
            "ShowName": "文件1.zip",
            "ID": str(uuid.uuid4()),
        },
        {
            "URL": "https://example.com/file2.zip",
            "SavePath": "file2.zip",
            "ShowName": "文件2.zip",
            "ID": str(uuid.uuid4()),
        }
    ]
    
    tasks_json = json.dumps(tasks)
    tasks_data = tasks_json.encode('utf-8')

    # 创建下载器实例
    downloader_id = lib.getDownloader(
        tasks_data,     # tasksData
        len(tasks),     # taskCount
        64,             # threadCount
        10              # chunkSizeMB
    )
    
    print(f"下载器ID: {downloader_id}")
    
    # 暂停下载
    result = lib.pauseDownload(downloader_id)
    if result == 0:
        print("下载已暂停")
    else:
        print("暂停下载失败")
    
    # 恢复下载
    result = lib.resumeDownload(downloader_id)
    if result == 0:
        print("下载已恢复")
    else:
        print("恢复下载失败")
        
except Exception as e:
    print(f"错误发生：{e}")

```
