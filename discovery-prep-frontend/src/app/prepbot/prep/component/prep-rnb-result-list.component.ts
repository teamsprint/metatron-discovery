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

import {
    Component, ElementRef, Injector, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import {AbstractComponent} from "../../../common/component/abstract.component";
import {PrDataSnapshot, Status} from '../../../domain/data-preparation/pr-snapshot';
import {DataflowService} from "../service/dataflow.service";
@Component({
    selector: 'prep-rnb-result-list',
    templateUrl: './prep-rnb-result-list.component.html',
})
export class PrepRnbResultListComponent extends AbstractComponent {


    @Input()
    public dsId: string;

    @Output()
    private snapshotDetailEvent:EventEmitter<string> = new EventEmitter<string>();


    public snapshotList : PrDataSnapshot[]= [];

    private inInterval: any;
    private delayTime: number = 10000;


    // 생성자
    constructor(protected elementRef: ElementRef,
                private dataflowService:DataflowService,
                protected injector: Injector) {

        super(elementRef, injector);
    }

    /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
 | Override Method
 |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

    public ngOnInit() {
        super.ngOnInit();

        this.getSnapshotList();

    }

    // Destory
    public ngOnDestroy() {
        super.ngOnDestroy();
    }



    public snapshotDetail(snapshot : PrDataSnapshot): void {
        if (snapshot.status === Status.CANCELED || snapshot.isCancel) {
            return;
        }
        this.snapshotList.forEach((item) => {
            item.isCancel = false;
        });
        this.snapshotDetailEvent.emit(snapshot.ssId);
    }


    public getSnapshotList(): void {
        this.dataflowService.getWorkList({dsId : this.dsId}).then((result) => {
            // this.snapshotList = [];
            if(result['snapshots'] && 0 < result['snapshots'].length) {
                this.snapshotList = result['snapshots'];
            }else{
                this.snapshotList = [];
            }

            let chk : number = -1;
            if(this.snapshotList.length > 0) {
                for(let i =0; i< this.snapshotList.length; i++ ) {
                    if(this.snapshotList[i].status !== Status.SUCCEEDED && this.snapshotList[i].status !== Status.FAILED) {
                        chk =i;
                        break;
                    }
                }
                // TIMER
                if(chk>-1) {
                    this.timerExec();
                }

            }
        }).catch(() => {
            //
        })
    }


    private timerExec(): void {

        if(this.inInterval != null) {
            clearTimeout(this.inInterval);
            this. inInterval = null;
        }

        const vthis = this;
        this.inInterval = setTimeout(function () {
            vthis.getSnapshotList();
            clearTimeout(vthis.inInterval);
        }, vthis.delayTime)
    }






}