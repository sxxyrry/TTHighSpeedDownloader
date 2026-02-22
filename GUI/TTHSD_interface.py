import os, pathlib, time, traceback, sys
from typing import Literal, Any, TypedDict
from enum import IntEnum, StrEnum


frozen: bool = getattr(sys, 'frozen', False)

folder = pathlib.Path(__file__).parent.resolve()

class IntLevel(IntEnum):
    DEBUG = 4
    INFO = 3
    WARING = 2
    ERROR = 1
    CRITICAL = 0

class StrLevel(StrEnum):
    DEBUG = 'DEBUG'
    INFO = 'INFO'
    WARING = 'WARING'
    ERROR = 'ERROR'
    CRITICAL = 'CRITICAL'

IntlevelToStrLevel = {
    IntLevel.DEBUG     :  StrLevel.DEBUG,
    IntLevel.INFO      :  StrLevel.INFO,
    IntLevel.WARING    :  StrLevel.WARING,
    IntLevel.ERROR     :  StrLevel.ERROR,
    IntLevel.CRITICAL  :  StrLevel.CRITICAL,
}

StrlevelToIntLevel = {v: k for k, v in IntlevelToStrLevel.items()}

class unexeceventClass(TypedDict):
    level: StrLevel
    message: str
    time: str

class execeventClass(TypedDict):
    level: StrLevel
    message: str
    time: str

