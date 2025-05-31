import { AnalysisOptions, CommitInfo } from "./types";
import { GitService } from "./services/git-service";
import { DateUtils } from "./utils/date-utils";
import { TokenEstimator } from "./utils/token-estimator";
import { Formatter } from "./utils/formatter";

export class GitAnalyzer {
  private gitService: GitService;

  constructor(projectDir: string) {
    this.gitService = new GitService(projectDir);
  }

  /**
   * 分析 git 提交记录
   */
  async analyze(options: AnalysisOptions): Promise<CommitInfo[]> {
    // 检查是否为 git 仓库
    if (!(await this.gitService.isGitRepository())) {
      throw new Error(`${options.dir} 不是一个有效的 git 仓库`);
    }

    // 设置默认值
    const branch = options.branch || (await this.gitService.getCurrentBranch());
    const author = options.author || (await this.gitService.getCurrentUser());
    const dateRange = DateUtils.parseDateRange(options.date);

    // 输出分析信息
    this.printAnalysisInfo(options.dir, branch, author, dateRange);

    try {
      // 获取提交记录
      const commits = await this.gitService.getCommits(
        branch,
        dateRange,
        author
      );

      if (commits.length === 0) {
        console.log("📭 没有找到匹配的提交记录");
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
    const tokenEstimation = TokenEstimator.analyzeContent(commits);
    Formatter.formatCommits(commits, tokenEstimation);
  }

  /**
   * 生成用于大模型处理的纯文本内容
   */
  generatePlainTextContent(commits: CommitInfo[]): string {
    return TokenEstimator.generatePlainTextContent(commits);
  }

  /**
   * 输出纯文本格式
   */
  outputPlainText(commits: CommitInfo[]): void {
    const plainContent = this.generatePlainTextContent(commits);
    Formatter.outputPlainText(plainContent);
  }

  /**
   * 打印分析信息
   */
  private printAnalysisInfo(
    dir: string,
    branch: string,
    author: string,
    dateRange: any
  ): void {
    console.log(`📁 分析目录: ${dir}`);
    console.log(`🌿 分析分支: ${branch}`);
    console.log(`👤 分析作者: ${author || "所有作者"}`);
    console.log(
      `📅 分析日期: ${dateRange.since}${
        dateRange.until !== dateRange.since ? ` 到 ${dateRange.until}` : ""
      }`
    );
    console.log("");
  }
}

// 重新导出类型，保持向后兼容
export type { AnalysisOptions, CommitInfo } from "./types";
