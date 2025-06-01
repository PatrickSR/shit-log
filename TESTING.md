# 测试指南

本项目使用 [Vitest](https://vitest.dev/) 作为测试框架。Vitest 是一个基于 Vite 的快速测试框架，支持 TypeScript 和现代 JavaScript 特性。

## 快速开始

### 安装依赖

所有测试相关的依赖已经配置在 `package.json` 中：

```bash
npm install
```

### 运行测试

```bash
# 运行所有测试
npm test

# 运行测试并生成覆盖率报告
npm run test:coverage

# 运行测试（单次，适合 CI/CD）
npm run test:run

# 启动测试 UI 界面
npm run test:ui
```

## 测试脚本说明

- `npm test`: 启动 vitest 监听模式，文件变化时自动重新运行测试
- `npm run test:ui`: 启动 Vitest UI 界面，提供可视化的测试管理
- `npm run test:run`: 单次运行所有测试，适合在 CI/CD 中使用
- `npm run test:coverage`: 运行测试并生成代码覆盖率报告

## 配置文件

### vitest.config.ts

主要配置包括：

- **测试环境**: Node.js 环境
- **文件匹配**: `src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}`
- **覆盖率**: 使用 v8 提供者，生成 text、json、html 格式报告
- **超时设置**: 测试和钩子超时为 10 秒

## 编写测试

### 测试文件命名

- 测试文件应该放在与源文件相同的目录中
- 命名格式：`文件名.test.ts` 或 `文件名.spec.ts`

### 示例测试

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { YourClass } from "./your-class";

describe("YourClass", () => {
  beforeEach(() => {
    // 每个测试前的设置
  });

  afterEach(() => {
    // 每个测试后的清理
  });

  describe("someMethod", () => {
    it("应该返回正确的结果", () => {
      const result = YourClass.someMethod("input");
      expect(result).toBe("expected");
    });

    it("应该处理边界情况", () => {
      const result = YourClass.someMethod("");
      expect(result).toBeUndefined();
    });
  });
});
```

### 常用的 Vitest API

- `describe()`: 创建测试套件
- `it()` / `test()`: 创建单个测试
- `expect()`: 断言
- `vi.mock()`: 模拟模块
- `vi.spyOn()`: 创建间谍函数
- `vi.useFakeTimers()`: 使用虚拟计时器
- `beforeEach()` / `afterEach()`: 测试钩子

## 覆盖率报告

运行 `npm run test:coverage` 后，覆盖率报告会生成在 `coverage/` 目录中：

- `coverage/index.html`: HTML 格式的详细报告
- `coverage/coverage-final.json`: JSON 格式的覆盖率数据
- 终端会显示覆盖率摘要

## 最佳实践

1. **测试命名**: 使用描述性的测试名称，说明测试的预期行为
2. **测试隔离**: 确保测试之间相互独立，使用 `beforeEach` 和 `afterEach` 进行设置和清理
3. **边界测试**: 测试边界条件和异常情况
4. **覆盖率**: 争取高覆盖率，但不要为了覆盖率而写无意义的测试
5. **模拟依赖**: 使用 `vi.mock()` 模拟外部依赖，保持测试的快速和可靠

## CI/CD 集成

在 CI/CD 管道中，建议使用：

```bash
npm run test:run
```

这会运行所有测试一次并退出，适合持续集成环境。

## 相关链接

- [Vitest 官方文档](https://vitest.dev/)
- [Vitest API 参考](https://vitest.dev/api/)
- [Vi Mock API](https://vitest.dev/api/vi.html)
