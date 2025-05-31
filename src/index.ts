import { Command } from "commander";
import { version, description } from "../package.json";
import { GitAnalyzer } from "./git-analyzer";

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

program
  .command("analysis")
  .description("分析 Git 项目的提交记录")
  .requiredOption("--dir <directory>", "项目目录路径")
  .option("--date <date>", "筛选日期 (YYYY-MM-DD 或 YYYY-MM-DD..YYYY-MM-DD)")
  .option("--branch <branch>", "筛选分支名")
  .option("--author <author>", "筛选作者名")
  .action(
    async (options: {
      dir: string;
      date?: string;
      branch?: string;
      author?: string;
    }) => {
      try {
        console.log("🔍 开始分析 Git 项目...\n");

        const analyzer = new GitAnalyzer(options.dir);
        const commits = await analyzer.analyze({
          dir: options.dir,
          date: options.date,
          branch: options.branch,
          author: options.author,
        });

        analyzer.formatCommits(commits);
      } catch (error) {
        console.error(
          "❌ 分析失败:",
          error instanceof Error ? error.message : error
        );
        process.exit(1);
      }
    }
  );

program.parse();
