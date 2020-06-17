/* tslint:disable */
import {ChangeDetectorRef, Injector, Component, ElementRef, EventEmitter, Output, Input, ViewChild, OnInit, OnDestroy} from '@angular/core';
import {CookieService} from 'ngx-cookie-service';
import {CookieConstant} from '../../common/constants/cookie.constant';
import {Dataset} from '../domains/dataset';
import {DatasetsService} from '../services/datasets.service';
import {CommonConstant} from '../../common/constants/common.constant';


@Component({
  selector: 'create-dataset-file-select',
  templateUrl: './create-dataset-file-select.component.html'
})


export class CreateDatasetFileSelectComponent {
  @Output()
  public readonly onClose = new EventEmitter();
  @Output()
  public readonly onGotoStep = new EventEmitter();
}
