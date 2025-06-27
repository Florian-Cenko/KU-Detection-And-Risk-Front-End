import React from "react";
import Form from "@/components/Form";
import Commits from "@/components/Commits";
import { Commit, AnalysisResult } from "@/lib/types";
import { Progress } from "@/components/ui/progress";
import Heatmap from "@/components/Heatmap";

interface CommitsScreenProps {
  commits: Commit[];
  progress: number;
  totalFiles: number;
  loading: boolean;
  analysisResults: AnalysisResult[];
  files: any[];
  commitLimit: number;
  extractFiles: () => Promise<void>;
  fetchCommits: () => Promise<void>;
  repoUrl: string;
  setCommits: React.Dispatch<React.SetStateAction<Commit[]>>;
  setProgress: React.Dispatch<React.SetStateAction<number>>;
  setTotalFiles: React.Dispatch<React.SetStateAction<number>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setAnalysisResults: React.Dispatch<React.SetStateAction<AnalysisResult[]>>;
  resultsOfAnalysis: boolean; // Prop to control the display of analysis results
  setResultsOfAnalysis: React.Dispatch<React.SetStateAction<boolean>>; // Add this prop
}

const CommitsScreen: React.FC<CommitsScreenProps> = ({
  commits,
  progress,
  totalFiles,
  loading,
  analysisResults,
  files,
  commitLimit,
  extractFiles,
  fetchCommits,
  repoUrl,
  setCommits,
  setProgress,
  setTotalFiles,
  setLoading,
  setAnalysisResults,
  resultsOfAnalysis,
  setResultsOfAnalysis, // Destructure the new prop
}) => {
  return (
    <div className="flex flex-col w-full h-full max-w-screen-lg mx-auto bg-white"> {/* Full width, centered horizontally */}
      <div className="flex flex-col w-full gap-4 p-4"> {/* Top section with padding */}
        <h1 className="text-2xl font-bold text-center">Git Commit Skill Extractor</h1>
        <Form
          commits={commits}
          setCommits={setCommits}
          setProgress={setProgress}
          setTotalFiles={setTotalFiles}
          loading={loading}
          setLoading={setLoading}
          setAnalysisResults={setAnalysisResults}
          initialRepoUrl={repoUrl}
          setResultsOfAnalysis={setResultsOfAnalysis} // Pass the setter function
        />
        {resultsOfAnalysis && ( // Render only if resultsOfAnalysis is true
          <div>
            {totalFiles > 0 && (
              <div className="flex gap-2 items-center justify-between">
                <Progress
                  value={(progress / totalFiles) * 100}
                  className="flex-grow bg-white"
                />
                <span className="whitespace-nowrap">
                  {progress}/{totalFiles}
                </span>
              </div>
            )}
            <div className="flex flex-col gap-4">
              {analysisResults.length > 0 && (
                <Heatmap analysisResults={analysisResults} />
              )}
              <Commits commits={commits} loading={loading} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommitsScreen;