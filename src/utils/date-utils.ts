import dayjs from "dayjs";
import { DateRange } from "../types";

export class DateUtils {
  /**
   * 解析日期参数
   */
  static parseDateRange(dateParam?: string): DateRange {
    if (!dateParam) {
      // 默认当天
      const today = dayjs().format("YYYY-MM-DD");
      return { since: today, until: today };
    }

    // 检查是否为日期区间 (格式: 2023-01-01..2023-01-31)
    if (dateParam.includes("..")) {
      const [start, end] = dateParam.split("..");
      return {
        since: dayjs(start).format("YYYY-MM-DD"),
        until: dayjs(end).format("YYYY-MM-DD"),
      };
    }

    // 单一日期
    const date = dayjs(dateParam).format("YYYY-MM-DD");
    return { since: date, until: date };
  }
}
