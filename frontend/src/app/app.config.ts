import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withHttpTransferCacheOptions, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

import { httpErrorInterceptor } from './http-error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }),
  provideRouter(routes),
  provideClientHydration(withHttpTransferCacheOptions({
    includeHeaders: [
      // Selected relayed headers
      'x-ratelimit-limit',
      'x-ratelimit-remaining',
    ]
  }
  )),
  provideHttpClient(
    withFetch(),
    withInterceptors([httpErrorInterceptor])
  ),
  provideCharts(withDefaultRegisterables()),]
};
