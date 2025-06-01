import { CommitInfo } from "../types";
import { writeFileSync } from "fs";
import { resolve } from "path";

export class MarkdownExporter {
  /**
   * 将提交信息导出为 markdown 格式
   */
  static async exportToFile(
    commits: CommitInfo[],
    filePath: string,
    analysisInfo: {
      dir: string;
      branch: string;
      author: string;
      dateRange: string;
    }
  ): Promise<void> {
    const markdownContent = this.generateMarkdown(commits, analysisInfo);
    const fullPath = resolve(filePath);

    try {
      writeFileSync(fullPath, markdownContent, "utf-8");
    } catch (error) {
      throw new Error(`导出 markdown 文件失败: ${error}`);
    }
  }

  /**
   * 生成 markdown 内容
   */
  private static generateMarkdown(
    commits: CommitInfo[],
    analysisInfo: {
      dir: string;
      branch: string;
      author: string;
      dateRange: string;
    }
  ): string {
    const lines: string[] = [];

    // 标题
    lines.push("# Git 提交记录分析报告");
    lines.push("");

    // 分析信息
    lines.push("## 📊 分析信息");
    lines.push("");
    lines.push(`- **分析目录**: ${analysisInfo.dir}`);
    lines.push(`- **分析分支**: ${analysisInfo.branch}`);
    lines.push(`- **分析作者**: ${analysisInfo.author || "所有作者"}`);
    lines.push(`- **分析日期**: ${analysisInfo.dateRange}`);
    lines.push(`- **提交总数**: ${commits.length} 个`);
    lines.push("");

    if (commits.length === 0) {
      lines.push("## ❌ 没有找到匹配的提交记录");
      return lines.join("\n");
    }

    // 统计信息
    const totalInsertions = commits.reduce((sum, c) => sum + c.insertions, 0);
    const totalDeletions = commits.reduce((sum, c) => sum + c.deletions, 0);
    const branches = new Set(commits.map((c) => c.branch));
    const authors = new Set(commits.map((c) => c.author));

    lines.push("## 📈 统计摘要");
    lines.push("");
    lines.push(
      `- **涉及分支**: ${branches.size} 个 (${Array.from(branches).join(", ")})`
    );
    lines.push(
      `- **参与作者**: ${authors.size} 个 (${Array.from(authors).join(", ")})`
    );
    lines.push(
      `- **代码变更**: +${totalInsertions} 行增加, -${totalDeletions} 行删除`
    );
    lines.push("");

    // 提交详情
    lines.push("## 📝 提交详情");
    lines.push("");

    commits.forEach((commit, index) => {
      lines.push(`### ${index + 1}. ${commit.message}`);
      lines.push("");
      lines.push(`**基本信息**:`);
      lines.push(`- Hash: \`${commit.hash.substring(0, 8)}\``);
      lines.push(`- 作者: ${commit.author} (${commit.email})`);
      lines.push(`- 分支: ${commit.branch}`);
      lines.push(`- 时间: ${new Date(commit.date).toLocaleString("zh-CN")}`);
      lines.push(`- 变更: +${commit.insertions} -${commit.deletions}`);
      lines.push("");

      if (commit.files.length > 0) {
        lines.push(`**涉及文件** (${commit.files.length} 个):`);
        commit.files.forEach((file) => {
          lines.push(`- \`${file}\``);
        });
        lines.push("");
      }

      if (commit.changes && commit.changes.trim()) {
        lines.push("**代码变更**:");
        lines.push("```diff");
        lines.push(commit.changes);
        lines.push("```");
        lines.push("");
      }

      lines.push("---");
      lines.push("");
    });

    // 底部信息
    lines.push(`*报告生成时间: ${new Date().toLocaleString("zh-CN")}*`);

    return lines.join("\n");
  }
}
