import sql from './db';
import { WatchlistEntry } from '../models/watchlist-entry.model';

export async function getWatchlistByEmail(email: string): Promise<WatchlistEntry[]> {
  const result = await sql`
    SELECT watchlist
    FROM watchlists
    WHERE email = ${email}
  `;

  if (result.length === 0) {
    throw new Error(`No watchlist found for email: ${email}`);
  }

  const rawWatchlist = result[0].watchlist;

  // Runtime check could be added here if you want to validate the JSON shape
  return rawWatchlist as WatchlistEntry[];
}

export async function upsertWatchlistByEmail(email: string, name: string, watchlist: WatchlistEntry[]): Promise<void> {
  const jsonString = JSON.stringify(watchlist);
  await sql`
    INSERT INTO watchlists (email, name, watchlist)
    VALUES (${email}, ${name}, ${sql.json(JSON.parse(jsonString))})
    ON CONFLICT (email) DO UPDATE
    SET name = EXCLUDED.name,
        watchlist = EXCLUDED.watchlist
  `;
}

export async function getPgVersion(): Promise<string> {
  const result = await sql`select version()`;
  return result[0].version;
}