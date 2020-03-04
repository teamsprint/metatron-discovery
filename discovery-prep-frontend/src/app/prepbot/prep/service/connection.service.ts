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
}
