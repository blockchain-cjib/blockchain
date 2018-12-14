import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { PersonInfo } from '../PersonInfo';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'localhost:3000/SOMETHING';  // URL to web api

  constructor(private http: HttpClient) { }

  getAllPersonInformation(): Observable<PersonInfo[]> {
    return this.http.get<PersonInfo[]>(this.apiUrl)
    .pipe(
      tap(_ => console.log('fetched citizen info')),
      catchError(this.handleError('getAllPersonInformation', []))
    );
  }

  /** POST: add a new personInfo to the server */
  uploadPersonInformation (personInfo: PersonInfo): Observable<PersonInfo> {
    return this.http.post<PersonInfo>(this.apiUrl, personInfo, httpOptions).pipe(
      tap((personInfo: PersonInfo) => console.log('added personInfo')),
      catchError(this.handleError<PersonInfo>('uploadPersonInformation'))
    );
  }

  /**
   * Handle Http operation that failed.
   * Let the app continue.
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  private handleError<T> (operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
    
      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead
    
      // TODO: better job of transforming error for user consumption
      console.log(`${operation} failed: ${error.message}`);
    
      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }
}
