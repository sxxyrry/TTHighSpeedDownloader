# TT High Speed Downloader TT 高速下载器

TT High Speed Downloader TT 高速下载器 是一个高性能的多线程文件下载器，支持并发下载、断点续传和进度监控。该项目使用 Go 语言开发。编译为 dll 或者 so 供全平台、全语言调用。

## 功能特性

- 多线程并发下载，提高下载速度
- 支持多个文件下载（不是同时下载，因为现在可能会存在回调被同时调用）
- 实时进度监控和速度计算
- 暂停和恢复下载功能
- 支持自定义线程数和分块大小
- 提供 C 接口，支持 多语言调用
- 支持任务信息（URL、保存路径、显示名称）

## 许可证

本项目基于 [GNU General Public License v3.0](https://www.gnu.org/licenses/gpl-3.0.en.html) 开源发布。

## 使用的 Go 库

- ### github.com/gorilla/websocket v1.5.3

## 重新编译

- Windows

    ```bash
    # 在 FastDownloader 下
    # 清理并更新依赖
    go mod tidy

    # 编译共享库
    go build -buildmode=c-shared -o build/Windows/TTHighSpeedDownloader.dll .
    ```

- Linux

    ```bash
    # 在 FastDownloader 下
    # 清理并更新依赖
    go mod tidy

    # 编译共享库
    go build -buildmode=c-shared -o build/Linux/TTHighSpeedDownloader.so .
    ```

## 安装

将 [TTHighSpeedDownloader.dll](./build/Windows/TTHighSpeedDownloader.dll) (Windows) 或 [TTHighSpeedDownloader.so](./build/Linux/libTTHighSpeedDownloader.so) (Linux（Ubuntu 22.04.5 LTS，因为作者只有这个虚拟机*）) 文件放置在您的项目目录中。

## API 参数说明

### startDownload 函数

- 参数

    | 参数名               | 类型                   | 说明                     |
    |----------------------|------------------------|--------------------------|
    | `threadCount`        | `int`                  | 下载线程数               |
    | `chunkSizeMB`        | `int`                  | 每个下载块的大小 ( MB )  |
    | `urlStr`             | `char*`                | 要下载的文件 URL         |
    | `savePath`           | `char*`                | 文件保存路径             |
    | `callback`           | `progress_callback_t`  | 进度回调函数             |
    | `useCallbackURL`     | `bool`                 | 是否使用远程回调URL      |
    | `remoteCallbackUrl`  | `char*`                | 远程回调URL              |
    | `useSocket`          | `bool*`                | 是否使用 Socket 通信     |

- 返回值

  返回值类型: int

  返回值含义:

  - 成功时返回下载器实例ID（正整数）

  - 失败时返回-1

### startDownloadWithTasks 函数（新增）

- 参数

    | 参数名               | 类型                   | 说明                     |
    |----------------------|------------------------|--------------------------|
    | `tasksData`          | `char*`                | JSON格式的任务数据       |
    | `taskCount`          | `int`                  | 任务数量                 |
    | `threadCount`        | `int`                  | 下载线程数               |
    | `chunkSizeMB`        | `int`                  | 每个下载块的大小 ( MB )  |
    | `callback`           | `progress_callback_t`  | 进度回调函数             |
    | `useCallbackURL`     | `bool`                 | 是否使用远程回调URL      |
    | `remoteCallbackUrl`  | `char*`                | 远程回调 URL             |
    | `useSocket`          | `bool*`                | 是否使用 Socket 通信     |

- 返回值

  返回值类型: int

  返回值含义:

  - 成功时返回下载器实例ID（正整数）

  - 失败时返回-1

### startMultiDownload 函数

- 参数

    | 参数名               | 类型                   | 说明                     |
    |----------------------|------------------------|--------------------------|
    | `urls`               | `char**`               | URL 数组                 |
    | `urlCount`           | `int`                  | URL 数量                 |
    | `savePaths`          | `char**`               | 保存路径数组             |
    | `pathCount`          | `int`                  | 路径数量                 |
    | `threadCount`        | `int`                  | 下载线程数               |
    | `chunkSizeMB`        | `int`                  | 每个下载块的大小 ( MB )  |
    | `callback`           | `progress_callback_t`  | 进度回调函数             |
    | `useCallbackURL`     | `bool`                 | 是否使用远程回调URL      |
    | `remoteCallbackUrl`  | `char*`                | 远程回调 URL             |
    | `useSocket`          | `bool*`                | 是否使用 Socket 通信     |

- 返回值

  返回值类型: int

  返回值含义:

  - 成功时返回下载器实例ID（正整数）

  - 失败时返回-1

### getDownloader 函数

- 参数

    | 参数名         | 类型      | 说明                     |
    |----------------|-----------|--------------------------|
    | `urls`         | `char**`  | URL 数组                 |
    | `urlCount`     | `int`     | URL 数量                 |
    | `savePaths`    | `char**`  | 保存路径数组             |
    | `pathCount`    | `int`     | 路径数量                 |
    | `threadCount`  | `int`     | 下载线程数               |
    | `chunkSizeMB`  | `int`     | 每个下载块的大小 ( MB )  |

- 返回值

  返回值类型: int

  返回值含义:

  - 成功时返回下载器实例ID（正整数）

  - 失败时返回-1

### getDownloaderWithTasks 函数（新增）

- 参数

    | 参数名         | 类型      | 说明                     |
    |----------------|-----------|--------------------------|
    | `tasksData`    | `char*`   | JSON格式的任务数据       |
    | `taskCount`    | `int`     | 任务数量                 |
    | `threadCount`  | `int`     | 下载线程数               |
    | `chunkSizeMB`  | `int`     | 每个下载块的大小 ( MB )  |

- 返回值

  返回值类型: int

  返回值含义:

  - 成功时返回下载器实例ID（正整数）

  - 失败时返回-1

### pauseDownload 函数参数

- 参数

    | 参数名 | 类型   | 说明           |
    |--------|--------|----------------|
    | `id`   | `int`  | 下载器实例 ID  |

- 返回值

    返回值类型: int

    返回值含义:

    - 成功时返回0

    - 失败时返回-1（找不到对应ID的下载器）

### resumeDownload 函数参数

- 参数

    | 参数名 | 类型   | 说明           |
    |--------|--------|----------------|
    | `id`   | `int`  | 下载器实例 ID  |

- 返回值

    返回值类型: int

    返回值含义:

    - 成功时返回0
    
    - 失败时返回-1（找不到对应ID的下载器）

### 重要提示

远程回调 URL 是回调函数的另一种实现，支持 WebSocket 通信 和 纯 TCP 通信

## 任务数据格式

任务数据使用JSON格式，每个任务包含以下字段：
- URL: 下载链接（必需）
- SavePath: 保存路径（必需）
- ShowName: 显示名称（可选，默认使用保存路径）

示例：
```json
[
  {
    "URL": "https://example.com/file1.zip",
    "SavePath": "downloads/file1.zip",
    "ShowName": "文件1.zip"
  },
  {
    "URL": "https://example.com/file2.zip",
    "SavePath": "downloads/file2.zip",
    "ShowName": "文件2.zip"
  }
]
```

## 注意事项

- URL 和保存路径需要使用字节字符串（bytes）
- 回调 URL 会接收 JSON 格式的事件和消息数据，回调函数则是接收指针
- 多文件下载时 URL 数量和保存路径数量必须一致
- 分块大小根据文件大小自动调整，避免过小或过大
- 线程数会根据分块数量自动调整，确保不超过分块数量

## Python 测试用例

```python
import ctypes
import os
import time
import json
from typing import Literal, TypedDict

# 定义回调函数类型
PROGRESS_CALLBACK = ctypes.CFUNCTYPE(None, ctypes.c_void_p, ctypes.c_void_p)

# 加载 DLL/SO
if os.name == 'nt':  # Windows
    lib = ctypes.CDLL('./TTHighSpeedDownloader.dll')
else:  # Linux/Mac
    lib = ctypes.CDLL('./TTHighSpeedDownloader.so')

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
lib.startDownload.restype = ctypes.c_int

lib.startDownloadWithTasks.argtypes = [
    ctypes.c_char_p,        # tasksData
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
lib.startMultiDownload.restype = ctypes.c_int

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
    ctypes.c_char_p,        # tasksDat
    ctypes.c_int,           # taskCount
    ctypes.c_int,           # threadCount
    ctypes.c_int,           # chunkSizeMB
]
lib.getDownloaderWithTasks.restype = ctypes.c_int

lib.pauseDownload.argtypes = [ctypes.c_int]  # id
lib.pauseDownload.restype = ctypes.c_int

lib.resumeDownload.argtypes = [ctypes.c_int]  # id
lib.resumeDownload.restype = ctypes.c_int

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

# 单文件下载示例
try:
    start_time = time.time()
    # 正确处理useSocket参数
    use_socket_val = ctypes.c_bool(False)
    
    result = lib.startDownload(
        64,  # threadCount
        10,  # chunkSizeMB
        b"https://example.com/file.zip",  # urlStr
        b"file.zip",  # savePath
        progress_cb,  # callback
        False, # useCallbackURL
        None,  # remoteCallbackUrl
        ctypes.byref(use_socket_val),  # useSocket - 传递指针
    )
    
    print()
    end_time = time.time()
    print(f"下载结果：{result}")
    print(f"下载时间：{end_time - start_time:.2f} 秒")
except Exception as e:
    print(f"错误发生：{e}")

# 使用任务数据的多文件下载示例
try:
    start_time = time.time()
    
    # 创建任务数据
    tasks = [
        {
            "URL": "https://example.com/file1.zip",
            "SavePath": "file1.zip",
            "ShowName": "文件1.zip"
        },
        {
            "URL": "https://example.com/file2.zip",
            "SavePath": "file2.zip",
            "ShowName": "文件2.zip"
        }
    ]
    
    tasks_json = json.dumps(tasks)
    tasks_data = tasks_json.encode('utf-8')
    
    # 正确处理useSocket参数
    use_socket_val = ctypes.c_bool(False)

    result = lib.startDownloadWithTasks(
        tasks_data,  # tasksData - JSON格式的任务数据
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

# 传统多文件下载示例
try:
    start_time = time.time()
    urls = [b"https://example.com/file1.zip", b"https://example.com/file2.zip"]
    save_paths = [b"file1.zip", b"file2.zip"]

    # 创建 ctypes 字符串数组
    url_array = (ctypes.c_char_p * len(urls))(*urls)
    path_array = (ctypes.c_char_p * len(save_paths))(*save_paths)

    # 正确处理useSocket参数
    use_socket_val = ctypes.c_bool(False)

    # 修改 startMultiDownload 调用部分
    result = lib.startMultiDownload(
        url_array,  # urlStrs
        len(urls),  # urlCount
        path_array,  # savePaths
        len(save_paths),  # pathCount
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
    tasks = [
        {
            "URL": "https://example.com/file1.zip",
            "SavePath": "file1.zip",
            "ShowName": "文件1.zip"
        },
        {
            "URL": "https://example.com/file2.zip",
            "SavePath": "file2.zip",
            "ShowName": "文件2.zip"
        }
    ]
    
    tasks_json = json.dumps(tasks)
    tasks_data = tasks_json.encode('utf-8')

    # 创建下载器实例
    downloader_id = lib.getDownloaderWithTasks(
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
