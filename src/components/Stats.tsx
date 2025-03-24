import React from 'react';
import {
  TrendingUp,
  DollarSign,
  Trophy,
  Target,
  BarChart3
} from 'lucide-react';
import type { BetStats } from '../types';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
);

interface StatsProps {
  stats: BetStats;
  profitHistory: number[];
}

export function Stats({ stats, profitHistory }: StatsProps) {
  const chartColors = {
    background: [
      '#2DD4BF',
      '#10B981',
      '#F59E0B',
      '#EF4444',
      '#8B5CF6',
      '#EC4899',
    ],
    line: '#2DD4BF',
    lineBackground: 'rgba(45, 212, 191, 0.1)'
  };

  const sportBreakdownData = {
    labels: Object.keys(stats.sportBreakdown),
    datasets: [{
      data: Object.values(stats.sportBreakdown),
      backgroundColor: chartColors.background,
    }],
  };

  const betTypeBreakdownData = {
    labels: Object.keys(stats.betTypeBreakdown).map(
      type => type.charAt(0).toUpperCase() + type.slice(1)
    ),
    datasets: [{
      data: Object.values(stats.betTypeBreakdown),
      backgroundColor: chartColors.background,
    }],
  };

  const profitHistoryData = {
    labels: profitHistory.map((_, i) => `Day ${i + 1}`),
    datasets: [{
      label: 'Cumulative Profit/Loss',
      data: profitHistory,
      borderColor: chartColors.line,
      backgroundColor: chartColors.lineBackground,
      fill: true,
    }],
  };

  const chartOptions = {
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#E5E7EB',
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: '#1A103C',
        borderColor: '#2DD4BF',
        borderWidth: 1,
        titleColor: '#E5E7EB',
        bodyColor: '#E5E7EB',
        padding: 12,
        displayColors: false
      }
    },
    scales: {
      y: {
        grid: {
          color: 'rgba(45, 212, 191, 0.1)',
        },
        ticks: {
          color: '#E5E7EB'
        }
      },
      x: {
        grid: {
          color: 'rgba(45, 212, 191, 0.1)',
        },
        ticks: {
          color: '#E5E7EB'
        }
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="arcade-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-arcade-cyan mb-1">Win Rate</p>
              <p className="text-3xl font-bold text-arcade-yellow">{stats.winRate.toFixed(1)}%</p>
            </div>
            <Trophy className="w-8 h-8 text-arcade-yellow" />
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm">
              <span className="text-green-500">Won: {stats.wonBets}</span>
              <span className="text-red-500">Lost: {stats.lostBets}</span>
              <span className="text-arcade-yellow">Pending: {stats.pendingBets}</span>
            </div>
          </div>
        </div>

        <div className="arcade-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-arcade-cyan mb-1">Net Profit/Loss</p>
              <p className={`text-3xl font-bold ${stats.totalProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                ${stats.totalProfit.toFixed(2)}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-arcade-cyan" />
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm">
              <span>ROI: {stats.roi.toFixed(2)}%</span>
              <span>Total Staked: ${stats.totalStaked.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="arcade-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-arcade-cyan mb-1">Average Odds</p>
              <p className="text-3xl font-bold text-arcade-yellow">{stats.averageOdds.toFixed(2)}</p>
            </div>
            <Target className="w-8 h-8 text-arcade-cyan" />
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm">
              <span>Total Bets: {stats.totalBets}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="arcade-card p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-arcade-cyan">
            <BarChart3 className="w-5 h-5" />
            Sport Breakdown
          </h3>
          <Doughnut data={sportBreakdownData} options={chartOptions} />
        </div>

        <div className="arcade-card p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-arcade-cyan">
            <BarChart3 className="w-5 h-5" />
            Bet Type Breakdown
          </h3>
          <Doughnut data={betTypeBreakdownData} options={chartOptions} />
        </div>

        <div className="arcade-card p-6 lg:col-span-3">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-arcade-cyan">
            <TrendingUp className="w-5 h-5" />
            Profit History
          </h3>
          <Line data={profitHistoryData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
}