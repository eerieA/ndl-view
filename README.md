# NDLView

This project is a web UI facading [Nasdaq Data Link API](https://www.nasdaq.com/solutions/data/nasdaq-data-link/api), crypto currency table endpoint.

## Features

A list of what this app does.

- Displays a list of cryptos with info from previous day.
- Displays a ranked "top 5" list based on previous day's prices.
- Displays simple market summary statistics from previous day.

# Docs

## Development server

Using a super simple Express backend to hide API key from browser, and provide mock data for frontend iterations.

Frontend `ng serve`.

Backend `cd api` then `npm run dev`. This uses Nodemon for hot reloading.


## Implementation notes

### class CryptoEntry

#### Data validation

Guarding against wrong types and illogical ranges. For example, if `high` $<$ `low`, it will throw an error in console with a message like this:
    
    Error: high (10.0) should be > low (11.0).

## Acknowledgements

Crypto currency icons are by [cryptocurrency-icons](https://github.com/spothq/cryptocurrency-icons), under [CC0-1.0 license](https://creativecommons.org/publicdomain/zero/1.0/).