import { format } from 'date-fns';

export type Timeframe = '1m' | '5m' | '15m' | '1h' | '4h' | '1d';
export type CandleData = [number, number, number, number, number, number]; // [timestamp, open, high, low, close, volume]

interface HistoricalDataParams {
  start: Date;
  end: Date;
  granularity: number;
}

const GRANULARITY_MAP: Record<Timeframe, number> = {
  '1m': 60,
  '5m': 300,
  '15m': 900,
  '1h': 3600,
  '4h': 14400,
  '1d': 86400,
};

const BASE_DELAY = 2000;
const MAX_RETRIES = 8;
const MAX_CONSECUTIVE_ERRORS = 5;
const DEFAULT_HOURS = 10; // New constant for default time range

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchWithRetry(url: string, options: RequestInit, retries = MAX_RETRIES): Promise<Response> {
  let lastError: Error | null = null;
  
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Accept': 'application/json',
          'User-Agent': 'Crypto Strategy Backtester',
          'CB-VERSION': '2021-06-17'
        }
      });
      
      if (response.status === 429) {
        const retryAfter = parseInt(response.headers.get('Retry-After') || '10');
        const waitTime = Math.max(retryAfter * 1000, BASE_DELAY * Math.pow(2, i));
        console.warn(`Rate limited. Waiting ${waitTime/1000}s before retry...`);
        await delay(waitTime);
        continue;
      }

      if (response.status === 404) {
        throw new Error('No data available for the specified time range');
      }

      if (response.status === 400) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Bad request: ${errorData.message || 'Invalid parameters'}`);
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        throw new Error('Invalid response format: expected JSON');
      }

      return response;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      console.warn(`Attempt ${i + 1}/${retries} failed:`, lastError.message);
      
      if (i === retries - 1) {
        throw lastError;
      }
      
      const waitTime = BASE_DELAY * Math.pow(2, i) * (0.5 + Math.random());
      await delay(waitTime);
    }
  }
  
  throw lastError || new Error('Max retries reached');
}

export async function fetchHistoricalData(
  timeframe: Timeframe,
  params?: Partial<HistoricalDataParams>
) {
  const granularity = GRANULARITY_MAP[timeframe];
  const end = params?.end || new Date();
  // Changed default time range to 10 hours
  const start = params?.start || new Date(end.getTime() - (DEFAULT_HOURS * 60 * 60 * 1000));

  if (start >= end) {
    throw new Error('Start date must be before end date');
  }

  const maxTimeRange = 250 * granularity * 1000;
  const chunks: { start: Date; end: Date }[] = [];
  let currentStart = new Date(start);

  while (currentStart < end) {
    const chunkEnd = new Date(Math.min(currentStart.getTime() + maxTimeRange, end.getTime()));
    chunks.push({ start: currentStart, end: chunkEnd });
    currentStart = new Date(chunkEnd.getTime() + granularity * 1000);
  }

  try {
    const allData: CandleData[] = [];
    let consecutiveErrors = 0;

    for (const chunk of chunks) {
      try {
        const url = `https://api.exchange.coinbase.com/products/BTC-USD/candles?start=${chunk.start.toISOString()}&end=${chunk.end.toISOString()}&granularity=${granularity}`;
        
        const response = await fetchWithRetry(url, {});
        const chunkData: CandleData[] = await response.json();

        if (!Array.isArray(chunkData)) {
          throw new Error('Invalid response format from Coinbase API');
        }

        const validChunkData = chunkData.filter(candle => 
          Array.isArray(candle) && 
          candle.length === 6 && 
          candle.every(value => typeof value === 'number' && !isNaN(value))
        );

        if (validChunkData.length === 0) {
          console.warn(`No valid data received for chunk ${chunk.start.toISOString()} - ${chunk.end.toISOString()}`);
          continue;
        }

        allData.push(...validChunkData);
        consecutiveErrors = 0;

        const waitTime = Math.max(BASE_DELAY, validChunkData.length * 10);
        await delay(waitTime);
      } catch (error) {
        consecutiveErrors++;
        console.error(`Error fetching chunk ${chunk.start.toISOString()} - ${chunk.end.toISOString()}:`, error);
        
        if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
          throw new Error('Too many consecutive errors while fetching data');
        }
        
        await delay(BASE_DELAY * Math.pow(2, consecutiveErrors));
      }
    }

    if (allData.length === 0) {
      throw new Error('No valid candle data received for the entire time range');
    }

    const uniqueData = Array.from(new Map(
      allData.map(candle => [candle[0], candle])
    ).values());

    return uniqueData
      .sort((a, b) => a[0] - b[0])
      .map(([timestamp, open, high, low, close, volume]) => ({
        timestamp: new Date(timestamp * 1000),
        open,
        high,
        low,
        close,
        volume
      }))
      .reverse();
  } catch (error) {
    console.error('Error fetching historical data:', error);
    throw new Error(
      `Failed to fetch BTC-USD data: ${error instanceof Error ? error.message : 'Unknown error'}. ` +
      'Please try again in a few moments.'
    );
  }
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
}