# shit-log

一个专业的 Git 项目分析工具，使用 TypeScript 开发。

## 安装

```bash
npm install -g shit-log
```

## 使用

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

# 导出分析结果为 markdown 文件
shit-log analysis --dir . --output report.md

# 综合使用各种参数
shit-log analysis --dir /path/to/project --date "2023-12-01..2023-12-31" --branch main --author "李四" --output report.md
```

**参数说明：**

- `--dir <directory>`: 项目目录路径（必填）
- `--date <date>`: 筛选日期，支持单一日期 (YYYY-MM-DD) 或日期区间 (YYYY-MM-DD..YYYY-MM-DD)，默认为当天
- `--branch <branch>`: 指定分支名，默认分析所有本地分支
- `--author <author>`: 指定作者名，默认分析所有作者
- `--output-plain`: 输出纯文本格式，方便复制给大模型进行分析
- `--output <file>`: 导出分析结果为 markdown 文件

**输出内容包括：**

- 提交 Hash
- 提交日期时间
- 作者信息（姓名和邮箱）
- 分支名称
- 提交消息
- 修改的文件列表
- 代码变更详情
- 统计信息（总提交数、涉及作者数、修改文件数、代码行数变更）
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

**Markdown 导出功能：**

使用 `--output` 参数可以将分析结果导出为格式化的 markdown 文件，包括：

- 📊 分析信息摘要
- 📈 统计数据（分支数、作者数、代码变更量）
- 📝 详细的提交记录（包含代码变更差异）
- 🔗 支持 GitHub/GitLab 等平台的 markdown 渲染

导出的 markdown 文件可以直接用于：

- 项目文档
- 工作汇报
- 代码评审记录
- 团队分享

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

### 测试

```bash
npm test
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
