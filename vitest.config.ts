import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // 启用 TypeScript 支持
    environment: "node",
    // 测试文件的匹配模式
    include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    // 排除的文件
    exclude: ["node_modules", "dist", ".idea", ".git", ".cache"],
    // 覆盖率配置
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "coverage/**",
        "dist/**",
        "packages/*/test{,s}/**",
        "**/*.d.ts",
        "cypress/**",
        "test{,s}/**",
        "test{,-*}.{js,cjs,mjs,ts,tsx,jsx}",
        "**/*{.,-}test.{js,cjs,mjs,ts,tsx,jsx}",
        "**/*{.,-}spec.{js,cjs,mjs,ts,tsx,jsx}",
        "**/__tests__/**",
        "**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress}.config.*",
        "**/.{eslint,mocha,prettier}rc.{js,cjs,yml}",
      ],
    },
    // 全局设置
    globals: false,
    // 设置测试超时
    testTimeout: 10000,
    // 设置钩子超时
    hookTimeout: 10000,
  },
});
