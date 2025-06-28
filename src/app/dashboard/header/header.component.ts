import { Component, OnInit, OnDestroy, Input, ElementRef, HostListener } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from './../../service/auth.service';
import { User } from '../../models/user.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule,RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Input() toolName: string = 'IEP';

  userName: string | null = null;
  avatarUrl: string = 'assets/images/default-avatar.png';
  dropdownOpen = false;
  isDropdownOpen = false; 
  // adminName = "admin";
  // adminEmail = "admin431@gmail.com";
  adminName: string | null = null;
  adminEmail:  string | null = null;

  private subscription = new Subscription();

  constructor(
    private authService: AuthService,
    private router: Router,
    private eRef: ElementRef
  ) {}

   dropDownItems = [
    { name: 'TASKBAR', icon: 'task', router: '/login' },
    { name: 'SETTINGS', icon: 'settings', router: '/settings' }
  ];

  ngOnInit(): void {
 
    this.subscription = this.authService.currentUser$.subscribe((user: User | null) => {
      if (user) {
        this.userName = user.userName;
        this.adminEmail = user.email || this.adminEmail;
        this.avatarUrl = user.avatar || this.avatarUrl;
      }
    });
  }

  DropdownClose() {
  setTimeout(() => {
    this.isDropdownOpen = false;
  }, 200); // Delay to allow button click to register
}

  toggleDropdown() {
  this.isDropdownOpen = !this.isDropdownOpen;
}

onChangeDashboard(){}

onLogout(event: MouseEvent) {
  event.stopPropagation(); // Prevent blur from closing the dropdown before click
  this.isDropdownOpen = false;
  this.authService.clearUser();
  this.router.navigate(['/login']);
  console.log("Logging out...");
}

@HostListener('document:click', ['$event'])
handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement;

  if (!this.eRef.nativeElement.contains(target)) {
    this.isDropdownOpen = false;
    this.dropdownOpen = false; // if you're using this for something else
  }
}
  onMenuClick()
  {
console.log("clicked now")
  }

  DropdownClick() {
    this.dropdownOpen = !this.dropdownOpen;
  }


  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
