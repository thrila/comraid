"use client";
import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  type ChartOptions,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const SalesOverview = () => {
  const data = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    datasets: [
      {
        label: "Orders",
        data: [200, 300, 400, 500, 400, 300, 200, 300, 400, 300, 200, 100],
        backgroundColor: "#4C71F0", // Blue color
        borderRadius: 10,
      },
      {
        label: "Sales",
        data: [150, 250, 350, 450, 350, 250, 150, 250, 350, 250, 150, 50],
        backgroundColor: "#202744", // Darker blue color
        borderRadius: 10,
      },
    ],
  };

  // Chart options
  const options: ChartOptions<"bar"> = {
    responsive: true,
    plugins: {
      title: {
        display: true, // Enable the title
        text: "Sales Overview", // Text for the chart title
        align: "start", // Align the title to the left or center ("start", "center", "end")
        color: "#fff", // Title color (matches dark mode)
        font: {
          size: 18, // Title font size
          weight: "bold",
        },
        padding: { top: 10, bottom: 20 }, // Space above and below the title
      },
      legend: {
        position: "top",
        labels: {
          color: "#fff", // White legend labels
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.dataset.label}: ${context.raw}k`,
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: "#aaa", // White x-axis labels
        },
        grid: {
          display: false,
        },
      },
      y: {
        ticks: {
          color: "#aaa", // White y-axis labels
          callback: (value) => `$${value}`,
        },
        grid: {
          color: "#444", // Grid line color
        },
        border: {
          dash: [5, 5], // Make lines dotted
        },
      },
    },
  };

  return <Bar data={data} options={options} />;
};

export default SalesOverview;
