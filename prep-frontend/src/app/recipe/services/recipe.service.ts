import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {CommonConstant} from '../../common/constants/common.constant';
import {CommonUtil} from '../../common/utils/common-util';
import {Observable, of} from 'rxjs';
import * as _ from 'lodash';
import {HTTPStatusCode} from '../../common/domain/http-status-code';
import {Recipe} from '../domain/recipe';

@Injectable()
export class RecipeService {

  constructor(private readonly http: HttpClient) {
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

    return this.http.get<Recipe.Entity | HttpErrorResponse>(url, {
      params: CommonUtil.Http.makeQueryString(params)
    });
  }
}
