# NDLView

This project is a web UI accessing [Nasdaq Data Link API](https://www.nasdaq.com/solutions/data/nasdaq-data-link/api), crypto currency table endpoint.

Frontend uses [Angular](https://github.com/angular/angular-cli). UI framework [Angular Material](https://material.angular.io/).

## Features

A list of what this app does.

- Displays a list of cryptos with info from previous day.
- Displays a ranked "top 5" list based on previous day's prices.
- Displays simple market summary statistics from previous day.
- Let user add cryptos from the top list to a personal watchlist.
- Let user remove cryptos from the watchlist.
- Let user filter the crypto list based on the watchlist.

## Screenshot
<img alt="Screenshot" src="https://live.staticflickr.com/65535/54458744302_d88e3d5e16_b.jpg" width="500">

# Docs

## Development servers

Using a super simple Express backend to hide API key from browser, and provide mock data for frontend iterations.

- `cd frontend` then `ng serve` for frontend.

- `cd backend` then `npm run dev` for backend. This uses Nodemon for hot reloading.

## Tools and scripts

`npm run cp-mdl`: Synchronize shared models. This command is defined in *package.json* in root.

## Implementation notes

### Type consistency

There are model classes shared between client side and server side for type consistency. See *./shared/models* for details.

### Data validation

#### class CryptoEntry

On client side. Guarding against wrong types and illogical ranges. For example, if `high` $<$ `low`, it will throw an error in console with a message like this:
    
    Error: high (10.0) should be > low (11.0).

#### class WatchlistEntry

On server side. Guarding against wrong types and illogical ranges. `isValidWatchlistEntry()` in *validators.ts*.

### Synch patterns

#### class WatchlistService

Maintains single source of truth for the watchlist. Inherently complies to the Observer pattern.

# Acknowledgements

Crypto currency icons are by [cryptocurrency-icons](https://github.com/spothq/cryptocurrency-icons), under [CC0-1.0 license](https://creativecommons.org/publicdomain/zero/1.0/).