import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface TrendChartProps {
  data: number[];
  labels: string[];
  title: string;
  color?: string;
}

export const TrendChart: React.FC<TrendChartProps> = ({ 
  data, 
  labels, 
  title,
  color = '#3B82F6' 
}) => {
  const chartData = {
    labels,
    datasets: [
      {
        label: title,
        data,
        borderColor: color,
        backgroundColor: `${color}20`,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: title,
        color: '#9C9FA4',
      },
    },
    scales: {
      y: {
        grid: {
          color: '#262A36',
        },
        ticks: {
          color: '#9C9FA4',
        },
      },
      x: {
        grid: {
          color: '#262A36',
        },
        ticks: {
          color: '#9C9FA4',
        },
      },
    },
  };

  return (
    <div className="bg-[#262A36] p-4 rounded-lg">
      <Line data={chartData} options={options} />
    </div>
  );
};