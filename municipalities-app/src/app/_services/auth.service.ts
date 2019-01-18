import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

const httpOptions = {
  headers: new HttpHeaders()
};

var LOCAL_TOKEN_KEY = 'hkey';

httpOptions.headers.append('Content-Type', 'application/json');
httpOptions.headers.append('Accept', 'application/json');

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  LOCAL_TOKEN_KEY: string = 'hkey';

  private apiUrl = 'http://localhost:8080/api/';

  constructor(private http: HttpClient) { }

  authenticate(credentials: any): Observable<any> {
      return this.http.post(this.apiUrl + 'authenticate', credentials, httpOptions).pipe(
        map(this.extractData),
        catchError(this.handleError))
  }

  private handleError(error: any): Observable<string> {
      const errMsg = 'Server error - ' + error.error.msg;
      console.error(errMsg); 
      return throwError(error);
  }

  private extractData = ((res: Response) => {
      this.storeUserCredentials(res);
      return res;
  })

  private storeUserCredentials = (res) => {
      window.localStorage.setItem(LOCAL_TOKEN_KEY, res.token);
  }
}
