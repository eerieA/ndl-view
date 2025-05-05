import { Component, inject, Inject, OnInit, OnDestroy, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { ChartConfiguration } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { NdlService } from '../../services/ndl.service';
import { CryptoEntry } from '../../models/crypto-entry.model';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-crypto-detail',
  imports: [CommonModule, BaseChartDirective, MatCardModule, MatButtonModule],
  templateUrl: './crypto-detail.component.html',
  styleUrl: './crypto-detail.component.scss'
})
export class CryptoDetailComponent implements OnInit {
  private ndlService = inject(NdlService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  code = '';
  entries: CryptoEntry[] = [];
  chartData: ChartConfiguration<'line'>['data'] = { labels: [], datasets: [] };
  chartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
  };
  rateLimitInfo = {
    remaining: 0,
    limit: 0,
  };
  isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    this.code = this.route.snapshot.paramMap.get('code')!;
    const end = new Date();
    const start = new Date();
    start.setMonth(end.getMonth() - 1);

    const format = (d: Date) => d.toISOString().slice(0, 10);

    this.ndlService.getCryptoDetail(this.code, format(start), format(end)).subscribe((response) => {
      const responseData = response.data;
      const rows = responseData.datatable.data;
      const iconUrl = this.lookUpIconUrl(this.code);

      this.rateLimitInfo.limit = response.headers.get('x-ratelimit-limit');
      this.rateLimitInfo.remaining = response.headers.get('x-ratelimit-remaining');

      try {
        this.entries = rows
          .map((row: any) => CryptoEntry.parseApiRow(row, iconUrl))
          .filter((e: any) => e.isValid);
      } catch (err) {
        console.error('Error parsing API data:', err);
        this.entries = []; // fallback to empty array
        return;
      }

      // Sort by ascending date
      this.entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      // Prepare chart data
      const labels = this.entries.map(e => e.date);
      const values = this.entries.map(e => e.last);

      this.chartData = {
        labels,
        datasets: [
          {
            data: values,
            label: `${this.code} Prices`,
            fill: false,
            borderColor: 'rgba(75,192,192,1)',
            tension: 0.1,
          }
        ]
      };
    });
  }

  lookUpIconUrl(symbol: string): string {
    const lowerSymbol = symbol.toLowerCase();
    return `assets/icons/${lowerSymbol}.svg`;
  }

  goBack() {
    this.router.navigate(['/']);
  }
}
