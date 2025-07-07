import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TabulardataService {

  constructor(private http: HttpClient) { }

private readonly apiUrl = 'http://localhost:5000/api/ncrtabledata';
private readonly projectapiUrl = 'http://localhost:5000/api/ncrprojecttabledata';

  getTabledata(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }


   getPojectTabledata(): Observable<any[]> {
    return this.http.get<any[]>(this.projectapiUrl);
  }

}
