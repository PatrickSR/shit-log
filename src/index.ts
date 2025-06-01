import { Command } from "commander";
import { version, description } from "../package.json";
import { GitAnalyzer } from "./git-analyzer";

const program = new Command();

program.name("shit-log").description(description).version(version);

program
  .command("analysis")
  .description("分析 Git 项目的提交记录")
  .requiredOption("--dir <directory>", "项目目录路径")
  .option("--date <date>", "筛选日期 (YYYY-MM-DD 或 YYYY-MM-DD..YYYY-MM-DD)")
  .option("--branch <branch>", "指定分支名，默认分析所有分支")
  .option("--author <author>", "指定作者名，默认分析所有作者")
  .option("--output-plain", "输出纯文本格式 (适合复制给大模型)")
  .option("--output <file>", "导出分析结果为 markdown 文件")
  .action(
    async (options: {
      dir: string;
      date?: string;
      branch?: string;
      author?: string;
      outputPlain?: boolean;
      output?: string;
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

        if (options.output) {
          // 导出为 markdown 文件
          await analyzer.exportToMarkdown(commits, options.output);
          console.log(`✅ 分析结果已导出到: ${options.output}`);
        } else if (options.outputPlain) {
          // 输出纯文本格式
          analyzer.outputPlainText(commits);
        } else {
          // 输出格式化内容
          analyzer.formatCommits(commits);
        }
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
