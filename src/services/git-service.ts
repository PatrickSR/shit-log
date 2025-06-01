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
   * 获取所有分支（优先远程分支）
   */
  async getAllBranches(): Promise<string[]> {
    try {
      const branchSummary = await this.git.branch(["-a"]);
      const branches: string[] = [];

      // 首先收集远程分支（优先 origin）
      const remoteBranches: string[] = [];
      const localBranches: string[] = [];

      for (const branchName of Object.keys(branchSummary.branches)) {
        if (branchName.startsWith("remotes/origin/")) {
          // 去掉 remotes/origin/ 前缀，跳过 HEAD
          const cleanName = branchName.replace("remotes/origin/", "");
          if (cleanName !== "HEAD") {
            remoteBranches.push(branchName);
          }
        } else if (!branchName.startsWith("remotes/")) {
          // 本地分支
          localBranches.push(branchName);
        }
      }

      // 如果有 origin 分支，优先使用 origin 分支
      if (remoteBranches.length > 0) {
        branches.push(...remoteBranches);
      } else {
        // 没有 origin 分支，使用本地分支
        branches.push(...localBranches);
      }

      return branches.length > 0 ? branches : ["main"];
    } catch (error) {
      console.warn("获取分支列表失败，使用当前分支:", error);
      return [await this.getCurrentBranch()];
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
    branches: string | string[],
    dateRange: DateRange,
    author?: string
  ): Promise<CommitInfo[]> {
    const branchList = Array.isArray(branches) ? branches : [branches];
    const allCommits: CommitInfo[] = [];

    for (const branch of branchList) {
      try {
        // 添加 --no-merges 参数过滤掉合并提交
        const logs: LogResult = await this.git.log([
          branch,
          "--no-merges", // 过滤合并提交
          "--since=" + dateRange.since,
          "--until=" + dateRange.until + " 23:59:59",
        ]);

        if (logs.all.length === 0) {
          continue;
        }

        for (const commit of logs.all) {
          // 避免重复提交（相同 hash）
          if (allCommits.some((c) => c.hash === commit.hash)) {
            continue;
          }

          // 如果指定了作者，进行过滤
          if (author && !commit.author_name.includes(author)) {
            continue;
          }

          // 获取该提交涉及的文件
          const files = await this.getCommitFiles(commit.hash);

          // 获取代码变更内容
          const changes = await this.getCommitChanges(commit.hash);

          // 获取统计信息
          const stats = await this.getCommitStats(commit.hash);

          const commitInfo: CommitInfo = {
            hash: commit.hash,
            date: commit.date,
            author: commit.author_name,
            email: commit.author_email,
            message: commit.message,
            branch: this.cleanBranchName(branch),
            files: files,
            changes: changes,
            insertions: stats.insertions,
            deletions: stats.deletions,
          };

          allCommits.push(commitInfo);
        }
      } catch (error) {
        console.warn(`分析分支 ${branch} 时出错:`, error);
        continue;
      }
    }

    // 按时间倒序排列
    return allCommits.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  /**
   * 清理分支名称（去掉 remotes/origin/ 前缀）
   */
  private cleanBranchName(branch: string): string {
    return branch.replace("remotes/origin/", "");
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

  /**
   * 获取提交的代码变更内容
   */
  private async getCommitChanges(commitHash: string): Promise<string> {
    try {
      // 使用 git show 获取完整的代码变更
      const changes = await this.git.show([
        commitHash,
        "--pretty=format:", // 不显示提交信息
        "--no-color", // 不使用颜色
      ]);
      return changes.trim();
    } catch (error) {
      // 如果是第一个提交，尝试获取所有文件的内容
      try {
        const changes = await this.git.show([
          commitHash,
          "--pretty=format:",
          "--root", // 显示根提交的完整内容
          "--no-color",
        ]);
        return changes.trim();
      } catch (showError) {
        return "无法获取代码变更内容";
      }
    }
  }

  /**
   * 获取提交的统计信息（新增和删除行数）
   */
  private async getCommitStats(
    commitHash: string
  ): Promise<{ insertions: number; deletions: number }> {
    try {
      const diffSummary = await this.git.diffSummary([
        `${commitHash}^`,
        commitHash,
      ]);

      return {
        insertions: diffSummary.insertions || 0,
        deletions: diffSummary.deletions || 0,
      };
    } catch (error) {
      // 如果是第一个提交，尝试获取统计信息
      try {
        const diffSummary = await this.git.diffSummary([commitHash, "--root"]);

        return {
          insertions: diffSummary.insertions || 0,
          deletions: diffSummary.deletions || 0,
        };
      } catch (statsError) {
        return {
          insertions: 0,
          deletions: 0,
        };
      }
    }
  }
}
