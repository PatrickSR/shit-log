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

    // 统计信息
    console.log(`📊 统计信息:`);
    console.log(`   📝 总提交数: ${commits.length}`);
    console.log(
      `   👥 涉及作者: ${new Set(commits.map((c) => c.author)).size}`
    );
    console.log(
      `   📁 修改文件: ${new Set(commits.flatMap((c) => c.files)).size}`
    );
  }
}
