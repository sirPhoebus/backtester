export interface Position {
  type: 'long' | 'short';
  entryPrice: number;
  entryTime: Date;
  exitPrice?: number;
  exitTime?: Date;
  size: number;
}

export interface BacktestResult {
  positions: Position[];
  pnl: number[];
  timestamps: Date[];
  equity: number[];
  drawdown: number[];
}

export interface Strategy {
  name: string;
  description: string;
  logic: string;
  parameters: Record<string, number>;
}