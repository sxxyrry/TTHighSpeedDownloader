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
import logging # pyright: ignore[reportUnusedImport]
import configparser
from Notice import Notice
import wx # pyright: ignore[reportMissingTypeStubs]
import webbrowser
import watch_sim as watch
import watch
from TTHSD_interface import TTHSDownloader


frozen: bool = getattr(sys, 'frozen', False)

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


# 创建下载器实例
downloader = TTHSDownloader()

# 为回调函数添加窗口引用
callback_window = None

# 添加下载状态跟踪变量
download_active = False
download_completed_count = 0
expected_task_count = 0
current_downloader_id: int = -1  # 当前下载器ID

class Event(TypedDict):
    Type: Literal['start', 'startOne', 'update', 'end', 'endOne', 'msg']
    Name: str

logging.basicConfig(format='{name} ({levelname}, {asctime}): {message}', style='{', level=logging.INFO)

path = './log'
if frozen:
    path = os.path.dirname(sys.executable)
else: 
    path = './log'

# 确保 log 目录存在
os.makedirs(path, exist_ok=True)

# 创建文件处理器
file_handler1 = logging.FileHandler(os.path.join(path, './Downloader.log'), encoding='utf-8')
file_handler1.setFormatter(logging.Formatter('{name} ({levelname}, {asctime}): {message}', style='{'))

file_handler2 = logging.FileHandler(os.path.join(path, './TTHSDGUI.log'), encoding='utf-8')
file_handler2.setFormatter(logging.Formatter('{name} ({levelname}, {asctime}): {message}', style='{'))

DownloadLog = logging.getLogger("Downloader")
DownloadLog.addHandler(file_handler1)

TGLog = logging.getLogger("TTHSDGUI")
TGLog.addHandler(file_handler2)

def callback_func(event_dict: dict, msg_dict: dict):
    global callback_window, download_active, download_completed_count, expected_task_count
    
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
        total: int = msg_dict.get('Total', 0)
        downloaded: int = msg_dict.get('Downloaded', 0)
        speed: float = msg_dict.get('Speed', 0.0)
        
        # 更新进度显示
        DownloadLog.info(f"速度：{speed:.2f} B/s {downloaded}/{total} 字节")
        
        # 添加进度信息
        progress_data["progress"] = {
            "downloaded": downloaded,
            "total": total,
            "speed": speed,
            "added": downloaded
        }
        
    elif event_type == 'msg':
        text = msg_dict.get('Text', '')
        DownloadLog.info(f"{event_name}：{text}")
    
    elif event_type == 'err':
        error = msg_dict.get('Error', '')
        DownloadLog.info(f"{event_name}：{error}")
        
    elif event_type == 'startOne':
        url = msg_dict.get('URL', '')
        task_id = msg_dict.get('ID', '')
        index = msg_dict.get('Index', 0)
        total_tasks = msg_dict.get('Total', 0)
        DownloadLog.info(f"开始下载：{url}，这是第 {index} 个下载，总共 {total_tasks} 个。")
        
        # 开始第一个任务时标记下载活动
        if not download_active:
            download_active = True
        
    elif event_type == 'start':
        DownloadLog.info(f"\n开始下载")
        
    elif event_type == 'endOne':
        url = msg_dict.get('URL', '')
        task_id = msg_dict.get('ID', '')
        index = msg_dict.get('Index', 0)
        total_tasks = msg_dict.get('Total', 0)
        DownloadLog.info(f"下载完成：{url}，这是第 {index} 个下载，总共 {total_tasks} 个。")
        
        # 更新完成计数
        download_completed_count += 1
        
    elif event_type == 'end':
        DownloadLog.info(f"下载完成或被取消")
        download_active = False  # 标记下载完成

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
            DownloadLog.error(f"发送进度更新到前端时出错: {e}")

