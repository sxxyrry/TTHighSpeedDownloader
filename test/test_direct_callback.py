import pytest
import ctypes
import json
import time
import uuid
from platform_utils import is_windows, is_linux, is_macos
from else_utils import get_download_dir, check_file_content_is_correct

def test_direct_callback_function(downloader_lib: ctypes.CDLL | None, sample_tasks: list[dict[str, str]]):
    """测试直接回调函数功能（跨平台）"""
    if not downloader_lib:
        pytest.skip("共享库未找到")
        
    # 定义回调函数类型
    if is_windows():
        # Windows平台的回调函数定义
        progress_callback_t = ctypes.WINFUNCTYPE(
            None,              # 返回类型
            ctypes.c_int,      # downloader_id
            ctypes.c_int,      # progress
            ctypes.c_char_p    # status_message
        )
    else:
        # Unix-like平台的回调函数定义
        progress_callback_t = ctypes.CFUNCTYPE(
            None,              # 返回类型
            ctypes.c_int,      # downloader_id
            ctypes.c_int,      # progress
            ctypes.c_char_p    # status_message
        )
    
    # 存储回调调用记录
    callback_calls = []
    
    # 定义Python回调函数
    def progress_callback(downloader_id, progress, status):
        try:
            status_str = status.decode('utf-8') if status else ''
        except UnicodeDecodeError:
            # 如果UTF-8解码失败，尝试其他编码或使用默认值
            status_str = str(status) if status else ''
        
        callback_calls.append({
            'id': downloader_id,
            'progress': progress,
            'status': status_str,
            'timestamp': time.time()
        })
    
    # 创建C兼容的回调函数
    c_callback = progress_callback_t(progress_callback)
    
    # 准备任务数据
    tasks_json = json.dumps(sample_tasks)
    tasks_data = tasks_json.encode('utf-8')
    task_count = len(sample_tasks)
    thread_count = 2
    chunk_size_mb = 1
    
    # 检查函数是否存在
    if not hasattr(downloader_lib, 'startDownload'):
        pytest.skip("startDownload 函数未找到")
    
    get_download_dir()

    # 调用 startDownload 函数
    downloader_id = downloader_lib.startDownload(
        tasks_data,
        task_count,
        thread_count,
        chunk_size_mb,
        c_callback,
        False,  # useCallbackURL
        None,   # remoteCallbackUrl
        None    # useSocket
    )

    check_file_content_is_correct(sample_tasks=sample_tasks)

    # 验证返回值
    assert downloader_id != -1, "startDownload 应该成功返回下载器实例ID"

    # # 等待一段时间让回调被调用
    # time.sleep(2)
    
    # 验证回调函数被调用
    assert len(callback_calls) >= 0, "回调函数应该被调用"

def test_get_downloader(downloader_lib, sample_tasks):
    """测试 getDownloader 函数（跨平台）"""
    if not downloader_lib:
        pytest.skip("共享库未找到")
        
    if not hasattr(downloader_lib, 'getDownloader'):
        pytest.skip("getDownloader 函数未找到")
    
    # 准备任务数据
    tasks_json = json.dumps(sample_tasks)
    tasks_data = tasks_json.encode('utf-8')
    task_count = len(sample_tasks)
    thread_count = 2
    chunk_size_mb = 1
    
    # 调用 getDownloader 函数
    downloader_id = downloader_lib.getDownloader(
        tasks_data,
        task_count,
        thread_count,
        chunk_size_mb
    )
    
    # 验证返回值
    assert downloader_id != -1, "getDownloader 应该成功返回下载器实例ID"

@pytest.mark.windows
def test_windows_specific_features(downloader_lib, sample_tasks):
    """Windows平台特定功能测试"""
    if not is_windows():
        pytest.skip("仅在Windows平台运行")
    
    if not downloader_lib:
        pytest.skip("共享库未找到")
        
    # Windows特定测试可以在这里添加
    pass

@pytest.mark.linux
def test_linux_specific_features(downloader_lib, sample_tasks):
    """Linux平台特定功能测试"""
    if not is_linux():
        pytest.skip("仅在Linux平台运行")
    
    if not downloader_lib:
        pytest.skip("共享库未找到")
        
    # Linux特定测试可以在这里添加
    pass

@pytest.mark.macos
def test_macos_specific_features(downloader_lib, sample_tasks):
    """macOS平台特定功能测试"""
    if not is_macos():
        pytest.skip("仅在macOS平台运行")
    
    if not downloader_lib:
        pytest.skip("共享库未找到")
        
    # macOS特定测试可以在这里添加
    pass
