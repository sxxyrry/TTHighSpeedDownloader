# 重新编译

## Windows

    ```bash
    # 在 TTHighSpeedDownloader 下
    # 清理并更新依赖
    go mod tidy

    # 编译共享库
    go build -buildmode=c-shared -o build/Windows/TTHighSpeedDownloader.dll .
    ```

## Linux

    ```bash
    # 在 TTHighSpeedDownloader 下
    # 清理并更新依赖
    go mod tidy

    # 编译共享库
    go build -buildmode=c-shared -o build/Linux/TTHighSpeedDownloader.so .
    ```
