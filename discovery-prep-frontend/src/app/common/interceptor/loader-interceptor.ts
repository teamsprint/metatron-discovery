import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http'
import {Injectable} from '@angular/core'
import {Observable} from 'rxjs'
import {catchError, finalize} from 'rxjs/operators'

@Injectable()
export class LoaderInterceptor implements HttpInterceptor {
  private totalRequests = 0
  constructor() {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const showLoading = !request.headers.has('hideLoading')
    if (showLoading) {
      this.totalRequests += 1
    }
    if (request.responseType === 'json') {
      let jsonHeaders = request.headers.append('x-requested-with', 'XMLHttpRequest')
      request = request.clone({headers: jsonHeaders})
    }
    return next.handle(request).pipe(
      catchError(err => {
        throw err
      }),
      finalize(() => {
        if (showLoading) {
          this.decreaseRequests()
        }
      })
    )
  }

  private decreaseRequests() {
    if (this.totalRequests > 0) {
      this.totalRequests -= 1
    }
  }
}