class logger():
    def __init__(self, name: str='root'):
        if name in _nametable.keys():
            self.__ie('nameisexists')

        _nametable[name] = self
        self.name = name

        self.level = IntLevel.WARING
        self.format = '{time} - {level} - {name} : {message}'

        self.isusefile: bool = False
        self.isuseconsole: bool = True

        self.filemode = 'cf'
        self.filepath: str = ''

        self.configtable: dict[str, Any] = {
                                            'level' : self.level,
                                            'format' : self.format,
                                            'isusefile' : self.isusefile,
                                            'filepath' : self.filepath,
                                            'filemode' : self.filemode,
                                            'isuseconsole' : self.isuseconsole,
                                           }
    
        self.eventslist: list[execeventClass] = []
    
        self.unexeceventslist: list[unexeceventClass] = []

    def config(self, level: StrLevel | None=None,
               format: str | None=None,
                isusefile: bool | None=None, filepath: str | None=None,
                filemode: Literal['cf', 'w'] | None=None, isuseconsole: bool | None=True):

        # 'XR - {time} - {level} - {name} : {message}'

        if level is not None:
            if not level in StrlevelToIntLevel.keys():
                self.__ie('levelisnotexists')
            else:
                self.level = StrlevelToIntLevel[level]
        else:
            self.level = self.level if self.level else IntLevel.WARING
        
        if format is not None:
            if \
                not '{time}' in format or \
                not '{level}' in format or \
                not '{name}' in format or \
                not '{message}' in format\
                :
                self.__ie('invalidformat')
            else:
                self.format: str = format
        else:
            self.format: str = self.format if self.format else 'XR - {time} - {level} - {name} : {message}'
        
        if isusefile is not None:
            if not isinstance(isusefile, bool): # type: ignore
                self.__ie('isusefileisnotbool')
            else:
                self.isusefile = isusefile
        else:
            self.isusefile = self.isusefile if self.isusefile else False

        if isuseconsole is not None:
            if not isinstance(isuseconsole, bool): # type: ignore
                self.__ie('isuseconsoleisnotbool')
            else:
                self.isuseconsole = isuseconsole
        else:
            self.isuseconsole = self.isuseconsole if self.isuseconsole else True

        if filemode is not None:
            if not filemode in ['cf', 'w']:
                self.__ie('invalidfilemode')
            else:
                self.filemode = filemode
        else:
            self.filemode = self.filemode if self.filemode else 'cf'

        if self.isusefile:
            if filepath is None:
                self.__ie('fileisnotexists')
            else:
                if not os.path.exists(filepath):
                    if filemode =='cf':
                        file = open(filepath, 'w')
                        file.write('')
                        file.close()
                    elif (filemode == 'w'):
                        self.__ie('fileisnotexists')
                    else:
                        self.__ie('invalidfilemode')

                # if self.name == 'root':
                #     __fileobj = open(filepath, 'r', encoding='UTF-8')
                #     if __fileobj.read() != '':
                #         open(filepath, 'w').write('')
                    
                #     del __fileobj

                self.filepath = filepath

        if self.configtable == {
                                'level' : self.level,
                                'format' : self.format,
                                'isusefile' : self.isusefile,
                                'filepath' : self.filepath,
                                'filemode' : self.filemode,
                                'isuseconsole' : self.isuseconsole,
                                }:
            return self

        self.configtable.update({
                                 'level' : self.level,
                                 'format' : self.format,
                                 'isusefile' : self.isusefile,
                                 'filepath' : self.filepath,
                                 'filemode' : self.filemode,
                                 'isuseconsole' : self.isuseconsole,
                                })

        return self

    def get_log(self, name: str):
        # print(self.name)
        # if self.name == 'root':
        #     _log = log(name)
        #     _log.config(
        #                 level=_leveltable[self.level],
        #                 format=self.format,
        #                 isusefile=self.isusefile,
        #                 filename=self.__filename,
        #                 filemode=self.filemode,
        #                 root_dir=self.root_dir,
        #                 isuseconsole=self.isuseconsole
        #                )
        # return _log
        # else:
        #     return log(name)
        return logger(name)

    def __log(self, level: IntLevel, message: str):
        text = self.format.format(time=time.strftime('%Y-%m-%d %H:%M:%S',
                                                            time.localtime()),
                                        level=IntlevelToStrLevel[level],
                                        name=self.name,
                                        message=message)
        if self.isusefile:
            if self.filepath and os.path.exists(self.filepath):
                with open(self.filepath, 'a', encoding='UTF-8') as file:
                    file.write(text + '\n')
            else:
                self.__ie('filepathisnotexists')
        if self.isuseconsole:
            print(text)
        else:
            self.unexeceventslist.append({'level' : IntlevelToStrLevel[level], 'message' : text, 'time' : time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())})

        self.eventslist.append({'level' : IntlevelToStrLevel[level], 'message' : text, 'time' : time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())})

    def debug(self, message: str):
        if self.level >= IntLevel.DEBUG:
            self.__log(IntLevel.DEBUG, message)
        else:
            pass
    
    def info(self, message: str):
        if self.level >= IntLevel.INFO:
            self.__log(IntLevel.INFO, message)
        else:
            pass

    def warning(self, message: str):
        if self.level >= IntLevel.WARING:
            self.__log(IntLevel.WARING, message)
        else:
            pass
    
    def error(self, message: str):
        if self.level >= IntLevel.ERROR:
            self.__log(IntLevel.ERROR, message)
        else:
            pass

    def critical(self, message: str):
        if self.level >= IntLevel.CRITICAL:
            self.__log(IntLevel.CRITICAL, message)
        else:
            pass

    def get_exception(self, exc_info=None): # type: ignore
        if exc_info is None:
            exc_info = traceback.format_exc()
        else:
            exc_info = traceback.format_exception_only(*exc_info[:2]) # type: ignore
            exc_info = ''.join(exc_info)

        self.error(f"Exception occurred: \n{exc_info}")

    def exit(self):
        if self.name == 'root':
            return
        _nametable.pop(self.name)
        del self
        return

    def __ie(self, error: str):
        table: dict[str, str] = {
                                    'nameisexists'           :  'name is exists',
                                    'errorisnotexists'       :  'error is not exists',
                                    'levelisnotexists'       :  'level is not exists',
                                    'invalidformat'          :  'format is invalid',
                                    'isusefileisnotbool'     :  'isusefile is not a Boolean value',
                                    'isuseconsoleisnotbool'  :  'isuseconsole is not a Boolean value',
                                    'fileisnotexists'        :  'file is not exists',
                                    'invalidfilemode'        :  'filemode is invalid',
                                    # 'fileobjisnotexists'  :  'file object is not exists',
                                }
        if ' ' in error:
            for i in error.split(' '):
                if i in table:
                    pass
                else:
                    self.__ie('errorisnotexists')
            
            raise Exception(' '.join([table[i] for i in error.split(' ')]))

        if not error in table:
            self.__ie('errorisnotexists')
        
        raise Exception(table[error])

    def GetEventsList(self) -> list[execeventClass]:
        return self.eventslist

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb): # type: ignore
        self.exit()
        return

_nametable: dict[str, logger] = {}

root_log = logger('root')

# debug = root_log.debug
# info = root_log.info
# warning = root_log.warning
# error = root_log.error
# critical = root_log.critical
# get_exception = root_log.get_exception
# # basicconfig = root_log.config
# config = root_log.config
# get_log = root_log.get_log

def debug(message: str):
    return root_log.debug(message)

def info(message: str):
    return root_log.info(message)

def warning(message: str):
    return root_log.warning(message)

def error(message: str):
    return root_log.error(message)

def critical(message: str):
    return root_log.critical(message)

def get_exception(exc_info=None): # type: ignore
    return root_log.get_exception(exc_info) # type: ignore

def get_log(name: str):
    return root_log.get_log(name)

def config(
    level: StrLevel | None=None,
    format: str | None=None,
    isusefile: bool | None=None, filepath: str | None=None,
    filemode: Literal['cf', 'w'] | None=None, isuseconsole: bool | None=True
):
    root_log.config(level=level, format=format, isusefile=isusefile, filepath=filepath, filemode=filemode, isuseconsole=isuseconsole)

