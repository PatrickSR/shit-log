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

### 查看版本信息

```bash
shit-log --version
```

### 查看帮助信息

```bash
shit-log --help
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

## 许可证

MIT
