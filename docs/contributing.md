# 贡献指南

感谢您对 TT 高速下载器 (TTHSD) 项目的关注和贡献意愿！本文档将指导您如何参与 TTHSD 的开发。

## 贡献方式

我们欢迎以下形式的贡献：

### 1. 代码贡献
- 修复 bug
- 添加新功能
- 优化性能
- 改进代码质量

### 2. 文档改进
- 完善现有文档
- 纠正文档错误
- 添加示例代码
- 翻译文档到其他语言

### 3. 问题反馈
- 报告 bug
- 提出功能建议
- 提供使用反馈

### 4. 测试验证
- 在不同平台测试
- 测试特定功能
- 验证修复效果

### 5. 推广分享
- 向他人介绍 TTHSD
- 分享使用经验
- 撰写教程或博客

## 开发环境设置

### 前置要求

- **Go 1.26.0 或更高版本** - 用于编译核心库
- **Python 3.11 或更高版本** - 用于开发和测试 Python 接口
- **Git** - 用于版本控制

### 克隆仓库

```bash
git clone https://github.com/sxxyrry/TTHighSpeedDownloader.git
cd TTHighSpeedDownloader
```

### 安装依赖

#### Go 依赖

```bash
go mod download
```

#### Python 依赖

```bash
pip install -r requirements.txt
```

## 编译项目

### 编译核心库

#### Windows

```bash
go build -o TTHighSpeedDownloader.dll -buildmode=c-shared
```

#### Linux

```bash
go build -o libTTHighSpeedDownloader.so -buildmode=c-shared
```

#### macOS

```bash
go build -o TTHighSpeedDownloader.dylib -buildmode=c-shared
```

### 运行测试

```bash
# 运行 Go 测试
go test ./...

# 运行 Python 接口测试
python tests/test_interface.py
```

## 提交代码

### 分支策略

- **main** - 主分支，稳定版本
- **develop** - 开发分支，功能开发
- **feature/xxx** - 功能分支
- **fix/xxx** - 修复分支

### 提交规范

使用清晰的提交信息格式：

```
<type>(<scope>): <subject>

<body>

<footer>
```

**类型 (type):**
- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码格式（不影响功能）
- `refactor`: 重构
- `test`: 测试相关
- `chore`: 构建或辅助工具

**示例:**

```
feat(api): 添加断点续传功能

实现了基于本地文件的断点续传功能，
支持 HTTP Range 请求。

Closes #123
```

### Pull Request 流程

1. Fork 本项目到您的 GitHub 账户
2. 从 `develop` 分支创建新的功能分支
3. 进行开发和测试
4. 提交代码到您的 Fork 仓库
5. 创建 Pull Request 到项目的 `develop` 分支
6. 等待代码审查和反馈

### Pull Request 要求

- **描述清晰**：详细说明更改的目的和内容
- **测试通过**：确保所有测试通过
- **代码规范**：遵循项目的代码风格
- **文档更新**：如有必要，更新相关文档
- **无冲突**：确保与目标分支无冲突

## 报告问题

### Issue 模板

提交 Issue 时，请提供以下信息：

#### Bug 报告

```markdown
**问题描述**
简要描述遇到的问题

**复现步骤**
1. 步骤一
2. 步骤二
3. ...

**预期行为**
描述预期的正确行为

**实际行为**
描述实际发生的行为

**环境信息**
- 操作系统：
- TTHSD 版本：
- Python 版本（如适用）：
- Go 版本：

**附加信息**
- 错误日志
- 截图（如适用）
- 其他相关信息
```

#### 功能建议

```markdown
**功能描述**
清晰描述您希望添加的功能

**使用场景**
说明该功能的使用场景和价值

**可能的实现方案**
如果您有实现想法，请分享

**附加信息**
- 相关 Issue
- 参考资料
```

## 代码规范

### Go 代码

- 使用 `gofmt` 格式化代码
- 遵循 Go 官方编码规范
- 添加必要的注释和文档
- 使用有意义的变量和函数名

### Python 代码

- 遵循 PEP 8 编码规范
- 使用类型注解
- 添加 docstring 文档字符串
- 编写单元测试

### 文档

- 使用 Markdown 格式
- 保持简洁明了
- 提供示例代码
- 保持与代码同步更新

## 行为准则

### 尊重与包容

- 尊重所有贡献者
- 包容不同的观点和背景
- 建设性的反馈和讨论
- 避免人身攻击和歧视

### 协作精神

- 积极参与讨论
- 乐于帮助他人
- 分享知识和经验
- 共同维护项目健康

## 许可证

通过向 TTHSD 项目贡献代码，您同意您的贡献将遵循项目的 [GNU General Public License v3.0](https://www.gnu.org/licenses/gpl-3.0.en.html) 许可证。

## 联系方式

- **GitHub Issues**: [提交 Issue](https://github.com/sxxyrry/TTHighSpeedDownloader/issues)
- **Pull Requests**: [发起 PR](https://github.com/sxxyrry/TTHighSpeedDownloader/pulls)
- **Discussions**: [参与讨论](https://github.com/sxxyrry/TTHighSpeedDownloader/discussions)

---

**再次感谢您的贡献！** 🙏

每一份贡献都让 TTHSD 变得更好！