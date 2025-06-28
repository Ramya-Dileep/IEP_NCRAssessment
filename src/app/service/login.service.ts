  import { Injectable } from '@angular/core';
  import { Observable, of } from 'rxjs';
  import { delay } from 'rxjs/operators';
  import { HttpClient } from '@angular/common/http';
import { User } from '../models/user.model';
  
  @Injectable({
    providedIn: 'root'
  })
  export class LoginService { 
  
    private validCredentials = [{
      userName: 'admin',
      password: 'admin123'
    },
  {
    userName:'ramya',
    password: 'ramya123'
  }];
  
    constructor(private http : HttpClient) { }

    //keeping this code  incase for future use
  
    // login(userName: string, password: string): Observable<boolean> {
    //   const isValid = userName === this.validCredentials.userName && password === this.validCredentials.password;
    //   return of(isValid).pipe(delay(1000));
    // }

  // login.service.ts


// commenting to implement backend

// login(userName: string, password: string): Observable<User | null> {
//   const matchedUser = this.validCredentials.find(
//     user => user.userName === userName && user.password === password
//   );

//   if (matchedUser) {
//     // Add avatar per user or a default
//     const user: User = {
//       userName: matchedUser.userName,
//       email: matchedUser.userName + '@example.com',
//       avatar: `assets/Logos/${matchedUser.userName}.jpg`
//     };
//     return of(user).pipe(delay(1000));
//   }

//   return of(null).pipe(delay(1000));
// }

 login(userName: string, password: string): Observable<User | null> {
    return this.http.post<User>('http://localhost:5000/api/auth/login', { userName, password });
  }

  }
