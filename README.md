# Crypto Strategy Backtester

A powerful web application for backtesting cryptocurrency trading strategies using real-time data from Coinbase. Built with React, TypeScript, and Tailwind CSS.

## Features

- 🤖 AI-powered strategy creation through chat interface
- 📈 Real-time BTC/USD price data from Coinbase
- 📊 Interactive price charts with multiple timeframes
- 💹 Strategy backtesting with performance metrics
- 🌓 Dark mode interface
- 📱 Responsive design
- 💬 Floating chat interface for strategy creation

## Project Structure

```
src/
├── components/           # React components
│   ├── Chart.tsx        # Price and volume chart component
│   ├── ChatBot.tsx      # Chat interface for strategy creation
│   ├── FloatingChat.tsx # Floating chat window
│   ├── ResultsTable.tsx # Backtest results display
│   └── TimeframeSelector.tsx # Timeframe selection controls
├── services/            # External API integrations
│   ├── anthropic.ts     # Claude AI integration
│   └── coinbase.ts      # Coinbase market data fetching
├── types/               # TypeScript type definitions
│   └── strategy.ts      # Strategy and backtest types
├── utils/               # Utility functions
│   └── backtester.ts    # Strategy backtesting engine
└── lib/                 # Shared utilities
    └── utils.ts         # Common utility functions
```

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example`:
   ```
   VITE_ANTHROPIC_API_KEY=your-anthropic-api-key-here
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## Technology Stack

- **Frontend Framework**: React with TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Lightweight Charts
- **AI Integration**: Claude AI (Anthropic)
- **Market Data**: Coinbase API
- **Build Tool**: Vite
- **State Management**: React Hooks
- **Date Handling**: date-fns
- **Number Precision**: decimal.js

## Features in Detail

### Strategy Creation
- AI-powered chat interface for creating trading strategies
- Support for various strategy types (moving averages, breakouts, etc.)
- Custom strategy parameter configuration

### Chart Features
- Candlestick chart with volume indicator
- Multiple timeframes (1m, 5m, 15m, 1h, 4h, 1d)
- Trade entry/exit markers
- Equity curve overlay

### Backtesting
- Historical price data from Coinbase
- Performance metrics calculation
- Trade list with entry/exit points
- Profit/loss tracking
- Maximum drawdown calculation

### User Interface
- Minimizable chat window
- Dark theme optimized for trading
- Responsive design for all screen sizes
- Real-time data updates

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - feel free to use this project for any purpose.