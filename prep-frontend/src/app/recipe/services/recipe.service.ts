import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';
import {CommonConstant} from '../../common/constants/common.constant';
import {CookieConstant} from '../../common/constants/cookie.constant';
import {Page} from '../../common/constants/page';
import {CommonUtil} from '../../common/utils/common-util';
import {Dataset} from '../../dataset/domains/dataset';
import {Observable, of} from 'rxjs';
import * as _ from 'lodash';
import {HTTPStatusCode} from '../../common/domain/http-status-code';
import {CookieService} from 'ngx-cookie-service';

@Injectable()
export class RecipeService {

  constructor(private readonly http: HttpClient,
              private readonly cookieService: CookieService) {
  }

  getRecipe(recipeId: string, preview = 'true') {
    const url = `${CommonConstant.API_CONSTANT.API_URL}/recipes/${recipeId}`;

    if (!recipeId) {
      return of(new HttpErrorResponse({
        url,
        status: HTTPStatusCode.BadRequest,
        statusText: 'Invalid connectionId value'
      }));
    }
    let params = {};
    if (preview) {
      params = _.merge({ preview }, params);
    }
    return this.http.get(url, { params: CommonUtil.Http.makeQueryString(params) });
  }
}
