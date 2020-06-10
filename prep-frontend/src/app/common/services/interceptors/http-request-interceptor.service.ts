import {Injectable} from '@angular/core';
import {HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';

@Injectable()
export class HttpRequestInterceptor implements HttpInterceptor {

  intercept(req: HttpRequest<object>, next: HttpHandler) {
    return next.handle(
      req.clone({
        setHeaders: {}
      })
    );
  }
}
