import React, { useState, useEffect } from "react";
import ReactApexChart from "react-apexcharts";
import { AnalysisResult } from "@/lib/types";
import { ApexOptions } from "apexcharts";

interface HeatmapProps {
  analysisResults: AnalysisResult[];
}

const Heatmap: React.FC<HeatmapProps> = ({ analysisResults }) => {
  const [series, setSeries] = useState<ApexOptions["series"]>([]);
  const [kus, setKus] = useState<string[]>([]);

  useEffect(() => {
    const authors = Array.from(
      new Set(analysisResults.map((result) => result.author))
    );

    const calculatedKus = Array.from(
      new Set(
        analysisResults.flatMap((result) => Object.keys(result.detected_kus))
      )
    ).sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, ""), 10);
      const numB = parseInt(b.replace(/\D/g, ""), 10);
      return numA - numB;
    });
    setKus(calculatedKus);

    const totalKuOccurrences: { [key: string]: number } = {};
    analysisResults.forEach((result) => {
      Object.entries(result.detected_kus).forEach(([ku, count]) => {
        if (totalKuOccurrences[ku]) {
          totalKuOccurrences[ku] += count;
        } else {
          totalKuOccurrences[ku] = count;
        }
      });
    });

    const newSeries = authors.map((author) => {
      const data = calculatedKus.map((ku) => {
        const authorResults = analysisResults.filter(
          (result) => result.author === author
        );
        const kuCount = authorResults.reduce(
          (acc, result) => acc + (result.detected_kus[ku] || 0),
          0
        );
        const percentage = (kuCount / totalKuOccurrences[ku]) * 100 || 0;
        return { x: ku, y: percentage, kuCount: kuCount };
      });
      return { name: author, data };
    });

    setSeries(newSeries);
  }, [analysisResults]);

  const options: ApexOptions = {
    chart: {
      type: "heatmap",
      toolbar: {
        show: false,
      },
    },
    legend: {
      show: false,
    },
    plotOptions: {
      heatmap: {
        shadeIntensity: 0.5,
        radius: 0,
        enableShades: true,
        useFillColorAsStroke: false,
        colorScale: {
          ranges: [
            {
              from: 0,
              to: 0.1,
              color: "#ffffff", // White for 0%
            },
            {
              from: 0.0000000000001,
              to: 100,
              color: "#247e48", // Darkest green
            },
          ],
        },
      },
    },
    stroke: {
      width: 0.1,
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      type: "category",
      categories: kus,
    },
    tooltip: {
      y: {
        formatter: (value, { seriesIndex, dataPointIndex, w }) => {
          const author = w.config.series[seriesIndex].name;
          const ku = w.config.xaxis.categories[dataPointIndex];
          const kuCount = w.config.series[seriesIndex].data[dataPointIndex].kuCount;
          return `Author: ${author}, KU: ${ku}, Files: ${kuCount}`;
        },
      },
    },
  };

  return (
    <div id="chart">
      <ReactApexChart
        options={options}
        series={series}
        type="heatmap"
        key={JSON.stringify(series)}
      />
    </div>
  );
};

export default Heatmap;