def BasicConfig(
    level: StrLevel | None=None,
    format: str | None=None,
    isusefile: bool | None=None, filepath: str | None=None,
    filemode: Literal['cf', 'w'] | None=None, isuseconsole: bool | None=True
):
    for log in _nametable.values():
        log.config(level=level, format=format, isusefile=isusefile, filepath=filepath, filemode=filemode, isuseconsole=isuseconsole)


import ctypes
import json
import sys
import uuid
from collections.abc import Callable


TIlog = logger("TTHSDPyInter")
logfilepath = ''

if frozen: # 在 exe 运行时
    logfilepath = os.path.join(os.path.dirname(sys.executable), './TTHSDPyInter.log')
else:
    logfilepath = './TTHSDPyInter.log'

with open(logfilepath, 'w', encoding='utf-8') as f:
    f.write('')

TIlog.config(level=StrLevel.INFO, format='{name} ({level}, {time}): {message}', filepath=logfilepath, filemode='cf', isusefile=True)

# 定义回调函数类型
PROGRESS_CALLBACK = ctypes.CFUNCTYPE(None, ctypes.c_void_p, ctypes.c_void_p)

class TTHSDownloader:
    """TT高速下载器Python接口"""
    
    def __init__(self, dll_path: str | None = None):
        """
        初始化下载器接口
        
        Args:
            dll_path: DLL/SO文件路径，如果为None则自动检测
        """
        if dll_path is None:
            if sys.platform.startswith('win'):
                dll_path = './TTHighSpeedDownloader.dll'
            elif sys.platform == 'darwin':
                dll_path = './TTHighSpeedDownloader.dylib'
            elif sys.platform.startswith('linux'):
                dll_path = './TTHighSpeedDownloader.so'
            else:
                raise OSError('Unsupported operating system')
        
        self._dll_path = dll_path

        self._load_dll()

        # 定义函数签名
        self._define_function_signatures()
        
        # 回调函数引用，防止被垃圾回收
        self._callback_refs = {}
        
    def _load_dll(self):
        TIlog.info(f"Loading DLL: {self._dll_path}")

        # 加载动态库
        self.lib = ctypes.CDLL(self._dll_path)

        TIlog.info(f"Loaded DLL: {self._dll_path}")
        

    def _define_function_signatures(self):
        """定义所有导出函数的签名"""
        
        TIlog.info(f"Defining function signatures for DLL: {self._dll_path}")
        
        # startDownload 函数
        self.lib.startDownload.argtypes = [
            ctypes.c_char_p,        # tasksData
            ctypes.c_int,           # taskCount
            ctypes.c_int,           # threadCount
            ctypes.c_int,           # chunkSizeMB
            PROGRESS_CALLBACK,      # callback
            ctypes.c_bool,          # useCallbackURL
            ctypes.c_char_p,        # userAgent
            ctypes.c_char_p,        # remoteCallbackUrl
            ctypes.POINTER(ctypes.c_bool),  # useSocket
            ctypes.POINTER(ctypes.c_bool),  # isMultiple
        ]
        self.lib.startDownload.restype = ctypes.c_int
        
        # getDownloader 函数
        self.lib.getDownloader.argtypes = [
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
        self.lib.getDownloader.restype = ctypes.c_int
        
        # startDownload_ID 函数
        self.lib.startDownload_ID.argtypes = [ctypes.c_int]
        self.lib.startDownload_ID.restype = ctypes.c_int
        
        # startMultipleDownloads_ID 函数
        self.lib.startMultipleDownloads_ID.argtypes = [ctypes.c_int]
        self.lib.startMultipleDownloads_ID.restype = ctypes.c_int
        
        # pauseDownload 函数
        self.lib.pauseDownload.argtypes = [ctypes.c_int]
        self.lib.pauseDownload.restype = ctypes.c_int
        
        # resumeDownload 函数
        self.lib.resumeDownload.argtypes = [ctypes.c_int]
        self.lib.resumeDownload.restype = ctypes.c_int
        
        # stopDownload 函数
        self.lib.stopDownload.argtypes = [ctypes.c_int]
        self.lib.stopDownload.restype = ctypes.c_int
    
        TIlog.info(f"Defined function signatures for DLL: {self._dll_path}")

    def create_callback(self, callback_func: Callable[[dict, dict], None]) -> PROGRESS_CALLBACK:
        """
        创建C回调函数
        
        Args:
            callback_func: Python回调函数，接收两个参数(event_dict, msg_dict)
            
        Returns:
            注册的C回调函数
        """
        def c_callback(event_ptr: int, msg_ptr: int):
            try:
                # 解析事件数据
                event_json = ctypes.cast(event_ptr, ctypes.c_char_p).value
                msg_json = ctypes.cast(msg_ptr, ctypes.c_char_p).value
                
                if event_json:
                    event_dict = json.loads(event_json.decode('utf-8'))
                else:
                    event_dict = {}
                    
                if msg_json:
                    msg_dict = json.loads(msg_json.decode('utf-8'))
                else:
                    msg_dict = {}
                
                # 调用Python回调
                callback_func(event_dict, msg_dict)
                
            except Exception as e:
                print(f"回调函数错误: {e}")
        
        # 创建并保存引用
        cb = PROGRESS_CALLBACK(c_callback)
        self._callback_refs[id(cb)] = cb
        return cb
    
    def start_download(
        self,
        urls: list[str],
        save_paths: list[str],
        thread_count: int = 64,
        chunk_size_mb: int = 10,
        callback: Callable | None = None,
        use_callback_url: bool = False,
        user_agent: str | None = None,
        remote_callback_url: str | None = None,
        use_socket: bool | None = None,
        is_multiple: bool | None = None
    ) -> int:
        """
        开始下载任务
        
        Args:
            urls: 下载URL列表
            save_paths: 保存路径列表
            thread_count: 线程数
            chunk_size_mb: 分块大小(MB)
            callback: 进度回调函数
            use_callback_url: 是否使用远程回调
            user_agent: 自定义User-Agent
            remote_callback_url: 远程回调URL
            use_socket: 是否使用Socket通信
            is_multiple: 是否并行下载
            
        Returns:
            下载器ID
        """
        if len(urls) != len(save_paths):
            raise ValueError("URL数量和保存路径数量必须一致")
        
        # 准备任务数据
        tasks = []
        for i in range(len(urls)):
            task = {
                "URL": urls[i],
                "SavePath": save_paths[i],
                "ShowName": os.path.basename(save_paths[i]),
                "ID": str(uuid.uuid4())
            }
            tasks.append(task)
        
        tasks_json = json.dumps(tasks, ensure_ascii=False)
        
        # 准备可选参数
        user_agent_bytes = user_agent.encode('utf-8') if user_agent else None
        remote_callback_url_bytes = remote_callback_url.encode('utf-8') if remote_callback_url else None
        
        # 处理指针参数
        use_socket_ptr = ctypes.pointer(ctypes.c_bool(use_socket)) if use_socket is not None else None
        is_multiple_ptr = ctypes.pointer(ctypes.c_bool(is_multiple)) if is_multiple is not None else None
        
        # 创建C回调
        c_callback = self.create_callback(callback) if callback else None
        
        # 调用startDownload
        downloader_id = self.lib.startDownload(
            tasks_json.encode('utf-8'),
            len(urls),
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
        callback: Callable | None = None,
        use_callback_url: bool = False,
        user_agent: str | None = None,
        remote_callback_url: str | None = None,
        use_socket: bool | None = None
    ) -> int:
        """
        获取下载器但不开始下载
        
        Args:
            ... (参数同上)
            
        Returns:
            下载器ID
        """
        if len(urls) != len(save_paths):
            raise ValueError("URL数量和保存路径数量必须一致")
        
        # 准备任务数据
        tasks = []
        for i in range(len(urls)):
            task = {
                "URL": urls[i],
                "SavePath": save_paths[i],
                "ShowName": os.path.basename(save_paths[i]),
                "ID": str(uuid.uuid4())
            }
            tasks.append(task)
        
        tasks_json = json.dumps(tasks, ensure_ascii=False)
        
        # 准备可选参数
        user_agent_bytes = user_agent.encode('utf-8') if user_agent else None
        remote_callback_url_bytes = remote_callback_url.encode('utf-8') if remote_callback_url else None
        
        # 处理指针参数
        use_socket_ptr = ctypes.pointer(ctypes.c_bool(use_socket)) if use_socket is not None else None
        
        # 创建C回调
        c_callback = self.create_callback(callback) if callback else None
        
        # 调用getDownloader
        downloader_id = self.lib.getDownloader(
            tasks_json.encode('utf-8'),
            len(urls),
            thread_count,
            chunk_size_mb,
            c_callback,
            use_callback_url,
            user_agent_bytes,
            remote_callback_url_bytes,
            use_socket_ptr
        )
        
        return downloader_id
    
    def start_download_by_id(self, downloader_id: int) -> bool:
        """通过ID启动下载器"""
        result = self.lib.startDownload_ID(downloader_id)
        return result == 0
    
    def start_multiple_downloads_by_id(self, downloader_id: int) -> bool:
        """通过ID启动并行下载"""
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
        """停止下载"""
        result = self.lib.stopDownload(downloader_id)
        return result == 0
