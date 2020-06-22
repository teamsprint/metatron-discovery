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
  public dbTypeDataset: Dataset.DatasetDatabase;
  @Input()
  public fileTypeDatasets: Dataset.Entity[];

  public importDBType = Dataset.IMPORT_TYPE.DATABASE;
  public importUploadType = Dataset.IMPORT_TYPE.UPLOAD;
  public isNameError = false;
  public name = '';
  public description = '';
  public datasetInfo: DatasetInfo[] = [];

  constructor(private readonly datasetService: DatasetsService,
              private readonly loadingService: LoadingService) {
  }


  ngOnInit(): void {
    if (this.importType === this.importDBType) {
      this.makeDatasetInfoForDb();
    }
  }

  private makeDatasetInfoForDb() {
    this.datasetInfo = [];
    if (this.dbTypeDataset != null) {
      const info1: DatasetInfo = new DatasetInfo();
      info1.svg = this.dbTypeDataset.implementor.toUpperCase();
      info1.name = 'ImportType';
      info1.value = this.dbTypeDataset.implementor;

      const info2: DatasetInfo = new DatasetInfo();
      info2.svg = '';
      info2.name = 'Connection';
      info2.value = this.dbTypeDataset.connectionName;

      const info3: DatasetInfo = new DatasetInfo();
      info3.svg = '';
      info3.name = 'Database';
      info3.value = this.dbTypeDataset.dbName;

      const info4: DatasetInfo = new DatasetInfo();
      info4.svg = '';
      info4.name = 'Table';
      info4.value = this.dbTypeDataset.tblName;

      this.datasetInfo.push(info1);
      this.datasetInfo.push(info2);
      this.datasetInfo.push(info3);
      this.datasetInfo.push(info4);
    }
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

    const dataset: Dataset.Entity = new Dataset.Entity();
    dataset.name = this.name;
    dataset.description = this.description;
    dataset.importType = this.importDBType;
    dataset.connId = this.dbTypeDataset.connId;
    dataset.rsType = Dataset.RS_TYPE.TABLE;
    dataset.dbName = this.dbTypeDataset.dbName;
    dataset.tblName = this.dbTypeDataset.tblName;
    dataset.queryStmt = this.dbTypeDataset.queryStmt;

    this.dbTypeDataset.name = this.name;
    this.dbTypeDataset.description = this.description;
    this.dbTypeDataset.importType = this.importDBType;
    this.loadingService.show();
    this.datasetService.createDataset(dataset)
      .pipe(finalize(() => this.loadingService.hide()))
      .subscribe(result => {
        if (result !== null) {
          this.onDone.emit();
        }
      });
  }
}

class DatasetInfo {
  name: string;
  value: string;
  svg?: string;
}
