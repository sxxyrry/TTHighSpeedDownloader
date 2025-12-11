# TT High Speed Downloader TT 高速下载器

TT High Speed Downloader TT 高速下载器 是一个高性能的多线程文件下载器，支持并发下载、断点续传和进度监控。该项目使用 Go 语言开发。编译为 dll 或者 so （可惜作者不知道发布Linux之类的要编译多少个 so 文件）供全平台、全语言调用。

## 功能特性

- 多线程并发下载，提高下载速度
- 支持多个文件下载（不是同时下载，因为现在可能会存在回调被同时调用）
- 实时进度监控和速度计算
- 暂停和恢复下载功能
- 支持自定义线程数和分块大小
- 提供 C 接口，支持 多语言调用
- 支持任务信息（URL、保存路径、显示名称）

## 许可证

本项目基于 [GNU General Public License v3.0](https://www.gnu.org/licenses/gpl-3.0.en.html) 开源发布。

## 版本历史

[版本历史](./VersionHistory.txt)

## GUI 版本

### 版本历史

[版本历史（GUI）](./GUI/VersionHistory.txt)

## 安装

将 [TTHighSpeedDownloader.dll](./build/Windows/TTHighSpeedDownloader.dll) (Windows) 或 [TTHighSpeedDownloader.so](./build/Linux/libTTHighSpeedDownloader.so) (Linux（Ubuntu 22.04.5 LTS，因为作者只有这个虚拟机*）) 文件放置在您的项目目录中。

## API 参数说明

[API 参数说明](./docs/API%20Parameter%20Description.md)

## 使用的 Go 库

- ### github.com/gorilla/websocket v1.5.3

## 重新编译

[重新编译](./docs/Recompile.md)

## 任务数据格式

任务数据使用JSON格式，每个任务包含以下字段：
- URL: 下载链接
- SavePath: 保存路径
- ShowName: 显示名称
- ID : 下载任务 ID （字符串，任意格式）

示例：
```json
[
  {
    "URL": "https://example.com/file1.zip",
    "SavePath": "downloads/file1.zip",
    "ShowName": "文件1.zip",
    "ID": "3686b666-5716-477c-a364-5b4b4e684874"
  },
  {
    "URL": "https://example.com/file2.zip",
    "SavePath": "downloads/file2.zip",
    "ShowName": "文件2.zip",
    "ID": "ac824bcc-ed02-4c4d-8b14-bfc500f0ba86"
  }
]
```

## 注意事项

- URL 和保存路径需要使用字节字符串（bytes）
- 回调 URL 会接收 JSON 格式的事件和消息数据，回调函数则是接收指针
- 多文件下载时 URL 数量和保存路径数量必须一致
- 分块大小根据文件大小自动调整，避免过小或过大
- 线程数会根据分块数量自动调整，确保不超过分块数量

## Python 测试用例

[Python 测试用例](./docs/Python%20test%20case.md)
