import {Injectable} from '@angular/core';
import {HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {CookieConstant} from '../../constants/cookie.constant';
import {CookieService} from 'ngx-cookie-service';
import * as _ from 'lodash';

@Injectable()
export class HttpRequestInterceptor implements HttpInterceptor {

  constructor(private readonly cookieService: CookieService) {
  }

  /**
   * 요청 보내기 전 인터셉터
   * 1. 컨텐츠 타입이 없으면 application/json을 추가
   * 2. Authorization이 없는 경우
   *    - e.g) Authorization: bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE1OTM0Mzc1MjIsInVzZXJfbmFtZSI6ImFkbWluIiwiYXV0aG9yaX ...
   *
   * @param req HttpRequest<object>
   * @param next HttpHandler
   */
  intercept(req: HttpRequest<object>, next: HttpHandler) {

    let header = {};

    if (!req.headers.has('Content-Type')) {
      header = _.merge({ 'Content-Type': 'application/json' }, header);
    }

    if (!req.headers.has('Authorization')) {
      header = _.merge({ Authorization: `${this.cookieService.get(CookieConstant.KEY.LOGIN_TOKEN_TYPE)} ${this.cookieService.get(CookieConstant.KEY.LOGIN_TOKEN)}` }, header);
    }

    return next.handle(
      req.clone({
        setHeaders: header
      })
    );
  }
}
