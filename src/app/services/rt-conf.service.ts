import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

// Inform Angular that Window instances have custom property NDL_API_KEY
declare global {
  interface Window {
    NDL_API_KEY: string;
  }
}

@Injectable({
  providedIn: 'root'
})
export class RtConfService {
  private apiKey = 'no-key';
  private apiKeySubject = new BehaviorSubject<string>('no-key');

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId) && window.NDL_API_KEY) {
      // Only obtain the api key from the window object when it is browser environment;
      // otherwise there will be an error from the server side because it cannot access window.
      // So this way if print the api key in terminal then the string will be the placeholder
      // but should be the correct one in browser
      const key = window.NDL_API_KEY;
      if (key) {
        this.apiKeySubject.next(key);
      } else {
        const checkKey = () => {
          if (window.NDL_API_KEY) {
            this.apiKeySubject.next(window.NDL_API_KEY);
          } else {
            setTimeout(checkKey, 100); // Recursive setTimeout for single checks
          }
        };
        setTimeout(checkKey, 100);
      }
    }
  }

  getApiKey$() {
    return this.apiKeySubject.asObservable();
  }

  // Optional utility
  getCurrentApiKey() {
    return this.apiKeySubject.value;
  }
}
