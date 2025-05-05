
import { Request, Response } from 'express';

const mockCryptoList = {
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


export function handleMockCryptoMulti(req: Request, res: Response) {
    // Simulate rate limit headers like NDL
    res.setHeader('x-ratelimit-limit', '100');
    res.setHeader('x-ratelimit-remaining', '98');
    res.status(200).json(mockCryptoList);
}

export function handleMockCryptoSymbols(req: Request, res: Response) {
    const symbolList = mockCryptoList.datatable.data.map(entry => [entry[0]]); // Wrap each symbol in an array

    const mockResponse = {
        datatable: {
            data: symbolList
        }
    };

    res.setHeader('x-ratelimit-limit', '100');
    res.setHeader('x-ratelimit-remaining', '98');
    res.status(200).json(mockResponse);
}

const mockCryptoHistory = {
    "datatable": {
        "data": [
            [
                "BTCUSD",
                "2025-03-14",
                85487,
                81024,
                84686.5,
                84689,
                84686,
                84687,
                1050.2251459
            ],
            [
                "BTCUSD",
                "2025-03-13",
                84494,
                80101,
                81385.5,
                81385,
                81385,
                81386,
                411.81940106
            ],
            [
                "BTCUSD",
                "2025-03-12",
                84630,
                80843,
                83794.5,
                83794,
                83794,
                83795,
                1148.91876253
            ],
            [
                "BTCUSD",
                "2025-03-11",
                83820,
                77041,
                83262.5,
                83262,
                83262,
                83263,
                1861.20453889
            ],
            [
                "BTCUSD",
                "2025-03-10",
                84245,
                77793,
                79785.5,
                79781,
                79782,
                79789,
                2408.68751262
            ],
            [
                "BTCUSD",
                "2025-03-09",
                86823,
                81026,
                81173.5,
                81161,
                81173,
                81174,
                1476.81516983
            ],
            [
                "BTCUSD",
                "2025-03-08",
                87140,
                85469,
                86449.5,
                86454,
                86449,
                86450,
                860.07467072
            ],
            [
                "BTCUSD",
                "2025-03-07",
                91454,
                84876,
                86987.5,
                86990,
                86987,
                86988,
                1385.84636709
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

export function handleMockCryptoHist(req: Request, res: Response) {
    // Simulate rate limit headers like NDL
    res.setHeader('x-ratelimit-limit', '100');
    res.setHeader('x-ratelimit-remaining', '98');
    res.status(200).json(mockCryptoHistory);
}

const mockWatchlists: Record<string, { email: string; name: string; watchlist: any[] }> = {
    'mock@123.com': {
        email: 'test@123.com',
        name: 'test',
        watchlist: [
            {
                "code": "BTCUSD"
            },
            {
                "code": "ETHUSD"
            }
        ],
    }
};

export function handleMockWatchlist(req: Request, res: Response) {
    const email = req.query.email as string;

    const matchedKey = Object.keys(mockWatchlists).find(key => key.includes('mock'));

    if (!matchedKey) {
        res.status(404).json({ error: 'No static mock watchlist found' });
        return;
    }

    const mockData = mockWatchlists[matchedKey];

    res.json(mockData.watchlist);
}

export function handleMockWatchlistPost(req: Request, res: Response) {
    const { email, name, watchlist } = req.body;

    console.log('🧪 Received mock watchlist POST:', { email, name, watchlist });

    res.status(200).json({ message: 'Mock watchlist "saved" successfully!' });
}