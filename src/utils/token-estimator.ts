import { CommitInfo, TokenEstimation } from "../types";
import dayjs from "dayjs";

export class TokenEstimator {
  /**
   * 估算文本的 token 数量
   * 根据经验值：英文约4字符/token，中文约1.5字符/token
   */
  static estimateTokens(text: string): number {
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
   * 获取基于 token 数量的使用建议
   */
  static getTokenSuggestion(tokens: number): string | undefined {
    if (tokens <= 4000) {
      return undefined; // 不需要特别提示
    } else if (tokens <= 16000) {
      return "大部分主流模型都可以处理这个长度";
    } else if (tokens <= 32000) {
      return "适合使用支持较长上下文的模型 (如 GPT-4, Claude)";
    } else {
      return "内容可能超出大部分模型的上下文长度限制，建议缩小日期范围或分批处理";
    }
  }

  /**
   * 生成用于大模型处理的纯文本内容
   */
  static generatePlainTextContent(commits: CommitInfo[]): string {
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
      content += `变更统计: +${commit.insertions} -${commit.deletions}\n`;

      if (commit.files.length > 0) {
        content += `修改文件 (${commit.files.length}):\n`;
        commit.files.forEach((file) => {
          content += `- ${file}\n`;
        });
      }

      // 添加代码变更内容
      if (commit.changes) {
        content += `代码变更:\n`;
        content += `${commit.changes}\n`;
      }

      content += `\n`;
    });

    // 添加统计信息
    const totalInsertions = commits.reduce((sum, c) => sum + c.insertions, 0);
    const totalDeletions = commits.reduce((sum, c) => sum + c.deletions, 0);

    content += `统计信息:\n`;
    content += `总提交数: ${commits.length}\n`;
    content += `涉及作者: ${new Set(commits.map((c) => c.author)).size}\n`;
    content += `修改文件: ${new Set(commits.flatMap((c) => c.files)).size}\n`;
    content += `代码变更: +${totalInsertions} -${totalDeletions}\n`;

    return content;
  }

  /**
   * 分析内容并返回 token 估算结果
   */
  static analyzeContent(commits: CommitInfo[]): TokenEstimation {
    const plainText = this.generatePlainTextContent(commits);
    const tokens = this.estimateTokens(plainText);
    const suggestion = this.getTokenSuggestion(tokens);

    return {
      tokens,
      characters: plainText.length,
      suggestion,
    };
  }
}
