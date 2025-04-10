import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { Subscription, filter, take } from 'rxjs';
import { NdlService } from '../../services/ndl.service';
import { RtConfService } from '../../services/rt-conf.service';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit, OnDestroy {
  private ndlService = inject(NdlService);
  private rtConfService = inject(RtConfService);

  testVar: string = '123';
  testNum: number = this.ndlService.add(2, 4);
  fundData: any;
  private sub = new Subscription();

  ngOnInit() {
    // Subscribe to the API key subject to wait until key is available
    this.rtConfService.getApiKey$().pipe(
      filter(key => key !== 'no-key'),
      take(1) // Unsubscribe after the first valid key
    ).subscribe(() => this.loadFundData());
  }

  loadFundData() {
    // Ensure the key is ready and fetch data
    this.sub.add(
      this.ndlService.getFundData('SPY').subscribe({
        next: (data) => {
          this.fundData = data;
          console.log('Fund data:', data);
        },
        error: (err) => console.error('Fetch error:', err)
      })
    );
  }

  ngOnDestroy() {
    console.log('Component destroyed — canceling subscriptions');
    this.sub.unsubscribe(); // This triggers Angular to abort active HTTP requests
  }
}
