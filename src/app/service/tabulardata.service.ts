import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TabulardataService {

  constructor(private http: HttpClient) { }

//  getTabledata(): Observable<any[]> {
//     return this.http.get<any[]>('https://jsonplaceholder.typicode.com/users');
//   }

// commenting to implement backend
//   getTabledata(): Observable<any[]> {
//   const mockData = [
//   {
//     contract: 'Phoenix GTG',
//     job: 'Bret',
//     status: 'Active',
//     name: 'Leanne Graham',
//     username: 'Bret',
//     email: 'Sincere@april.biz',
//     city: 'Gwenborough',
//     street: 'Kulas Light',
//     zipcode: '92998-3874'
//   },
//   {
//     contract: 'Phoenix GTG',
//     job: 'Antonette',
//     status: 'Inactive',
//     name: 'Ervin Howell',
//     username: 'Antonette',
//     email: 'Shanna@melissa.tv',
//     city: 'Wisokyburgh',
//     street: 'Victor Plains',
//     zipcode: '90566-7771'
//   },
//   {
//     contract: 'Orion Gas Plant',
//     job: 'Samantha',
//     status: 'Active',
//     name: 'Clementine Bauch',
//     username: 'Samantha',
//     email: 'Nathan@yesenia.net',
//     city: 'McKenziehaven',
//     street: 'Douglas Extension',
//     zipcode: '59590-4157'
//   },
//   {
//     contract: 'Orion Gas Plant',
//     job: 'Karianne',
//     status: 'Inactive',
//     name: 'Patricia Lebsack',
//     username: 'Karianne',
//     email: 'Julianne.OConner@kory.org',
//     city: 'South Elvis',
//     street: 'Hoeger Mall',
//     zipcode: '53919-4257'
//   },
//   {
//     contract: 'Nova Hydrogen GTG',
//     job: 'Kamren',
//     status: 'Active',
//     name: 'Chelsey Dietrich',
//     username: 'Kamren',
//     email: 'Lucio_Hettinger@annie.ca',
//     city: 'Roscoeview',
//     street: 'Skiles Walks',
//     zipcode: '33263'
//   },
//   {
//     contract: 'Nova Hydrogen GTG',
//     job: 'Leopoldo_Corkery',
//     status: 'Inactive',
//     name: 'Mrs. Dennis Schulist',
//     username: 'Leopoldo_Corkery',
//     email: 'Karley_Dach@jasper.info',
//     city: 'South Christy',
//     street: 'Norberto Crossing',
//     zipcode: '23505-1337'
//   },
//   {
//     contract: 'Zeta Oil Platform',
//     job: 'Elwyn.Skiles',
//     status: 'Active',
//     name: 'Kurtis Weissnat',
//     username: 'Elwyn.Skiles',
//     email: 'Telly.Hoeger@billy.biz',
//     city: 'Howemouth',
//     street: 'Rex Trail',
//     zipcode: '58804-1099'
//   },
//   {
//     contract: 'Zeta Oil Platform',
//     job: 'Maxime_Nienow',
//     status: 'Active',
//     name: 'Nicholas Runolfsdottir V',
//     username: 'Maxime_Nienow',
//     email: 'Sherwood@rosamond.me',
//     city: 'Aliyaview',
//     street: 'Ellsworth Summit',
//     zipcode: '45169'
//   },
//   {
//     contract: 'Solar Fusion Plant',
//     job: 'Delphine',
//     status: 'Inactive',
//     name: 'Glenna Reichert',
//     username: 'Delphine',
//     email: 'Chaim_McDermott@dana.io',
//     city: 'Bartholomebury',
//     street: 'Dayna Park',
//     zipcode: '76495-3109'
//   },
//   {
//     contract: 'Solar Fusion Plant',
//     job: 'Moriah.Stanton',
//     status: 'Active',
//     name: 'Clementina DuBuque',
//     username: 'Moriah.Stanton',
//     email: 'Rey.Padberg@karina.biz',
//     city: 'Lebsackbury',
//     street: 'Kattie Turnpike',
//     zipcode: '31428-2261'
//   }
// ];

//     return of(mockData);
//   }

private readonly apiUrl = 'http://localhost:5000/api/tabledata';

  getTabledata(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

}
