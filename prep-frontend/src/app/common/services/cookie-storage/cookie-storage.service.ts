import {Injectable} from '@angular/core';
import {CookieService} from 'ngx-cookie-service';
import {Token} from '../../../user/domains/token';
import {CookieConstant} from '../../constants/cookie.constant';
import {User} from '../../../user/domains/user';

@Injectable({
  providedIn: 'root'
})
export class CookieStorageService {

  constructor(private readonly cookieService: CookieService) {
  }

  saveLoginToken(token: Token) {
    this.cookieService.set(CookieConstant.KEY.LOGIN_TOKEN, token.access_token, 0, '/');
    this.cookieService.set(CookieConstant.KEY.LOGIN_TOKEN_TYPE, token.token_type, 0, '/');
    this.cookieService.set(CookieConstant.KEY.REFRESH_LOGIN_TOKEN, token.refresh_token, 0, '/');
  }

  deleteLoginToken() {
    this.cookieService.delete(CookieConstant.KEY.LOGIN_TOKEN, '/');
    this.cookieService.delete(CookieConstant.KEY.LOGIN_TOKEN_TYPE, '/');
    this.cookieService.delete(CookieConstant.KEY.REFRESH_LOGIN_TOKEN, '/');
  }

  saveLoginUserId(user: User) {
    this.cookieService.set(CookieConstant.KEY.LOGIN_USER_ID, user.username, 0, '/');
  }

  deleteLoginUserId() {
    this.cookieService.delete(CookieConstant.KEY.LOGIN_USER_ID, '/');
  }
}
