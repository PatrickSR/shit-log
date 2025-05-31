import { CommitInfo, TokenEstimation } from "../types";
import dayjs from "dayjs";

export class Formatter {
  /**
   * 格式化输出提交信息
   */
  static formatCommits(
    commits: CommitInfo[],
    tokenEstimation: TokenEstimation
  ): void {
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
      console.log(`   📊 变更: +${commit.insertions} -${commit.deletions}`);

      if (commit.files.length > 0) {
        console.log(`   📁 修改文件 (${commit.files.length}):`);
        commit.files.forEach((file) => {
          console.log(`      - ${file}`);
        });
      }

      // 显示代码变更内容（限制长度以避免输出过长）
      if (commit.changes) {
        console.log(`   🔧 代码变更:`);
        const lines = commit.changes.split("\n");
        const maxLines = 100; // 限制显示最多20行

        if (lines.length > maxLines) {
          console.log(`      ${lines.slice(0, maxLines).join("\n      ")}`);
          console.log(`      ... (还有 ${lines.length - maxLines} 行变更内容)`);
        } else {
          console.log(`      ${commit.changes.replace(/\n/g, "\n      ")}`);
        }
      }

      console.log(""); // 空行分隔
    });

    // 统计信息
    this.printStatistics(commits, tokenEstimation);
  }

  /**
   * 打印统计信息
   */
  private static printStatistics(
    commits: CommitInfo[],
    tokenEstimation: TokenEstimation
  ): void {
    const totalInsertions = commits.reduce((sum, c) => sum + c.insertions, 0);
    const totalDeletions = commits.reduce((sum, c) => sum + c.deletions, 0);

    console.log(`📊 统计信息:`);
    console.log(`   📝 总提交数: ${commits.length}`);
    console.log(
      `   👥 涉及作者: ${new Set(commits.map((c) => c.author)).size}`
    );
    console.log(
      `   📁 修改文件: ${new Set(commits.flatMap((c) => c.files)).size}`
    );
    console.log(`   📈 代码变更: +${totalInsertions} -${totalDeletions}`);
    console.log(
      `   🤖 估算 Token 数: ${tokenEstimation.tokens.toLocaleString()}`
    );
    console.log(
      `   📄 内容字符数: ${tokenEstimation.characters.toLocaleString()}`
    );

    // 如果有建议，显示提示
    if (tokenEstimation.suggestion) {
      console.log(
        `\n⚠️  提示: Token 数量较大 (${tokenEstimation.tokens.toLocaleString()})，建议:`
      );
      console.log(`   - ${tokenEstimation.suggestion}`);
    }
  }

  /**
   * 输出纯文本格式
   */
  static outputPlainText(plainContent: string): void {
    console.log("📄 纯文本输出 (可直接复制给大模型):");
    console.log("=" + "=".repeat(50));
    console.log(plainContent);
    console.log("=" + "=".repeat(50));
  }
}
