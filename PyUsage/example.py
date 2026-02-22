"""
TT高速下载器Python使用示例
"""

import os
import sys
import time
from TTHSD_interface import TTHSDownloader

def progress_callback(event_dict: dict, msg_dict: dict):
    """
    进度回调函数示例
    
    Args:
        event_dict: 事件字典
        msg_dict: 消息字典
    """
    event_type = event_dict.get('Type', '')
    event_name = event_dict.get('Name', '')
    
    if event_type == 'start':
        print(f"📥 开始下载")
        
    elif event_type == 'startOne':
        url = msg_dict.get('URL', '')
        index = msg_dict.get('Index', 0)
        total = msg_dict.get('Total', 0)
        print(f"📂 开始下载文件 {index}/{total}: {url}")
        
    elif event_type == 'update':
        downloaded = msg_dict.get('Downloaded', 0)
        total = msg_dict.get('Total', 0)
        if total > 0:
            percent = (downloaded / total) * 100
            print(f"📊 进度: {downloaded:,} / {total:,} ({percent:.1f}%)", end='\r')
            
    elif event_type == 'endOne':
        url = msg_dict.get('URL', '')
        index = msg_dict.get('Index', 0)
        print(f"✅ 完成文件 {index}: {url}")
        
    elif event_type == 'end':
        print(f"\n🎉 所有文件下载完成！")
        
    elif event_type == 'msg':
        text = msg_dict.get('Text', '')
        if text:
            print(f"ℹ️  消息: {text}")

def example1_basic_download():
    """示例1：基本下载"""
    print("=" * 50)
    print("示例1：基本下载")
    print("=" * 50)
    
    # 初始化下载器
    downloader = TTHSDDownloader()
    
    # 准备下载任务
    urls = [
        "https://example.com/file1.zip",
        "https://example.com/file2.zip",
    ]
    
    save_paths = [
        "downloads/file1.zip",
        "downloads/file2.zip",
    ]
    
    # 确保下载目录存在
    os.makedirs("downloads", exist_ok=True)
    
    print("开始下载...")
    
    # 开始下载
    downloader_id = downloader.start_download(
        urls=urls,
        save_paths=save_paths,
        thread_count=64,
        chunk_size_mb=10,
        callback=progress_callback,
        use_callback_url=False,
        user_agent=None,  # 使用默认User-Agent
        remote_callback_url=None,
        use_socket=None,
        is_multiple=False  # 顺序下载
    )
    
    print(f"下载器ID: {downloader_id}")
    
    # 等待下载完成
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n用户中断下载")
        # 停止下载
        downloader.stop_download(downloader_id)
    
    print("示例1完成\n")

def example2_advanced_download():
    """示例2：高级下载配置"""
    print("=" * 50)
    print("示例2：高级下载配置")
    print("=" * 50)
    
    downloader = TTHSDDownloader()
    
    # 准备多个下载任务
    urls = [
        "https://example.com/large_file1.iso",
        "https://example.com/large_file2.iso",
        "https://example.com/large_file3.iso",
    ]
    
    save_paths = [
        "downloads/large1.iso",
        "downloads/large2.iso",
        "downloads/large3.iso",
    ]
    
    # 创建下载器但不开始下载
    print("创建下载器...")
    downloader_id = downloader.get_downloader(
        urls=urls,
        save_paths=save_paths,
        thread_count=128,  # 更多线程
        chunk_size_mb=20,  # 更大的分块
        callback=progress_callback,
        use_callback_url=False,
        user_agent="MyCustomAgent/1.0",
        remote_callback_url=None,
        use_socket=False
    )
    
    print(f"下载器创建成功，ID: {downloader_id}")
    
    # 稍后开始下载
    print("5秒后开始下载...")
    time.sleep(5)
    
    # 开始下载
    print("开始下载...")
    success = downloader.start_download_by_id(downloader_id)
    if success:
        print("下载已启动")
    else:
        print("启动下载失败")
        return
    
    # 模拟中途暂停和恢复
    time.sleep(10)
    print("\n暂停下载...")
    if downloader.pause_download(downloader_id):
        print("下载已暂停")
        
        time.sleep(5)
        print("恢复下载...")
        if downloader.resume_download(downloader_id):
            print("下载已恢复")
        else:
            print("恢复下载失败")
    
    # 等待完成
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n用户中断下载")
        downloader.stop_download(downloader_id)
    
    print("示例2完成\n")

def example3_parallel_download():
    """示例3：并行下载"""
    print("=" * 50)
    print("示例3：并行下载（实验性）")
    print("=" * 50)
    
    downloader = TTHSDDownloader()
    
    # 准备多个小文件
    urls = [
        "https://example.com/small1.jpg",
        "https://example.com/small2.jpg",
        "https://example.com/small3.jpg",
        "https://example.com/small4.jpg",
        "https://example.com/small5.jpg",
    ]
    
    save_paths = [f"downloads/small{i+1}.jpg" for i in range(len(urls))]
    
    print("开始并行下载...")
    
    downloader_id = downloader.start_download(
        urls=urls,
        save_paths=save_paths,
        thread_count=32,
        chunk_size_mb=1,  # 小文件用小分块
        callback=progress_callback,
        use_callback_url=False,
        user_agent=None,
        remote_callback_url=None,
        use_socket=None,
        is_multiple=True  # 启用并行下载
    )
    
    print(f"并行下载器ID: {downloader_id}")
    
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n停止并行下载...")
        downloader.stop_download(downloader_id)
    
    print("示例3完成\n")

def example4_error_handling():
    """示例4：错误处理"""
    print("=" * 50)
    print("示例4：错误处理")
    print("=" * 50)
    
    downloader = TTHSDDownloader()
    
    # 无效的URL
    urls = [
        "https://invalid-url-that-does-not-exist.example/file.zip",
        "https://example.com/valid_file.zip",  # 有效URL
    ]
    
    save_paths = [
        "downloads/invalid.zip",
        "downloads/valid.zip",
    ]
    
    print("测试错误处理...")
    
    def error_callback(event_dict, msg_dict):
        event_type = event_dict.get('Type', '')
        if event_type == 'msg' and '错误' in event_dict.get('Name', ''):
            error_text = msg_dict.get('Text', '')
            print(f"⚠️  错误信息: {error_text}")
    
    downloader_id = downloader.start_download(
        urls=urls,
        save_paths=save_paths,
        thread_count=64,
        chunk_size_mb=10,
        callback=error_callback,
        is_multiple=False  # 顺序下载，第一个失败不影响第二个
    )
    
    print(f"下载器ID: {downloader_id}")
    
    # 等待一段时间
    time.sleep(15)
    
    print("停止下载器...")
    downloader.stop_download(downloader_id)
    
    print("示例4完成\n")

def main():
    """主函数"""
    print("TT高速下载器 Python 示例")
    print("=" * 50)
    
    # 确保下载目录存在
    os.makedirs("downloads", exist_ok=True)
    
    # 运行示例
    try:
        # 示例1：基本下载
        example1_basic_download()
        
        # 示例2：高级配置
        example2_advanced_download()
        
        # 示例3：并行下载
        example3_parallel_download()
        
        # 示例4：错误处理
        example4_error_handling()
        
    except Exception as e:
        print(f"运行示例时出错: {e}")
        import traceback
        traceback.print_exc()
        return 1
    
    print("所有示例完成！")
    print("下载的文件保存在 'downloads' 目录中")
    return 0

if __name__ == "__main__":
    sys.exit(main())
