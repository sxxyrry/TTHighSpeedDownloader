function getBase64DecodedContent(paramName) {
    const url = new URL(location.href);
    let encodedContent = url.searchParams.get(paramName);
    
    if (!encodedContent) {
        throw new Error(`参数 ${paramName} 不存在`);
    }
    
    // 解码 URL 参数，将 %xx 编码的字符转换回原始字符
    encodedContent = decodeURIComponent(encodedContent);
    
    // 移除空白字符
    encodedContent = encodedContent.replace(/\s/g, '');

    // 确保字符串是有效的 Base64 格式
    // 将 URL 安全的 Base64 的 - 替换为 +，_ 替换为 /
    let base64Content = encodedContent.replace(/-/g, '+').replace(/_/g, '/');
    
    // 确保 Base64 字符串长度是 4 的倍数，补上等号
    while (base64Content.length % 4 !== 0) {
         base64Content += '=';
    }

    // 验证 Base64 字符串只包含有效的 Base64 字符
    const validBase64Regex = /^[A-Za-z0-9+/=]+$/;
    if (!validBase64Regex.test(base64Content)) {
        throw new Error('Base64 编码无效');
    }

    // 将 Base64 解码为原始内容
    const binaryData = atob(base64Content);
    // 将二进制数据转换为字符串（处理 UTF-8）
    let bytes = new Uint8Array(binaryData.length);
    for (let i = 0; i < binaryData.length; i++) {
        bytes[i] = binaryData.charCodeAt(i);
    }
    return new TextDecoder('utf-8').decode(bytes);
}

export {
    getBase64DecodedContent
}
