# 只使用requests和标准库
# 爬取出tbody中的所有a元素
from email import header
import os
import pathlib
import requests
from urllib.parse import urljoin, urlparse
from concurrent.futures import ThreadPoolExecutor, as_completed
from threading import Lock
URL = 'https://app.unpkg.com/sober@1.1.9/files/dist/core/utils'

def get_file_list(url):
    response = requests.get(url)
    if response.status_code != 200:
        raise Exception(f"Failed to fetch URL: {url}")

    from html.parser import HTMLParser

    class MyHTMLParser(HTMLParser):
        def __init__(self):
            super().__init__()
            self.in_tbody = False
            self.file_links = []

        def handle_starttag(self, tag, attrs):
            if tag == 'tbody':
                self.in_tbody = True
            if self.in_tbody and tag == 'a':
                for attr in attrs:
                    if attr[0] == 'href':
                        self.file_links.append(attr[1])

        def handle_endtag(self, tag):
            if tag == 'tbody':
                self.in_tbody = False

    parser = MyHTMLParser()
    parser.feed(response.text)
    return parser.file_links

def download(url: str):
    file_name = url.split('/')[-1]

    print(file_name)

    if (not '.' in file_name) or ('@' in file_name):
        print('a')
        return
    
    href = 'https://unpkg.com/sober@1.1.9/dist/core/utils/' + file_name
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }

    response = requests.get(href, headers=headers, timeout=30)
    response.raise_for_status()
    
    # 创建目录如果不存在
    os.makedirs('./code/core/utils', exist_ok=True)
    
    # 写入文件
    filepath = f'./code/core/utils/{file_name}'
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(response.text)
    
    print(f"成功下载: {file_name}")
    return True

def download_list(urls: list[str]):
    # for url in urls:
        # download(url)
    downloadable_links = urls


    # 使用线程池进行并发下载
    max_workers = min(20, len(downloadable_links))  # 最大线程数不超过可下载文件数
    successful_downloads = 0
    
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        # 提交所有下载任务
        future_to_link = {executor.submit(download, link): link for link in downloadable_links}
        
        # 处理完成的任务
        for future in as_completed(future_to_link):
            link = future_to_link[future]
            try:
                result = future.result()
                if result:
                    successful_downloads += 1
            except Exception as e:
                print(f"处理 {link} 时出错: {e}")
        
download_list(get_file_list(URL))
