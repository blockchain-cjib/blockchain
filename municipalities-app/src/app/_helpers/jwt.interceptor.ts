import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
    key: string = 'hkey';

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // add authorization header with jwt token if available
        let token = localStorage.getItem(this.key);
        if (token) {
            request = request.clone({
                setHeaders: { 
                    Authorization: `${token}`
                }
            });
        }

        return next.handle(request);
    }
}
