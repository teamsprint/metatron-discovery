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
import * as _ from 'lodash';

@Injectable()
export class LineageViewService extends AbstractService {

/*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
| Private Variables
|-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

private readonly URL_LINEAGENODE = this.API_URL + 'lineagenodes';

/*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
| Protected Variables
|-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

/*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
| Public Variables
|-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

/*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
| Constructor
|-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

constructor(protected injector: Injector) {
super(injector);
}

/*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
| Override Method
|-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

/*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
| Public Method
|-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * 리니지 노드 목록 조회
   * @param {string} projection
   * @returns {Promise<any>}
   */
  public getLineageNodes(projection: string = 'forDetailView'): Promise<any> {
    return this.get(this.URL_LINEAGENODE + `?projection=${projection}`);
  }

  /**
   * 메타데이터를 기준으로 리니지 노드 목록 조회
   * @param {string} metadataId
   * @param {string} projection
   * @returns {Promise<any>}
   */
  public getLineageNodesForMetadata(metadataId: string, projection: string = 'forDetailView'): Promise<any> {
    return this.get(this.URL_LINEAGENODE + `/${metadataId}?projection=${projection}`);
  }

  /**
   * 메타데이터 이름을 기준으로 리니지 노드 목록 조회
   * @param {string} metadataName
   * @param {string} projection
   * @returns {Promise<any>}
   */
  public getLineageNodesForMetadataName(metadataName: string, projection: string = 'forDetailView'): Promise<any> {
    return this.get(this.URL_LINEAGENODE + `?nameContain=${metadataName}`);
  }

  public postLineageNode(params: any): Promise<any> {
    return this.post(this.URL_LINEAGENODE, params);
  }
}
