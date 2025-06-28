import { Routes } from '@angular/router';
import { UserLoginComponent } from './user-login/user-login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component : UserLoginComponent,
    // loadComponent: () =>
    //   import('./user-login/user-login.component').then(m => m.UserLoginComponent)
  },
  {
    path: 'dashboard',
    component : DashboardComponent,
    // loadComponent: () =>
    //   import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  // {
  //   path: '**',
  //   redirectTo: '/login'
  // }
];