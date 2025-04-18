import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { WatchlistEntry } from '../models/watchlist-entry.model';

@Injectable({
  providedIn: 'root'
})
export class WatchlistService {
  private readonly _watchlist = new BehaviorSubject<WatchlistEntry[]>([]);
  readonly watchlist$ = this._watchlist.asObservable();

  constructor(
    private http: HttpClient
  ) { }

  add(entry: WatchlistEntry) {
    const current = this._watchlist.getValue();
    if (!current.find(e => e.code === entry.code)) {
      const updated = [...current, entry];
      this._watchlist.next(updated);
      this.saveWatchlist();
    }
  }

  remove(code: string) {
    const updated = this._watchlist.getValue().filter(e => e.code !== code);
    this._watchlist.next(updated);
    this.saveWatchlist();
  }

  isWatched(code: string): boolean {
    return this._watchlist.getValue().some(e => e.code === code);
  }

  getWatchlist(): void {
    this.http.get<WatchlistEntry[]>('/api/watchlist').subscribe({
      next: (data) => {
        this._watchlist.next(data);
      },
      error: (err) => {
        console.error('Failed to fetch watchlist:', err);
      }
    });
  }

  saveWatchlist(): void {
    this.http.post('/api/watchlist', this._watchlist.getValue()).subscribe({
      next: () => console.log('Watchlist saved!'),
      error: err => console.error('Failed to save watchlist:', err)
    });
  }
}
