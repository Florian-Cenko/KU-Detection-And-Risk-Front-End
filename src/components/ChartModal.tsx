import React from 'react';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import { ChartOptions, TooltipItem } from 'chart.js';
import {
  Chart as ChartJS,
  PointElement,
  LineElement,
  TimeScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';

ChartJS.register(PointElement, LineElement, TimeScale, LinearScale, Tooltip, Legend, zoomPlugin);

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  timestamps: string[];
  analyzedTimestamps: string[];
}

// Function to format date as dd/MM/yyyy
function formatDate(dateOld: string) {
  const date = new Date(dateOld);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

const ChartModal: React.FC<ModalProps> = ({ isOpen, onClose, timestamps, analyzedTimestamps }) => {
  if (!isOpen) return null;

  // Ensure the date string is parsed correctly
  const convertToISO = (dateString: string) => {
    return dateString.includes('T') ? dateString : dateString.replace(' ', 'T');
  };

  // Group commits by day
  const aggregateByDate = (timestamps: string[]) => {
    return timestamps.reduce((acc, timestamp) => {
      const date = new Date(convertToISO(timestamp)).toLocaleDateString('en-GB'); // Force dd/MM/yyyy format
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as { [date: string]: number });
  };

  const dateMap = aggregateByDate(timestamps);
  const analyzedDateMap = aggregateByDate(analyzedTimestamps);

  // Data for commits
  const commitData = Object.keys(dateMap).map(date => ({
    x: new Date(date.split('/').reverse().join('-')), // Convert back to YYYY-MM-DD for chart.js
    y: dateMap[date],
  }));

  // Data for analyzed commits
  const analyzedData = Object.keys(analyzedDateMap).map(date => ({
    x: new Date(date.split('/').reverse().join('-')),
    y: analyzedDateMap[date],
  }));

  const chartData = {
    labels: Object.keys(dateMap).map(date => formatDate(date)),
    datasets: [
      {
        label: 'Commits over time',
        data: commitData,
        borderColor: '#0d3a6a',
        backgroundColor: 'rgba(13, 58, 106, 0.6)',
        fill: false,
        tension: 0,
        pointRadius: 6,
        pointHoverRadius: 8,
        borderWidth: 0,
      },
      {
        label: 'Analyzed Commits',
        data: analyzedData,
        borderColor: '#c72424',
        backgroundColor: 'rgba(199, 36, 36, 0.6)',
        fill: false,
        pointRadius: 6,
        pointHoverRadius: 8,
        borderWidth: 0,
      },
    ],
  };

  const chartOptions: ChartOptions<'line'> = {
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'day',
          tooltipFormat: 'dd/MM/yyyy',
        },
        title: {
          display: true,
          text: 'Date',
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Commits',
        },
        ticks: {
          callback: (value) => value,
        },
      },
    },
    plugins: {
      zoom: {
        pan: {
          enabled: true,
          mode: 'x',
        },
        zoom: {
          wheel: {
            enabled: true,
          },
          pinch: {
            enabled: true,
          },
          mode: 'x',
        },
      },
      tooltip: {
        callbacks: {
          label: (context: TooltipItem<'line'>) => {
            const date = new Date(context.parsed.x as number);
            const formattedDate = `${String(date.getDate()).padStart(2, '0')}/${
              String(date.getMonth() + 1).padStart(2, '0')
            }/${date.getFullYear()}`;
            const commits = context.parsed.y as number;
            return `Date: ${formattedDate}, Commits: ${commits}`;
          },
        },
      },
    },
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full flex flex-col">
        <div className="flex flex-col items-center mb-4">
          <div className="text-lg font-semibold mb-2">Total Commits:</div>
          <div className="text-xl">{timestamps.length}</div>
        </div>
        <h2 className="text-2xl font-bold mb-4">Commits Over Time</h2>
        <Line data={chartData} options={chartOptions} />
        <button
          className="mt-4 bg-[#c72424] hover:bg-[#a31e1e] text-white font-bold py-2 px-4 rounded"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ChartModal;
