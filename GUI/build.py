import PyInstaller.__main__ as Pyi
import os

def build():
    # 获取当前脚本目录
    current_dir = os.path.dirname(os.path.abspath(__file__))
    icon_path = os.path.join(current_dir, './files/assets/TTHSD.ico')

    args = ['./TTHighSpeedDownloader_GUI.py', '--onefile', '--windowed', '--icon', icon_path]

    files = ['./TTHighSpeedDownloader.dll', './VersionLog.txt']
    folders = [('./files/', 'files')]

    for file in files:
        args.append('--add-data')
        # Windows使用分号，其他系统使用冒号
        if os.name == 'nt':
            args.append(f'{file};.')
        else:
            args.append(f'{file}:.')
            
    for folder in folders:
        args.append('--add-data')
        if os.name == 'nt':
            args.append(f'{folder[0]};{folder[1]}')
        else:
            args.append(f'{folder[0]}:{folder[1]}')
    
    Pyi.run(args)

if __name__ == '__main__':
    build()