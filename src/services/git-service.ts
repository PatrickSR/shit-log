import { simpleGit, SimpleGit, LogResult } from "simple-git";
import { existsSync } from "fs";
import { resolve } from "path";
import { CommitInfo, DateRange } from "../types";

export class GitService {
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
   * 获取提交记录
   */
  async getCommits(
    branch: string,
    dateRange: DateRange,
    author?: string
  ): Promise<CommitInfo[]> {
    const logs: LogResult = await this.git.log([
      branch,
      "--since=" + dateRange.since,
      "--until=" + dateRange.until + " 23:59:59",
    ]);

    if (logs.all.length === 0) {
      return [];
    }

    const commits: CommitInfo[] = [];

    for (const commit of logs.all) {
      // 如果指定了作者，进行过滤
      if (author && !commit.author_name.includes(author)) {
        continue;
      }

      // 获取该提交涉及的文件
      const files = await this.getCommitFiles(commit.hash);

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
  }

  /**
   * 获取提交涉及的文件列表
   */
  private async getCommitFiles(commitHash: string): Promise<string[]> {
    try {
      const diffSummary = await this.git.diffSummary([
        `${commitHash}^`,
        commitHash,
      ]);
      return diffSummary.files.map((f: any) => f.file);
    } catch (error) {
      // 如果是第一个提交或者其他原因导致无法获取diff，尝试获取该提交的文件列表
      try {
        const showResult = await this.git.show([
          commitHash,
          "--pretty=format:",
          "--name-only",
        ]);
        return showResult.split("\n").filter((f) => f.trim() !== "");
      } catch (showError) {
        // 如果仍然失败，设为空数组
        return [];
      }
    }
  }
}
