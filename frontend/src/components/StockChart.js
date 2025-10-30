// src/components/StockChart.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Legend
} from 'chart.js';

const API_URL ="https://stock-market-dashboard-backend-omega.vercel.app"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const StockChart = ({ companyName }) => {
  const [chartData, setChartData] = useState(null);
  const [stockInfo, setStockInfo] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    if (companyName) {
      setError(null);
      setChartData(null);
      
      axios.get(`${API_URL}/api/stock/${companyName}`)
        .then(response => {
          const { historical, fiftyTwoWeekHigh, fiftyTwoWeekLow, averageVolume, sma50, prediction } = response.data;
          
          setStockInfo({
            high: fiftyTwoWeekHigh,
            low: fiftyTwoWeekLow,
            avgVolume: averageVolume,
            prediction: prediction,
          });

          const formattedData = {
            labels: historical.map(d => new Date(d.date).toLocaleDateString()),
            datasets: [
              {
                label: `${companyName} Stock Price (USD)`,
                data: historical.map(d => d.close),
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                yAxisID: 'y',
              },
              {
                label: '50-Day SMA',
                data: sma50,
                borderColor: 'rgb(255, 159, 64)',
                backgroundColor: 'rgba(255, 159, 64, 0.2)',
                pointRadius: 0,
                yAxisID: 'y',
              }
            ],
          };
          setChartData(formattedData);
        })
        .catch(err => {
          setError('Failed to fetch stock data.');
          console.error(err);
        });
    }
  }, [companyName]);

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: `${companyName} - Stock Performance` },
    },
    scales: { y: { type: 'linear', display: true, position: 'left' } }
  };

  return (
    <div className="chart-container">
      <h2>{companyName}</h2>
      {error && <p className="error">{error}</p>}
      {chartData ? (
        <>
          <div className="stock-info">
            <span><strong>52-Wk High:</strong> ${stockInfo.high?.toFixed(2)}</span>
            <span><strong>Avg Vol (3M):</strong> {stockInfo.avgVolume?.toLocaleString()}</span>
            <span><strong>52-Wk Low:</strong> ${stockInfo.low?.toFixed(2)}</span>
          </div>

          {stockInfo.prediction && (
            <div className="prediction-info">
              <span><strong>AI Next-Day Forecast:</strong> ${stockInfo.prediction.toFixed(2)}</span>
            </div>
          )}

          <Line options={options} data={chartData} />
        </>
      ) : (
        !error && <p>Loading chart...</p>
      )}
    </div>
  );
};

export default StockChart;