import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

import { Observable, throwError } from 'rxjs';
import { map, filter, switchMap, catchError } from 'rxjs/operators';

const httpOptions = {
    headers: new HttpHeaders(),
    params: new HttpParams()
};

httpOptions.headers.append('Content-Type', 'application/json');
httpOptions.headers.append('Accept', 'application/json');

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://localhost:8080/api/';

  constructor(private http: HttpClient) { }

  queryCitizenAbilityToPay(bsn, months): Observable<any> {
    httpOptions.params = httpOptions.params.set('bsn', bsn);
    if (months) {
        httpOptions.params = httpOptions.params.set('months', months);
    }

    return this.http.get(this.apiUrl + 'getCitizen', httpOptions).pipe(
        map(res => res),
        catchError(this.handleError))
  }

  verifyProof(proof): Observable<any> {
    return this.http.post(this.apiUrl + 'verifyProof', proof, httpOptions).pipe(
      map(this.extractData),
      catchError(this.handleError))
  }

  private handleError(error: any): Observable<string> {
    console.log(error);
    const errMsg = 'Server error';
    console.error(errMsg); 
    return throwError(error);
  }

  private extractData(res: Response): any {
      console.log(res);
      return res.json();
  }
}
