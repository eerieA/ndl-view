import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { Observable, throwError, timer } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NdlService {

  constructor(
    private http: HttpClient
  ) { }

  getCryptoData(code: string, startDate: string, endDate: string): Observable<{ data: any, headers: any }> {
    const url = `/api/crypto?code=${code}&from=${startDate}&to=${endDate}`;
    return this.http.get(url, { observe: 'response' }).pipe(
      map((response) => ({
        data: response.body,
        headers: response.headers
      })),
      catchError((error) => {
        console.error('Crypto data fetch error:', error);
        return throwError(() => error);
      })
    );
  }

}
