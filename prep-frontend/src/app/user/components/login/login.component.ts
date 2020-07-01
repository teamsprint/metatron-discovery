import {Component} from '@angular/core';
import {LoginService} from '../../services/login/login.service';
import {LoadingService} from '../../../common/services/loading/loading.service';
import {finalize, map} from 'rxjs/operators';
import {Router} from '@angular/router';
import {CookieStorageService} from '../../../common/services/cookie-storage/cookie-storage.service';
import {User} from '../../domains/user';
import {NGXLogger} from 'ngx-logger';
import {Alert} from '../../../common/utils/alert.util';
import {HTTPStatusCode} from '../../../common/domain/http-status-code';
import * as _ from 'lodash';
import {Token} from '../../domains/token';
import {RouterUrls} from '../../../common/constants/router.constant';

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
        map(response => {

          if (_.negate(_.isNil)(response)) {
            return response;
          }

          return new Error(`Invalid token value`);
        }),
        finalize(() => this.loadingService.hide())
      )
      .subscribe(
        (response: Error | Token) => {

          if (response instanceof Error) {
            Alert.error(`로그인 오류가 발생했습니다.`);
            return;
          }

          this.cookieStorageService.saveLoginToken(response);
          this.cookieStorageService.saveLoginUserId(this.user);
          this.router.navigate([`${RouterUrls.Managements.getMainUrl()}`]).then();
        },
        error => {
          if (error.status === HTTPStatusCode.BadRequest) {
            Alert.success('사용자 정보를 확인해 주세요.');
          } else {
            Alert.error(error?.message);
          }
        }
      );
  }
}
