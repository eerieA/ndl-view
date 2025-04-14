import express, { Request, Response } from 'express';
import axios from 'axios';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
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
    console.log('Proxying to:', url); // helpful for debugging

    const response = await axios.get(url); // Axios automatically uses HTTPS
    res.json(response.data);
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
          "ZRXUSD",
          "2025-04-11",
          0.23745,
          0.22713,
          0.23522,
          0.23559,
          0.23499,
          0.23545,
          44910.22879052
        ],
        [
          "TRXUSD",
          "2025-04-11",
          0.24286,
          0.23436,
          0.24339,
          0.24261,
          0.24323,
          0.24355,
          113806.64715645
        ],
        [
          "MKRUSD",
          "2025-04-11",
          1347.4,
          1284.2,
          1330.05,
          1329.4,
          1329.3,
          1330.8,
          41.75022033
        ],
        [
          "ETHUSD",
          "2025-04-11",
          1588.7,
          1503.5,
          1567.15,
          1567.1,
          1567.1,
          1567.2,
          12556.43345319
        ],
        [
          "DSHBTC",
          "2025-04-11",
          0.00025312,
          0.00024476,
          0.000246655,
          0.00024656,
          0.00024611,
          0.0002472,
          2063.65365584
        ],
        [
          "BTCUSD",
          "2025-04-11",
          84232,
          78888,
          83407.5,
          83429,
          83407,
          83408,
          430.68435676
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

  res.json(dummyData);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});