import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { WatchlistEntry } from '../models/watchlist-entry.model';

@Injectable({
  providedIn: 'root'
})
export class WatchlistService {
  private readonly _watchlist = new BehaviorSubject<WatchlistEntry[]>([]);
  readonly watchlist$ = this._watchlist.asObservable();

  constructor() { }

  add(entry: WatchlistEntry) {
    const current = this._watchlist.getValue();
    if (!current.find(e => e.code === entry.code)) {
      this._watchlist.next([...current, entry]);
    }
  }

  remove(code: string) {
    const current = this._watchlist.getValue().filter(e => e.code !== code);
    this._watchlist.next(current);
  }

  isWatched(code: string): boolean {
    return this._watchlist.getValue().some(e => e.code === code);
  }
}
