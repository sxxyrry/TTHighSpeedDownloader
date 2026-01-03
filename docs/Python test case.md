# Python 测试用例

``` python
import ctypes
import sys
import time
import json
from typing import Literal, TypedDict
import uuid

# 定义回调函数类型
PROGRESS_CALLBACK = ctypes.CFUNCTYPE(None, ctypes.c_void_p, ctypes.c_void_p)

# 加载 DLL/SO/DYLIB
if sys.platform.startswith('win'):  # Windows
    lib = ctypes.CDLL('./TTHighSpeedDownloader.dll')
elif sys.platform.startswith('darwin'):  # MacOS
    lib = ctypes.CDLL('./TTHighSpeedDownloader.dylib')
elif sys.platform.startswith('linux'):  # Linux
    lib = ctypes.CDLL('./TTHighSpeedDownloader.so')
else:
    raise OSError('Unsupported operating system')

# 定义函数签名
lib.startDownload.argtypes = [
    ctypes.c_char_p,        # tasksData
    ctypes.c_int,           # taskCount
    ctypes.c_int,           # threadCount
    ctypes.c_int,           # chunkSizeMB
    PROGRESS_CALLBACK,      # callback
    ctypes.c_bool,          # useCallbackURL
    ctypes.c_char_p,        # userAgent
    ctypes.c_char_p,        # remoteCallbackUrl
    ctypes.POINTER(ctypes.c_bool),  # useSocket
]
lib.startDownload.restype = ctypes.c_int

lib.getDownloader.argtypes = [
    ctypes.c_char_p,        # tasksData
    ctypes.c_int,           # taskCount
    ctypes.c_int,           # threadCount
    ctypes.c_int,           # chunkSizeMB
    PROGRESS_CALLBACK,      # callback
    ctypes.c_bool,          # useCallbackURL
    ctypes.c_char_p,        # userAgent
    ctypes.c_char_p,        # remoteCallbackUrl
    ctypes.POINTER(ctypes.c_bool),  # useSocket
]
lib.getDownloader.restype = ctypes.c_int

lib.startDownload_ID.argtypes = [ctypes.c_int]  # id
lib.startDownload_ID.restype = ctypes.c_int

lib.pauseDownload.argtypes = [ctypes.c_int]  # id
lib.pauseDownload.restype = ctypes.c_int

lib.resumeDownload.argtypes = [ctypes.c_int]  # id
lib.resumeDownload.restype = ctypes.c_int

UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0'

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

# 定义进度回调函数
def callback_func(event_ptr, msg_ptr):
    # 将 ctypes 指针转换为字节数据，然后解码为 JSON
    try:
        # 从指针获取事件数据
        if event_ptr:
            event_data = ctypes.cast(event_ptr, ctypes.c_char_p).value
            event_dict: Event = json.loads(event_data.decode('utf-8')) if event_data else {}
        else:
            event_dict: Event = {
                'ID': '',
                'Type': 'msg',
                'Name': '',
                'ShowName': None,
            }
        
        # 从指针获取消息数据
        if msg_ptr:
            msg_data = ctypes.cast(msg_ptr, ctypes.c_char_p).value
            msg_dict: dict[Literal["Total", "Downloaded", "Speed"], int | float] | \
                dict[Literal["Text"], str] | \
                dict[Literal["Index", "Total", "URL", "SavePath", "ShowName", "ID"], str | int] | \
                dict[None, None] = json.loads(msg_data.decode('utf-8')) if msg_data else {}
        else:
            msg_dict: dict[Literal["Total", "Downloaded", "Speed"], int | float] | \
                dict[Literal["Text"], str] | \
                dict[Literal["Index", "Total", "URL", "SavePath", "ShowName", "ID"], str | int] | \
                dict[None, None] = {}
        
        # 处理不同类型的消息
        event_type = event_dict.get('Type', '')
        event_name = event_dict.get('Name', '')
        
        if event_type == 'update':
            total = msg_dict.get('Total', 0)
            downloaded = msg_dict.get('Downloaded', 0)  # 使用绝对下载量而非增量
            speed = msg_dict.get('Speed', 0.0)
            
            # 更新进度显示，使用绝对下载量
            print(f"速度：{speed:.2f} B/s {downloaded}/{total} 字节", end='\r', flush=True)
            
        elif event_type == 'msg':
            text = msg_dict.get('Text', '')
            print(f"\n{event_name}：{text}")
        
        elif event_type == 'startOne':
            task_id = msg_dict.get('ID', '')
            url = msg_dict.get('URL', '')
            show_name = msg_dict.get('ShowName', url)
            index = msg_dict.get('Index', 0)
            total = msg_dict.get('Total', 0)
            print(f"\n开始下载：{show_name}，这是第 {index} 个下载，总共 {total} 个。ID: {task_id}")

        elif event_type == 'start':
            print(f"\n开始下载")

        elif event_type == 'endOne':
            task_id = msg_dict.get('ID', '')
            url = msg_dict.get('URL', '')
            show_name = msg_dict.get('ShowName', url)
            index = msg_dict.get('Index', 0)
            total = msg_dict.get('Total', 0)
            print(f"\n下载完成：{show_name}，这是第 {index} 个下载，总共 {total} 个。ID: {task_id}")

        elif event_type == 'end':
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
        UA.encode('utf-8'), # userAgent
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
    use_socket_val = ctypes.c_bool(False)
    downloader_id = lib.getDownloader(
        tasks_data,     # tasksData
        len(tasks),     # taskCount
        64,             # threadCount
        10,             # chunkSizeMB
        progress_cb,    # callback
        False,          # useCallbackURL
        UA.encode('utf-8'), # userAgent
        None,           # remoteCallbackUrl
        ctypes.byref(use_socket_val)  # useSocket
    )
    
    print(f"下载器ID: {downloader_id}")
    
    # 开始下载
    result = lib.startDownload_ID(downloader_id)
    if result == 0:
        print("下载已开始")
    else:
        print("开始下载失败")
    
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
