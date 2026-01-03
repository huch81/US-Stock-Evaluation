
import React from 'react';

interface GaugeProps {
  value: number;
  min: number;
  max: number;
  label: string;
  subLabel?: string;
  segments: { color: string; stop: number }[];
  unit?: string;
}

const Gauge: React.FC<GaugeProps> = ({ value, min, max, label, subLabel, segments, unit = "" }) => {
  const strokeWidth = 16;
  const radius = 80;
  const center = { x: 100, y: 100 };
  
  const normalizedValue = Math.min(Math.max(value, min), max);
  const percentage = (normalizedValue - min) / (max - min);
  
  /**
   * Rotation logic for a semi-circle in the top half:
   * 0% (min) should be at 180 degrees (Left)
   * 100% (max) should be at 360 degrees (Right)
   * 50% (mid) should be at 270 degrees (Up)
   * 
   * We define the needle pointing RIGHT (0 degrees) by default in the SVG path,
   * then rotate it from 180 to 360 degrees.
   */
  const rotation = 180 + (percentage * 180);

  return (
    <div className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-3xl shadow-2xl flex flex-col items-center relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      
      <h3 className="text-slate-400 font-bold text-[10px] tracking-[0.3em] uppercase mb-6">{label}</h3>
      
      <div className="relative w-52 h-32">
        <svg viewBox="0 0 200 120" className="w-full h-full overflow-visible">
          <defs>
            <filter id="needleShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
              <feOffset dx="0" dy="1" result="offsetblur" />
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.5" />
              </feComponentTransfer>
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background Track */}
          <path
            d={`M ${center.x - radius} ${center.y} A ${radius} ${radius} 0 0 1 ${center.x + radius} ${center.y}`}
            fill="none"
            stroke="#1e293b"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          
          {/* Segmented Color Bands */}
          {segments.map((seg, i) => {
            const prevStop = i === 0 ? 0 : segments[i-1].stop;
            const startPercent = prevStop / 100;
            const endPercent = seg.stop / 100;
            
            const startAngle = 180 + (startPercent * 180);
            const endAngle = 180 + (endPercent * 180);
            
            const startX = center.x + radius * Math.cos((startAngle * Math.PI) / 180);
            const startY = center.y + radius * Math.sin((startAngle * Math.PI) / 180);
            const endX = center.x + radius * Math.cos((endAngle * Math.PI) / 180);
            const endY = center.y + radius * Math.sin((endAngle * Math.PI) / 180);
            
            return (
              <path
                key={i}
                d={`M ${startX} ${startY} A ${radius} ${radius} 0 0 1 ${endX} ${endY}`}
                fill="none"
                stroke={seg.color}
                strokeWidth={strokeWidth}
                className="opacity-80 transition-all duration-700 ease-in-out"
              />
            );
          })}

          {/* Scale Markers (Ticks) */}
          {[0, 0.25, 0.5, 0.75, 1].map((tick) => {
            const angle = 180 + (tick * 180);
            const innerR = radius - 12;
            const outerR = radius + 12;
            const x1 = center.x + innerR * Math.cos((angle * Math.PI) / 180);
            const y1 = center.y + innerR * Math.sin((angle * Math.PI) / 180);
            const x2 = center.x + outerR * Math.cos((angle * Math.PI) / 180);
            const y2 = center.y + outerR * Math.sin((angle * Math.PI) / 180);
            return (
              <line key={tick} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#334155" strokeWidth="1" />
            );
          })}

          {/* Needle Group */}
          <g 
            transform={`rotate(${rotation}, ${center.x}, ${center.y})`} 
            className="transition-transform duration-1000 cubic-bezier(0.34, 1.56, 0.64, 1)"
            filter="url(#needleShadow)"
          >
            {/* Tapered needle pointing RIGHT (0 deg). 
                Rotated 180 to 360 deg, it will point into the arc. 
                Length 85 reaches into the middle of the 16-width band at radius 80. */}
            <path 
              d={`M ${center.x} ${center.y - 2.5} L ${center.x + 85} ${center.y} L ${center.x} ${center.y + 2.5} Z`} 
              fill="#ffffff" 
            />
            {/* Center Hub */}
            <circle cx={center.x} cy={center.y} r="8" fill="#ffffff" />
            <circle cx={center.x} cy={center.y} r="4" fill="#0f172a" />
            <circle cx={center.x} cy={center.y} r="1.5" fill="#ffffff" />
          </g>
        </svg>

        {/* Value Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
          <div className="flex items-baseline gap-0.5">
            <span className="text-4xl font-black text-white leading-none tracking-tighter drop-shadow-sm">{value}</span>
            {unit && <span className="text-sm font-bold text-slate-500 mb-1">{unit}</span>}
          </div>
          {subLabel && (
            <div className="bg-slate-900/80 backdrop-blur-sm px-3 py-0.5 rounded-full mt-2 border border-slate-700/50">
              <span className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.1em]">{subLabel}</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Range Labels */}
      <div className="mt-4 w-full flex justify-between px-2 text-[10px] font-black text-slate-500 tracking-tighter tabular-nums">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
};

export default Gauge;
