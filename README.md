# shit-log

一个简单的命令行日志工具，使用 TypeScript 开发。

## 安装

```bash
npm install -g shit-log
```

## 使用

### 添加日志记录

```bash
shit-log add "这是一条日志消息"
shit-log add "这是一条错误日志" --type error
```

### 查看日志记录

```bash
# 查看最近 10 条记录
shit-log list

# 查看最近 20 条记录
shit-log list --number 20
```

### 清空日志记录

```bash
shit-log clear
```

### Git 项目分析

分析 Git 项目的提交记录，包括提交详情和修改的文件列表。

```bash
# 分析指定目录的项目（必填参数）
shit-log analysis --dir /path/to/project

# 分析指定日期的提交
shit-log analysis --dir . --date 2023-12-01

# 分析日期区间的提交
shit-log analysis --dir . --date "2023-12-01..2023-12-31"

# 分析指定分支的提交
shit-log analysis --dir . --branch develop

# 分析指定作者的提交
shit-log analysis --dir . --author "张三"

# 输出纯文本格式（适合复制给大模型处理）
shit-log analysis --dir . --output-plain

# 综合使用各种参数
shit-log analysis --dir /path/to/project --date "2023-12-01..2023-12-31" --branch main --author "李四" --output-plain
```

**参数说明：**

- `--dir <directory>`: 项目目录路径（必填）
- `--date <date>`: 筛选日期，支持单一日期 (YYYY-MM-DD) 或日期区间 (YYYY-MM-DD..YYYY-MM-DD)，默认为当天
- `--branch <branch>`: 筛选分支名，默认为当前分支
- `--author <author>`: 筛选作者名，默认为当前 git 用户
- `--output-plain`: 输出纯文本格式，方便复制给大模型进行分析

**输出内容包括：**

- 提交 Hash
- 提交日期时间
- 作者信息（姓名和邮箱）
- 分支名称
- 提交消息
- 修改的文件列表
- 统计信息（总提交数、涉及作者数、修改文件数）
- **Token 数估算**：估算内容的 token 数量，便于判断是否适合大模型处理
- **智能提示**：根据 token 数量提供使用建议

**Token 估算功能：**

- 🤖 自动估算内容的 token 数量（考虑中英文差异）
- 📄 显示内容字符数
- ⚠️ 根据 token 数量给出使用建议：
  - < 4K tokens: 大部分模型都可处理
  - 4K-16K tokens: 适合主流大模型 (GPT-3.5, GPT-4, Claude)
  - 16K-32K tokens: 需要支持长上下文的模型
  - \> 32K tokens: 建议分批处理或缩小日期范围

### 查看版本信息

```bash
shit-log --version
```

### 查看帮助信息

```bash
shit-log --help

# 查看特定命令的帮助
shit-log analysis --help
```

## 开发

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建

```bash
npm run build
```

### 发布

```bash
npm publish
```

## 依赖

- [commander](https://github.com/tj/commander.js/) - CLI 框架
- [simple-git](https://github.com/steveukx/git-js) - Git 操作库
- [dayjs](https://github.com/iamkun/dayjs) - 日期处理库

## 许可证

MIT
