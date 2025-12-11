import platform
import sys

def is_windows():
    """检查是否为Windows平台"""
    return platform.system().lower() == "windows"

def is_linux():
    """检查是否为Linux平台"""
    return platform.system().lower() == "linux"

def is_macos():
    """检查是否为macOS平台"""
    return platform.system().lower() == "darwin"

def get_platform_name():
    """获取当前平台名称"""
    return platform.system().lower()

def skip_if_not_platform(expected_platform):
    """如果不在预期平台上则跳过测试"""
    current = get_platform_name()
    return current != expected_platform
