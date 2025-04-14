import { Component, inject, Inject, OnInit, OnDestroy, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common'; // Import this
import { Subscription, filter, take } from 'rxjs';
import { NdlService } from '../../services/ndl.service';
import { CryptoEntry } from '../../models/crypto-entry.model'

import { FormsModule } from '@angular/forms'; // for [(ngModel)]
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatList } from '@angular/material/list';
import { NgxGaugeModule } from 'ngx-gauge';

@Component({
  selector: 'app-home',
  imports: [FormsModule, CommonModule, MatTableModule, MatCardModule, MatList, NgxGaugeModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, OnDestroy {
  private ndlService = inject(NdlService);

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
  cryptoList: CryptoEntry[] = [];
  topCryptos: CryptoEntry[] = [];
  // DEBUG instruction: add word 'mock' at the end of these to call the mock endpoint
  cryptoOptions = ['BTCUSD', 'ETHUSD', 'ZRXUSD', 'mock'];

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
  }

  loadData() {
    console.log("loadData");

    const targetDate = '2025-03-07';
    const start = targetDate;
    const end = targetDate;

    const codes = this.cryptoOptions.join(',');
    console.log("joined codes:", codes);
    this.cryptoList = []; // Clear old entries

    this.sub.add(
      this.ndlService.getCryptoData(codes, start, end).subscribe({
        next: (data) => {
          const entries = this.parseCryptoEntries(data);
          this.cryptoList = entries;
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

    return rows.map((row: any[]) => {
      const code = row[0]; // 0th index now contains the code (e.g., BTCUSD)
      const symbol = code.slice(0, -3);
      return {
        code: code,
        date: row[1],
        high: row[2],
        low: row[3],
        mid: row[4],
        last: row[5],
        bid: row[6],
        ask: row[7],
        volume: row[8],
        iconUrl: this.lookUpIconUrl(symbol)
      } as CryptoEntry;
    });
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
    const valid = entries.filter(e => e.high > e.low && e.mid > 0);
    const n = valid.length;

    if (n === 0) return;

    let momentumSum = 0;
    let spreadSum = 0;
    let volumeSum = 0;

    for (const entry of valid) {
      const momentum = (entry.last - entry.low) / (entry.high - entry.low);
      const spread = (entry.ask - entry.bid) / entry.mid;

      momentumSum += momentum;
      spreadSum += spread;
      volumeSum += entry.volume;
    }

    const avgMomentum = momentumSum / n;
    const avgSpread = spreadSum / n;
    const totalVolume = volumeSum;

    // Normalize each factor to [0, 1] range
    const normMomentum = Math.max(0, Math.min(1, avgMomentum)); // already in 0–1
    const normSpread = 1 - Math.min(1, avgSpread / 0.05);        // high spread → fear
    const normVolume = Math.min(1, Math.log10(totalVolume + 1) / 10); // scaled log volume

    // Weighted score. Weights are arbitrary, change if needed
    const score = (
      normMomentum * 0.5 +
      normSpread * 0.3 +
      normVolume * 0.2
    ) * 100;

    // Sentiment label
    let sentiment = 'Neutral';
    if (score >= 70) {
      sentiment = 'Greedy';
    } else if (score <= 30) {
      sentiment = 'Fearful';
    }

    this.marketSummary = {
      avgMomentum,
      avgSpread,
      totalVolume,
      sentiment,
      sentimentScore: Math.round(score)
    };
  }

  lookUpIconUrl(symbol: string): string {
    const lowerSymbol = symbol.toLowerCase();
    return `assets/icons/${lowerSymbol}.svg`;
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
