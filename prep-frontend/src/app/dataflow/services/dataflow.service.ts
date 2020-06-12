import {Injectable} from '@angular/core';
import {DataflowModule} from '../dataflow.module';
import {HttpClient} from '@angular/common/http';
import {CommonConstant} from '../../common/constants/common.constant';
import {Page} from '../../common/constants/page';
import {CookieService} from 'ngx-cookie-service';
import * as _ from 'lodash';
import {Dataflow} from '../domains/dataflow';
import {CommonUtil} from '../../common/utils/common-util';

@Injectable({
  providedIn: DataflowModule
})
export class DataflowService {

  constructor(private readonly http: HttpClient,
              private readonly cookieService: CookieService) {
  }

  createDataflow() {
    return this.http.post(``, {});
  }

  getDataflow() {
    return this.http.get(``);
  }

  getDataflows(searchText: string,
               page: Page,
               projection: Dataflow.Result.GetDataflows.Projections = Dataflow.Result.GetDataflows.Projections.FOR_LIST_VIEW) {

    let params = {};

    if (searchText) {
      params = _.merge({ name: searchText }, params);
    }

    if (!searchText) {
      params = _.merge({ name: '' }, params);
    }

    if (page) {
      params = _.merge(page, params);
    }

    if (projection) {
      params = _.merge({ projection }, params);
    }

    return this.http.get<Dataflow.Result.GetDataflows.Entity>(
      `${CommonConstant.API_CONSTANT.API_URL}/dataflows/search/findByNameContaining`,
      {
        params: CommonUtil.Http.makeQueryString(params)
      });
  }

  updateDataflow() {
    return this.http.patch(``, {});
  }

  deleteDataflow() {
    return this.http.delete(``);
  }
}
