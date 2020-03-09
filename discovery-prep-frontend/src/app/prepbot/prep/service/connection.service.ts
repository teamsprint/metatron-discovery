/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {Injectable, Injector} from '@angular/core';
import {AbstractService} from '../../../common/service/abstract.service';
import {CommonUtil} from '../../../common/util/common.util';
import {Page} from '../../../domain/common/page';
import {isNullOrUndefined} from "util";
import {Observable} from "rxjs/Observable";

@Injectable()
export class PrConnectionService extends AbstractService {

  // Dictionary url
  private URL_CONNECTIONS = this.API_URL + 'preparationconnections';

  constructor(protected injector: Injector) {
    super(injector);
  }

    // 데이터 커넥션 모든 목록
    public getAllDataconnections(param: any, projection: string = 'list'): Promise<any[]> {
        let url = this.API_URL + `connections`;
        if (param) {
            url += '?' + CommonUtil.objectToUrlString(param);
        }
        return this.get(url + '&projection=' + projection);
    }
    // 커넥션 상세정보 조회
    public getDataconnectionDetail(connectionId: string, projection: string = 'default'): Promise<any> {
        const url = this.API_URL + `connections/${connectionId}`;
        return this.get(url + '?projection=' + projection);
    }

  /**
     * Create connection
     * @param param
     * @returns {Promise<any>}
     */
    public createConnection(param : any) : Promise<any>  {
      return this.post(this.API_URL + 'preparationconnections', param);
    }
    public getConnections() : Promise<any>  {
          return this.get(this.API_URL + 'preparationconnections' );
    }


    // 커넥션 정보로만 데이터베이스 조회
    public getDatabasesWithoutId(param: any): Promise<any> {
        return this.post(this.API_URL + 'connections/query/databases', param);
    }

    // 커넥션 정보로 데이터 테이블 조회
    public getTablesWitoutId(param: any): Promise<any>  {
        return this.post(this.API_URL + 'connections/query/tables?size=5000', param);
    }

    // 테이블 상세조회
    public getTableDetailWitoutId(param: any, extractColumnName: boolean, limit: number = 50): Promise<any>  {
        return this.post(this.API_URL + `connections/query/data?extractColumnName=${extractColumnName}&limit=${limit}`, param);
    }
}
