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
  changes: string;
  insertions: number;
  deletions: number;
}

export interface DateRange {
  since?: string;
  until?: string;
}

export interface TokenEstimation {
  tokens: number;
  characters: number;
  suggestion?: string;
}
