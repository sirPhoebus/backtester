import React, { useEffect, useRef } from 'react';
import { createChart, ColorType } from 'lightweight-charts';

interface ChartProps {
  data: {
    timestamp: Date;
    price: number;
    open: number;
    high: number;
    low: number;
    volume: number;
    equity?: number;
  }[];
  positions: Position[];
  theme?: 'light' | 'dark';
}

export const Chart: React.FC<ChartProps> = ({ data, positions, theme = 'dark' }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const isDark = theme === 'dark';

    chartRef.current = createChart(chartContainerRef.current, {
      layout: {
        background: { color: isDark ? '#2c2e33' : '#ffffff' },
        textColor: isDark ? '#d1d5db' : '#333333',
      },
      grid: {
        vertLines: { color: isDark ? '#374151' : '#f0f0f0' },
        horzLines: { color: isDark ? '#374151' : '#f0f0f0' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
    });

    const candlestickSeries = chartRef.current.addCandlestickSeries({
      upColor: '#10b981',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: '#10b981',
      wickDownColor: '#ef4444',
    });

    const volumeSeries = chartRef.current.addHistogramSeries({
      color: '#3b82f6',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '',
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
    });

    const equitySeries = chartRef.current.addLineSeries({
      color: '#8b5cf6',
      lineWidth: 1,
      priceScaleId: 'right',
    });

    candlestickSeries.setData(
      data.map((d) => ({
        time: d.timestamp.getTime() / 1000,
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.price,
      }))
    );

    volumeSeries.setData(
      data.map((d) => ({
        time: d.timestamp.getTime() / 1000,
        value: d.volume,
        color: d.price >= d.open ? '#10b981' : '#ef4444',
      }))
    );

    if (data[0]?.equity) {
      equitySeries.setData(
        data.map((d) => ({
          time: d.timestamp.getTime() / 1000,
          value: d.equity || 0,
        }))
      );
    }

    positions.forEach((position) => {
      candlestickSeries.setMarkers([
        {
          time: position.entryTime.getTime() / 1000,
          position: 'belowBar',
          color: position.type === 'long' ? '#10b981' : '#ef4444',
          shape: 'arrowUp',
          text: position.type === 'long' ? 'LONG' : 'SHORT',
        },
        ...(position.exitTime ? [{
          time: position.exitTime.getTime() / 1000,
          position: 'aboveBar',
          color: '#ef4444',
          shape: 'arrowDown',
          text: 'EXIT',
        }] : []),
      ]);
    });

    const handleResize = () => {
      if (chartContainerRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chartRef.current.remove();
    };
  }, [data, positions, theme]);

  return <div ref={chartContainerRef} className="w-full h-[400px]" />;
};