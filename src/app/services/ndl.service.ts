import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, catchError, switchMap, filter, retry } from 'rxjs/operators';
import { RtConfService } from './rt-conf.service';
import { Observable, throwError, timer } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NdlService {
  // private baseUrl = 'https://data.nasdaq.com/api/v3/datatables/ETFG/FUND.json';
  private baseUrl = '/api/v3/datatables/ETFG/FUND.json';
  private cryBaseUrl = '/api/v3/datatables/QDL/BITFINEX';

  constructor(
    private http: HttpClient,
    private configService: RtConfService
  ) { }

  add(x: number, y: number): number {
    return x + y;
  }

  getFundData(ticker: string): Observable<any> {
    return this.configService.getApiKey$().pipe(
      filter((key) => key !== 'no-key'),
      switchMap((apiKey) => {
        const url = `${this.baseUrl}?ticker=${ticker}&api_key=${apiKey}`;
        return this.http.get(url).pipe(
          map((response) => {
            console.log('✅ Successful response');
            return response;
          }),
          retry({
            count: 5,
            delay: (error, retryCount) => {
              if (error instanceof DOMException && error.name === 'AbortError') {
                console.warn(`⚠️ Retry ${retryCount}: AbortError caught`);
                return timer(1000); // wait 1 second before retrying
              }
              // For other error types, also retry (or optionally rethrow)
              console.warn(`⚠️ Retry ${retryCount}:`, error);
              return timer(1000);
            }
          }),
          catchError((error) => {
            console.error('❌ Final error after retries:', error);
            return throwError(() => error);
          })
        );
      })
    );
  }

  getCryptoData(code: string, startDate: string, endDate: string): Observable<any> {
    // const startDate = '2025-03-08';
    // const endDate = '2025-04-08';
  
    return this.configService.getApiKey$().pipe(
      filter((key) => key !== 'no-key'),
      switchMap((apiKey) => {
        const url = `${this.cryBaseUrl}?code=${code}&date.gte=${startDate}&date.lte=${endDate}&api_key=${apiKey}`;
        return this.http.get(url).pipe(
          map((response) => response),
          catchError((error) => {
            console.error('Crypto data fetch error:', error);
            return throwError(() => error);
          })
        );
      })
    );
  }
  
}
