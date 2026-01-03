import argparse
import subprocess
import os
import sys


def build():
    # 在构建函数开始处添加
    os.environ['NUITKA_DOWNLOADS_CONFIRMATION'] = '1'
    os.environ['NUITKA_ASSUME_YES_FOR_DOWNLOADS'] = '1'
    os.environ['NUITKA_DISABLE_DLL_DEPENDENCY_CACHE'] = '1'
    
    parser = argparse.ArgumentParser()
    parser.add_argument('--platform', choices=['Windows', 'Linux', 'MacOS'], 
                       help='指定目标平台 (Windows/Linux/MacOS)')
    args = parser.parse_args()
    
    # 获取当前脚本目录
    current_dir = os.path.dirname(os.path.abspath(__file__))
    icon_path = os.path.join(current_dir, './files/assets/Image//TTHSD_GUI.ico')
    
    # 确定目标平台
    target_platform = args.platform
    if not target_platform:
        if sys.platform.startswith('win'):
            target_platform = 'Windows'
        elif sys.platform == 'darwin':
            target_platform = 'MacOS'
        else:
            target_platform = 'Linux'

    # 定义分隔符
    separator = '='

    # 构建Nuitka命令参数
    nuitka_args = [
        'python', '-m', 'nuitka',
        '--standalone',
        '--onefile',  # 生成单个可执行文件
        '--output-dir=dist',
        f'--output-filename=TTHighSpeedDownloader_GUI_{target_platform}',
        './TTHighSpeedDownloader_GUI.py'
    ]

    nuitka_args.extend([
        '--assume-yes-for-downloads',
        '--disable-dll-dependency-cache'
    ])

    # 设置控制台选项
    if target_platform == 'Windows':
        # 使用新的控制台模式参数替代 --disable-console
        # nuitka_args.append('--windows-console-mode=disable')
        pass

    # 设置图标
    if target_platform == 'Windows' and os.path.exists(icon_path):
        nuitka_args.append(f'--windows-icon-from-ico={icon_path}')
    elif target_platform == 'MacOS' and os.path.exists(icon_path.replace('.ico', '.icns')):
        nuitka_args.append(f'--macos-app-icon={icon_path.replace(".ico", ".icns")}')

    # nuitka_args.append(f'')

    # 处理文件和目录
    files = ['./TTHighSpeedDownloader.dll', './TTHighSpeedDownloader.so', './TTHighSpeedDownloader.dylib', './VersionHistory.txt', './README.md']
    for file in files:
        if os.path.exists(file):
            filename = os.path.basename(file)
            # 修正：使用具体的文件名而不是 "."
            nuitka_args.append(f'--include-data-file={file}={filename}')

    folders = [('./files/', 'files')]
    for folder, dest in folders:
        if os.path.exists(folder):
            # 确保目标路径不以 "/" 结尾
            nuitka_args.append(f'--include-data-dir={folder}={dest}')
    try:
        print("运行参数:", ' '.join(nuitka_args))
    except UnicodeEncodeError:
        print("Build arguments:", ' '.join(nuitka_args))
    try:
        subprocess.run(nuitka_args, check=True)
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
            print("错误：未找到 Nuitka，请先安装")
        except UnicodeEncodeError:
            print("Error: Nuitka not found, please install it first")
        sys.exit(1)

if __name__ == '__main__':
    build()
