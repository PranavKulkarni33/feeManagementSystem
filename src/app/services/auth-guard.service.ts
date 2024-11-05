import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const expectedRole = route.data['role'];
    const token = localStorage.getItem('token');
    const userRole = this.auth.getRole();

    if (token && userRole) {
      // Redirect logged-in users from login/signup to respective dashboards
      if (state.url === '/login' || state.url === '/signup') {
        if (userRole === 'admin') {
          this.router.navigate(['/adminDashboard']);
        } else if (userRole === 'employee') {
          this.router.navigate(['/dashboard']);
        }
        return false;
      }

      // Role-based redirection for dashboard access
      if (userRole === 'admin' && state.url !== '/adminDashboard') {
        this.router.navigate(['/adminDashboard']);
        return false;
      } else if (userRole === 'employee' && state.url !== '/dashboard') {
        this.router.navigate(['/dashboard']);
        return false;
      }

      // Allow access if the role matches or no specific role is expected
      if (expectedRole && userRole === expectedRole) {
        return true;
      } else if (!expectedRole) {
        return true;
      } else {
        alert('Access denied: Insufficient permissions');
        return false;
      }
    } else {
      this.router.navigate(['/login']);
      return false;
    }
  }
}
