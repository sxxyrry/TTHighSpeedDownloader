from shutil import rmtree
import pytest
import ctypes
import sys
import os
import platform
import uuid
from pathlib import Path

def get_library_name():
    """根据平台获取正确的库文件名"""
    system = platform.system().lower()
    if system == "windows":
        return "TTHighSpeedDownloader.dll"
    elif system == "darwin":  # macOS
        return "TTHighSpeedDownloader.dylib"
    else:  # Linux and others
        return "TTHighSpeedDownloader.so"

@pytest.fixture(scope="session")
def downloader_lib():
    """加载对应平台的下载器共享库"""
    lib_name = get_library_name()
    
    # 搜索可能的库文件位置
    possible_paths = [
        f"./{lib_name}",
        f"build/{lib_name}",
        f"dist/{lib_name}",
        f"../{lib_name}",
        f"../../{lib_name}",

        
        f"build/Windows/{lib_name}",
        f"dist/Windows/{lib_name}",
        f"../Windows/{lib_name}",
        f"../../Windows/{lib_name}",

        
        f"build/Linux/{lib_name}",
        f"dist/Linux/{lib_name}",
        f"../Linux/{lib_name}",
        f"../../Linux/{lib_name}",

        
        f"build/MacOS/{lib_name}",
        f"dist/MacOS/{lib_name}",
        f"../MacOS/{lib_name}",
        f"../../MacOS/{lib_name}",
        lib_name
    ]
    
    for path in possible_paths:
        if os.path.exists(path):
            try:
                return ctypes.CDLL(path)
            except OSError as e:
                print(f"无法加载库文件 {path}: {e}")
                continue
    
    print(f"警告: 未找到库文件 {lib_name}")
    return None

@pytest.fixture
def sample_tasks():
    """提供测试用的任务数据，使用UUID4格式的ID"""
    return [
        {
            "URL": "https://disk.sample.cat/samples/zip/sample-1.zip",
            "SavePath": "./test/downloads/test_download_1.zip",
            "ShowName": "测试文件1.zip",
            "ID": str(uuid.uuid4())
        },
        {
            "URL": "https://disk.sample.cat/samples/json/sample-1.json",
            "SavePath": "./test/downloads/test_download_2.json",
            "ShowName": "测试文件2.json",
            "ID": str(uuid.uuid4())
        }
    ]

def pytest_configure(config):
    """配置pytest"""
    config.addinivalue_line("markers", "platform_specific: mark test as platform specific")
    config.addinivalue_line("markers", "windows: mark test to run only on Windows")
    config.addinivalue_line("markers", "linux: mark test to run only on Linux")
    config.addinivalue_line("markers", "macos: mark test to run only on macOS")
