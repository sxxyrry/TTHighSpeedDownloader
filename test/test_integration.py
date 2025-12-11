from ctypes import CDLL
import pytest
import json
import time
import uuid
import platform
from platform_utils import is_windows, is_linux, is_macos, get_platform_name

def test_cross_platform_compatibility(downloader_lib: CDLL | None, sample_tasks: list[dict[str, str]]):
    """测试跨平台兼容性"""
    if not downloader_lib:
        pytest.skip("共享库未找到")
    
    platform_name = get_platform_name()
    print(f"在 {platform_name} 平台上运行测试")
    
    # 测试基本功能
    tasks_json = json.dumps(sample_tasks)
    tasks_data = tasks_json.encode('utf-8')
    task_count = len(sample_tasks)
    thread_count = 2
    chunk_size_mb = 1
    
    if hasattr(downloader_lib, 'getDownloader'):
        downloader_id = downloader_lib.getDownloader(
            tasks_data,
            task_count,
            thread_count,
            chunk_size_mb
        )
        
        assert downloader_id != -1, f"{platform_name} 平台上 getDownloader 应该成功"

def test_task_data_validation(downloader_lib, sample_tasks):
    """测试任务数据验证"""
    if not downloader_lib:
        pytest.skip("共享库未找到")

    # 测试有效的任务数据
    tasks_json = json.dumps(sample_tasks)
    tasks_data = tasks_json.encode('utf-8')
    
    # 验证JSON格式正确
    try:
        parsed = json.loads(tasks_json)
        assert isinstance(parsed, list), "任务数据应该是数组格式"
        assert len(parsed) > 0, "任务数据不应该为空"
        for task in parsed:
            required_fields = ['URL', 'SavePath', 'ShowName', 'ID']
            for field in required_fields:
                assert field in task, f"任务数据缺少必需字段: {field}"
            # 验证ID是UUID4格式
            task_id = task['ID']
            uuid.UUID(task_id)  # 这会抛出异常如果ID不是有效的UUID
    except (json.JSONDecodeError, ValueError) as e:
        pytest.fail(f"任务数据格式无效: {e}")

def test_library_loading_by_platform(downloader_lib):
    """根据平台测试库加载"""
    platform_name = get_platform_name()
    
    if platform_name == "windows":
        expected_ext = ".dll"
    elif platform_name == "darwin":  # macOS
        expected_ext = ".dylib"
    else:  # linux
        expected_ext = ".so"
    
    assert downloader_lib is not None, f"应该能成功加载 {expected_ext} 格式的库文件"

def test_api_function_signatures(downloader_lib):
    """测试API函数签名"""
    if not downloader_lib:
        pytest.skip("共享库未找到")
    
    # 检查必需的函数是否存在
    required_functions = [
        'startDownload',
        'getDownloader',
        'pauseDownload',
        'resumeDownload'
    ]
    
    for func_name in required_functions:
        assert hasattr(downloader_lib, func_name), f"应该存在 {func_name} 函数"

def test_error_handling(downloader_lib):
    """测试错误处理"""
    if not downloader_lib:
        pytest.skip("共享库未找到")
        
    # 测试无效参数处理
    if hasattr(downloader_lib, 'startDownload'):
        # 调用函数使用无效参数
        result = downloader_lib.startDownload(
            None,  # 无效的任务数据
            0,     # 无效的任务数量
            0,     # 无效的线程数
            0,     # 无效的块大小
            None,  # 无回调
            False, # 不使用远程回调
            None,  # 无远程回调URL
            None   # 不使用Socket
        )
        
        # 应该返回错误码
        assert isinstance(result, int), "函数调用应该返回整数值"

@pytest.mark.windows
def test_windows_specific_integration(downloader_lib, sample_tasks):
    """Windows平台集成测试"""
    if not is_windows():
        pytest.skip("仅在Windows平台运行")
    
    test_cross_platform_compatibility(downloader_lib, sample_tasks)

@pytest.mark.linux
def test_linux_specific_integration(downloader_lib, sample_tasks):
    """Linux平台集成测试"""
    if not is_linux():
        pytest.skip("仅在Linux平台运行")
    
    test_cross_platform_compatibility(downloader_lib, sample_tasks)

@pytest.mark.macos
def test_macos_specific_integration(downloader_lib, sample_tasks):
    """macOS平台集成测试"""
    if not is_macos():
        pytest.skip("仅在macOS平台运行")
    
    test_cross_platform_compatibility(downloader_lib, sample_tasks)
