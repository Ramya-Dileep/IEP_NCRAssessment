import { CanActivateFn, Router } from '@angular/router';
import {AuthService} from '../service/auth.service';
import {inject} from '@angular/core'

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  
console.log("User in guard:", authService.getCurrentUser());
 
const user = authService.getCurrentUser();
  console.log("Guard check - user:", user);

   if (!user || !user.userName) {
    return router.parseUrl('/login');
  }

  return true;

};

