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

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, TypeScript Express!');
});

// Proxy endpoint
app.get('/api/crypto', async (req, res) => {
  const { code, from, to } = req.query;

  if (!code || !from || !to) {
    res.status(400).json({ error: 'Missing query parameters' });
  }

  try {
    const url = `${NDL_BASE_URL}?code=${code}&date.gte=${from}&date.lte=${to}&api_key=${NDL_API_KEY}`;
    console.log('Proxying to:', url); // helpful for debugging

    const response = await axios.get(url); // Axios automatically uses HTTPS
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching data from Nasdaq:', error);
    res.status(500).json({ error: 'Failed to fetch data from upstream API' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});