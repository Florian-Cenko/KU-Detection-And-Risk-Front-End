import React, { useState, Dispatch, SetStateAction } from 'react';
import axios from 'axios';
import { FileChange, Commit, AnalysisResult } from '@/lib/types';
import { ButtonLoading } from '@/components/ButtonLoading';
import { Button } from '@/components/ui/button';
import { GitCommitVertical, BarChartHorizontal } from 'lucide-react';
import Heatmap from '@/components/Heatmap'; // Assuming you have a Heatmap component
import ChartModal from '@/components/ChartModal'; // Import the ChartModal component

interface FormProps {
  commits: Commit[];
  setCommits: (commits: Commit[]) => void;
  setProgress: Dispatch<SetStateAction<number>>;
  setTotalFiles: (total: number) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  setAnalysisResults: Dispatch<SetStateAction<AnalysisResult[]>>;
  initialRepoUrl?: string; // Optional prop for initial repo URL
  setResultsOfAnalysis: Dispatch<SetStateAction<boolean>>;
}

const Form: React.FC<FormProps> = ({
  commits,
  setCommits,
  setProgress,
  setTotalFiles,
  loading,
  setLoading,
  setAnalysisResults,
  initialRepoUrl = "",
  setResultsOfAnalysis,
}) => {
  const [repoUrl, setRepoUrl] = useState<string>(initialRepoUrl);
  const [commitLimit, setCommitLimit] = useState<string>("30");
  const [analysisStarted, setAnalysisStarted] = useState<boolean>(false);
  const [heatmapData, setHeatmapData] = useState<AnalysisResult[]>([]);
  const [loadingHeatmap, setLoadingHeatmap] = useState<boolean>(false);
  const [heatmapMessage, setHeatmapMessage] = useState<string>("No data available");
  const [initialHeatmapHandler, setInitialHeatmapHandler] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [analyzedTimestamps, setAnalyzedTimestamps] = useState<string[]>([]);
  const [KUs, setKUs] = useState<string[]>([]);

  // State for timestamps data
  const [timestamps, setTimestamps] = useState<string[]>([]);

  // Update repoUrl if initialRepoUrl prop changes
  React.useEffect(() => {
    setRepoUrl(initialRepoUrl);
  }, [initialRepoUrl]);

  React.useEffect(() => {
    if (repoUrl) {
      fetchHeatmapData(repoUrl);
    }
  }, [repoUrl]);

  const fetchHeatmapData = async (repoURL: string) => {
    setLoadingHeatmap(true);
    setInitialHeatmapHandler(true);
    try {
      const response = await axios.get(`http://localhost:5000/analyzedb?repo_name=${getRepoNameFromUrl(repoURL)}`);
      const analysisResults = response.data || [];
      setLoadingHeatmap(false);

      if (analysisResults.length > 0) {
        setHeatmapData(analysisResults);
      } else {
        setHeatmapMessage("No analysis data found for this repository.");
        setHeatmapData([]);
      }
    } catch (error) {
      console.error("Error fetching analysis data:", error);
      setLoadingHeatmap(false);
      setHeatmapMessage("Failed to fetch analysis data.");
    }
  };

  function getRepoNameFromUrl(url: string) {
    const cleanedUrl = url.endsWith('.git') ? url.slice(0, -4) : url;
    const parts = cleanedUrl.split('/');
    return parts[parts.length - 1];
  }

  const handleFetchCommits = async () => {
    setLoading(true);
    setCommits([]);
    setAnalysisResults([]);
    setProgress(0);
    setResultsOfAnalysis(true);

    try {
      const limit = commitLimit ? parseInt(commitLimit) : null;
      const response = await axios.post("http://localhost:5000/commits", {
        repo_url: repoUrl,
        limit: limit,
      });

      const fileChanges: FileChange[] = response.data;
      const commits: Commit[] = [];
      const grouped = fileChanges.reduce((acc, fileChange) => {
        if (!acc[fileChange.sha]) {
          acc[fileChange.sha] = {
            sha: fileChange.sha,
            author: fileChange.author,
            timestamp: fileChange.timestamp,
            file_changes: [],
          };
        }
        acc[fileChange.sha].file_changes.push(fileChange);
        return acc;
      }, {} as { [key: string]: Commit });

      for (const sha in grouped) {
        commits.push(grouped[sha]);
      }

      setCommits(commits);
      const totalFiles = fileChanges.length;
      setTotalFiles(totalFiles);
      // Fetch commit timestamps
      await fetchCommitTimestamps(repoUrl);
    } catch (error) {
      console.error("Error fetching commits:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCommitTimestamps = async (repoURL: string) => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/historytime`, {
        params: { repo_url: repoURL },
      });

      if (response.data && response.data.commit_dates) {
        setTimestamps(response.data.commit_dates); // Update the timestamps state
      } else {
        console.error("No commit dates found in response");
      }
    } catch (error) {
      console.error("Error fetching commit timestamps:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalyzedCommitTimestamps = async (repoURL: string) => {
    try {
      const response = await axios.get(`http://localhost:5000/timestamps?repo_name=${getRepoNameFromUrl(repoURL)}`);
      if (response.data && response.data.length > 0) {
        return response.data;
      } else {
        return [];
      }
    } catch (error) {
      console.error('Error fetching analyzed commit timestamps:', error);
      return [];
    }
  };

  const handleExtractSkills = () => {
    setInitialHeatmapHandler(false);
    setAnalysisStarted(true);
    setProgress(0);
    setAnalysisResults(heatmapData);
    setResultsOfAnalysis(true);

    const eventSource = new EventSource(
      `http://localhost:5000/analyze?repo_url=${encodeURIComponent(repoUrl)}`
    );

    eventSource.onmessage = (event: MessageEvent) => {
      if (event.data === "end") {
        eventSource.close();
        setLoading(false);
        setAnalysisStarted(false);
      } else {
        const fileData: AnalysisResult = JSON.parse(event.data);
        setAnalysisResults((prevResults) => [...prevResults, fileData]);
        setProgress((prevProgress) => prevProgress + 1);
      }
    };

    eventSource.onerror = (error) => {
      console.error("Error streaming data:", error);
      eventSource.close();
      setLoading(false);
      setAnalysisStarted(false);
    };

    eventSource.onopen = () => {
      setProgress(0);
    };
  };

  const handleAnalysis = async () => {
    await handleFetchCommits();
    handleExtractSkills();
  };

  // Prepare data for the chart
  const chartData = {
    labels: timestamps.map(timestamp => new Date(timestamp).toLocaleString()),
    datasets: [
      {
        label: 'Commits over time',
        data: timestamps.map((_, index) => ({ x: new Date(timestamps[index]), y: 1 })), // Use the correct timestamp for each point
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: false,
        tension: 0.1,
      },
    ],
  };

  // Fetch data for the chart when the modal opens
  const handleOpenModal = async () => {
    if (!isModalOpen) {
      await fetchCommitTimestamps(repoUrl); // Ensure timestamps are fetched
      const analyzedTimestamps = await fetchAnalyzedCommitTimestamps(repoUrl);
      setAnalyzedTimestamps(analyzedTimestamps)
      setIsModalOpen(true);
    }
  };

  return (
    <div className="flex flex-col gap-4 items-start">
      <form onSubmit={(e) => e.preventDefault()} className="space-y-4 w-full">
        <div>
          <label htmlFor="repoUrl" className="block text-gray-700 mb-2">
            GitHub Repository URL
          </label>
          <input
            type="text"
            id="repoUrl"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <div>
          <label htmlFor="commitLimit" className="block text-gray-700 mb-2">
            Commit Limit (leave empty to scan all commits)
          </label>
          <input
            type="number"
            id="commitLimit"
            value={commitLimit}
            onChange={(e) => setCommitLimit(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            min="1"
          />
        </div>
        {loading ? (
          <ButtonLoading />
        ) : (
          <div className="flex space-x-4"> {/* Προσθέτω αυτή την γραμμή */}
            <Button
              type="button"
              onClick={handleAnalysis}
              disabled={!repoUrl || analysisStarted}
            >
              <GitCommitVertical className="mr-2 h-4 w-4" />
              Start Analysis
            </Button>
            <Button
              type="button"
              onClick={handleOpenModal}
              disabled={!repoUrl}
            >
              <BarChartHorizontal className="mr-2 h-4 w-4" />
              Show History
            </Button>
          </div> 
        )}
      </form>

      {/* Heatmap section */}
      {initialHeatmapHandler && (
        <div className="mt-8 w-full">
          {loadingHeatmap ? (
            <p>Loading analysis data...</p>
          ) : heatmapData.length > 0 ? (
            <Heatmap analysisResults={heatmapData} />
          ) : (
            <p>{heatmapMessage}</p>
          )}
        </div>
      )}

      {/* Modal for displaying chart */}
      
      <ChartModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        timestamps={timestamps}
        analyzedTimestamps={analyzedTimestamps}
      />
    </div>
  );



};



export default Form;
