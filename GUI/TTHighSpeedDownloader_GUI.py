import base64
import ctypes
import os
import pathlib
import sys
import time
from typing import Literal, TypedDict
import json
import requests
import webview
import uuid
import threading
import logging
import configparser
from Notice import Notice
import wx # pyright: ignore[reportMissingTypeStubs]
import webbrowser
import watch_sim as watch
# import watch


class popupDict(TypedDict):
    title: str
    message: str
    type: Literal['info', 'warning', 'error']

class selectPathDict(TypedDict):
    title: str
    defaultPath: str

app = wx.App(False)
notice = Notice(app=app)

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
            'chunk_size_mb': '10',
            'UA': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0'
        }
        with open(config_path, 'w') as configfile:
            config.write(configfile)
    else:
        
        config.read(config_path)
        
    return config

def save_config(thread_count: int, chunk_size_mb: int, UA: str):
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
    config['DOWNLOAD']['UA'] = UA
    
    with open(config_path, 'w') as configfile:
        config.write(configfile)


# 定义回调函数类型
PROGRESS_CALLBACK = ctypes.CFUNCTYPE(None, ctypes.c_void_p, ctypes.c_void_p)

# 加载 DLL/SO
if sys.platform.startswith('win'):  # Windows
    lib = ctypes.CDLL('./TTHighSpeedDownloader.dll')
elif sys.platform == 'darwin':  # MacOS
    lib = ctypes.CDLL('./TTHighSpeedDownloader.dylib')
elif sys.platform.startswith('linux'):  # Linux
    lib = ctypes.CDLL('./TTHighSpeedDownloader.so')
else:
    raise OSError('Unsupported operating system')

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
    ctypes.c_char_p,        # userAgent
    ctypes.c_char_p,        # remoteCallbackUrl
    ctypes.POINTER(ctypes.c_bool),  # useSocket
]

# 定义进度回调函数
last_downloaded = 0
# 为回调函数添加窗口引用
callback_window = None

class Event(TypedDict):
    Type: Literal['start', 'startOne', 'update', 'end', 'endOne', 'msg']
    Name: str

def callback_func(event_ptr, msg_ptr):
    global callback_window  # 移除对 last_downloaded 的依赖
    
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
            msg_dict: dict[Literal["Total", "Downloaded", "Speed"], int | float] | \
                dict[Literal["Text"], str] | \
                dict[Literal["Index", "Total", "URL", "ID"], str | int] | \
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
            downloaded = msg_dict.get('Downloaded', 0)  # 使用绝对下载量而非增量
            speed = msg_dict.get('Speed', 0.0)
            
            # 更新进度显示
            print(f"速度：{speed:.2f} B/s {downloaded}/{total} 字节", end='\r', flush=True)
            
            # 添加进度信息
            progress_data["progress"] = {
                "downloaded": downloaded,
                "total": total,
                "speed": speed,
                "added": downloaded  # 保留added字段，但实际使用downloaded
            }
            
        elif event_type == 'msg':
            text = msg_dict.get('Text', '')
            print(f"\n{event_name}：{text}")
            
        elif event_type == 'startOne':
            url = msg_dict.get('URL', '')
            task_id = msg_dict.get('ID', '')
            index = msg_dict.get('Index', 0)
            total_tasks = msg_dict.get('Total', 0)
            print(f"\n开始下载：{url}，这是第 {index} 个下载，总共 {total_tasks} 个。")
            
        elif event_type == 'start':
            print(f"\n开始下载")
            
        elif event_type == 'endOne':
            url = msg_dict.get('URL', '')
            task_id = msg_dict.get('ID', '')
            index = msg_dict.get('Index', 0)
            total_tasks = msg_dict.get('Total', 0)
            print(f"\n下载完成：{url}，这是第 {index} 个下载，总共 {total_tasks} 个。")
            
        elif event_type == 'end':
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
        UA: str = config.get('DOWNLOAD', 'UA', fallback='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0')
        
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
            UA.encode('utf-8'),
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

    with open(os.path.join(pathlib.Path(__file__).parent.resolve(), './README.md'), 'r', encoding='utf-8') as file:
        README: str = file.read()

    KernelVersion = '0.4.0'

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

        def openURL_NewWin(self, url: str):
            """在新窗口打开 URL"""
            webbrowser.open_new(url)

        def openURL_NewTab(self, url: str):
            """在新标签页打开 URL"""
            webbrowser.open_new_tab(url)

        def openURL(self, url: str):
            """在新标签页打开 URL"""
            webbrowser.open(url)

        def openURL_webview(self, url: str, title: str):
            window_: webview.Window = webview.create_window(title, url) # pyright: ignore[reportUnknownMemberType, reportAssignmentType]
            window_.show()
        
        def openMD(self, file: str | None = None, url: str | None = None):
            if (file is None) and (url is None):
                raise ValueError('openMDFile: Both file and url are None in the same call.')
            if not (file is None) and not (url is None):
                raise ValueError('openMDDile: Both file and URL have values in the same call.')
            
            if (file is None) and not (url is None):
                print(url)
                response = requests.get(url)
                response.raise_for_status()
                print(response.text)
                md_content: str = response.text
            elif (url is None) and not (file is None):
                with open(file, 'r', encoding='utf-8') as f:
                    md_content: str = f.read()
            else:
                raise TypeError('openMDFile: file and url are None in the same call.')

            self.openURL_webview(url=f'./showMD.html?content={base64.urlsafe_b64encode(md_content.encode()).decode()}', title='文件查看')

        def openFile(self, file: str | None = None, url: str | None = None):
            if (file is None) and (url is None):
                raise ValueError('openFile: Both file and url are None in the same call.')
            if not (file is None) and not (url is None):
                raise ValueError('openFile: Both file and URL have values in the same call.')
            
            if (file is None) and not (url is None):
                response = requests.get(url)
                response.raise_for_status()
                content: str = response.text
            elif (url is None) and not (file is None):
                with open(file, 'r', encoding='utf-8') as f:
                    content: str = f.read()
            else:
                raise TypeError('openFile: file and url are None in the same call.')

            self.openURL_webview(url=f'./showFile.html?content={base64.urlsafe_b64encode(content.encode()).decode()}', title='文件查看')

        def showPopup(self, popup: popupDict) -> dict[str, str]:
            if popup['type'] == 'info':
                notice.EmitNotice_New(popup['title'], popup['message'])
            elif popup['type'] == 'warning':
                notice.EmitWarningNotice_New(popup['title'], popup['message'])
            elif popup['type'] == 'error':
                notice.EmitErrorNotice_New(popup['title'], popup['message'])
            
            return {
                'message': '成功发送弹窗'
            }

        def selectPath(self, data: selectPathDict | None = None) -> dict[str, str]:  # pyright: ignore[reportUnusedFunction]
            """打开文件夹选择对话框并返回选择的路径"""
            try:
                # 获取请求数据
                data: selectPathDict = {'title': '选择文件夹', 'defaultPath': ''} if data is None else data
                title: str = data['title']
                default_path: str = data['defaultPath']
                
                # 创建并显示文件夹选择对话框
                dialog: wx.DirDialog = wx.DirDialog(None, message=title, defaultPath=default_path, style=wx.DD_DIR_MUST_EXIST | wx.DD_NEW_DIR_BUTTON)
                if dialog.ShowModal() == wx.ID_OK:
                    selected_path = dialog.GetPath()
                else:
                    selected_path = ''
                dialog.Destroy()
                
                if selected_path:
                    return {
                        'selectedPath': selected_path
                    }
                else:
                    # 用户取消了选择
                    return {
                        'msg': '用户取消了选择'
                    }
                    
            except Exception as e:
                # 服务器错误
                return {
                    'msg': f'服务器发生错误: {str(e)}'
                }

        def exit(self, status: int = 0):
            running = False
            window.destroy()
            os._exit(status=status)

        def get_Version(self):
            return version
        
        def get_VersionHistory(self):
            return versionHistory

        def get_README(self):
            return README
        
        def get_KernelVersion(self):
            return KernelVersion

        def get_Config(self):
            """获取配置"""
            config = load_config()
            return {
                'thread_count': config.getint('DOWNLOAD', 'thread_count', fallback=64),
                'chunk_size_mb': config.getint('DOWNLOAD', 'chunk_size_mb', fallback=10),
                'UA': config.get('DOWNLOAD', 'UA', fallback='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0'),
            }

        def save_Config(self, thread_count: int, chunk_size_mb: int, UserAgent: str):
            """保存配置"""
            save_config(thread_count, chunk_size_mb, UserAgent)
            return True


    # 在创建webview窗口时注册API
    api = Api()
    window: webview.Window = webview.create_window( # pyright: ignore[reportUnknownMemberType, reportAssignmentType]
        ' TT 高速下载器 GUI ',
        './files/index.html',
        width=850,
        height=850,
        js_api=api,
        # frameless=True,
        # text_select=False,
        resizable=False,
        text_select=True,
    )
    
    # 设置回调窗口引用
    global callback_window
    callback_window = window
    # window

    running = True
    
    watch.start(window, running) # pyright: ignore[reportUnknownMemberType]

    load_config()

    webview.start(
        icon=os.path.join(pathlib.Path(__file__).parent.resolve(), f'./files/assets/Image/TTHSD_GUI.{'ico' if sys.platform.startswith('win') else 'icns'}'),
        debug=not getattr(sys, 'frozen', False),
    )

    os._exit(0)

    # webview.overrideredirect(True)
       
if __name__ == '__main__':
    main()
