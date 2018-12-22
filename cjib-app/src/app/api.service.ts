import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { map, filter, switchMap, catchError } from 'rxjs/operators';

const httpOptions = {
  headers: new HttpHeaders()
};

httpOptions.headers.append('Content-Type', 'application/json');
httpOptions.headers.append('Accept', 'application/json');

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://localhost:3000/api/';  // URL to web api

  constructor(private http: HttpClient) { }

  queryCitizenAbilityToPay(requestBody): Observable<any> {
    return this.http.post(this.apiUrl + 'cjibGetPersonInfo', requestBody, httpOptions).pipe(
      map(res => res),
      catchError(this.handleError))
  }

  private handleError(error: any): Observable<string> {
      const errMsg = (error.message) ? error.message : error.status ? `${error.status} - ${error.statusText}` : 'Server error';
      console.error(errMsg);
      return Observable.throw(errMsg);
  }

  private extractData(res: Response): any {
      console.log(res);
      return res.json();
  }
}
