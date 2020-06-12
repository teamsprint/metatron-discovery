import {Injectable} from '@angular/core';
import {HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {CookieConstant} from '../../constants/cookie.constant';
import {CookieService} from 'ngx-cookie-service';
import * as _ from 'lodash';

@Injectable()
export class HttpRequestInterceptor implements HttpInterceptor {

  constructor(private readonly cookieService: CookieService) {
  }

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
