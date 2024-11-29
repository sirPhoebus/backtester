import React, { useState, useEffect } from 'react';
import { Chart } from './components/Chart';
import { FloatingChat } from './components/FloatingChat';
import { ResultsTable } from './components/ResultsTable';
import { TimeframeSelector } from './components/TimeframeSelector';
import { Backtester } from './utils/backtester';
import { Strategy } from './types/strategy';
import { LineChart } from 'lucide-react';
import { fetchHistoricalData, type Timeframe } from './services/coinbase';

function App() {
  // Changed initial timeframe to 1h
  const [timeframe, setTimeframe] = useState<Timeframe>('1h');
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [backtestResults, setBacktestResults] = useState<BacktestResult | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const historicalData = await fetchHistoricalData(timeframe);
        setData(historicalData.map(candle => ({
          timestamp: candle.timestamp,
          price: candle.close,
          open: candle.open,
          high: candle.high,
          low: candle.low,
          volume: candle.volume
        })));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
        console.error('Error loading data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [timeframe]);

  const handleStrategyCreate = (strategy: Strategy) => {
    if (!data.length) return;
    
    const strategyFn = new Function('price', 'timestamp', `
      const prices = this.data.map(d => d.price);
      const calculateMA = (prices, period) => {
        const slice = prices.slice(-period);
        return slice.reduce((sum, price) => sum + price, 0) / slice.length;
      };
      ${strategy.logic}
    `);

    const backtester = new Backtester(data, strategyFn.bind({ data }));
    const results = backtester.runBacktest();
    setBacktestResults(results);
  };

  return (
    <div className="min-h-screen bg-dark-100 text-gray-100 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <LineChart className="w-8 h-8 text-blue-400" />
            <h1 className="text-3xl font-bold text-gray-100">Crypto Strategy Backtester</h1>
          </div>
          <TimeframeSelector
            selectedTimeframe={timeframe}
            onTimeframeChange={setTimeframe}
          />
        </div>

        <div className="grid grid-cols-1 gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-200">BTC/USD Price Chart</h2>
            <div className="bg-dark-200 p-4 rounded-lg shadow-md">
              {isLoading ? (
                <div className="h-[400px] flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : error ? (
                <div className="h-[400px] flex items-center justify-center text-red-400">
                  <p>{error}</p>
                </div>
              ) : (
                <Chart 
                  data={data.map((d, i) => ({
                    ...d,
                    equity: backtestResults?.equity[i]
                  }))}
                  positions={backtestResults?.positions || []}
                  theme="dark"
                />
              )}
            </div>
          </div>
        </div>

        {backtestResults && (
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-200">Backtest Results</h2>
            <ResultsTable results={backtestResults} />
          </div>
        )}
      </div>

      <FloatingChat onStrategyCreate={handleStrategyCreate} />
    </div>
  );
}

export default App;