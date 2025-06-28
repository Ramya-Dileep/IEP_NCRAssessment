import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { User } from '../models/user.model'; 

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser$;

  constructor() {
    const stored = sessionStorage.getItem('LoggedUser') || localStorage.getItem('LoggedUser');
    const user = stored ? JSON.parse(stored) as User : null;
    this.currentUserSubject = new BehaviorSubject<User | null>(user);
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  setCurrentUser(user: User, remember: boolean): void {
    this.currentUserSubject.next(user);
    if (remember) {
      localStorage.setItem('LoggedUser', JSON.stringify(user));
      localStorage.setItem('RememberedSSO', user.userName);   
      sessionStorage.removeItem('LoggedUser');
    } else {
      sessionStorage.setItem('LoggedUser', JSON.stringify(user));
      localStorage.removeItem('LoggedUser');
      localStorage.removeItem('RememberedSSO');
    }
  }

  isAdmin(): boolean {
  return this.getCurrentUser()?.userName === 'admin' ? true : false;
}

isUser(): boolean {
  return this.getCurrentUser()?.userName !== 'admin' ? true : false;
}


  clearUser(): void {
    this.currentUserSubject.next(null);
    localStorage.removeItem('LoggedUser');
    sessionStorage.removeItem('LoggedUser');
  }

  isLoggedIn(): boolean {
    return this.getCurrentUser() !== null;
  }
}
