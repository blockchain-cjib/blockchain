import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
    key: string;

    constructor(private router: Router) { 
        this.key = 'hkey';
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        var token = localStorage.getItem(this.key);
        if (token !== null && token != undefined) {
            return true;
        }
        // Redirect to /login if unauthenticated
        this.router.navigate(['/login'], { queryParams: { returnUrl: state.url }});
        return false;
    }
}
