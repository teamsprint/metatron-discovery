import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {of} from 'rxjs';
import {ConnectionModule} from '../connection.module';
import {CommonConstant} from '../../common/constants/common.constant';
import {Connection} from '../domains/connection';

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
    return this.http.post<Connection.ConnectionCheck>(url, JSON.stringify(param));
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

  getConnections() {
    return this.http.get(``);
  }

  updateConnection() {
    return this.http.patch(``, {});
  }

  deleteConnection() {
    return this.http.delete(``);
  }
}
