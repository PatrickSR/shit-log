import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import dayjs from "dayjs";
import { DateUtils } from "../src/utils/date-utils";

describe("DateUtils", () => {
  beforeEach(() => {
    // 模拟固定的日期以确保测试的一致性
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2023-12-01"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("parseDateRange", () => {
    it("应该返回今天的日期当没有提供参数时", () => {
      const result = DateUtils.parseDateRange();

      expect(result).toEqual({
        since: "2023-12-01",
        until: "2023-12-01",
      });
    });

    it("应该返回今天的日期当提供空字符串时", () => {
      const result = DateUtils.parseDateRange("");

      expect(result).toEqual({
        since: "2023-12-01",
        until: "2023-12-01",
      });
    });

    it("应该解析单一日期", () => {
      const result = DateUtils.parseDateRange("2023-10-15");

      expect(result).toEqual({
        since: "2023-10-15",
        until: "2023-10-15",
      });
    });

    it("应该解析日期区间", () => {
      const result = DateUtils.parseDateRange("2023-10-01..2023-10-31");

      expect(result).toEqual({
        since: "2023-10-01",
        until: "2023-10-31",
      });
    });

    it("应该处理不同的日期格式", () => {
      const result = DateUtils.parseDateRange("2023/10/15");

      expect(result).toEqual({
        since: "2023-10-15",
        until: "2023-10-15",
      });
    });

    it("应该处理包含时间的日期", () => {
      const result = DateUtils.parseDateRange("2023-10-15 10:30:00");

      expect(result).toEqual({
        since: "2023-10-15",
        until: "2023-10-15",
      });
    });

    it("应该处理跨年的日期区间", () => {
      const result = DateUtils.parseDateRange("2023-12-01..2024-01-15");

      expect(result).toEqual({
        since: "2023-12-01",
        until: "2024-01-15",
      });
    });
  });
});
