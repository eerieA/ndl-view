import { HttpInterceptorFn, HttpHandlerFn, HttpRequest, HttpEvent } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export const httpErrorInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  return next(req).pipe(
    catchError((error: any) => {
      // Handle AbortError (only suppress it if it is a canceled request, not a genuine issue)
      if (error instanceof DOMException && error.name === 'AbortError') {
        console.log('⚠️ AbortError caught, suppressing...');
        return of(); // Return an empty observable to suppress the error
      }
      
      // For any other errors, rethrow them
      throw error;
    })
  );
};
