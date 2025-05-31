import { simpleGit, SimpleGit, LogResult } from "simple-git";
import dayjs from "dayjs";
import { existsSync } from "fs";
import { resolve } from "path";

export interface AnalysisOptions {
  dir: string;
  date?: string;
  branch?: string;
  author?: string;
}

export interface CommitInfo {
  hash: string;
  date: string;
  author: string;
  email: string;
  message: string;
  branch: string;
  files: string[];
}

export class GitAnalyzer {
  private git: SimpleGit;
  private projectDir: string;

  constructor(projectDir: string) {
    this.projectDir = resolve(projectDir);

    // 检查目录是否存在
    if (!existsSync(this.projectDir)) {
      throw new Error(`目录不存在: ${this.projectDir}`);
    }

    this.git = simpleGit(this.projectDir);
  }

  /**
   * 检查是否为 git 仓库
   */
  async isGitRepository(): Promise<boolean> {
    try {
      await this.git.status();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * 获取当前分支名
   */
  async getCurrentBranch(): Promise<string> {
    try {
      const status = await this.git.status();
      return status.current || "main";
    } catch (error) {
      return "main";
    }
  }

  /**
   * 获取当前 git 用户名
   */
  async getCurrentUser(): Promise<string> {
    try {
      const config = await this.git.getConfig("user.name");
      return config.value || "";
    } catch (error) {
      return "";
    }
  }

  /**
   * 解析日期参数
   */
  private parseDateRange(dateParam?: string): {
    since?: string;
    until?: string;
  } {
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

  /**
   * 分析 git 提交记录
   */
  async analyze(options: AnalysisOptions): Promise<CommitInfo[]> {
    // 检查是否为 git 仓库
    if (!(await this.isGitRepository())) {
      throw new Error(`${this.projectDir} 不是一个有效的 git 仓库`);
    }

    // 设置默认值
    const branch = options.branch || (await this.getCurrentBranch());
    const author = options.author || (await this.getCurrentUser());
    const dateRange = this.parseDateRange(options.date);

    console.log(`📁 分析目录: ${this.projectDir}`);
    console.log(`🌿 分析分支: ${branch}`);
    console.log(`👤 分析作者: ${author || "所有作者"}`);
    console.log(
      `📅 分析日期: ${dateRange.since}${
        dateRange.until !== dateRange.since ? ` 到 ${dateRange.until}` : ""
      }`
    );
    console.log("");

    try {
      // 构建 git log 选项
      const logOptions: any = {
        from: dateRange.since,
        to: dateRange.until,
        format: {
          hash: "%H",
          date: "%ai",
          message: "%s",
          author_name: "%an",
          author_email: "%ae",
        },
      };

      // 添加作者过滤
      if (author) {
        logOptions.author = author;
      }

      // 获取指定分支的提交记录
      const logs: LogResult = await this.git.log([
        branch,
        "--since=" + dateRange.since,
        "--until=" + dateRange.until + " 23:59:59",
      ]);

      if (logs.all.length === 0) {
        console.log("📭 没有找到匹配的提交记录");
        return [];
      }

      const commits: CommitInfo[] = [];

      for (const commit of logs.all) {
        // 如果指定了作者，进行过滤
        if (author && !commit.author_name.includes(author)) {
          continue;
        }

        // 获取该提交涉及的文件
        let files: string[] = [];
        try {
          const diffSummary = await this.git.diffSummary([
            `${commit.hash}^`,
            commit.hash,
          ]);
          files = diffSummary.files.map((f: any) => f.file);
        } catch (error) {
          // 如果是第一个提交或者其他原因导致无法获取diff，尝试获取该提交的文件列表
          try {
            const showResult = await this.git.show([
              commit.hash,
              "--pretty=format:",
              "--name-only",
            ]);
            files = showResult.split("\n").filter((f) => f.trim() !== "");
          } catch (showError) {
            // 如果仍然失败，设为空数组
            files = [];
          }
        }

        const commitInfo: CommitInfo = {
          hash: commit.hash,
          date: commit.date,
          author: commit.author_name,
          email: commit.author_email,
          message: commit.message,
          branch: branch,
          files: files,
        };

        commits.push(commitInfo);
      }

      return commits;
    } catch (error) {
      throw new Error(`分析 git 日志时发生错误: ${error}`);
    }
  }

  /**
   * 估算文本的 token 数量
   * 根据经验值：英文约4字符/token，中文约1.5字符/token
   */
  private estimateTokens(text: string): number {
    // 分离中文和英文字符
    const chineseChars = text.match(/[\u4e00-\u9fff]/g) || [];
    const englishChars = text.match(/[a-zA-Z0-9]/g) || [];
    const otherChars = text.length - chineseChars.length - englishChars.length;

    // 估算公式：中文 1.5字符/token，英文 4字符/token，其他 3字符/token
    const chineseTokens = chineseChars.length / 1.5;
    const englishTokens = englishChars.length / 4;
    const otherTokens = otherChars / 3;

    return Math.ceil(chineseTokens + englishTokens + otherTokens);
  }

  /**
   * 生成用于大模型处理的纯文本内容
   */
  generatePlainTextContent(commits: CommitInfo[]): string {
    if (commits.length === 0) {
      return "没有找到匹配的提交记录";
    }

    let content = `Git 提交记录分析报告\n`;
    content += `===================\n\n`;

    commits.forEach((commit, index) => {
      content += `提交 ${index + 1}:\n`;
      content += `Hash: ${commit.hash.substring(0, 8)}\n`;
      content += `日期: ${dayjs(commit.date).format("YYYY-MM-DD HH:mm:ss")}\n`;
      content += `作者: ${commit.author} <${commit.email}>\n`;
      content += `分支: ${commit.branch}\n`;
      content += `消息: ${commit.message}\n`;

      if (commit.files.length > 0) {
        content += `修改文件 (${commit.files.length}):\n`;
        commit.files.forEach((file) => {
          content += `- ${file}\n`;
        });
      }

      content += `\n`;
    });

    // 添加统计信息
    content += `统计信息:\n`;
    content += `总提交数: ${commits.length}\n`;
    content += `涉及作者: ${new Set(commits.map((c) => c.author)).size}\n`;
    content += `修改文件: ${new Set(commits.flatMap((c) => c.files)).size}\n`;

    return content;
  }

  /**
   * 格式化输出提交信息
   */
  formatCommits(commits: CommitInfo[]): void {
    if (commits.length === 0) {
      console.log("📭 没有找到匹配的提交记录");
      return;
    }

    console.log(`🔍 找到 ${commits.length} 个提交记录:\n`);

    commits.forEach((commit, index) => {
      console.log(`📝 提交 ${index + 1}:`);
      console.log(`   🔗 Hash: ${commit.hash.substring(0, 8)}`);
      console.log(
        `   📅 日期: ${dayjs(commit.date).format("YYYY-MM-DD HH:mm:ss")}`
      );
      console.log(`   👤 作者: ${commit.author} <${commit.email}>`);
      console.log(`   🌿 分支: ${commit.branch}`);
      console.log(`   💬 消息: ${commit.message}`);

      if (commit.files.length > 0) {
        console.log(`   📁 修改文件 (${commit.files.length}):`);
        commit.files.forEach((file) => {
          console.log(`      - ${file}`);
        });
      }

      console.log(""); // 空行分隔
    });

    // 生成纯文本内容用于 token 估算
    const plainTextContent = this.generatePlainTextContent(commits);
    const estimatedTokens = this.estimateTokens(plainTextContent);

    // 统计信息
    console.log(`📊 统计信息:`);
    console.log(`   📝 总提交数: ${commits.length}`);
    console.log(
      `   👥 涉及作者: ${new Set(commits.map((c) => c.author)).size}`
    );
    console.log(
      `   📁 修改文件: ${new Set(commits.flatMap((c) => c.files)).size}`
    );
    console.log(`   🤖 估算 Token 数: ${estimatedTokens.toLocaleString()}`);
    console.log(
      `   📄 内容字符数: ${plainTextContent.length.toLocaleString()}`
    );

    // 如果 token 数较大，给出提示
    if (estimatedTokens > 4000) {
      console.log(
        `\n⚠️  提示: Token 数量较大 (${estimatedTokens.toLocaleString()})，建议:`
      );
      if (estimatedTokens > 32000) {
        console.log(`   - 内容可能超出大部分模型的上下文长度限制`);
        console.log(`   - 建议缩小日期范围或分批处理`);
      } else if (estimatedTokens > 16000) {
        console.log(`   - 适合使用支持较长上下文的模型 (如 GPT-4, Claude)`);
      } else {
        console.log(`   - 大部分主流模型都可以处理这个长度`);
      }
    }
  }
}
