import {Component} from '@angular/core';
import {LoginService} from '../../services/login/login.service';
import * as _ from 'lodash';
import {LoadingService} from '../../../common/services/loading/loading.service';
import {catchError, filter, finalize} from 'rxjs/operators';
import {of} from 'rxjs';
import {Router} from '@angular/router';
import {RouterUrls} from '../../../common/constants/router.constant';
import {CookieStorageService} from '../../../common/services/cookie-storage/cookie-storage.service';
import {User} from '../../domains/user';

@Component({
  selector: 'login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  public readonly user = new User();

  constructor(
    private readonly loginService: LoginService,
    private readonly cookieStorageService: CookieStorageService,
    private readonly loadingService: LoadingService,
    private readonly router: Router) {
  }

  login() {

    this.loadingService.show();

    this.loginService
      .login(this.user)
      .pipe(
        catchError(() => of(undefined)),
        filter(token => _.negate(_.isNil)(token)),
        finalize(() => this.loadingService.hide())
      )
      .subscribe(token => {
        this.cookieStorageService.saveLoginToken(token);
        this.cookieStorageService.saveLoginUserId(this.user);
        this.router.navigate([`${RouterUrls.Managements.getMainUrl()}`]).then();
      });
  }
}
