import {Injectable} from '@angular/core';
import {of} from 'rxjs';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {CommonConstant} from '../../common/constants/common.constant';
import {Page} from '../../common/constants/page';
import * as _ from 'lodash';
import {Dataflow} from '../domains/dataflow';
import {CommonUtil} from '../../common/utils/common-util';
import {HTTPStatusCode} from '../../common/domain/http-status-code';

@Injectable()
export class DataflowService {

  constructor(private readonly http: HttpClient) {
  }

  createDataflow(dataflow: Dataflow.ValueObjects.Create) {
    const url = `${CommonConstant.API_CONSTANT.API_URL}/dataflows`;

    if (!dataflow) {
      return of(new HttpErrorResponse({
        url,
        status: HTTPStatusCode.BadRequest,
        statusText: 'Invalid connection value'
      }));
    }

    return this.http.post(url, JSON.stringify(dataflow));
  }


  getDataflow(dfId: string) {

    const url = `${CommonConstant.API_CONSTANT.API_URL}/dataflows/${dfId}`;

    const params = {};

    if (!dfId) {
      return of(new HttpErrorResponse({
        url,
        status: HTTPStatusCode.BadRequest,
        statusText: 'Invalid connectionId value'
      }));
    }

    return this.http.get<Dataflow.ValueObjects.Select | HttpErrorResponse>(url, {
      params: CommonUtil.Http.makeQueryString(params)
    });
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

  updateDataflow(dfId: string, dataflow: Dataflow.ValueObjects.Create) {
    const url = `${CommonConstant.API_CONSTANT.API_URL}/dataflows/${dfId}`;
    let params = {};
    if (dataflow) {
      params = _.merge(dataflow, params);
    }
    return this.http.patch(url, params);
  }

  deleteDataflow() {
    return this.http.delete(``);
  }
}
