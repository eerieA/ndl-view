import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { WatchlistEntry } from '../models/watchlist-entry.model';

import { environment } from '../../envs/environment';

@Injectable({
  providedIn: 'root'
})
export class WatchlistService {
  private readonly beBaseUrl = environment.beBaseUrl;
  private readonly _watchlist = new BehaviorSubject<WatchlistEntry[]>([]);
  readonly watchlist$ = this._watchlist.asObservable();

  // Temporary. Only use one hardcoded test user for now
  private userEmail = 'test@123.com';
  private userName = 'test';

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
    this.http.get<WatchlistEntry[]>(`${this.beBaseUrl}/watchlist?email=${this.userEmail}`).subscribe({
      next: (data) => {
        this._watchlist.next(data);
      },
      error: (err) => {
        console.error('Failed to fetch watchlist:', err);
      }
    });
  }

  saveWatchlist(): void {
    const watchlistData = {
      email: this.userEmail,
      name: this.userName,  // Add user name here if you have it
      watchlist: this._watchlist.getValue()
    };

    this.http.post(`${this.beBaseUrl}/watchlist`, watchlistData).subscribe({
      next: () => console.log('Watchlist saved!'),
      error: err => console.error('Failed to save watchlist:', err)
    });
  }
}
