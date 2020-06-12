import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Token} from '../../domains/token';
import {CookieService} from 'ngx-cookie-service';
import {CommonConstant} from '../../../common/constants/common.constant';
import {User} from '../../domains/user';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor(private readonly http: HttpClient,
              private readonly cookieService: CookieService) {
  }

  login(user: User) {
    return this.http
      .post<Token>(
        `${CommonConstant.API_CONSTANT.OAUTH_URL}/token`,
        `grant_type=password&scope=write&username=${user.username}&password=${user.password}`,
        {
          headers: new HttpHeaders({
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: 'Basic cG9sYXJpc19jbGllbnQ6cG9sYXJpcw=='
          }),
          withCredentials: true
        }
      );
  }

  verify(userId: string) {
    return this.http.get<User>(`${CommonConstant.API_CONSTANT.API_URL}/users/${userId}`);
  }
}
