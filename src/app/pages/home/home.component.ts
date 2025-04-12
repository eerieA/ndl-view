import { Component, inject, Inject, OnInit, OnDestroy, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common'; // Import this
import { Subscription, filter, take } from 'rxjs';
import { NdlService } from '../../services/ndl.service';
import { CryptoEntry } from '../../models/crypto-entry.model'

import { FormsModule } from '@angular/forms'; // for [(ngModel)]

@Component({
  selector: 'app-home',
  imports: [FormsModule, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit, OnDestroy {
  private ndlService = inject(NdlService);
  cryptoList: CryptoEntry[] = [];

  cryptoOptions = ['BTCUSD', 'ETHUSD', 'ZRXUSD'];
  selectedCrypto = 'BTCUSD';
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

    this.cryptoList = []; // Clear old entries

    this.cryptoOptions.forEach(code => {
      this.sub.add(
        this.ndlService.getCryptoData(code, start, end).subscribe({
          next: (data) => {
            const entry = this.parseSingleEntry(data, code, targetDate);
            if (entry) {
              this.cryptoList.push(entry);
            }
          },
          error: (err) => console.error(`Fetch error for ${code}:`, err)
        })
      );
    });
  }

  parseSingleEntry(raw: any, code: string, date: string): CryptoEntry | null {
    const rows: any[] = raw?.datatable?.data || [];

    const row = rows.find(r => r[1] === date); // Find the matching date
    if (!row) return null;

    return {
      code: code,
      date: row[1],
      open: row[2],
      close: row[3],
      high: row[4],
      low: row[5],
      volume: row[6],
      iconUrl: this.lookUpIconUrl(code)
    };
  }

  parseCryptoEntries(raw: any, code: string): CryptoEntry[] {
    const rows = raw?.datatable?.data || [];
    return rows.map((row: any[]) => ({
      code: code,
      date: row[1],
      open: row[2],
      close: row[3],
      high: row[4],
      low: row[5],
      volume: row[6],
      iconUrl: this.lookUpIconUrl(this.selectedCrypto)
    } as CryptoEntry));
  }

  lookUpIconUrl(symbol: string): string {
    const map: Record<string, string> = {
      BTCUSD: 'assets/icons/btc.svg',
      ETHUSD: 'assets/icons/eth.svg',
      ZRXUSD: 'assets/icons/zrx.svg'
    };
    return map[symbol] || 'assets/icons/generic.svg';
  }

  ngOnDestroy() {
    console.log('Component destroyed — canceling subscriptions');
    this.sub.unsubscribe(); // This triggers Angular to abort active HTTP requests
  }
}
