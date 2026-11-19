"use client";
import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const data = {
  labels: ["Gowns", "Trousers", "Skirts", "Tops", "Shoes"],
  datasets: [
    {
      data: [12, 51, 20, 45, 32], // Values for each label
      backgroundColor: ["#4B88D2", "#3FB0AC", "#A29BFE", "#F59E0B", "#2ECC71"], // Custom colors
      hoverBackgroundColor: ["#4B88D2AA", "#3FB0ACAA", "#A29BFEAA", "#F59E0BAA", "#2ECC71AA"],
      borderWidth: 0,
      borderColor: "transparent",
      borderRadius: 30,
      offset: 10,
      cutout: "85%", // To create a hollow center
    },
  ],
};

const options = {
  plugins: {
    legend: {
      display: false, // Hide default legend
    },
    tooltip: {
      enabled: true, // Show tooltips on hover
    },
  },
  cutoutPercentage: 75, // Hollow center size
};

const DoughnutProfile = () => {
  return (
    <div
      style={{
        display: "flex", // Flexbox for layout
        alignItems: "center", // Align items vertically
        justifyContent: "center", // Center content
        gap: "20px", // Add space between chart and legend
        padding: "10px", // Add some padding around
      }}
    >
      {/* Doughnut Chart */}
      <div style={{ position: "relative", width: "150px", height: "150px" }}>
        <Doughnut data={data} options={options} />
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            color: "#FFFFFF",
          }}
        >
          <h2 style={{ fontSize: "24px", margin: 0 }}>014</h2>
          <p style={{ fontSize: "12px", margin: 0 }}>Today</p>
        </div>
      </div>

      {/* Custom Legend */}
      <div>
        {data.labels.map((label, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "8px", // Space between items
              color: "#FFFFFF",
            }}
          >
            {/* Color Dot */}
            <div
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                backgroundColor: data.datasets[0].backgroundColor[index],
                marginRight: "10px", // Space between dot and text
              }}
            ></div>
            {/* Label and Value */}
            <div>
              <span style={{ fontSize: "14px" }}>{label}</span>
              <span style={{ fontSize: "14px", marginLeft: "8px" }}>
                {data.datasets[0].data[index]}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default DoughnutProfile;
