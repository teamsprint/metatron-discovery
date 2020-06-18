import {Component, EventEmitter, Output, Input, OnInit} from '@angular/core';
import {Dataset} from '../domains/dataset';
import {DatasetsService} from '../services/datasets.service';
import {CommonConstant} from '../../common/constants/common.constant';
import {ConnectionService} from '../../connection/services/connection.service';
import {LoadingService} from '../../common/services/loading/loading.service';
import {finalize} from 'rxjs/operators';

@Component({
  selector: 'create-dataset-name',
  templateUrl: './create-dataset-name.component.html'
})

export class CreateDatasetNameComponent implements OnInit{
  @Output()
  public readonly onClose = new EventEmitter();
  @Output()
  public readonly onGotoStep = new EventEmitter();
  @Output()
  public readonly onDone = new EventEmitter();
  @Input()
  public importType: Dataset.IMPORT_TYPE;
  @Input()
  public dbTypeDataset: Dataset.Entity;
  @Input()
  public fileTypeDatasets: Dataset.Entity[];

  public importDBType = Dataset.IMPORT_TYPE.DATABASE;
  public importUploadType = Dataset.IMPORT_TYPE.UPLOAD;
  public isNameError = false;
  public name = '';
  public description = '';

  constructor(private readonly datasetService: DatasetsService,
              private readonly loadingService: LoadingService) {
  }


  ngOnInit(): void {
    //
    // console.info('======', this.importType);
  }

  public complete() {
    this.isNameError = false;
    if (this.name === '' || this.name.length === 0) {
      this.isNameError = true;
    }
    if (this.isNameError) {
      return;
    }

    if (this.importType === this.importDBType) {
        this.dbTypeComplete();
    }
  }

  private dbTypeComplete() {

    if (this.dbTypeDataset === null) {
      return;
    }
    this.dbTypeDataset.name = this.name;
    this.dbTypeDataset.description = this.description;
    this.dbTypeDataset.importType = this.importDBType;
    this.loadingService.show();
    this.datasetService.createDataset(this.dbTypeDataset)
      .pipe(finalize(() => this.loadingService.hide()))
      .subscribe(result => {
        if (result !== null) {
          this.onDone.emit();
        }
      });
  }

}
