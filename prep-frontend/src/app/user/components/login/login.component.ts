import {Component} from '@angular/core';
import {LoginService} from '../../services/login/login.service';
import * as _ from 'lodash';
import {LoadingService} from '../../../common/services/loading/loading.service';
import {filter, finalize} from 'rxjs/operators';
import {Router} from '@angular/router';
import {RouterUrls} from '../../../common/constants/router.constant';
import {CookieStorageService} from '../../../common/services/cookie-storage/cookie-storage.service';
import {User} from '../../domains/user';
import {NGXLogger} from 'ngx-logger';

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
    private readonly logger: NGXLogger,
    private readonly router: Router) {
  }

  login() {

    this.loadingService.show();

    this.loginService
      .login(this.user)
      .pipe(
        filter(token => _.negate(_.isNil)(token)),
        finalize(() => this.loadingService.hide())
      )
      .subscribe(
        token => {
          this.cookieStorageService.saveLoginToken(token);
          this.cookieStorageService.saveLoginUserId(this.user);
          this.router.navigate([`${RouterUrls.Managements.getMainUrl()}`]).then();
        },
        error => {
          this.logger.debug('Login fail', error);
        }
      );
  }
}
