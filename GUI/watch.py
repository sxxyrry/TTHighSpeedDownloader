from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
from watchdog.events import DirModifiedEvent, FileModifiedEvent
import time
import threading
import webview


class FileChangeHandler(FileSystemEventHandler):
    def __init__(self, window: webview.Window):
        self.window = window
        
    def on_modified(self, event: DirModifiedEvent | FileModifiedEvent):
        if not event.is_directory and str(event.src_path).startswith('./files'):
            if 'assets' in str(event.src_path) or 'ico' in str(event.src_path):
                return
            print(f"检测到文件变化: {event.src_path}")
            # 刷新页面
            self.window.evaluate_js("location.reload();")
        pass

def start(window: webview.Window, running: bool):
    # 启动文件监控线程
    def start_file_watcher():
        event_handler = FileChangeHandler(window)
        observer = Observer()
        observer.schedule(event_handler, './files', recursive=True)
        observer.start()
        try:
            while running:
                time.sleep(0.5)
        except KeyboardInterrupt:
            observer.stop()
        observer.join()
    
    # 在后台线程中启动文件监控
    watcher_thread = threading.Thread(target=start_file_watcher, daemon=True)
    watcher_thread.start()
