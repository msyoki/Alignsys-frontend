import React from "react";
import { Bar, Line, Pie, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,   // 👈 Needed for Pie/Doughnut
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register necessary Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,   // 👈 Register this
  Title,
  Tooltip,
  Legend
);

const DynamicChart = ({ chartData }) => {
  const { chart, chartType, text } = chartData;

  const renderChart = () => {
    switch (chartType) {
      case "bar":
        return <Bar data={chart} options={{ responsive: true }} />;
      case "line":
        return <Line data={chart} options={{ responsive: true }} />;
      case "pie":
        return <Pie data={chart} options={{ responsive: true }} />;
      case "doughnut":
        return <Doughnut data={chart} options={{ responsive: true }} />;
      default:
        return <p>Unsupported chart type: {chartType}</p>;
    }
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      {renderChart()}
      <p style={{ marginTop: "10px", fontStyle: "italic" }}>{text}</p>
    </div>
  );
};

export default DynamicChart;
