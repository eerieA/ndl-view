import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { Observable, throwError, timer } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NdlService {

  constructor(
    private http: HttpClient
  ) { }

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
