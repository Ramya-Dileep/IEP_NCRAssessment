import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChartdataService {
 constructor(private http: HttpClient) { }

private readonly apiUrl = 'http://localhost:5000/api/ncrchartdata';
private readonly projectapiUrl = 'http://localhost:5000/api/ncrchartprojectdata';

  getChartdata(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }


   getPojectChartdata(): Observable<any[]> {
    return this.http.get<any[]>(this.projectapiUrl);
  }
}
