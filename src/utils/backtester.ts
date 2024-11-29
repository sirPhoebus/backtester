import Decimal from 'decimal.js';

export class Backtester {
  private data: { timestamp: Date; price: number }[];
  private strategy: (price: number, timestamp: Date) => boolean;
  private positions: Position[] = [];
  private equity: number[] = [];
  private initialCapital: number;

  constructor(data: { timestamp: Date; price: number }[], strategy: (price: number, timestamp: Date) => boolean, initialCapital: number = 10000) {
    this.data = data;
    this.strategy = strategy;
    this.initialCapital = initialCapital;
  }

  public runBacktest(): BacktestResult {
    let currentEquity = new Decimal(this.initialCapital);
    const results: BacktestResult = {
      positions: [],
      pnl: [],
      timestamps: [],
      equity: [],
      drawdown: []
    };

    let highWaterMark = currentEquity;

    this.data.forEach((candle, index) => {
      const shouldEnter = this.strategy(candle.price, candle.timestamp);
      
      if (shouldEnter && !this.positions.length) {
        this.positions.push({
          type: 'long',
          entryPrice: candle.price,
          entryTime: candle.timestamp,
          size: currentEquity.div(candle.price).toNumber()
        });
      } else if (!shouldEnter && this.positions.length) {
        const position = this.positions[this.positions.length - 1];
        position.exitPrice = candle.price;
        position.exitTime = candle.timestamp;
        
        const pnl = new Decimal(position.size)
          .mul(candle.price - position.entryPrice)
          .toNumber();
        
        currentEquity = currentEquity.plus(pnl);
        results.positions.push({ ...position });
      }

      if (currentEquity.greaterThan(highWaterMark)) {
        highWaterMark = currentEquity;
      }

      const drawdown = highWaterMark.minus(currentEquity)
        .div(highWaterMark)
        .mul(100)
        .toNumber();

      results.timestamps.push(candle.timestamp);
      results.equity.push(currentEquity.toNumber());
      results.drawdown.push(drawdown);
    });

    return results;
  }
}