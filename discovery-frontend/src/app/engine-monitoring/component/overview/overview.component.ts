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

import {AfterViewInit, Component, ElementRef, EventEmitter, Injector, OnDestroy, OnInit, Output} from '@angular/core';
import {AbstractComponent} from '../../../common/component/abstract.component';
import {StateService} from '../../service/state.service';
import {EngineService} from '../../service/engine.service';
import {Engine} from "../../../domain/engine-monitoring/engine";

@Component({
  selector: '[overview]',
  templateUrl: './overview.component.html',
  host: {'[class.ddp-wrap-contents-det]': 'true'},
})
export class OverviewComponent extends AbstractComponent implements OnInit, OnDestroy, AfterViewInit {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  @Output('completeLoad')
  private readonly _completeLoad = new EventEmitter();



  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Variables
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  public clusterStatus:Engine.ClusterStatus = new Engine.ClusterStatus();
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // noinspection JSUnusedLocalSymbols
  constructor(
    protected elementRef: ElementRef,
    protected injector: Injector,
    private engineService: EngineService) {
    super(elementRef, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Override Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  public ngOnInit() {
    super.ngOnInit();
    this._completeLoad.emit();
    this.init();

  }

  public ngAfterViewInit() {
    super.ngAfterViewInit();
  }

  public ngOnDestroy() {
    super.ngOnDestroy();
  }


  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Public Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  public init(){
    this._initView();
  }

  /**
   * 전체 서버 목록 조회(상태 포함)
   */
  public getMonitoring(){
    this.loadingShow();
    // 전체 서버 목록 조회(상태 포함)
    this.engineService.getMonitoring().then((result) => {
      this.loadingHide();

    }).catch((error) => {
      this.loadingHide();
    });

  }
  /**
   * 서버 타입별 상태 조회
   */
  public getMonitoringServersHealth(){
    this.loadingShow();
    // 서버 타입별 상태 조회
    this.engineService.getMonitoringServersHealth().then((result) => {
      this.loadingHide();

    }).catch((error)=> {
      this.loadingHide();

    });
  }

  /**
   * 차트조회
   */
  public getMonitoringQuery(){
    this.loadingShow();
    // 차트조회
    this.engineService.getMonitoringQuery().then((result) => {
        this.loadingHide();
      }
    ).catch((error)=> {
      this.loadingHide();

    });

  }
  public getStatusClass(status: string): string {
    let result = 'ddp-icon-status-success';
    if(undefined == status ){
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

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Protected Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Private Method
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /**
   * ui init
   * @param
   * @private
   */
  private _initView() {
    // 전체 서버 목록 조회(상태 포함)
    this.getMonitoring();
    // 서버 타입별 상태 조회
    this.getMonitoringServersHealth();
    // 차트조회
    // this.getMonitoringQuery();getMonitoringQuery
    console.log('initView');
  }


}
