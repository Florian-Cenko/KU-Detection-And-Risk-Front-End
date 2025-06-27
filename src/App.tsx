import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import RepoList from './components/RepoList';
import CreateRepoPage from '@/components/pages/CreateRepoPage';
import EditRepoPage from '@/components/pages/EditRepoPage';
import CommitsScreen from '@/components/CommitsScreen';
import { Commit, AnalysisResult } from '@/lib/types';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

import Heatmap from '@/components/Heatmap'; // Import Heatmap

interface Repo {
    name: string;
    url: string;
    description?: string;
    comments?: string;
    created_at?: string;
    updated_at?: string;
}


const App: React.FC = () => {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [selectedRepoForEdit, setSelectedRepoForEdit] = useState<Repo | null>(null);
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
  const [repoUrl, setRepoUrl] = useState<string>('');

  const [commits, setCommits] = useState<Commit[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  const [progress, setProgress] = useState<number>(0);
  const [totalFiles, setTotalFiles] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);
  const [commitLimit, setCommitLimit] = useState<number>(100);
  const [showScreen, setShowScreen] = useState<boolean>(false);
  const [resultsOfAnalysis, setResultsOfAnalysis] = useState<boolean>(false); // Initial value set to false
  const [chartData, setChartData] = useState<any>(null);
  const [showChart, setShowChart] = useState<boolean>(false);
  //const [showHeatmap, setShowHeatmap] = useState<boolean>(false); // Heatmap visibility state

  const [kuRisks, setKuRisks] = useState<Record<string, { files: number; authors: Set<string>; employeeCount: number; risk: number }>>({});
  const [showRisksTable, setShowRisksTable] = useState<boolean>(false);  

  const [employeeRisks, setEmployeeRisks] = useState<Record<string, { relative: number;  absolute: number }>>({});
  const [showEmployeeRisksTable, setShowEmployeeRisksTable] = useState<boolean>(false);  

  useEffect(() => {
    fetchRepos();
  }, []);

  useEffect(() => {
    if (showScreen && repoUrl) {
      fetchCommits();
      extractFiles();
    }
  }, [showScreen, repoUrl]);

    const handleSetAnalysisResults = (results: AnalysisResult[]) => {
       setAnalysisResults(results);
    }

  const fetchRepos = async () => {
    try {
      const response = await fetch('http://localhost:5000/repos');
      const data = await response.json();
      setRepos(data);
    } catch (error) {
      console.error('Error fetching repos:', error);
    }
  };

  const addRepo = async (newRepo: Repo) => {
    try {
      const response = await fetch('http://localhost:5000/repos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newRepo),
      });

      if (!response.ok) {
        throw new Error('Failed to add repository');
      }

      fetchRepos();
    } catch (error) {
      console.error('Error adding repo:', error);
    }
  };

  const CloseRepo = async (updatedRepo: Repo) => {
    setShowEditModal(false);
  };

  const fetchCommits = async () => {
    if (!repoUrl) {
      console.error("No repository selected");
      return;
    }
    
    setLoading(true);
    try {
      
    console.log("llllll")
      const response = await fetch(`http://localhost:5000/api/commits?repo=${encodeURIComponent(repoUrl)}&limit=${commitLimit}`);
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const data = await response.json();
  
      if (!Array.isArray(data)) {
        throw new Error('Unexpected response format');
      }
  
      setCommits(data);
      setResultsOfAnalysis(true); // Set resultsOfAnalysis to true when fetching commits
    } catch (error) {
      console.error("Failed to fetch commits:", error);
      setResultsOfAnalysis(false); // Handle error by setting resultsOfAnalysis to false
    } finally {
      setLoading(false);
    }
  };

  const extractFiles = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/files');
      const data = await response.json();
      setFiles(data);
    } catch (error) {
      console.error("Failed to extract files:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRepo = (repoName: string, repoUrl: string) => {
    setSelectedRepo(repoName);
    setRepoUrl(repoUrl);
    setShowScreen(true);
    setResultsOfAnalysis(false); // Set resultsOfAnalysis to false when selecting a repo
      //fetch data
  };

  const handleSelectAddRepo = () => {
    setShowCreateModal(true);
  };

  const handleEditRepo = (repo: Repo) => {
    setSelectedRepoForEdit(repo);
    setShowEditModal(true);
  };
 
  const handleDeleteRepo = async (repoName: string) => {
    try {
      const response = await fetch(`http://localhost:5000/delete_repo/${encodeURIComponent(repoName)}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete repository');
      }

      setRepos(repos.filter((repo) => repo.name !== repoName));
    } catch (error) {
      console.error('Error deleting repo:', error);
    }
  };

  const handleSave = async () => {
    await fetchRepos();
    setShowCreateModal(false);
    setShowEditModal(false);
  };

  const handleCloseScreen = () => {
    setShowScreen(false);
    setResultsOfAnalysis(false); // Reset analysis results when closing the screen
  };

  const handleCloseChart = () => {
    //setShowScreen(false);
    setShowChart(false)
  };

  const handleCloseTable = () => {
    //setShowScreen(false);
    setShowRisksTable(false)
  };

  const handleCloseEmpsTable = () => {
    //setShowScreen(false);
    setShowEmployeeRisksTable(false)
  };

  // const toggleHeatmap = async () => {
  //       try {
  //           const response = await fetch('http://localhost:5000/analyzeall');

  //           if (!response.ok) {
  //               throw new Error(`HTTP error! Status: ${response.status}`);
  //           }

  //           const data = await response.json();
  //           setAnalysisResults(data); // Set the analysis results
  //           setShowHeatmap(true); // Show heatmap after fetching data
  //       } catch (error) {
  //           console.error('Failed to load analysis data:', error);
  //       }
  //   };


  interface AggregatedDataType {
    [key: string]: {
        files: number;
        authors: Set<string>;
        employeeCount: number;
    }
  }
  
  const handleViewOrganizationSkills = async () => {
    try {
        const response = await fetch('http://localhost:5000/detected_kus');

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const analysisData = await response.json();

        console.log('Fetched Analysis Data:', analysisData); // Debug: Δεδομένα από το API

        const aggregatedData: Record<string, { files: number; authors: Set<string>; employeeCount: number }> = {};

        // Επεξεργασία δεδομένων
        analysisData.forEach((item: any, index: number) => {
            console.log(`Processing item ${index}:`, item); // Debug: Αντικείμενο προς επεξεργασία

            const { kus, author } = item;

            // Επεξεργασία των kus
            for (const [key, value] of Object.entries(kus)) {
                console.log(`Processing KU "${key}" with value: ${value}`); // Debug: Κάθε KU

                if (typeof value === 'number') {
                    // Αρχικοποίηση αν το KU δεν υπάρχει
                    if (!aggregatedData[key]) {
                        aggregatedData[key] = {
                            files: 0,
                            authors: new Set(),
                            employeeCount: 0,
                        };
                        console.log(`Initialized data for KU "${key}".`);
                    }

                    // Ενημέρωση του αριθμού των αρχείων
                    aggregatedData[key].files += value;
                    console.log(`Updated files for KU "${key}":`, aggregatedData[key].files);

                    // Προσθήκη συγγραφέα ΜΟΝΟ αν η τιμή είναι 1
                    if (value === 1) {
                        aggregatedData[key].authors.add(author);
                        console.log(`Added author "${author}" to KU "${key}".`);
                    }

                    // Ενημέρωση του αριθμού μοναδικών συγγραφέων
                    aggregatedData[key].employeeCount = aggregatedData[key].authors.size;
                    console.log(`Updated employeeCount for KU "${key}":`, aggregatedData[key].employeeCount);
                }
            }
        });

        console.log('Final Aggregated Data:', aggregatedData); // Debug: Τελική δομή

        // Ταξινόμηση των `ku`
        const sortedKeys = Object.keys(aggregatedData).sort((a, b) => {
            const numA = parseInt(a.slice(1));
            const numB = parseInt(b.slice(1));
            return numA - numB;
        });

        console.log('Sorted Keys:', sortedKeys); // Debug: Σειρά κλειδιών

        // Δημιουργία δεδομένων για το γράφημα
        const labels = sortedKeys;
        const dataFiles = sortedKeys.map(key => aggregatedData[key].files); // Αριθμός αρχείων
        const dataEmployees = sortedKeys.map(key => aggregatedData[key].employeeCount); // Αριθμός μοναδικών συγγραφέων

        console.log('Chart Data - Files:', dataFiles);
        console.log('Chart Data - Employees:', dataEmployees);

        // Ρυθμίσεις του γραφήματος
        setChartData({
          labels: labels,
          datasets: [
              {
                  label: 'Number of Files',
                  data: dataFiles,
                  backgroundColor: 'rgba(75, 192, 192, 0.2)',
                  borderColor: 'rgba(75, 192, 192, 1)',
                  borderWidth: 1,
                  yAxisID: 'y', // Κύριος άξονας
              },
              {
                  label: 'Number of Authors',
                  data: dataEmployees,
                  backgroundColor: 'rgba(255, 99, 132, 0.2)',
                  borderColor: 'rgba(255, 99, 132, 1)',
                  borderWidth: 1,
                  yAxisID: 'y1', // Δευτερεύων άξονας
              },
          ],
          options: {
              responsive: true,
              layout: {
                  padding: {
                      right: 150, // Δημιουργία κενής περιοχής στα δεξιά
                  },
              },
              plugins: {
                  legend: {
                      position: 'top', // Μετακίνηση του legend στην κορυφή
                  },
              },
              scales: {
                  y: {
                      type: 'linear',
                      position: 'left', // Τοποθέτηση του κύριου άξονα στα αριστερά
                      title: {
                          display: true,
                          text: 'Number of Files', // Ετικέτα του κύριου άξονα
                      },
                  },
                  y1: {
                      type: 'linear',
                      position: 'right', // Τοποθέτηση του δευτερεύοντος άξονα δεξιά
                      offset: true, // Μετακίνηση του άξονα εκτός του διαγράμματος
                      title: {
                          display: true,
                          text: 'Number of Authors', // Ετικέτα του δευτερεύοντος άξονα
                      },
                      grid: {
                          drawOnChartArea: false, // Απενεργοποίηση πλέγματος για τον δεξιό άξονα
                      },
                  },
              },
          },
      });
      
      

        console.log('Chart Data prepared successfully.');

        // Εμφάνιση γραφήματος
        setShowChart(true);

    } catch (error) {
        console.error('Failed to load analysis data:', error);
    }
  };


  const risk = async() => {
    try{
      const response = await fetch('http://localhost:5000/detected_kus');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const analysisData = await response.json();
        console.log('Fetched Analysis Data:', analysisData); // Debug: Δεδομένα από το API
        const knowledgeUnits: Record<string, { files: number; authors: Set<string>; employeeCount: number; risk:number}> = {};
        let sumFiles = 0;

        // Επεξεργασία δεδομένων
        analysisData.forEach((item: any, index: number) => {
            console.log(`Processing item ${index}:`, item); // Debug: Αντικείμενο προς επεξεργασία
            const { kus, author } = item;

            // Επεξεργασία των kus
            for (const [key, value] of Object.entries(kus)) {
                console.log(`Processing KU "${key}" with value: ${value}`); // Debug: Κάθε KU

                if (typeof value === 'number') {
                    // Αρχικοποίηση αν το KU δεν υπάρχει
                    if (!knowledgeUnits[key]) {
                        knowledgeUnits[key] = {
                            files: 0,
                            authors: new Set(),
                            employeeCount: 0,
                            risk:0,
                        };
                        console.log(`Initialized data for KU "${key}".`);
                    }
                    // Ενημέρωση του αριθμού των αρχείων
                    knowledgeUnits[key].files += value;
                    console.log(`Updated files for KU "${key}":`, knowledgeUnits[key].files);
                    // Προσθήκη συγγραφέα ΜΟΝΟ αν η τιμή είναι 1
                    if (value === 1) {
                        knowledgeUnits[key].authors.add(author);
                        console.log(`Added author "${author}" to KU "${key}".`);
                    }
                    // Ενημέρωση του αριθμού μοναδικών συγγραφέων
                    knowledgeUnits[key].employeeCount = knowledgeUnits[key].authors.size;
                    console.log(`Updated employeeCount for KU "${key}":`, knowledgeUnits[key].employeeCount);
                }
            }

        });
        for (const [key, value] of Object.entries(knowledgeUnits)) {
          sumFiles+=knowledgeUnits[key].files
        }
        
        for (const [key, value] of Object.entries(knowledgeUnits)) {
          knowledgeUnits[key].risk = calculateRisk(value.files, value.employeeCount, sumFiles); 
        }
        
           setKuRisks(Object.fromEntries(
            Object.entries(knowledgeUnits).sort(([a], [b]) => a.localeCompare(b))
          ));        
           setShowRisksTable(true);
      
    }catch (error) {
      console.error('Failed to load analysis data:', error);
    }

  };

  const employeeRisk = async() => {
    try{
      const response = await fetch('http://localhost:5000/detected_kus');

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const analysisData = await response.json();

        console.log('Fetched Analysis Data:', analysisData); // Debug: Δεδομένα από το API

        const knowledgeUnits: Record<string, { files: number; authors: Set<string>; employeeCount: number; risk:number}> = {};
        const authorKUMap: Record<string, {kus: Set<string>; relative:number; absolute:number}> = {};  // Για να καταγράφεται ποια KU χρησιμοποιεί κάθε author
        let sumFiles = 0;

        // Επεξεργασία δεδομένων
        analysisData.forEach((item: any, index: number) => {
            console.log(`Processing item ${index}:`, item); // Debug: Αντικείμενο προς επεξεργασία

            const { kus, author } = item;

            // Επεξεργασία των kus
            for (const [key, value] of Object.entries(kus)) {
                console.log(`Processing KU "${key}" with value: ${value}`); // Debug: Κάθε KU

                if (typeof value === 'number') {
                    // Αρχικοποίηση αν το KU δεν υπάρχει
                    if (!knowledgeUnits[key]) {
                        knowledgeUnits[key] = {
                            files: 0,
                            authors: new Set(),
                            employeeCount: 0,
                            risk:0,
                        };
                        console.log(`Initialized data for KU "${key}".`);
                    }

                    // Ενημέρωση του αριθμού των αρχείων
                    knowledgeUnits[key].files += value;
                    console.log(`Updated files for KU "${key}":`, knowledgeUnits[key].files);

                    // Προσθήκη συγγραφέα ΜΟΝΟ αν η τιμή είναι 1
                    if (value === 1) {
                        knowledgeUnits[key].authors.add(author);
                        console.log(`Added author "${author}" to KU "${key}".`);
                    }

                    // Ενημέρωση του αριθμού μοναδικών συγγραφέων
                    knowledgeUnits[key].employeeCount = knowledgeUnits[key].authors.size;
                    console.log(`Updated employeeCount for KU "${key}":`, knowledgeUnits[key].employeeCount);

                }
            }

        });
        for (const [key, value] of Object.entries(knowledgeUnits)) {
          sumFiles+=knowledgeUnits[key].files
        }
        Object.entries(knowledgeUnits).forEach(([ku, { authors }]) => {
          authors.forEach((author) => {
            if (!authorKUMap[author]) {
              authorKUMap[author] = { kus: new Set(), relative: 0, absolute: 0 };
            }
            authorKUMap[author].kus.add(ku);
          });
        });

        Object.entries(authorKUMap).forEach(([author, { kus }]) => {
          let empRisk = 0;
          let beforeSum = 0;
          kus.forEach((ku) => {
              let riskBefore = calculateRisk(knowledgeUnits[ku].files, knowledgeUnits[ku].employeeCount, sumFiles);
              let riskAfter = calculateRisk(knowledgeUnits[ku].files, ((knowledgeUnits[ku].employeeCount)-1), sumFiles);
              let dRisk = riskAfter - riskBefore;
              empRisk+=dRisk;
              beforeSum+=riskBefore;
          });
          let relativeRisk = empRisk / beforeSum;
          authorKUMap[author].relative = relativeRisk;
          authorKUMap[author].absolute = empRisk; 
        });

       
      setEmployeeRisks(authorKUMap);
      setShowEmployeeRisksTable(true);
      
    }catch (error) {
      console.error('Failed to load analysis data:', error);
    }

  };

  const calculateRisk = (freq: number, emps: number, totalFiles:number): number => {
    const p_A = 0.1;
    let p_L = p_A**emps;
    let impact = freq / totalFiles
    return p_L*impact;
  };


  return (
    <Router>
      <div className="flex min-h-screen bg-gray-100">
        <div className="flex flex-col w-1/4 p-8 h-full sticky top-0 gap-4 bg-gray-50 border-r border-gray-200"> {/* Adjust width and add border */}
          <RepoList
            repos={repos}
            onSelectRepo={handleSelectRepo}
            onSelectAddRepo={handleSelectAddRepo}
            selectedRepo={selectedRepo}
            onEditRepo={handleEditRepo}
            onDeleteRepo={handleDeleteRepo}
          />
        </div>
   
        <div className="flex flex-col flex-1 p-8 gap-4 ml-4"> {/* Added margin-left to match the distance */}
          <button 
            onClick={handleViewOrganizationSkills} 
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            View Organization Skills
          </button>

          {showChart && chartData && (
            <div className="mt-8">
              <Bar data={chartData} />
              <button 
                onClick={handleCloseChart} 
                className="mt-4 px-4 py-2 bg-[#c72424] text-white rounded"
              >
                Close Chart
              </button>
            </div>
          )}
          {showScreen && (
            <CommitsScreen
              commits={commits}
              progress={progress}
              totalFiles={totalFiles}
              loading={loading}
              analysisResults={analysisResults}
              files={files}
              commitLimit={commitLimit}
              extractFiles={extractFiles}
              fetchCommits={fetchCommits}
              repoUrl={repoUrl}
              setCommits={setCommits}
              setProgress={setProgress}
              setTotalFiles={setTotalFiles}
              setLoading={setLoading}
              setAnalysisResults={setAnalysisResults}
              resultsOfAnalysis={resultsOfAnalysis}
              setResultsOfAnalysis={setResultsOfAnalysis} // Pass the setter function
            />
          )}

           {/* <button
                onClick={toggleHeatmap}
                className="px-4 py-2 bg-purple-500 text-white rounded"
            >
                Show Heatmap
            </button>

            {showHeatmap && (
                <Heatmap analysisResults={analysisResults} />
            )} */}

          {showCreateModal && (
            <CreateRepoPage
              isOpen={showCreateModal}
              onClose={() => setShowCreateModal(false)}
              onAddRepo={addRepo}
              onSave={handleSave}
            />
          )}
          
          {showEditModal && (
            <EditRepoPage
              isOpen={showEditModal}
              onClose={() => setShowEditModal(false)}
              onSave={handleSave}
              onCloseRepo={CloseRepo}
              repo={selectedRepoForEdit}
            />
          )}

            <button
                onClick={risk}
                className="px-4 py-2 bg-green-500 text-white rounded"
            >
                KU's Risks
            </button>

          {showRisksTable && (
            <div className="mt-8">
              <table className="min-w-full table-auto">
                <thead>
                  <tr>
                    <th className="px-4 py-2">KU</th>
                    <th className="px-4 py-2">Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(kuRisks).map(([ku, data]) => (
                    <tr key={ku}>
                      <td className="border px-4 py-2">{ku}</td>
                      <td className="border px-4 py-2">{data.risk.toFixed(20)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button 
                onClick={handleCloseTable} 
                className="mt-4 px-4 py-2 bg-[#c72424] text-white rounded"
              >
                Close Table
              </button>
            </div>
          )}

            <button
                onClick={employeeRisk}
                className="px-4 py-2 bg-orange-500 text-white rounded"
            >
                Employee Risks
            </button>

            {showEmployeeRisksTable && (
            <div className="mt-8">
              <table className="min-w-full table-auto">
                <thead>
                  <tr>
                    <th className="px-4 py-2">Employee</th>
                    <th className="px-4 py-2">Absolute Risk</th>
                    <th className="px-4 py-2">Relative Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(employeeRisks).map(([employee, data]) => (
                    <tr key={employee}>
                      <td className="border px-4 py-2">{employee}</td>
                      <td className="border px-4 py-2">{data.absolute.toFixed(20)}</td>
                      <td className="border px-4 py-2">{data.relative.toFixed(20)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button 
                onClick={handleCloseEmpsTable} 
                className="mt-4 px-4 py-2 bg-[#c72424] text-white rounded"
              >
                Close Table
              </button>
            </div>
          )}
          
        </div>
      </div>
      
    </Router>
  );

  
};

export default App;