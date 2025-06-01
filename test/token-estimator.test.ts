import { describe, it, expect } from "vitest";
import { TokenEstimator } from "../src/utils/token-estimator";
import { CommitInfo } from "../src/types";

describe("TokenEstimator", () => {
  describe("estimateTokens", () => {
    it("应该估算英文文本的 token 数量", () => {
      const text = "Hello world, this is a test message.";
      const tokens = TokenEstimator.estimateTokens(text);

      // 英文约 4字符/token
      expect(tokens).toBeGreaterThan(0);
      expect(tokens).toBeLessThanOrEqual(Math.ceil(text.length / 2));
    });

    it("应该估算中文文本的 token 数量", () => {
      const text = "这是一个测试消息，用于验证中文字符的token估算。";
      const tokens = TokenEstimator.estimateTokens(text);

      // 中文约 1.5字符/token
      expect(tokens).toBeGreaterThan(0);
      expect(tokens).toBeLessThanOrEqual(text.length);
    });

    it("应该估算混合文本的 token 数量", () => {
      const text = "Hello 世界! This is 测试 123";
      const tokens = TokenEstimator.estimateTokens(text);

      expect(tokens).toBeGreaterThan(0);
    });

    it("应该处理空字符串", () => {
      const tokens = TokenEstimator.estimateTokens("");
      expect(tokens).toBe(0);
    });

    it("应该处理包含特殊字符的文本", () => {
      const text = "Hello @#$%^&*()_+ 世界！";
      const tokens = TokenEstimator.estimateTokens(text);

      expect(tokens).toBeGreaterThan(0);
    });
  });

  describe("getTokenSuggestion", () => {
    it("应该在 token 数量小于 4000 时返回 undefined", () => {
      const suggestion = TokenEstimator.getTokenSuggestion(3000);
      expect(suggestion).toBeUndefined();
    });

    it("应该在 token 数量在 4000-16000 时返回主流模型建议", () => {
      const suggestion = TokenEstimator.getTokenSuggestion(8000);
      expect(suggestion).toBe("大部分主流模型都可以处理这个长度");
    });

    it("应该在 token 数量在 16000-32000 时返回长上下文模型建议", () => {
      const suggestion = TokenEstimator.getTokenSuggestion(20000);
      expect(suggestion).toBe(
        "适合使用支持较长上下文的模型 (如 GPT-4, Claude)"
      );
    });

    it("应该在 token 数量超过 32000 时返回分批处理建议", () => {
      const suggestion = TokenEstimator.getTokenSuggestion(40000);
      expect(suggestion).toBe(
        "内容可能超出大部分模型的上下文长度限制，建议缩小日期范围或分批处理"
      );
    });
  });

  describe("generatePlainTextContent", () => {
    const mockCommits: CommitInfo[] = [
      {
        hash: "abc123def456",
        author: "张三",
        email: "zhangsan@example.com",
        date: "2023-12-01T10:30:00Z",
        message: "修复用户登录问题",
        branch: "main",
        insertions: 15,
        deletions: 3,
        files: ["src/login.ts", "src/auth.ts"],
        changes: "function login() {\n  // 修复的代码\n}",
      },
      {
        hash: "def456ghi789",
        author: "李四",
        email: "lisi@example.com",
        date: "2023-12-01T14:20:00Z",
        message: "添加新功能",
        branch: "feature/new-feature",
        insertions: 25,
        deletions: 0,
        files: ["src/feature.ts"],
        changes: "",
      },
    ];

    it("应该生成包含所有提交信息的纯文本内容", () => {
      const content = TokenEstimator.generatePlainTextContent(mockCommits);

      expect(content).toContain("Git 提交记录分析报告");
      expect(content).toContain("修复用户登录问题");
      expect(content).toContain("添加新功能");
      expect(content).toContain("张三");
      expect(content).toContain("李四");
      expect(content).toContain("src/login.ts");
      expect(content).toContain("统计信息");
      expect(content).toContain("总提交数: 2");
    });

    it("应该处理空的提交列表", () => {
      const content = TokenEstimator.generatePlainTextContent([]);

      expect(content).toBe("没有找到匹配的提交记录");
    });

    it("应该正确计算统计信息", () => {
      const content = TokenEstimator.generatePlainTextContent(mockCommits);

      expect(content).toContain("代码变更: +40 -3");
      expect(content).toContain("涉及作者: 2");
      expect(content).toContain("修改文件: 3");
    });
  });

  describe("analyzeContent", () => {
    const mockCommits: CommitInfo[] = [
      {
        hash: "abc123",
        author: "Test User",
        email: "test@example.com",
        date: "2023-12-01",
        message: "Test commit",
        branch: "main",
        insertions: 10,
        deletions: 2,
        files: ["test.ts"],
        changes: 'console.log("test");',
      },
    ];

    it("应该返回完整的 token 分析结果", () => {
      const analysis = TokenEstimator.analyzeContent(mockCommits);

      expect(analysis).toHaveProperty("tokens");
      expect(analysis).toHaveProperty("characters");
      expect(analysis.tokens).toBeGreaterThan(0);
      expect(analysis.characters).toBeGreaterThan(0);
    });

    it("应该在 token 数量较低时不提供建议", () => {
      const analysis = TokenEstimator.analyzeContent([]);

      expect(analysis.suggestion).toBeUndefined();
    });
  });
});
