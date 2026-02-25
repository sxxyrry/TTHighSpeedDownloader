import os
import pathlib
import time
import traceback
import sys
import ctypes
import json
import uuid
from typing import Literal, Any, TypedDict, Protocol, Optional
from enum import IntEnum, StrEnum
from collections.abc import Callable

# ==================== 私有常量 ====================
_frozen: bool = getattr(sys, 'frozen', False)
_folder = pathlib.Path(__file__).parent.resolve()

# ==================== 日志系统（私有）====================
class _IntLevel(IntEnum):
    DEBUG = 4
    INFO = 3
    WARNING = 2
    ERROR = 1
    CRITICAL = 0

class _StrLevel(StrEnum):
    DEBUG = 'DEBUG'
    INFO = 'INFO'
    WARNING = 'WARNING'
    ERROR = 'ERROR'
    CRITICAL = 'CRITICAL'

_IntlevelToStrLevel = {
    _IntLevel.DEBUG: _StrLevel.DEBUG,
    _IntLevel.INFO: _StrLevel.INFO,
    _IntLevel.WARNING: _StrLevel.WARNING,
    _IntLevel.ERROR: _StrLevel.ERROR,
    _IntLevel.CRITICAL: _StrLevel.CRITICAL,
}
_StrlevelToIntLevel = {v: k for k, v in _IntlevelToStrLevel.items()}

class _execeventClass(TypedDict):
    level: _StrLevel
    message: str
    time: str

class _Logger:
    """内部日志器，不暴露给用户"""
    def __init__(self, name: str = 'root'):
        if name in _nametable:
            raise ValueError(f'Logger name "{name}" already exists.')
        _nametable[name] = self
        self.name = name
        self.level = _IntLevel.WARNING
        self.format = '{time} - {level} - {name} : {message}'
        self.use_file: bool = False
        self.use_console: bool = True
        self.file_mode: Literal['cf', 'w'] = 'cf'  # 'cf': 创建文件, 'w': 等待文件存在
        self.file_path: pathlib.Path | None = None
        self.events: list[_execeventClass] = []

    # ---------- 配置方法（拆分为独立setter）----------
    def set_level(self, level: _StrLevel | str) -> None:
        """设置日志级别，接受字符串或_StrLevel"""
        if isinstance(level, str):
            level = _StrLevel(level)
        if level not in _StrlevelToIntLevel:
            raise ValueError(f'Invalid level: {level}')
        self.level = _StrlevelToIntLevel[level]

    def set_format(self, fmt: str) -> None:
        """设置日志格式，必须包含 {time}, {level}, {name}, {message}"""
        required = {'time', 'level', 'name', 'message'}
        if not required.issubset(set(self._extract_format_keys(fmt))):
            raise ValueError('Format must contain {time}, {level}, {name}, {message}')
        self.format = fmt

    def set_console(self, enable: bool) -> None:
        """启用或禁用控制台输出"""
        if not isinstance(enable, bool):
            raise TypeError('enable must be a boolean')
        self.use_console = enable

    def set_file(self, path: str | pathlib.Path, mode: Literal['cf', 'w'] = 'cf') -> None:
        """设置日志文件路径和模式
        - mode='cf': 如果文件不存在则创建
        - mode='w': 等待文件存在（不自动创建）
        """
        self.file_path = pathlib.Path(path)
        self.file_mode = mode
        self.use_file = True

        # 根据模式处理文件
        if mode == 'cf':
            self.file_path.parent.mkdir(parents=True, exist_ok=True)
            # 注意：不自动清空文件，以追加模式写入
        # mode='w' 时不创建，等待外部创建

    # ---------- 核心日志方法 ----------
    def _log(self, level: _IntLevel, message: str) -> None:
        """内部记录日志"""
        if self.level < level:  # 级别数值越大越详细，这里用 < 是因为DEBUG=4 > WARNING=2
            return

        text = self.format.format(
            time=time.strftime('%Y-%m-%d %H:%M:%S', time.localtime()),
            level=_IntlevelToStrLevel[level],
            name=self.name,
            message=message
        )

        # 写入文件
        if self.use_file and self.file_path:
            try:
                # 确保父目录存在（如果是 'cf' 模式已在 set_file 创建）
                if self.file_mode == 'w' and not self.file_path.exists():
                    raise FileNotFoundError(f'Log file {self.file_path} does not exist')
                with open(self.file_path, 'a', encoding='utf-8') as f:
                    f.write(text + '\n')
            except Exception as e:
                # 文件写入失败时降级到控制台
                print(f"Failed to write log to file: {e}")
                print(text)

        # 控制台输出
        if self.use_console:
            print(text)

        # 记录事件
        self.events.append({
            'level': _IntlevelToStrLevel[level],
            'message': text,
            'time': time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())
        })

    # ---------- 公开日志方法 ----------
    def debug(self, message: str) -> None:
        self._log(_IntLevel.DEBUG, message)

    def info(self, message: str) -> None:
        self._log(_IntLevel.INFO, message)

    def warning(self, message: str) -> None:
        self._log(_IntLevel.WARNING, message)

    def error(self, message: str) -> None:
        self._log(_IntLevel.ERROR, message)

    def critical(self, message: str) -> None:
        self._log(_IntLevel.CRITICAL, message)

    def exception(self, exc_info=None) -> None:
        """记录异常信息"""
        if exc_info is None:
            exc_info = traceback.format_exc()
        else:
            exc_info = ''.join(traceback.format_exception_only(*exc_info[:2]))
        self.error(f"Exception occurred:\n{exc_info}")

    # ---------- 子日志器 ----------
    def get_child(self, name: str) -> '_Logger':
        """创建继承当前配置的子日志器"""
        child = _Logger(name)
        child.level = self.level
        child.format = self.format
        child.use_file = self.use_file
        child.use_console = self.use_console
        child.file_mode = self.file_mode
        child.file_path = self.file_path
        return child

    # ---------- 事件列表 ----------
    def get_events(self) -> list[_execeventClass]:
        """返回所有已记录的事件"""
        return self.events.copy()

    # ---------- 辅助方法 ----------
    @staticmethod
    def _extract_format_keys(fmt: str) -> list[str]:
        """提取格式字符串中的 {key} 占位符"""
        import re
        return re.findall(r'\{(\w+)\}', fmt)

    # ---------- 生命周期 ----------
    def exit(self) -> None:
        """从全局表中移除日志器"""
        if self.name == 'root':
            return
        _nametable.pop(self.name, None)

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.exit()

