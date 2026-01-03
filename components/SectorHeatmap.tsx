
import React from 'react';
import { SectorData } from '../types';

interface Props {
  sectors: SectorData[];
}

const SectorHeatmap: React.FC<Props> = ({ sectors }) => {
  const getIntensityColor = (change: number) => {
    if (change > 2.5) return 'bg-emerald-700 text-emerald-50';
    if (change > 1.2) return 'bg-emerald-600 text-emerald-50';
    if (change > 0.3) return 'bg-emerald-500/30 text-emerald-100';
    if (change >= -0.3 && change <= 0.3) return 'bg-slate-800 text-slate-400';
    if (change > -1.2) return 'bg-rose-500/30 text-rose-100';
    if (change > -2.5) return 'bg-rose-600 text-rose-50';
    return 'bg-rose-700 text-rose-50';
  };

  // Sort sectors by percentage change descending
  const sortedSectors = [...sectors].sort((a, b) => b.percentChange - a.percentChange);
  
  // Split into top 8 (Gainers) and bottom 8 (Losers)
  const topGainers = sortedSectors.slice(0, 8);
  const topLosers = sortedSectors.slice(-8).reverse(); // Reverse to show the largest drop first

  const SectorGrid = ({ data, title, icon, accentColor }: { data: SectorData[], title: string, icon: string, accentColor: string }) => (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3 px-1">
        <span className="text-xl drop-shadow-md">{icon}</span>
        <h3 className={`text-sm font-black uppercase tracking-[0.25em] ${accentColor}`}>{title}</h3>
        <div className="h-px flex-1 bg-slate-800/50" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {data.map((sector, idx) => (
          <div 
            key={`${sector.name}-${idx}`}
            className={`relative p-5 rounded-2xl border border-white/5 transition-all hover:scale-[1.03] hover:shadow-2xl hover:z-10 cursor-default flex flex-col justify-between min-h-[220px] ${getIntensityColor(sector.percentChange)} shadow-xl`}
          >
            <div className="flex justify-between items-start mb-3">
              <h4 className="font-extrabold text-base tracking-tight leading-tight line-clamp-2 max-w-[78%]">
                {sector.name}
              </h4>
              <span className="text-sm font-black whitespace-nowrap bg-black/25 px-2 py-0.5 rounded shadow-inner backdrop-blur-sm">
                {sector.percentChange > 0 ? '+' : ''}{sector.percentChange}%
              </span>
            </div>
            
            <div className="mt-auto flex flex-col gap-4 bg-black/15 rounded-xl p-3 border border-white/5 backdrop-blur-sm">
              {/* Gainers List */}
              <div className="space-y-1.5">
                {sector.topGainers.slice(0, 3).map((gainer, i) => (
                  <div key={i} className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                      <span className="font-black truncate tracking-wide text-[11px]">{gainer.symbol}</span>
                    </div>
                    <span className="text-emerald-300 font-black ml-2 text-[11px]">{gainer.change}</span>
                  </div>
                ))}
              </div>
              
              <div className="h-px bg-white/10" />

              {/* Losers List */}
              <div className="space-y-1.5">
                {sector.topLosers.slice(0, 3).map((loser, i) => (
                  <div key={i} className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                      <span className="font-black truncate tracking-wide text-[11px]">{loser.symbol}</span>
                    </div>
                    <span className="text-rose-300 font-black ml-2 text-[11px]">{loser.change}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-16 mt-8">
      <SectorGrid 
        data={topGainers} 
        title="Top 8 Gainers" 
        icon="📈" 
        accentColor="text-emerald-400"
      />
      <SectorGrid 
        data={topLosers} 
        title="Top 8 Losers" 
        icon="📉" 
        accentColor="text-rose-400"
      />
    </div>
  );
};

export default SectorHeatmap;
