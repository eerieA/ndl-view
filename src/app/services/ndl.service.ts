import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, catchError, switchMap, filter, retryWhen, delay, tap, takeWhile } from 'rxjs/operators';
import { RtConfService } from './rt-conf.service';
import { Observable, throwError, timer } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NdlService {
  // private baseUrl = 'https://data.nasdaq.com/api/v3/datatables/ETFG/FUND.json';
  private baseUrl = '/api/v3/datatables/ETFG/FUND.json';

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
          retryWhen((errors) =>
            errors.pipe(
              tap((err) => {
                if (err instanceof DOMException && err.name === 'AbortError') {
                  console.warn('⚠️ AbortError caught, will retry...');
                } else {
                  console.warn('⚠️ Error caught, will retry:', err);
                }
              }),
              delay(1000), // Wait 1s before retrying
              takeWhile((err, index) => index < 5) // Max 5 retries
            )
          ),
          catchError((error) => {
            console.error('❌ Final error after retries:', error);
            return throwError(() => error);
          })
        );
      })
    );
  }
}
