import React from 'react';
import { format } from 'date-fns';

interface ResultsTableProps {
  results: BacktestResult;
}

export const ResultsTable: React.FC<ResultsTableProps> = ({ results }) => {
  const calculateMetrics = () => {
    const totalPnL = results.equity[results.equity.length - 1] - results.equity[0];
    const winningTrades = results.positions.filter(
      p => p.exitPrice && p.exitPrice > p.entryPrice
    ).length;
    const totalTrades = results.positions.length;
    const winRate = (winningTrades / totalTrades) * 100;
    const maxDrawdown = Math.max(...results.drawdown);

    return {
      totalPnL,
      winRate,
      maxDrawdown,
      totalTrades,
    };
  };

  const metrics = calculateMetrics();

  return (
    <div className="bg-dark-200 rounded-lg shadow-md p-6">
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-dark-300 rounded-lg">
          <h3 className="text-sm font-medium text-gray-400">Total P&L</h3>
          <p className={`text-xl font-bold ${metrics.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            ${metrics.totalPnL.toFixed(2)}
          </p>
        </div>
        <div className="p-4 bg-dark-300 rounded-lg">
          <h3 className="text-sm font-medium text-gray-400">Win Rate</h3>
          <p className="text-xl font-bold text-blue-400">{metrics.winRate.toFixed(1)}%</p>
        </div>
        <div className="p-4 bg-dark-300 rounded-lg">
          <h3 className="text-sm font-medium text-gray-400">Max Drawdown</h3>
          <p className="text-xl font-bold text-red-400">{metrics.maxDrawdown.toFixed(1)}%</p>
        </div>
        <div className="p-4 bg-dark-300 rounded-lg">
          <h3 className="text-sm font-medium text-gray-400">Total Trades</h3>
          <p className="text-xl font-bold text-gray-100">{metrics.totalTrades}</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-dark-400">
          <thead className="bg-dark-300">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Entry Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Entry Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Exit Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Exit Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                P&L
              </th>
            </tr>
          </thead>
          <tbody className="bg-dark-200 divide-y divide-dark-400">
            {results.positions.map((position, index) => {
              const pnl = position.exitPrice 
                ? (position.exitPrice - position.entryPrice) * position.size
                : 0;
              
              return (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      position.type === 'long' ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'
                    }`}>
                      {position.type.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {format(position.entryTime, 'yyyy-MM-dd HH:mm')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    ${position.entryPrice.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {position.exitTime ? format(position.exitTime, 'yyyy-MM-dd HH:mm') : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {position.exitPrice ? `$${position.exitPrice.toFixed(2)}` : '-'}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                    pnl >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    ${pnl.toFixed(2)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};