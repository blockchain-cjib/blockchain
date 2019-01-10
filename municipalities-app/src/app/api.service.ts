import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable } from 'rxjs';
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
      const errMsg = (error.message) ? error.message : error.status ? `${error.status} - ${error.statusText}` : 'Server error';
      console.error(errMsg); 
      return Observable.throw(errMsg);
  }

  private extractData(res: Response): any {
      console.log(res);
      return res;
  }
}
