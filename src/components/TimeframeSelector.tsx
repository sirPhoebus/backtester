import React from 'react';
import { cn } from '../lib/utils';
import type { Timeframe } from '../services/coinbase';

interface TimeframeSelectorProps {
  selectedTimeframe: Timeframe;
  onTimeframeChange: (timeframe: Timeframe) => void;
}

export const TimeframeSelector: React.FC<TimeframeSelectorProps> = ({
  selectedTimeframe,
  onTimeframeChange,
}) => {
  const timeframes: Timeframe[] = ['1m', '5m', '15m', '1h', '4h', '1d'];

  return (
    <div className="flex space-x-2">
      {timeframes.map((timeframe) => (
        <button
          key={timeframe}
          onClick={() => onTimeframeChange(timeframe)}
          className={cn(
            "px-3 py-1 rounded-md text-sm font-medium transition-colors",
            selectedTimeframe === timeframe
              ? "bg-blue-600 text-white"
              : "bg-dark-300 text-gray-300 hover:bg-dark-400"
          )}
        >
          {timeframe}
        </button>
      ))}
    </div>
  );
};