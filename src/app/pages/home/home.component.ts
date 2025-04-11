import { Component, inject, Inject, OnInit, OnDestroy, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common'; // Import this
import { Subscription, filter, take } from 'rxjs';
import { FormsModule } from '@angular/forms'; // for [(ngModel)]
import { BaseChartDirective } from 'ng2-charts';
import { NdlService } from '../../services/ndl.service';

interface CryptoRow {
  [index: number]: any; // still loose, but avoids 'any' warnings
}

@Component({
  selector: 'app-home',
  imports: [FormsModule, BaseChartDirective, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit, OnDestroy {
  private ndlService = inject(NdlService);

  testVar: string = '123';
  
  cryptoOptions = ['BTCUSD', 'ETHUSD', 'ZRXUSD'];
  selectedCrypto = 'BTCUSD';
  chartData: any = [];
  chartOptions: any = {}; // Add this line to define chartOptions
  isBrowser: boolean;

  private sub = new Subscription();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    // Check the platform and set isBrowser to true or false
    this.isBrowser = isPlatformBrowser(this.platformId);
  }


  ngOnInit() {
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
    // Ensure the key is ready and fetch data
    this.sub.add(
      this.ndlService.getCryptoData(this.selectedCrypto, '2025-03-08', '2025-03-12').subscribe({
        next: (data) => {
          this.chartData = this.transformCryptoData(data);
          console.log('Crypto data:', data);
          console.log('this.chartData:', this.chartData);
        },
        error: (err) => console.error('Fetch error:', err)
      })
    );
  }

  onCryptoChange(code: string) {
    this.selectedCrypto = code; // Keep internal state in sync
    console.log("onCryptoChange triggered with:", code);

    this.ndlService.getCryptoData(code, '2025-03-08', '2025-03-12').subscribe({
      next: (data) => {
        console.log('Raw crypto data:', data);
        this.chartData = this.transformCryptoData(data);
      },
      error: (err) => console.error('Fetch error:', err)
    });
  }

  transformCryptoData(raw: any): any {
    console.log('transforming crypto data:', raw);
    const rows: CryptoRow[] = raw?.datatable?.data || [];
    const labels = rows.map(row => row[1] as string);
    const values = rows.map(row => row[3] as number);

    return {
      labels,
      datasets: [
        {
          label: this.selectedCrypto,
          data: values,
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          fill: true,
          tension: 0.1
        }
      ]
    };
  }

  ngOnDestroy() {
    console.log('Component destroyed — canceling subscriptions');
    this.sub.unsubscribe(); // This triggers Angular to abort active HTTP requests
  }
}
