import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import {LoginService} from '../../../user/services/login/login.service';
import {CookieService} from 'ngx-cookie-service';
import {CookieConstant} from '../../../common/constants/cookie.constant';
import {catchError, map} from 'rxjs/operators';
import * as _ from 'lodash';
import {of} from 'rxjs';
import {Store} from '@ngxs/store';
import {AddUser} from '../../../user/services/store/user.actions';
import {UserRouterUrl} from '../../../user/constants/user-router-url';

@Injectable({
  providedIn: 'root'
})
export class UserVerifyGuard implements CanActivate {

  constructor(private readonly loginService: LoginService,
              private readonly cookieService: CookieService,
              private readonly router: Router,
              private readonly store: Store) {
  }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot) {

    const loginUserId = this.cookieService.get(CookieConstant.KEY.LOGIN_USER_ID);

    if (_.isNil(loginUserId) || _.isEmpty(loginUserId)) {
      return this.router.navigate([UserRouterUrl.getLoginUrl()]).then(() => false);
    }

    return this.loginService
      .verify(loginUserId)
      .pipe(
        catchError(() => of(undefined)),
        map(responses => {

          if (_.isNil(responses)) {
            this.router.navigate([UserRouterUrl.getLoginUrl()]).then();
            return false;
          }
          this.addLoginUser(responses);
          return true;
        })
      );
  }

  private addLoginUser(responses) {
    this.store.dispatch(new AddUser(responses));
  }
}
