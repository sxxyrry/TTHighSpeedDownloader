# API 说明

## startDownload 函数

- 参数

    | 参数名               | 类型                   | 说明                           |
    |----------------------|------------------------|--------------------------------|
    | `tasksData`          | `char*`                | JSON格式的任务数据             |
    | `taskCount`          | `int`                  | 任务数量                       |
    | `threadCount`        | `int`                  | 下载线程数                     |
    | `chunkSizeMB`        | `int`                  | 每个下载块的大小 ( MB )        |
    | `callback`           | `progress_callback_t`  | 进度回调函数                   |
    | `userAgent`          | `char*`                | UA 字符串（可选）默认值：①    |
    | `useCallbackURL`     | `bool`                 | 是否使用远程回调URL            |
    | `remoteCallbackUrl`  | `char*`                | 远程回调 URL（可选）           |
    | `useSocket`          | `bool*`                | 是否使用 Socket 通信 （可选）  |

    ①："Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0"

- 返回值

  返回值类型: int

  返回值含义:

  - 返回下载器实例ID（正整数）

- 注意事项

  下载失败会发送一个消息，包含错误信息。

## getDownloader 函数

- 参数

    | 参数名               | 类型                   | 说明                           |
    |----------------------|------------------------|--------------------------------|
    | `tasksData`          | `char*`                | JSON格式的任务数据             |
    | `taskCount`          | `int`                  | 任务数量                       |
    | `threadCount`        | `int`                  | 下载线程数                     |
    | `chunkSizeMB`        | `int`                  | 每个下载块的大小 ( MB )        |
    | `callback`           | `progress_callback_t`  | 进度回调函数                   |
    | `userAgent`          | `char*`                | UA 字符串（可选）默认值：①    |
    | `useCallbackURL`     | `bool`                 | 是否使用远程回调URL            |
    | `remoteCallbackUrl`  | `char*`                | 远程回调 URL（可选）           |
    | `useSocket`          | `bool*`                | 是否使用 Socket 通信 （可选）  |

    ①："Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0"

- 返回值

  返回值类型: int

  返回值含义:

  - 成功时返回下载器实例ID（正整数）

  - 失败时返回-1

- 注意事项

  不会自动开始下载

## startDownload_ID

- 参数

    | 参数名 | 类型   | 说明           |
    |--------|--------|----------------|
    | `id`   | `int`  | 下载器实例 ID  |

- 返回值

    返回值类型: int

    返回值含义:

    - 成功时返回0

    - 失败时返回-1（找不到对应ID的下载器）

- 注意事项

  下载失败会发送一个消息，包含错误信息。


## pauseDownload 函数参数

- 参数

    | 参数名 | 类型   | 说明           |
    |--------|--------|----------------|
    | `id`   | `int`  | 下载器实例 ID  |

- 返回值

    返回值类型: int

    返回值含义:

    - 成功时返回0

    - 失败时返回-1（找不到对应ID的下载器）

- 注意事项

  暂停下载会发送一个消息。

## resumeDownload 函数参数

- 参数

    | 参数名 | 类型   | 说明           |
    |--------|--------|----------------|
    | `id`   | `int`  | 下载器实例 ID  |

- 返回值

    返回值类型: int

    返回值含义:

    - 成功时返回0
    
    - 失败时返回-1（找不到对应ID的下载器）

- 注意事项：

  恢复下载会发送一个消息。

## 重要提示

远程回调 URL 是回调函数的另一种实现，支持 WebSocket 通信 和 纯 TCP 通信