def RunDownload(urls: list[str], savepaths: list[str]) -> int:
    global download_active, download_completed_count, expected_task_count, current_downloader_id
    # 重置全局变量
    download_active = False
    download_completed_count = 0
    expected_task_count = len(urls)
    current_downloader_id = -1

    try:
        # 加载配置
        config = load_config()
        thread_count = config.getint('DOWNLOAD', 'thread_count', fallback=64)
        chunk_size_mb = config.getint('DOWNLOAD', 'chunk_size_mb', fallback=10)
        UA: str = config.get('DOWNLOAD', 'UA', fallback='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0')
        
        start_time = time.time()
        
        # 使用TTHSDDownloader开始下载
        downloader_id = downloader.get_downloader(
            urls=urls,
            save_paths=savepaths,
            thread_count=thread_count,
            chunk_size_mb=chunk_size_mb,
            callback=callback_func,
            use_callback_url=False,
            user_agent=UA,
            remote_callback_url=None,
            use_socket=None,
        )

        if downloader_id < 1:
            return -1

        current_downloader_id = downloader_id
        DownloadLog.info(f"下载器创建成功，ID: {downloader_id}")

        def start():
            try:
                result = downloader.start_download_by_id(current_downloader_id)

                # 等待下载完成
                while download_active or download_completed_count < expected_task_count:
                    time.sleep(0.5)  # 等待0.5秒后再次检查状态
            
                DownloadLog.info(f"下载完成，已完成 {download_completed_count} 个任务")
                end_time = time.time()
                DownloadLog.info(f"下载器ID：{downloader_id}")
                DownloadLog.info(f"下载时间：{end_time - start_time:.2f} 秒")
            
            except Exception as e:
                DownloadLog.error(f"错误发生：{e}")
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
                        DownloadLog.error(f"发送错误信息到前端时出错: {send_error}")

        downloadThread = threading.Thread(
            target=start,
            daemon=True
        )
        downloadThread.start()

        return downloader_id
        
    except Exception as e:
        DownloadLog.error(f"错误发生：{e}")
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
                DownloadLog.error(f"发送错误信息到前端时出错: {send_error}")
        
        return -1

def cancel_download(downloader_id: int) -> bool:
    """取消下载"""
    global current_downloader_id
    try:
        if downloader_id > 0:
            # 使用stopDownload停止下载
            result = downloader.stop_download(downloader_id)
            if result:
                DownloadLog.info(f"下载器 {downloader_id} 已停止")
                if current_downloader_id == downloader_id:
                    current_downloader_id = -1
                return True
            else:
                DownloadLog.error(f"停止下载器 {downloader_id} 失败")
                return False
        else:
            return False
    except Exception as e:
        DownloadLog.error(f"取消下载时出错: {e}")
        return False

def main():
    global frozen

    TGLog.info("Starting TTHSD GUI")
    with open(os.path.join(pathlib.Path(__file__).parent.resolve(), './VersionHistory.txt'), 'r', encoding='utf-8') as file:
        versionHistory: str = file.read()
    
        version = ''

        for item in versionHistory.split('\n'):
            if item.endswith(' V:'):
                version: str = item.split(' V:')[0]

    with open(os.path.join(pathlib.Path(__file__).parent.resolve(), './README.md'), 'r', encoding='utf-8') as file:
        README: str = file.read()

    KernelVersion = '0.5.0'

    class Api:
        def download(self, urls: list[str], savepaths: list[str]) -> int:
            DownloadLog.info("开始下载...")
            
            return RunDownload(urls=urls, savepaths=savepaths)
        
        def cancel_download(self, downloaderID: int) -> dict[str, str | bool]:
            """取消下载"""
            try:
                success = cancel_download(downloaderID)
                return {
                    'success': success,
                    'message': '下载已取消' if success else '取消下载失败'
                }
            except Exception as e:
                DownloadLog.error(f"取消下载时出错: {str(e)}")
                return {
                    'success': False,
                    'message': f'取消下载时出错: {str(e)}'
                }

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

        def selectPath(self, data: selectPathDict | None = None) -> dict[str, str]:  # pyright: ignore[reportRedeclaration, reportUnusedFunction]
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
            running = False # pyright: ignore[reportUnusedVariable]
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

    TGLog.info("Created API and Window")
    
    # 设置回调窗口引用
    global callback_window
    callback_window = window

    running = True
        
    TGLog.info('Opening watch')

    watch.start(window, running) # pyright: ignore[reportUnknownMemberType]

    TGLog.info('Opened watch')

    load_config()

    if '--dev_pyinexe' in sys.argv:
        frozen = True
    elif '--dev_pie' in sys.argv:
        frozen = True

    TGLog.info('Injecting Window.Closed event')

    def run_():
        def on_window_closed():
            TGLog.info('webview closed')
            time.sleep(0.05)
            os._exit(0)
            os._exit(0)
            os._exit(0)
            os._exit(0)

        window.events.closed += on_window_closed

    run_()

    def on_window_opened():
        TGLog.info('webview opened')

    TGLog.info('Injected Window.Closed event')

    TGLog.info('Starting webview')
    # breakpoint()
    webview.start(
        func=on_window_opened,
        icon=os.path.join(pathlib.Path(__file__).parent.resolve(), f'./files/assets/Image/TTHSD_GUI.{'ico' if sys.platform.startswith('win') else 'icns'}'),
        debug=not frozen,
    )

    # webview.overrideredirect(True)
       
if __name__ == '__main__':
    main()
