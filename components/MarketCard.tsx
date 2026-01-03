
import React from 'react';
import { IndexData } from '../types';

interface Props {
  data: IndexData;
}

const MarketCard: React.FC<Props> = ({ data }) => {
  const isPositive = data.isPositive;
  
  // Calculate SVG path for sparkline
  const minTrend = Math.min(...data.trend);
  const maxTrend = Math.max(...data.trend);
  const range = maxTrend - minTrend || 1;
  const width = 200;
  const height = 40;
  
  const points = data.trend.map((val, i) => {
    const x = (i / (data.trend.length - 1)) * width;
    const y = height - ((val - minTrend) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="bg-slate-800/60 border border-slate-700/50 p-6 rounded-3xl shadow-2xl hover:bg-slate-800 transition-all flex flex-col h-full">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-slate-400 font-bold text-xs tracking-widest uppercase">{data.name}</h3>
        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black ${isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
          {isPositive ? '▲' : '▼'} {data.percentChange}
        </span>
      </div>
      
      <div className="flex flex-col mb-6">
        <span className="text-3xl font-black text-white tracking-tight">{data.value}</span>
        <span className={`text-xs font-bold mt-1 ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
          {isPositive ? '+' : ''}{data.change} ({data.percentChange})
        </span>
      </div>

      <div className="mt-auto pt-4 border-t border-slate-700/30">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-12 overflow-visible">
          <polyline
            fill="none"
            stroke={isPositive ? '#10b981' : '#f43f5e'}
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
            points={points}
          />
          {/* Subtle glow effect for the line */}
          <polyline
            fill="none"
            stroke={isPositive ? '#10b981' : '#f43f5e'}
            strokeWidth="6"
            strokeLinejoin="round"
            strokeLinecap="round"
            points={points}
            className="opacity-20 blur-sm"
          />
        </svg>
      </div>
    </div>
  );
};

export default MarketCard;
