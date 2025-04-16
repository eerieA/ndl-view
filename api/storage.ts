import fs from 'fs/promises';
import path from 'path';

const filePath = path.resolve(__dirname, './watchlist.json');

export async function readWatchlist(): Promise<{ code: string }[]> {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
}

export async function writeWatchlist(watchlist: { code: string }[]): Promise<void> {
    await fs.writeFile(filePath, JSON.stringify(watchlist, null, 2), 'utf-8');
}
