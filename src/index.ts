import { Command } from "commander";
import { version, description } from "../package.json";

const program = new Command();

program.name("shit-log").description(description).version(version);

program
  .command("add")
  .description("添加一条日志记录")
  .argument("<message>", "日志消息")
  .option("-t, --type <type>", "日志类型", "info")
  .action((message: string, options: { type: string }) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${options.type.toUpperCase()}] ${message}`);
    // 这里可以添加实际的日志存储逻辑
  });

program
  .command("list")
  .description("列出所有日志记录")
  .option("-n, --number <count>", "显示最近的 N 条记录", "10")
  .action((options: { number: string }) => {
    console.log(`显示最近的 ${options.number} 条日志记录`);
    // 这里可以添加实际的日志读取逻辑
  });

program
  .command("clear")
  .description("清空所有日志记录")
  .action(() => {
    console.log("所有日志记录已清空");
    // 这里可以添加实际的日志清空逻辑
  });

program.parse();
