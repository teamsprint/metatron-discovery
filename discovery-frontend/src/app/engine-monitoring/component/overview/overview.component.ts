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
import {PageResult} from '../../../domain/common/page';
import * as _ from 'lodash';

@Component({
  selector: '[overview]',
  templateUrl: './overview.component.html',
  host: { '[class.ddp-wrap-contents-det]': 'true' }
})
export class OverviewComponent extends AbstractComponent implements OnInit, OnDestroy, AfterViewInit {

  public clusterStatus = new Engine.Cluster.Status();
  public monitorings: Engine.Monitoring[] = [];

  public keyword: string = '';
  public selectedStatus: 'ALL' | 'OK' | 'ERROR' = 'ALL';
  public tableSortProperty: string = '';
  public tableSortDirection: '' | 'desc' | 'asc' = '';

  constructor(protected elementRef: ElementRef,
              protected injector: Injector,
              private engineService: EngineService) {
    super(elementRef, injector);
  }

  public ngOnInit() {
    super.ngOnInit();
    this._createPageableParameter();
    this._initializeView();
  }

  public ngAfterViewInit() {
    super.ngAfterViewInit();
  }

  public ngOnDestroy() {
    super.ngOnDestroy();
  }

  private _initializeView() {
    Promise.resolve()
      .then(() => this.loadingShow())
      .then(() => {
        return this._getMonitoringServersHealthWithPromise()
          .then(result => {
            this.clusterStatus = result;
          })
      })
      .then(() => {
        return this._getMonitoringWithPromise(Engine.Monitoring.ofEmpty(), this.pageResult, 'forDetailView')
          .then(result => {
            this.monitorings = result._embedded.monitorings;
          })
      })
      .then(() => this.loadingHide())
      .catch(error => {
        this.clusterStatus = new Engine.Cluster.Status();
        this.monitorings = [];
        this.commonExceptionHandler(error);
      });
  }

  /**
   * Cllck hostname column
   */
  public clickHostameHeaderColumn(column: string) {
    if (this.tableSortProperty == column) {
      this.tableSortDirection = this.tableSortDirection == 'desc' ? 'asc' : 'desc';
    } else {
      this.tableSortDirection = 'desc';
    }
    this.tableSortProperty = column;
  }

  /**
   * Create labels with five node types.
   *  - broker, coordinator, historical, overlord, middleManager
   */
  public convertTypeLabel(type: Engine.NodeType) {
    switch (type) {
      case Engine.NodeType.BROKER:
        return this._toCamelCase(type);
      case Engine.NodeType.COORDINATOR:
        return this._toCamelCase(type);
      case Engine.NodeType.HISTORICAL:
        return this._toCamelCase(type);
      case Engine.NodeType.OVERLORD:
        return this._toCamelCase(type);
      case Engine.NodeType.MIDDLE_MANAGER:
        return this._toCamelCase(type);
      default:
        return type;
    }
  }

  /**
   * Utility function to change only the first letter to uppercase
   */
  private _toCamelCase(type: Engine.NodeType) {

    if (_.isNil(type)) {
      return '';
    }

    if (type.length === 0) {
      return type;
    }

    return `${type.charAt(0).toLocaleUpperCase()}${type.substring(1, type.length)}`;
  }

  /**
   * Pagenation processing is not available on this screen
   * create a Pageable parameter for importing a complete list
   */
  private _createPageableParameter() {
    this.pageResult.number = 0;
    this.pageResult.size = 5000;
  }

  private _getMonitoringWithPromise(monitoring: Engine.Monitoring, page: PageResult, projection: 'default' | 'forDetailView' | 'forServerHealth'): Promise<Engine.Result.Monitoring> {
    return new Promise((resolve, reject) => this.engineService.getMonitorings(monitoring, page, projection).then(resolve).catch(reject));
  }

  private _getMonitoringServersHealthWithPromise(): Promise<Engine.Result.Health> {
    return new Promise((resolve, reject) => this.engineService.getMonitoringServersHealth().then(resolve).catch(reject));
  }

  public changeKeyword(keyword: string) {
    this._initTableSortDirection();
    this.keyword = keyword;
  }

  public changeStatus(status: 'ALL' | 'OK' | 'ERROR') {
    this._initTableSortDirection();
    this.selectedStatus = status;
  }

  private _initTableSortDirection() {
    this.tableSortDirection = '';
  }
}
