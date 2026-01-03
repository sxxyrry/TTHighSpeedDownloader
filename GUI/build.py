import argparse
import subprocess
import os
import sys


def build():
    parser = argparse.ArgumentParser()
    parser.add_argument('--platform', choices=['Windows', 'Linux', 'MacOS'], 
                       help='指定目标平台 (Windows/Linux/MacOS)')
    args = parser.parse_args()
    
    # 获取当前脚本目录
    current_dir = os.path.dirname(os.path.abspath(__file__))
    icon_path = os.path.join(current_dir, './files/assets/Image/TTHSD_GUI.ico')
    
    # 确定目标平台
    target_platform = args.platform
    if not target_platform:
        if sys.platform.startswith('win'):
            target_platform = 'Windows'
        elif sys.platform == 'darwin':
            target_platform = 'MacOS'
        else:
            target_platform = 'Linux'

    # 构建PyInstaller命令参数
    pyinstaller_args = [
        'pyinstaller',
        '--onefile',  # 生成单个可执行文件
        # '--windowed',  # 不显示控制台窗口（Windows下）
        f'--name=TTHighSpeedDownloader_GUI_{target_platform}',
        f'--icon={icon_path}' if os.path.exists(icon_path) else '',  # 设置图标
        '--hidden-import=wx',  # 隐式导入wx模块
        '--hidden-import=webview',  # 隐式导入webview模块
        # '--hidden-import=watchdog',  # 隐式导入watchdog模块
        # '--hidden-import=Notice',  # 隐式导入Notice模块
        '--add-data', './files;files' if sys.platform.startswith('win') else './files:files',  # 添加 files 目录
        '--add-data', './VersionHistory.txt;.' if sys.platform.startswith('win') else './VersionHistory.txt:.',  # 添加版本历史文件
        '--add-data', './Notice.py;.' if sys.platform.startswith('win') else './Notice.py:.',  # 添加 Notice
        '--add-data', './README.md;.' if sys.platform.startswith('win') else './README.md:.',  # 添加 README.md 文件
    ]
    
    for i in ['./TTHighSpeedDownloader.dll', './TTHighSpeedDownloader.so', './TTHighSpeedDownloader.dylib']:
        if os.path.exists(i):
            pyinstaller_args.append(f'--add-data')
            pyinstaller_args.append( f'{i};.' if sys.platform.startswith('win') else f'{i}:.')

    # 过滤掉空字符串参数
    pyinstaller_args = [arg for arg in pyinstaller_args if arg]
    
    pyinstaller_args.append('./TTHighSpeedDownloader_GUI.py')

    try:
        print("运行参数:", ' '.join(pyinstaller_args))
    except UnicodeEncodeError:
        print("Build arguments:", ' '.join(pyinstaller_args))
    
    try:
        subprocess.run(pyinstaller_args, check=True)
        try:
            print("GUI构建成功完成！")
        except UnicodeEncodeError:
            print("GUI build completed successfully!")
    except subprocess.CalledProcessError as e:
        try:
            print(f"GUI构建失败：{e}")
        except UnicodeEncodeError:
            print(f"GUI build failed: {e}")
        sys.exit(1)
    except FileNotFoundError:
        try:
            print("错误：未找到 PyInstaller，请先安装")
        except UnicodeEncodeError:
            print("Error: PyInstaller not found, please install it first")
        sys.exit(1)


if __name__ == '__main__':
    build()
