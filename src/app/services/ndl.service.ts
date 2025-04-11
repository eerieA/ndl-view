import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, catchError, switchMap, filter, retry } from 'rxjs/operators';
import { Observable, throwError, timer } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NdlService {
  // private baseUrl = 'https://data.nasdaq.com/api/v3/datatables/ETFG/FUND.json';
  private baseUrl = '/api/v3/datatables/ETFG/FUND.json';
  private cryBaseUrl = '/api/v3/datatables/QDL/BITFINEX';

  constructor(
    private http: HttpClient
  ) { }

  add(x: number, y: number): number {
    return x + y;
  }

  getCryptoData(code: string, startDate: string, endDate: string): Observable<any> {
    const url = `/api/crypto?code=${code}&from=${startDate}&to=${endDate}`;
    return this.http.get(url).pipe(
      map((response) => response),
      catchError((error) => {
        console.error('Crypto data fetch error:', error);
        return throwError(() => error);
      })
    );
  }

}
