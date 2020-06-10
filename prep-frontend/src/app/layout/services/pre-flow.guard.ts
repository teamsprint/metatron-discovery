import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import {Observable} from 'rxjs';
import {RouterUrls} from '../../common/constants/router.constant';

@Injectable()
export class PreFlowGuard implements CanActivate {

  constructor(private readonly router: Router) {
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    this.router.navigate([`${RouterUrls.Managements.getMainUrl()}`]).then();
    return false;
  }
}
