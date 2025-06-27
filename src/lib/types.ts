export interface FileChange {
  author: string;
  changed_lines: number[];
  file_content: string;
  sha: string;
  temp_filepath: string;
  timestamp: string;
}

export interface Commit {
  sha: string;
  author: string;
  timestamp: string;
  file_changes: FileChange[];
}

export interface AnalysisResult {
  filename: string;
  author: string;
  timestamp: string;
  sha: string;
  detected_kus: {
    [key: string]: number;
  };
  elapsed_time: number;
}
