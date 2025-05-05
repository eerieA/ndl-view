import express, { Request, Response } from 'express';
import axios, { AxiosResponseHeaders } from 'axios';
import cors from 'cors';
import dotenv from 'dotenv';

import sql from '../services/db';
import { getWatchlistByEmail, upsertWatchlistByEmail } from '../services/watchlist.service';
import { isValidWatchlistEntry } from '../models/validators';
import {
  handleMockCryptoMulti,
  handleMockCryptoSymbols,
  handleMockCryptoHist,
  handleMockWatchlist,
  handleMockWatchlistPost
} from './mock-handlers';

dotenv.config();
const app = express();
app.use(express.json());
const port = process.env.PORT || 3000;

// For local dev only
app.use(cors());

const NDL_API_KEY = process.env.NDL_API_KEY || 'no-key';
const NDL_BASE_URL = 'https://data.nasdaq.com/api/v3/datatables/QDL/BITFINEX';
const LOCAL_BASE_URL = `http://localhost:${port}`;
const USE_MOCK_DATA = true; // Global-ish mock data flag

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, TypeScript Express!');
});

// ========================================================================== //
// NDL proxies

// For sending custom headers
// If not do this, custom headers will be silently blocked
app.use(cors({
  origin: '*',  // or your frontend domain
  exposedHeaders: ['x-ratelimit-limit', 'x-ratelimit-remaining']
}));

app.get('/api/crypto', async (req, res) => {
  const { code, from, to } = req.query as {
    code?: string;
    from?: string;
    to?: string;
  };

  if (!code || !from || !to) {
    res.status(400).json({ error: 'Missing query parameters' });
    return;
  }

  // For DEBUG
  const codeArray = code.split(',').map(c => c.trim());
  if (USE_MOCK_DATA) {
    if (codeArray.length > 1) {
      console.log("Using internal mock data for cryptos");
      return handleMockCryptoMulti(req, res);
    } else {
      res.status(500).json({ error: 'No mock data for this request' });
      return;
    }
  }

  try {
    const cleanedCode = codeArray.join(',');  // Extra safty measure in parsing
    const url = `${NDL_BASE_URL}?code=${cleanedCode}&date.gte=${from}&date.lte=${to}&api_key=${NDL_API_KEY}`;
    console.log('Proxying to:', url);

    const response = await axios.get(url);

    // Relay select headers (NDL rate limit info)
    // res.setHeader('Access-Control-Expose-Headers', 'x-ratelimit-limit, x-ratelimit-remaining');
    relayHeaders(response.headers, res, ['x-ratelimit-limit', 'x-ratelimit-remaining']);

    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Error fetching data from Nasdaq:', error);
    res.status(500).json({ error: 'Failed to fetch data from upstream API' });
  }
});

app.get('/api/crypto/symbols', async (req, res) => {
  const { date } = req.query as {
    date?: string;
  };

  if (!date) {
    res.status(400).json({ error: 'Missing required query parameter: date' });
    return;
  }

  // For DEBUG
  if (USE_MOCK_DATA) {
    console.log("Using internal mock data for crypto symbols");
    return handleMockCryptoSymbols(req, res);
  }

  try {
    const url = `${NDL_BASE_URL}?qopts.columns=code&date=${date}&api_key=${NDL_API_KEY}`;
    console.log('Proxying to:', url);

    const response = await axios.get(url);

    // Relay select headers (NDL rate limit info)
    relayHeaders(response.headers, res, ['x-ratelimit-limit', 'x-ratelimit-remaining']);

    res.status(response.status).json(response.data); // or format it a bit if you want
  } catch (error) {
    console.error('Error fetching crypto symbols:', error);
    res.status(500).json({ error: 'Failed to fetch crypto symbols' });
  }
});

app.get('/api/crypto/history', async (req, res) => {
  const { code, from, to } = req.query;

  if (!code || !from || !to) {
    res.status(400).json({ error: 'Missing required query params' });
    return;
  }
  
  // For DEBUG
  if (USE_MOCK_DATA) {
    console.log(`Using internal mock data for crypto history of ${code}`);
    return handleMockCryptoHist(req, res);
  }

  try {
    const url = `${NDL_BASE_URL}?date.gte=${from}&date.lte=${to}&code=${code}&api_key=${NDL_API_KEY}`;
    const response = await axios.get(url);

    // Relay select headers (NDL rate limit info)
    relayHeaders(response.headers, res, ['x-ratelimit-limit', 'x-ratelimit-remaining']);

    res.status(200).json(response.data);
  } catch (err) {
    console.error('Failed to fetch history data:', err);
    res.status(500).json({ error: 'Failed to fetch crypto history data' });
  }
});

app.get('/api/watchlist/', async (req, res) => {
  const email = req.query.email as string;

  if (!email) {
    res.status(400).json({ error: 'Missing email query parameter' });
    return;
  }

  if (USE_MOCK_DATA) {
    console.log("Using internal mock data for watchlist GET");
    return handleMockWatchlist(req, res);
  }

  try {
    const watchlist = await getWatchlistByEmail(email);

    if (
      !Array.isArray(watchlist) ||
      !watchlist.every(isValidWatchlistEntry)
    ) {
      res.status(500).json({ error: 'Corrupted watchlist format from server' });
      return;
    }

    res.json(watchlist);
  } catch (error: unknown) {
    // Narrowing the type in order to access its property
    if (error instanceof Error) {
      res.status(500).send(error.message);
    } else {
      res.status(500).json({ error: 'Unknown error occurred while querying remote database' });
    }
  }
});

app.post('/api/watchlist/', async (req, res) => {
  const { email, name, watchlist } = req.body as {
    email?: string;
    name?: string;
    watchlist?: any;
  };

  if (
    !email ||
    !name ||
    !Array.isArray(watchlist) ||
    !watchlist.every(isValidWatchlistEntry)
  ) {
    res.status(400).json({ error: 'Missing or invalid request body fields: email, name, or watchlist format' });
    return;
  }

  if (USE_MOCK_DATA) {
    console.log("Using internal mock data watchlist POST");
    return handleMockWatchlistPost(req, res);
  }

  try {
    await upsertWatchlistByEmail(email, name, watchlist);
    res.status(200).json({ message: 'Watchlist saved successfully!' });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).send(error.message);
    } else {
      res.status(500).json({ error: 'Unknown error occurred while saving watchlist' });
    }
  }
});

app.listen(port, () => {
  console.log(`Server running at: ${LOCAL_BASE_URL}`);
});

process.on('SIGINT', async () => {
  console.log('Received SIGINT. Closing database connection...');
  await sql.end({ timeout: 2 });
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Received SIGTERM. Closing database connection...');
  await sql.end({ timeout: 2 });
  process.exit(0);
});


// ========================================================================== //
// Helpers

function relayHeaders(
  sourceHeaders: Record<string, any>,
  targetResponse: Response,
  headerNames: string[]
) {
  headerNames.forEach((name) => {
    const value = sourceHeaders[name.toLowerCase()];
    if (value != null) {
      targetResponse.setHeader(name, value.toString());
    }
  });
}
