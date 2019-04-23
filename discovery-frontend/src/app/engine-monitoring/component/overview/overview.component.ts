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

import {AfterViewInit, Component, ElementRef, Injector, OnDestroy, OnInit} from '@angular/core';
import {AbstractComponent} from '../../../common/component/abstract.component';
import {EngineService} from '../../service/engine.service';
import {Engine} from '../../../domain/engine-monitoring/engine';
import {error} from '@angular/compiler/src/util';
import * as _ from 'lodash';

@Component({
  selector: '[overview]',
  templateUrl: './overview.component.html',
  host: { '[class.ddp-wrap-contents-det]': 'true' }
})
export class OverviewComponent extends AbstractComponent implements OnInit, OnDestroy, AfterViewInit {

  public clusterStatus: Engine.ClusterStatus = new Engine.ClusterStatus();

  constructor(
    protected elementRef: ElementRef,
    protected injector: Injector,
    private engineService: EngineService) {
    super(elementRef, injector);
  }

  public ngOnInit() {
    super.ngOnInit();
    this._initialize();
  }

  public ngAfterViewInit() {
    super.ngAfterViewInit();
  }

  public ngOnDestroy() {
    super.ngOnDestroy();
  }

  public getStatusClass(status: string): string {

    let result = 'ddp-icon-status-success';

    if (_.isNil(status)) {
      return result;
    }

    switch (status.toUpperCase()) {
      case 'true':
        result = 'ddp-icon-status-success';
        break;
      case 'warn':
        result = 'ddp-icon-status-warning';
        break;
      case 'error':
        result = 'ddp-icon-status-error';
        break;
      default:
        console.error('정의되지 않은 아이콘 타입입니다.', status);
        break;
    }

    return result;
  }

  /**
   * 전체 서버 목록 조회(상태 포함)
   */
  private _getMonitoringPromise() {
    return new Promise((resolve, reject) => {
      return this.engineService.getMonitoring()
        .then(resolve)
        .catch(reject)
    })
  }

  /**
   * 서버 타입별 상태 조회
   */
  private _getMonitoringServersHealthPromise() {
    return new Promise((resolve, reject) => {
      return this.engineService.getMonitoringServersHealth()
        .then(resolve)
        .catch(reject)
    });
  }

  private _initialize() {
    Promise.resolve()
      .then(() => this.loadingShow())
      .then(() => this._getMonitoringPromise().then())
      .then(() => this._getMonitoringServersHealthPromise().then())
      .then(() => this.loadingHide())
      .catch(error => this.commonExceptionHandler(error));
  }
}
