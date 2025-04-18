import express, { Request, Response } from 'express';
import axios from 'axios';
import cors from 'cors';
import dotenv from 'dotenv';

import { writeWatchlist, readWatchlist } from './storage';
import { isValidWatchlistEntry } from './models/validators';

dotenv.config();
const app = express();
app.use(express.json());
const port = process.env.PORT || 3000;

// For local dev only
app.use(cors());

const NDL_API_KEY = process.env.NDL_API_KEY || 'no-key';
const NDL_BASE_URL = 'https://data.nasdaq.com/api/v3/datatables/QDL/BITFINEX';
const LOCAL_BASE_URL = `http://localhost:${port}`;

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, TypeScript Express!');
});

// Proxy endpoint
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
  if (code?.includes('mock')) {
    if (codeArray.length > 1) {
      console.log("redir to internal mock-api/crypto-multi");
      return res.redirect(`${LOCAL_BASE_URL}/mock-api/crypto-multi`);
    } else {
      res.status(500).json({ error: 'No mock endpoint for this request' });
      return;
    }
  }

  try {
    const cleanedCode = codeArray.join(',');  // Extra safty measure in parsing
    const url = `${NDL_BASE_URL}?code=${cleanedCode}&date.gte=${from}&date.lte=${to}&api_key=${NDL_API_KEY}`;
    console.log('Proxying to:', url);

    const response = await axios.get(url);

    // Relay select headers (NDL rate limit info)
    const selectedHeaders = ['x-ratelimit-limit', 'x-ratelimit-remaining'];
    for (const headerName of selectedHeaders) {
      const headerValue = response.headers[headerName];
      if (headerValue !== undefined) {
        res.setHeader(headerName, headerValue);
      }
    }

    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Error fetching data from Nasdaq:', error);
    res.status(500).json({ error: 'Failed to fetch data from upstream API' });
  }
});

// Dummy data endpoint
app.get('/mock-api/crypto-multi', (req: Request, res: Response) => {
  const dummyData = {
    "datatable": {
      "data": [
        [
          "ZECUSD",
          "2025-04-14",
          34.795,
          26.667,
          30.17,
          30.119,
          30.119,
          30.221,
          7376.64624749
        ],
        [
          "ZECBTC",
          "2025-04-14",
          0.000403,
          0.00031341,
          0.000362995,
          0.00036353,
          0.00035531,
          0.00037068,
          3114.57318898
        ],
        [
          "RRTUSD",
          "2025-04-14",
          0.8252,
          0.8252,
          0.86014,
          0.8252,
          0.82029,
          0.89999,
          33.62159216
        ],
        [
          "LTCUSD",
          "2025-04-14",
          80.54,
          75.729,
          76.9255,
          76.93,
          76.881,
          76.97,
          9944.35215942
        ],
        [
          "LTCBTC",
          "2025-04-14",
          0.00093796,
          0.0009023,
          0.00091097,
          0.00090936,
          0.0009106,
          0.00091134,
          7087.45081847
        ],
        [
          "ETHUSD",
          "2025-04-14",
          1689.8,
          1582.1,
          1620.95,
          1620.1,
          1620.9,
          1621,
          8675.49927813
        ],
        [
          "ETHBTC",
          "2025-04-14",
          0.019921,
          0.019002,
          0.01918,
          0.019177,
          0.019177,
          0.019183,
          5087.27628031
        ],
        [
          "ETCUSD",
          "2025-04-14",
          15.804,
          15.123,
          15.2735,
          15.298,
          15.267,
          15.28,
          2255.68710639
        ],
        [
          "ETCBTC",
          "2025-04-14",
          0.000186,
          0.00018023,
          0.000180695,
          0.00018023,
          0.00018053,
          0.00018086,
          485.99953082
        ],
        [
          "BTCUSD",
          "2025-04-14",
          85727,
          83167,
          84517.5,
          84530,
          84517,
          84518,
          186.06922417
        ]
      ],
      "columns": [
        {
          "name": "code",
          "type": "text"
        },
        {
          "name": "date",
          "type": "Date"
        },
        {
          "name": "high",
          "type": "double"
        },
        {
          "name": "low",
          "type": "double"
        },
        {
          "name": "mid",
          "type": "double"
        },
        {
          "name": "last",
          "type": "double"
        },
        {
          "name": "bid",
          "type": "double"
        },
        {
          "name": "ask",
          "type": "double"
        },
        {
          "name": "volume",
          "type": "double"
        }
      ]
    },
    "meta": {
      "next_cursor_id": null
    }
  };

  // Simulate rate limit headers like NDL
  res.setHeader('x-ratelimit-limit', '100');
  res.setHeader('x-ratelimit-remaining', '98');
  res.status(200).json(dummyData);
});

app.get('/api/watchlist', async (req, res) => {
  try {
    const watchlist = await readWatchlist();

    if (
      !Array.isArray(watchlist) ||
      !watchlist.every(isValidWatchlistEntry)
    ) {
      res.status(500).json({ error: 'Corrupted watchlist format from server' });
      return;
    }

    res.json(watchlist);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load watchlist' });
  }
});

app.post('/api/watchlist', async (req, res) => {
  try {
    const newWatchlist = req.body;
    if (!Array.isArray(newWatchlist) ||
      !newWatchlist.every(isValidWatchlistEntry)) {
      res.status(400).json({ error: 'Invalid watchlist format' });
      return;
    }

    await writeWatchlist(newWatchlist);
    res.status(200).json({ message: 'Watchlist updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update watchlist' });
  }
});

app.patch('/api/watchlist', async (req, res) => {
  const { code, action } = req.body;

  if (!code || !['add', 'remove'].includes(action)) {
    res.status(400).json({ error: 'Invalid payload' });
    return;
  }

  if (!isValidWatchlistEntry({ code })) {
    res.status(400).json({ error: 'Invalid watchList entry' });
    return;
  }

  try {
    const current = await readWatchlist();
    const exists = current.find(e => e.code === code);

    let updated;

    if (action === 'add' && !exists) {
      updated = [...current, { code }];
    } else if (action === 'remove' && exists) {
      updated = current.filter(e => e.code !== code);
    } else {
      res.status(200).json({ message: 'No changes made' }); // nothing to update
      return;
    }

    await writeWatchlist(updated);
    res.status(200).json({ message: 'Watchlist updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error updating watchlist' });
  }
});

app.listen(port, () => {
  console.log(`Server running at: ${LOCAL_BASE_URL}`);
});