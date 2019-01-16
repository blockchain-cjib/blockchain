import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

const httpOptions = {
  headers: new HttpHeaders()
};

httpOptions.headers.append('Content-Type', 'application/json');
httpOptions.headers.append('Accept', 'application/json');

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://localhost:8080/api/';

  constructor(private http: HttpClient) { }

  createCitizenInformation(personInfo: any): Observable<any> {
    return this.http.post(this.apiUrl + 'createCitizen', personInfo, httpOptions).pipe(
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
      return res;
  }
}
