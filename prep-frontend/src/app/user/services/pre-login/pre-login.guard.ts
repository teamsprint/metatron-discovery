import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree} from '@angular/router';
import {Observable} from 'rxjs';
import {Store} from '@ngxs/store';
import {AddUser} from '../store/user.actions';
import {CookieStorageService} from '../../../common/services/cookie-storage/cookie-storage.service';

@Injectable()
export class PreLoginGuard implements CanActivate {

  constructor(private readonly cookieStorageService: CookieStorageService,
              private readonly store: Store) {
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    this.store.dispatch(new AddUser(undefined));
    this.cookieStorageService.deleteLoginToken();
    this.cookieStorageService.deleteLoginUserId();
    return true;
  }
}
