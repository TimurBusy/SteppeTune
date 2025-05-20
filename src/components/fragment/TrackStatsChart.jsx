import React, { useEffect, useState } from 'react';
import "../assets/scss/TrackStatsChart.scss";
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler
);

function TrackStatsChart({ trackId, userTracks }) {
  const [chartData, setChartData] = useState(null);
  const [range, setRange] = useState('day');
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [chartOptions, setChartOptions] = useState({});

  useEffect(() => {
    if (!selectedTrack) return;

    const token = localStorage.getItem("token");

    // 🎨 Статичные цвета
    const fillColor = "rgba(78, 204, 163, 0.2)";
    const lineColor = "rgba(78, 204, 163, 1)";
    const tickColor = "#ccc";

    fetch(`http://localhost:5000/api/tracks/${selectedTrack}/stats?range=${range}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        const labels = data.map(item => new Date(item.period).toLocaleDateString());
        const values = data.map(item => item.views);

        setChartData({
          labels,
          datasets: [{
            label: '',
            data: values,
            fill: true,
            borderColor: lineColor,
            backgroundColor: fillColor,
            tension: 0.3,
          }]
        });

        setChartOptions({
          responsive: true,
          plugins: {
            legend: { display: false },
          },
          scales: {
            x: {
              ticks: { color: tickColor },
              grid: { color: "rgba(255,255,255,0.05)" },
            },
            y: {
              ticks: { color: tickColor },
              grid: { color: "rgba(255,255,255,0.05)" },
            },
          },
        });
      });
  }, [selectedTrack, range]);

  return (
    <div className="stats-chart-wrapper">
      <div className="chart-controls">
        <select className="custom-select-menu" value={selectedTrack || ''} onChange={e => setSelectedTrack(e.target.value)}>
          <option value="" disabled>Select a track</option>
          {userTracks?.map(track => (
            <option key={track.id} value={track.id}>{track.name}</option>
          ))}
        </select>
        <select className="custom-select-menu" value={range} onChange={e => setRange(e.target.value)}>
          <option value="day">By day</option>
          <option value="month">By month</option>
          <option value="year">By year</option>
        </select>
      </div>

      {chartData ? (
        <div className="chart-container">
          <Line data={chartData} options={chartOptions} />
        </div>
      ) : (
        <p style={{ textAlign: 'center', color: '#ccc' }}>Select a track to display statistics</p>
      )}
    </div>
  );
}

export default TrackStatsChart;
