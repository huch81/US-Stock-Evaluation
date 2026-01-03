
import React, { useState, useEffect, useCallback } from 'react';
import { MarketState } from './types';
import { fetchMarketData } from './services/geminiService';
import MarketCard from './components/MarketCard';
import SectorHeatmap from './components/SectorHeatmap';
import FearGreedMeter from './components/FearGreedMeter';
import Gauge from './components/Gauge';

const App: React.FC = () => {
  const [marketState, setMarketState] = useState<MarketState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMarketData();
      setMarketState(data);
    } catch (err) {
      setError("Failed to load market data. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading && !marketState) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 p-6">
        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-400 font-medium animate-pulse tracking-widest text-xs uppercase">Terminal Initializing...</p>
      </div>
    );
  }

  const vixValue = parseFloat(marketState?.vix.value || "0");
  const vixSegments = [
    { color: '#10b981', stop: 30 },  // Low Risk (0-15)
    { color: '#f59e0b', stop: 50 },  // Moderate (15-25)
    { color: '#ef4444', stop: 70 },  // High Risk (25-35)
    { color: '#7f1d1d', stop: 100 }, // Extreme (35+)
  ];

  // Put Call Ratio segments logic: lower is bullish, higher is bearish
  // Typical range 0.5 to 1.5. Let's map 0.0 to 2.0 to the gauge (0-100%).
  const pcrValue = marketState?.putCallRatio.value || 0;
  const pcrPercent = (pcrValue / 2) * 100;
  const pcrSegments = [
    { color: '#6366f1', stop: 35 },  // Bullish (< 0.7)
    { color: '#10b981', stop: 50 },  // Neutral (0.7 - 1.0)
    { color: '#f59e0b', stop: 65 },  // Bearish (1.0 - 1.3)
    { color: '#ef4444', stop: 100 }, // Extreme Bearish (> 1.3)
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
            <span className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-500/20">US</span>
            Market Sentinel
          </h1>
          <p className="text-slate-400 mt-2 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            Live Session: <span className="text-slate-200">{marketState?.lastUpdated || "Updating..."}</span>
          </p>
        </div>
        <button 
          onClick={loadData}
          disabled={loading}
          className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-3 rounded-2xl font-black text-xs tracking-widest transition-all border border-slate-700 flex items-center gap-2 active:scale-95 disabled:opacity-50 shadow-2xl"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          )}
          REFRESH TERMINAL
        </button>
      </header>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/50 p-4 rounded-xl text-rose-400 mb-8 font-medium">
          {error}
        </div>
      )}

      {/* ROW 1: Major Indices with Trends */}
      <div className="mb-8">
        <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4 ml-1">Market Leaders</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {marketState?.indices.slice(0, 3).map((idx) => (
            <MarketCard key={idx.name} data={idx} />
          ))}
        </div>
      </div>

      {/* ROW 2: Gauges side by side - 3 items now */}
      <div className="mb-12">
        <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4 ml-1">Sentiment & Volatility</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {marketState && (
            <>
              <FearGreedMeter 
                value={marketState.fearGreed.value} 
                label={marketState.fearGreed.label} 
              />
              <Gauge 
                value={vixValue}
                min={0}
                max={50}
                label="CBOE Volatility Index (VIX)"
                subLabel={vixValue < 20 ? "Stable" : vixValue < 30 ? "Elevated" : "Turbulent"}
                segments={vixSegments}
              />
              <Gauge 
                value={pcrValue}
                min={0}
                max={2}
                label="Total Put/Call Ratio"
                subLabel={marketState.putCallRatio.label}
                segments={pcrSegments}
              />
            </>
          )}
        </div>
      </div>

      {/* Sector Heatmap Section */}
      <section className="mb-16">
        <div className="flex items-center gap-4 mb-8">
          <h2 className="text-xl font-black text-white uppercase tracking-wider">Sector Heatmap</h2>
          <div className="h-px flex-1 bg-slate-800" />
        </div>
        {marketState && <SectorHeatmap sectors={marketState.sectors} />}
      </section>

      {/* Sources Footer */}
      <footer className="border-t border-slate-800 pt-12 mt-12 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h4 className="text-slate-500 font-black text-[9px] uppercase tracking-[0.4em] mb-4">Reference Grounding</h4>
            <div className="flex flex-wrap gap-3">
              {marketState?.sources.map((source, i) => (
                <a 
                  key={i} 
                  href={source.uri} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[9px] bg-slate-900 hover:bg-slate-800 text-slate-500 hover:text-indigo-400 py-1.5 px-3 rounded-md transition-colors border border-slate-800 font-black uppercase"
                >
                  {source.title.length > 20 ? `${source.title.slice(0, 20)}...` : source.title}
                </a>
              ))}
            </div>
          </div>
          <div className="text-right">
             <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest">
              Built with Gemini Flash 3
             </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
