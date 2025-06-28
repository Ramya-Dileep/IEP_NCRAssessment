import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  private isCollapsedSubject = new BehaviorSubject<boolean>(false);
  isCollapsed$ = this.isCollapsedSubject.asObservable();

  toggleSidebar() {
    this.isCollapsedSubject.next(!this.isCollapsedSubject.getValue());
  }

  setSidebarState(state: boolean) {
    this.isCollapsedSubject.next(state);
  }
}
