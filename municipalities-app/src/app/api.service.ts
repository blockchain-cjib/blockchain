import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { map, filter, switchMap, catchError } from 'rxjs/operators';

import { createPersonInfo, PersonInfo } from '../org.example.cjibnetwork';

const httpOptions = {
  headers: new HttpHeaders()
};

httpOptions.headers.append('Content-Type', 'application/json');
httpOptions.headers.append('Accept', 'application/json');

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'localhost:3000/api/';  // URL to web api

  constructor(private http: HttpClient) { }

  public getAllPersonInformation(): Observable<PersonInfo[]> {
    return this.http.get(this.apiUrl + 'PersonInfo').pipe(
        map(this.extractData),
        catchError(this.handleError));
  }

  /** POST: POST a createPersonInfo transaction */
  uploadPersonInformation (personInfo: PersonInfo): Observable<createPersonInfo> {
    return this.http.post(this.apiUrl + 'createPersonInfo', personInfo, httpOptions).pipe(
      map(this.extractData),
      catchError(this.handleError))
  }

  private handleError(error: any): Observable<string> {
      // In a real world app, we might use a remote logging infrastructure
      // We'd also dig deeper into the error to get a better message
      const errMsg = (error.message) ? error.message :
        error.status ? `${error.status} - ${error.statusText}` : 'Server error';
      console.error(errMsg); // log to console instead
      return Observable.throw(errMsg);
  }

  private extractData(res: Response): any {
      return res.json();
  }
}
