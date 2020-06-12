import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {of} from 'rxjs';
import {ConnectionModule} from '../connection.module';
import {CommonConstant} from '../../common/constants/common.constant';
import {Connection} from '../domains/connection';
import {Page} from '../../common/constants/page';
import {CommonUtil} from '../../common/utils/common-util';
import * as _ from 'lodash';

@Injectable({
  providedIn: ConnectionModule
})
export class ConnectionService {

  constructor(private readonly http: HttpClient) {
  }

  checkConnection(connectionParam: Connection.Entity) {
    const url = `${CommonConstant.API_CONSTANT.API_URL}/connections/query/check`;
    if (!connectionParam) {
      return of(new HttpErrorResponse({
        url,
        status: 400,
        statusText: 'Invalid connection value'
      }));
    }
    const param = {connection: connectionParam};
    return this.http.post(url, JSON.stringify(param));
  }

  createConnection(connection: Connection.Entity) {

    const url = `${CommonConstant.API_CONSTANT.API_URL}/connections`;

    if (!connection) {
      return of(new HttpErrorResponse({
        url,
        status: 400,
        statusText: 'Invalid connection value'
      }));
    }

    return this.http.post(url, JSON.stringify(connection));
  }

  getConnection(connectionId: string) {

    const url = `${CommonConstant.API_CONSTANT.API_URL}/connections/${connectionId}`;

    if (!connectionId) {
      return of(new HttpErrorResponse({
        url,
        status: 400,
        statusText: 'Invalid connectionId value'
      }));
    }

    return this.http.get(url);
  }

  getConnections(searchText: string,
                 page: Page, projection = 'forListView') {

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
    return this.http.get(`${CommonConstant.API_CONSTANT.API_URL}/connections/search/findByNameContaining`,
      {params: CommonUtil.Http.makeQueryString(params)});
  }

  updateConnection() {
    return this.http.patch(``, {});
  }

  deleteConnection() {
    return this.http.delete(``);
  }
}
