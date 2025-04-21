import { Component, inject, Inject, OnInit, OnDestroy, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common'; // Import this
import { Subscription, filter, take } from 'rxjs';
import { NdlService } from '../../services/ndl.service';
import { WatchlistService } from '../../services/watchlist.service';
import { CryptoEntry } from '../../models/crypto-entry.model'
import { WatchlistEntry } from '../../models/watchlist-entry.model'

import { FormsModule } from '@angular/forms'; // for [(ngModel)]
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatList } from '@angular/material/list';
import { MatTabGroup, MatTab } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { NgxGaugeModule } from 'ngx-gauge';

@Component({
  selector: 'app-home',
  imports: [FormsModule, CommonModule, MatTableModule, MatCardModule, MatList, MatTabGroup, MatTab, MatButtonModule, NgxGaugeModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, OnDestroy {
  private ndlService = inject(NdlService);
  private wlService = inject(WatchlistService);

  columnDefs = [
    { key: 'code', label: 'Symbol', icon: true },
    { key: 'date', label: 'Date' },
    { key: 'high', label: 'High' },
    { key: 'low', label: 'Low' },
    { key: 'mid', label: 'Mid' },
    { key: 'last', label: 'Last' },
    { key: 'bid', label: 'Bid' },
    { key: 'ask', label: 'Ask' },
    { key: 'volume', label: 'Volume' }
  ];
  marketSummary = {
    avgMomentum: 0,
    avgSpread: 0,
    totalVolume: 0,
    sentiment: 'Loading...',
    sentimentScore: 50,
  };
  rateLimitInfo = {
    remaining: 0,
    limit: 0,
  }
  cryptoList: CryptoEntry[] = [];
  topCryptos: CryptoEntry[] = [];
  watchlist: WatchlistEntry[] = [];
  activeTabIndex = 0; // 0 = All, 1 = Watched
  // DEBUG instruction: add word 'mock' at the end of these to call the mock endpoint
  // cryptoOptions = ['BTCUSD', 'LTCUSD', 'LTCBTC', 'ETHUSD', 'ETHBTC', 'ETCBTC', 'ETCUSD', 'RRTUSD', 'ZECUSD', 'ZECBTC', 'XMRUSD', 'XMRBTC', 'DSHUSD', 'DSHBTC', 'BTCEUR', 'BTCJPY', 'XRPUSD', 'XRPBTC', 'IOTUSD', 'IOTBTC', 'EOSUSD', 'EOSBTC', 'OMGUSD', 'OMGBTC', 'NEOUSD', 'MNAUSD', 'ZRXUSD', 'TRXUSD', 'TRXBTC', 'BTCGBP', 'ETHEUR', 'ETHJPY', 'ETHGBP', 'DAIUSD', 'XLMUSD', 'XLMBTC', 'MKRUSD', 'XTZUSD'];
  cryptoOptions = ['BTCUSD', 'LTCUSD', 'LTCBTC', 'ETHUSD', 'ETHBTC', 'ETCBTC', 'ETCUSD'];

  chartData: any = [];
  chartOptions: any = {};
  isBrowser: boolean;

  private sub = new Subscription();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    // Check the platform and set isBrowser to true or false
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      // Initialize chart and other client-side logic
      this.chartOptions = {
        responsive: true,
        scales: {
          x: {
            beginAtZero: true
          },
          y: {
            beginAtZero: true
          }
        }
      };
    }

    // Now that API key is no longer needed on frontend, load data directly
    this.loadData();

    this.wlService.getWatchlist();
    // After loading data there can be watchlist, add to the same sub manager
    this.sub.add(
      this.wlService.watchlist$.subscribe(w => {
        this.watchlist = w;
      })
    );
  }

  loadData() {
    console.log("loadData");

    // To be safe, target date is 2 days before today
    const targetDate = this.getPastDateString(2);
    console.log("targetDate:", targetDate);
    const start = targetDate;
    const end = targetDate;

    const codes = this.cryptoOptions.join(',');
    console.log("joined codes:", codes);
    this.cryptoList = []; // Clear old entries

    this.sub.add(
      this.ndlService.getCryptoData(codes, start, end).subscribe({
        next: (response) => {
          const entries = this.parseCryptoEntries(response.data);
          this.cryptoList = entries;
          this.rateLimitInfo.limit = response.headers.get('x-ratelimit-limit');
          this.rateLimitInfo.remaining = response.headers.get('x-ratelimit-remaining');
        },
        error: (err) => console.error(`Fetch error for ${codes}:`, err)
      })
    );

    // After data is loaded, update the top few highest priced cryptos
    // and market summary
    this.getTopCryptos();
    this.calculateMarketSummary(this.cryptoList);
    console.log("market summary:", this.marketSummary);
  }

  parseCryptoEntries(raw: any): CryptoEntry[] {
    const rows = raw?.datatable?.data || [];

    const entries: CryptoEntry[] = [];

    for (const row of rows) {
      try {
        const code = row[0];
        const symbol = code.slice(0, -3);
        const iconUrl = this.lookUpIconUrl(symbol);
        const entry = CryptoEntry.parseApiRow(row, iconUrl);
        entries.push(entry);
      } catch (err) {
        // Mainly to catch errors from CryptoEntry's row parser
        console.warn('Skipping invalid row:', row, 'due to:', err);
      }
    }

    return entries;
  }

  // Parse and sort the top 5 highest priced cryptos
  getTopCryptos() {
    this.topCryptos = this.cryptoList
      .sort((a, b) => b.last - a.last)  // Sort by 'last' price in descending order
      .slice(0, 5);  // Take the top 5
  }

  /* How does it work:
  1. Momentum
    Calculate momentum for each crypto:
    momentumRatio = (last - low) / (high - low)
    Take the average across all entries to get rough market momentum
  2. Spread Ratio
    spreadRatio = (ask - bid) / mid
    Lower values roughly means more stability. Also take the average across all entries
  3. Total volumn
    Simple sum of all retrieved entry's volumn. Roughly means high / low trading activity.
  Use 1, 2 and 3 to make an sentiment label.*/
  private calculateMarketSummary(entries: CryptoEntry[]) {
    const valid = entries.filter(e => e.isValid);
    const n = valid.length;
    if (n === 0) return;

    let momentumSum = 0;
    let spreadSum = 0;
    let volumeSum = 0;

    for (const entry of valid) {
      momentumSum += entry.momentum;
      spreadSum += entry.spread;
      volumeSum += entry.volume;
    }

    const avgMomentum = momentumSum / n;
    const avgSpread = spreadSum / n;
    const totalVolume = volumeSum;

    // Normalize each factor to [0, 1] range
    const normMomentum = Math.max(0, Math.min(1, avgMomentum));
    const normSpread = 1 - Math.min(1, avgSpread / 0.05);
    const normVolume = Math.min(1, Math.log10(totalVolume + 1) / 10);

    // Use weighted average for sentiment score. Weights are arbitrary
    const score = (
      normMomentum * 0.5 +
      normSpread * 0.3 +
      normVolume * 0.2
    ) * 100;

    // Sentiment label
    let sentiment = 'Greedy';
    if (score < 25) {
      sentiment = 'Fearful';
    } else if (score < 50) {
      sentiment = 'Caution';
    } else if (score < 75) {
      sentiment = 'Neutral';
    }

    this.marketSummary = {
      avgMomentum,
      avgSpread,
      totalVolume,
      sentiment,
      sentimentScore: Math.round(score)
    };
  }

  private getPastDateString(n: number): string {
    const today = new Date();
    const pastDate = new Date(today);
    pastDate.setDate(today.getDate() - n);

    const yyyy = pastDate.getFullYear();
    const mm = String(pastDate.getMonth() + 1).padStart(2, '0');
    const dd = String(pastDate.getDate()).padStart(2, '0');

    return `${yyyy}-${mm}-${dd}`;
  }

  lookUpIconUrl(symbol: string): string {
    const lowerSymbol = symbol.toLowerCase();
    return `assets/icons/${lowerSymbol}.svg`;
  }

  addToWatchlist(entry: CryptoEntry) {
    this.wlService.add({ code: entry.code });
    console.log("watchlist frontend:", this.watchlist);
  }

  removeFromWatchlist(code: string) {
    this.wlService.remove(code);
  }

  isWatched(code: string): boolean {
    return this.wlService.isWatched(code);
  }

  get watchlistEnriched(): CryptoEntry[] {
    return this.watchlist
      .map(w => this.cryptoList.find(c => c.code === w.code))
      .filter((e): e is CryptoEntry => !!e); // filters out undefined
  }

  get filteredCryptoList(): CryptoEntry[] {
    return this.activeTabIndex === 0 ? this.cryptoList : this.watchlistEnriched;
  }

  gaugeColor(score: number): string {
    if (score < 25) return '#f44336'; // red (fear)
    if (score < 50) return '#ff9800'; // orange (caution)
    if (score < 75) return '#ffeb3b'; // yellow (neutral)
    return '#4caf50'; // green (greed)
  }

  get columnHeaders(): string[] {
    return this.columnDefs.map(col => col.key);
  }

  ngOnDestroy() {
    console.log('Component destroyed — canceling subscriptions');
    this.sub.unsubscribe(); // This triggers Angular to abort active HTTP requests
  }
}
