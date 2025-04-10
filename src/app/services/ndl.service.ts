import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../env/environment';

@Injectable({
  providedIn: 'root'
})
export class NdlService {
  private apiKey = environment.ndlApiKey;
  private baseUrl = 'https://data.nasdaq.com/api/v3/datatables/ETFG/FUND.json';

  constructor(private http: HttpClient) { }

  add(x: number, y: number) {
    return x + y;
  }

  getFundData(ticker: string) {
    const url = `${this.baseUrl}?ticker=${ticker}&api_key=${this.apiKey}`;
    return this.http.get(url).subscribe(res => {
      console.log("got data:", res);
    });
  }

}
