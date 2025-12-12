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
    icon_path = os.path.join(current_dir, './files/assets/TTHSD.ico')
    
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

    if target_platform == 'Linux':
        separator = '='
    elif target_platform == 'MacOS':
        separator = '='
    else:
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
    
    # 设置控制台选项
    if target_platform == 'Windows':
        nuitka_args.append('--disable-console')  # Windows下禁用控制台
    
    # 设置图标
    if target_platform == 'Windows' and os.path.exists(icon_path):
        nuitka_args.append(f'--windows-icon-from-ico={icon_path}')
    elif target_platform == 'MacOS' and os.path.exists(icon_path.replace('.ico', '.icns')):
        nuitka_args.append(f'--macos-app-icon={icon_path.replace(".ico", ".icns")}')

    # 处理文件和目录
    files = ['./TTHighSpeedDownloader.dll', './TTHighSpeedDownloader.so', './TTHighSpeedDownloader.dylib', './VersionHistory.txt']
        
    for file in files:
        if os.path.exists(file):
            nuitka_args.append(f'--include-data-file={file}{separator}.')

    folders = [('./files/', 'files')]
    for folder, dest in folders:
        if os.path.exists(folder):
            nuitka_args.append(f'--include-data-dir={folder}{separator}{dest}')

    print("运行参数:", ' '.join(nuitka_args))
    
    try:
        subprocess.run(nuitka_args, check=True)
        print("GUI构建成功完成！")
    except subprocess.CalledProcessError as e:
        print(f"GUI构建失败: {e}")
        sys.exit(1)
    except FileNotFoundError:
        print("错误: 未找到 Nuitka，请先安装")
        sys.exit(1)

if __name__ == '__main__':
    build()
