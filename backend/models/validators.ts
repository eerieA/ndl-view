import { WatchlistEntry } from './watchlist-entry.model';

export function isValidWatchlistEntry(entry: any): entry is WatchlistEntry {
    return (
        typeof entry === 'object' &&
        typeof entry.code === 'string' &&
        entry.code.length > 0
    );
}
