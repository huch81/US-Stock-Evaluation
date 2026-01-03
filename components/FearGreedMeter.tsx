
import React from 'react';
import Gauge from './Gauge';

interface Props {
  value: number;
  label: string;
}

const FearGreedMeter: React.FC<Props> = ({ value, label }) => {
  const segments = [
    { color: '#e11d48', stop: 25 }, // Extreme Fear
    { color: '#f59e0b', stop: 45 }, // Fear
    { color: '#94a3b8', stop: 55 }, // Neutral
    { color: '#10b981', stop: 75 }, // Greed
    { color: '#6366f1', stop: 100 }, // Extreme Greed
  ];

  return (
    <Gauge 
      value={value}
      min={0}
      max={100}
      label="Fear & Greed Index"
      subLabel={label}
      segments={segments}
    />
  );
};

export default FearGreedMeter;