# 全局日志器注册表
_nametable: dict[str, _Logger] = {}

# ==================== 下载器模块 ====================
# 下载器专用日志实例
_TIlog = _Logger("TTHSDPyInter")

# 根据运行环境确定日志路径
if _frozen:
    _log_path = pathlib.Path(sys.executable).parent / 'TTHSDPyInter.log'
else:
    _log_path = pathlib.Path('./TTHSDPyInter.log')

# 配置下载器日志
_TIlog.set_level(_StrLevel.INFO)
_TIlog.set_format('{name} ({level}, {time}): {message}')
_TIlog.set_file(_log_path, mode='cf')  # 自动创建文件
_TIlog.set_console(True)

# ==================== ctypes 类型定义 ====================
class _CCallbackProtocol(Protocol):
    """C回调函数的Python协议，用于类型提示"""
    def __call__(self, event_ptr: int, msg_ptr: int) -> None: ...

# 创建C回调函数类型，使用 type: ignore 抑制Pylance错误（因为CFUNCTYPE是运行时工厂）
_PROGRESS_CALLBACK = ctypes.CFUNCTYPE(None, ctypes.c_void_p, ctypes.c_void_p)  # type: ignore

# ==================== 公开接口 ====================
class TTHSDownloader:
    """TT高速下载器Python接口（唯一公开类）"""

    # ---------- 初始化 ----------
    def __init__(self, dll_path: str | pathlib.Path | None = None):
        """
        初始化下载器接口

        Args:
            dll_path: DLL/SO/DYLIB文件路径，为None时自动检测
        """
        if dll_path is None:
            if sys.platform.startswith('win'):
                dll_path = './TTHighSpeedDownloader.dll'
            elif sys.platform == 'darwin':
                dll_path = './TTHighSpeedDownloader.dylib'
            elif sys.platform.startswith('linux'):
                dll_path = './TTHighSpeedDownloader.so'
            else:
                raise OSError(f'Unsupported platform: {sys.platform}')
        self._dll_path = str(dll_path)
        self._load_dll()
        self._define_function_signatures()
        self._callback_refs = {}  # 保存回调引用，防止GC

    def _load_dll(self) -> None:
        """加载动态库"""
        _TIlog.info(f"Loading DLL: {self._dll_path}")
        try:
            self.lib = ctypes.CDLL(self._dll_path)
            _TIlog.info(f"Loaded DLL: {self._dll_path}")
        except Exception as e:
            _TIlog.error(f"Failed to load DLL: {e}")
            raise

    def _define_function_signatures(self) -> None:
        """定义所有导出函数的参数和返回类型"""
        _TIlog.info(f"Defining function signatures for {self._dll_path}")

        # startDownload (创建并启动)
        self.lib.startDownload.argtypes = [
            ctypes.c_char_p,        # tasksData
            ctypes.c_int,           # taskCount
            ctypes.c_int,           # threadCount
            ctypes.c_int,           # chunkSizeMB
            _PROGRESS_CALLBACK,      # callback
            ctypes.c_bool,          # useCallbackURL
            ctypes.c_char_p,        # userAgent
            ctypes.c_char_p,        # remoteCallbackUrl
            ctypes.POINTER(ctypes.c_bool),  # useSocket
            ctypes.POINTER(ctypes.c_bool),  # isMultiple
        ]
        self.lib.startDownload.restype = ctypes.c_int

        # getDownloader (仅创建)
        self.lib.getDownloader.argtypes = [
            ctypes.c_char_p,        # tasksData
            ctypes.c_int,           # taskCount
            ctypes.c_int,           # threadCount
            ctypes.c_int,           # chunkSizeMB
            _PROGRESS_CALLBACK,      # callback
            ctypes.c_bool,          # useCallbackURL
            ctypes.c_char_p,        # userAgent
            ctypes.c_char_p,        # remoteCallbackUrl
            ctypes.POINTER(ctypes.c_bool),  # useSocket
        ]
        self.lib.getDownloader.restype = ctypes.c_int

        # startDownload_ID (启动已创建的下载器)
        self.lib.startDownload_ID.argtypes = [ctypes.c_int]
        self.lib.startDownload_ID.restype = ctypes.c_int

        # startMultipleDownloads_ID (并行启动)
        self.lib.startMultipleDownloads_ID.argtypes = [ctypes.c_int]
        self.lib.startMultipleDownloads_ID.restype = ctypes.c_int

        # pauseDownload
        self.lib.pauseDownload.argtypes = [ctypes.c_int]
        self.lib.pauseDownload.restype = ctypes.c_int

        # resumeDownload
        self.lib.resumeDownload.argtypes = [ctypes.c_int]
        self.lib.resumeDownload.restype = ctypes.c_int

        # stopDownload
        self.lib.stopDownload.argtypes = [ctypes.c_int]
        self.lib.stopDownload.restype = ctypes.c_int

        _TIlog.info("Function signatures defined")

    # ---------- 回调处理 ----------
    def create_callback(self, callback_func: Callable[[dict, dict], None]) -> _CCallbackProtocol:
        """
        将Python回调函数包装为C回调

        Args:
            callback_func: Python函数，接收 (event_dict, msg_dict)

        Returns:
            可传递给C的C回调函数对象
        """
        def c_callback(event_ptr: int, msg_ptr: int) -> None:
            try:
                event_json = ctypes.cast(event_ptr, ctypes.c_char_p).value
                msg_json = ctypes.cast(msg_ptr, ctypes.c_char_p).value

                event_dict = json.loads(event_json.decode('utf-8')) if event_json else {}
                msg_dict = json.loads(msg_json.decode('utf-8')) if msg_json else {}

                callback_func(event_dict, msg_dict)
            except Exception as e:
                # 使用日志记录异常，避免静默失败
                _TIlog.error(f"Callback error: {e}")
                # 可选择重新抛出，或根据需求处理                ca

        cb = _PROGRESS_CALLBACK(c_callback)
        self._callback_refs[id(cb)] = cb  # 保持引用
        return cb  # type: ignore  # 协议兼容

    # ---------- 任务准备辅助方法 ----------
    def _prepare_tasks(self, urls: list[str], save_paths: list[str]) -> tuple[str, int]:
        """
        准备任务JSON数据

        Returns:
            (tasks_json, task_count)
        """
        if len(urls) != len(save_paths):
            raise ValueError("URL数量和保存路径数量必须一致")

        tasks = []
        for url, save_path in zip(urls, save_paths):
            tasks.append({
                "URL": url,
                "SavePath": save_path,
                "ShowName": os.path.basename(save_path),
                "ID": str(uuid.uuid4())
            })
        return json.dumps(tasks, ensure_ascii=False), len(tasks)

    # ---------- 核心下载方法 ----------
    def start_download(
        self,
        urls: list[str],
        save_paths: list[str],
        thread_count: int = 64,
        chunk_size_mb: int = 10,
        callback: Callable[[dict, dict], None] | None = None,
        use_callback_url: bool = False,
        user_agent: str | None = None,
        remote_callback_url: str | None = None,
        use_socket: bool | None = None,
        is_multiple: bool | None = None
    ) -> int:
        """
        创建下载器实例并立即启动下载

        Args:
            urls: 下载URL列表
            save_paths: 保存路径列表
            thread_count: 线程数
            chunk_size_mb: 分块大小(MB)
            callback: 进度回调函数，接收 (event_dict, msg_dict)
            use_callback_url: 是否启用远程回调URL
            user_agent: 自定义User-Agent，None表示使用默认值
            remote_callback_url: 远程回调URL，None或空字符串表示不启用
            use_socket: 是否启用Socket通信，None表示不启用
            is_multiple: 是否并行下载，None表示顺序下载

        Returns:
            下载器ID（正整数），失败返回-1
        """
        tasks_json, task_count = self._prepare_tasks(urls, save_paths)

        # 编码字符串参数
        user_agent_bytes = user_agent.encode('utf-8') if user_agent else None
        remote_callback_url_bytes = remote_callback_url.encode('utf-8') if remote_callback_url else None

        # 指针参数：根据文档，None会被转换为NULL，是安全的
        use_socket_ptr = ctypes.pointer(ctypes.c_bool(use_socket)) if use_socket is not None else None
        is_multiple_ptr = ctypes.pointer(ctypes.c_bool(is_multiple)) if is_multiple is not None else None

        # 创建回调
        c_callback = self.create_callback(callback) if callback else None

        # 调用DLL
        downloader_id = self.lib.startDownload(
            tasks_json.encode('utf-8'),
            task_count,
            thread_count,
            chunk_size_mb,
            c_callback,
            use_callback_url,
            user_agent_bytes,
            remote_callback_url_bytes,
            use_socket_ptr,
            is_multiple_ptr
        )
        return downloader_id

    def get_downloader(
        self,
        urls: list[str],
        save_paths: list[str],
        thread_count: int = 64,
        chunk_size_mb: int = 10,
        callback: Callable[[dict, dict], None] | None = None,
        use_callback_url: bool = False,
        user_agent: str | None = None,
        remote_callback_url: str | None = None,
        use_socket: bool | None = None
    ) -> int:
        """
        仅创建下载器实例，不启动下载

        Args: 同 start_download（无 is_multiple 参数）

        Returns:
            下载器ID（正整数），失败返回-1
        """
        tasks_json, task_count = self._prepare_tasks(urls, save_paths)

        user_agent_bytes = user_agent.encode('utf-8') if user_agent else None
        remote_callback_url_bytes = remote_callback_url.encode('utf-8') if remote_callback_url else None
        use_socket_ptr = ctypes.pointer(ctypes.c_bool(use_socket)) if use_socket is not None else None
        c_callback = self.create_callback(callback) if callback else None

        downloader_id = self.lib.getDownloader(
            tasks_json.encode('utf-8'),
            task_count,
            thread_count,
            chunk_size_mb,
            c_callback,
            use_callback_url,
            user_agent_bytes,
            remote_callback_url_bytes,
            use_socket_ptr
        )
        return downloader_id

    # ---------- 控制方法 ----------
    def start_download_by_id(self, downloader_id: int) -> bool:
        """
        通过ID启动已创建的下载器

        Returns:
            True: 成功，False: 下载器不存在
        """
        result = self.lib.startDownload_ID(downloader_id)
        return result == 0

    def start_multiple_downloads_by_id(self, downloader_id: int) -> bool:
        """
        通过ID启动并行下载（实验性）

        Returns:
            True: 成功，False: 下载器不存在
        """
        result = self.lib.startMultipleDownloads_ID(downloader_id)
        return result == 0

    def pause_download(self, downloader_id: int) -> bool:
        """暂停下载"""
        result = self.lib.pauseDownload(downloader_id)
        return result == 0

    def resume_download(self, downloader_id: int) -> bool:
        """恢复下载"""
        result = self.lib.resumeDownload(downloader_id)
        return result == 0

    def stop_download(self, downloader_id: int) -> bool:
        """停止下载并清理资源"""
        result = self.lib.stopDownload(downloader_id)
        return result == 0

# ==================== 模块公开接口 ====================
__all__ = [
    'TTHSDownloader'
]
