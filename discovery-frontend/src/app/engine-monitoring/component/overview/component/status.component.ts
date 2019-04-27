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

import {Component, ElementRef, Injector, Input, OnDestroy, OnInit} from '@angular/core';
import {AbstractComponent} from '../../../../common/component/abstract.component';
import {Engine} from '../../../../domain/engine-monitoring/engine';

@Component({
  selector: '[overview-status-view]',
  templateUrl: './status.component.html',
  host: { '[class.ddp-box-type]': 'true' }
})
export class StatusComponent extends AbstractComponent implements OnInit, OnDestroy {

  @Input()
  public clusterStatus: Engine.Cluster.Status;

  private readonly NORMAL_CLASS = 'ddp-icon-status-success';
  private readonly WARN_CLASS = 'ddp-icon-status-warning';
  private readonly ERROR_CLASS = 'ddp-icon-status-error';
  private readonly NONE_CLASS = '';

  constructor(protected elementRef: ElementRef,
              protected injector: Injector) {
    super(elementRef, injector);
  }

  public ngOnInit() {
    super.ngOnInit();
  }

  public ngOnDestroy() {
    super.ngOnDestroy();
  }

  public getStatusClass(clusterStatus: Engine.Cluster.Code) {
    switch (clusterStatus) {
      case Engine.Cluster.Code.NORMAL:
        return this.NORMAL_CLASS;
      case Engine.Cluster.Code.WARN:
        return this.WARN_CLASS;
      case Engine.Cluster.Code.ERROR:
        return this.ERROR_CLASS;
      default:
        return this.NONE_CLASS;
    }
  }
}
