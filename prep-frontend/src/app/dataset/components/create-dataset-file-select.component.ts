/* tslint:disable */
import {Component, EventEmitter, Output, Input, OnInit, OnDestroy} from '@angular/core';
import {Dataset} from '../domains/dataset';
import {DatasetsService} from '../services/datasets.service';
import {CommonConstant} from '../../common/constants/common.constant';


@Component({
  selector: 'create-dataset-file-select',
  templateUrl: './create-dataset-file-select.component.html'
})

export class CreateDatasetFileSelectComponent implements OnInit{
  @Output()
  public readonly onClose = new EventEmitter();
  @Output()
  public readonly onGotoStep = new EventEmitter();
  @Input()
  public datasetFiles: Dataset.DatasetFile[] = [];

  ngOnInit(): void {
    //
  }
}
