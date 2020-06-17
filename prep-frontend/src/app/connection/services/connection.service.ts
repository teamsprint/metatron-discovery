import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {of} from 'rxjs';
import {ConnectionModule} from '../connection.module';
import {CommonConstant} from '../../common/constants/common.constant';
import {Connection} from '../domains/connection';
import {Page} from '../../common/constants/page';
import {CommonUtil} from '../../common/utils/common-util';
import * as _ from 'lodash';

@Injectable()
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

  getConnection(connId: string) {

    const url = `${CommonConstant.API_CONSTANT.API_URL}/connections/${connId}`;

    if (!connId) {
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
    return this.http.get<Connection.Result.GetConnections.SearchedData>(`${CommonConstant.API_CONSTANT.API_URL}/connections/search/findByNameContaining`,
      {params: CommonUtil.Http.makeQueryString(params)});
  }

  updateConnection(connId: string, connectionParam: Connection.Entity) {
    return this.http.patch(`${CommonConstant.API_CONSTANT.API_URL}/connections/${connId}`, JSON.stringify(connectionParam));
  }

  deleteConnection(connId: string) {
    return this.http.delete(``);
  }

  getDatabases(connectionParam: Connection.Entity) {
    const url = `${CommonConstant.API_CONSTANT.API_URL}/connections/query/databases`;

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

  getTables(connectionParam: Connection.Entity, databaseName: string) {
    const url = `${CommonConstant.API_CONSTANT.API_URL}/connections/query/tables`;

    if (!connectionParam || !databaseName) {
      return of(new HttpErrorResponse({
        url,
        status: 400,
        statusText: 'Invalid connection value'
      }));
    }
    const param = {connection: connectionParam, database: databaseName};
    return this.http.post(url, JSON.stringify(param));
  }

  getPreviewData(connectionParam: Connection.Entity, databaseName: string, tableName: string) {
    const url = `${CommonConstant.API_CONSTANT.API_URL}/connections/query/data?extractColumnName=false&limit=50`;
    if (!connectionParam || !databaseName || !tableName) {
      return of(new HttpErrorResponse({
        url,
        status: 400,
        statusText: 'Invalid connection value'
      }));
    }
    const param = {connection: connectionParam, database: databaseName, query: tableName, type: 'TABLE'};
    return this.http.post(url, JSON.stringify(param));
  }

}
