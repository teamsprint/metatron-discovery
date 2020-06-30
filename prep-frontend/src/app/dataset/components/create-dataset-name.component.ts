/* tslint:disable */
import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Dataset} from '../domains/dataset';
import {DatasetsService} from '../services/datasets.service';
import {LoadingService} from '../../common/services/loading/loading.service';
import {Dataflow} from '../../dataflow/domains/dataflow';
import {DataflowService} from '../../dataflow/services/dataflow.service';
import {finalize} from 'rxjs/operators';
import * as _ from 'lodash';
import {NGXLogger} from 'ngx-logger';

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
  @Output()
  public readonly onGotoDataflow = new EventEmitter();

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

  public nameErrors: string[] = [];
  public names: string[] = [];
  private fileTypeSaveCount  = 0;
  public isChecked = true; // jump to dataflow main grid


  constructor(private readonly datasetService: DatasetsService,
              private readonly dataflowService: DataflowService,
              private readonly loadingService: LoadingService,
              private readonly logger: NGXLogger) {
  }


  ngOnInit(): void {
    if (this.importType === this.importDBType) {
      this.makeDatasetInfoForDb();
    }else if (this.importType === this.importUploadType) {
      if (this.fileTypeDatasets !== null && this.fileTypeDatasets.length > 0) {
        this.fileTypeDatasets.forEach((item) => {
          this.nameErrors.push('');
          this.names.push(item.name);
        });
      }
      if (this.fileTypeDatasets !== null && this.fileTypeDatasets.length === 1) {
        this.makeDatasetInfoForUpload();
      }else{
        this.isChecked = false;
      }
    }
  }

  private makeDatasetInfoForDb() {
    this.datasetInfo = [];
    if (this.dbTypeDataset != null) {
      const info1: DatasetInfo = new DatasetInfo();
      info1.svg = this.dbTypeDataset.implementor.toUpperCase();
      info1.name = 'Import Type';
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

  private makeDatasetInfoForUpload() {
    this.datasetInfo = [];
    if (this.fileTypeDatasets[0].filenameBeforeUpload !== null && this.fileTypeDatasets[0].filenameBeforeUpload !== undefined) {
      const info1: DatasetInfo = new DatasetInfo();
      info1.svg = this.getFileItemIconName(this.fileTypeDatasets[0].filenameBeforeUpload).trim();
      info1.name = 'File Name';
      info1.value = this.fileTypeDatasets[0].filenameBeforeUpload as string;
      this.datasetInfo.push(info1);
    }

    if (this.fileTypeDatasets[0].sheetName !== null && this.fileTypeDatasets[0].sheetName !== undefined) {
      const info2: DatasetInfo = new DatasetInfo();
      info2.svg = '';
      info2.name = 'Sheet Name';
      info2.value = this.fileTypeDatasets[0].sheetName;
      this.datasetInfo.push(info2);
    }

    if (this.fileTypeDatasets[0].delimiter !== null && this.fileTypeDatasets[0].delimiter !== undefined) {
      const info3: DatasetInfo = new DatasetInfo();
      info3.svg = '';
      info3.name = 'Delimiter';
      info3.value = this.fileTypeDatasets[0].delimiter;
      this.datasetInfo.push(info3);
    }
  }

  public complete() {
    if (this.importType === this.importDBType) {
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
    } else if (this.importType === this.importUploadType) {
      this.nameErrors.forEach((nerror, idx) => {
        this.nameErrors[idx] = '';
      });

      let errorNumber = -1;
      this.names.forEach((name, idx) => {
        if (errorNumber < 0) {
          if (name === null || name.trim() === '') {
            errorNumber = idx;
          }
        }
      });
      if (errorNumber > -1) {
        this.nameErrors[errorNumber] = 'error';
        return;
      }

      this.names.forEach((name, idx) => {
        this.fileTypeDatasets[idx].name = name;
      });
      this.fileTypeSaveCount = 0;
      this.fileTypeComplete();
    }
  }

  private fileTypeComplete() {
    this.loadingService.show();
    this.datasetService.createDataset(this.fileTypeDatasets[this.fileTypeSaveCount])
      .pipe(finalize(() => this.loadingService.hide()))
      .subscribe(result => {
        if (result !== null) {
          this.fileTypeSaveCount++;
          if (this.fileTypeSaveCount < this.fileTypeDatasets.length) {
            this.fileTypeComplete();
          } else {
            this.onDone.emit();
          }
        }
      });
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
          if (this.isChecked) {
            this.makeDataflow(result['dsId'], result['name']);
          } else {
            this.onDone.emit();
          }
        }
      });
  }

  private makeDataflow(dsId: string, name: string) {
    const today = new Date();
    let fileSurfix: string = today.toISOString();
    fileSurfix = fileSurfix.replace(/[^0-9]/g,'');

    const dataflow: Dataflow.ValueObjects.Create = new Dataflow.ValueObjects.Create();
    dataflow.name = `${name}_${fileSurfix}` ;
    dataflow.dataset = [];
    dataflow.dataset.push(dsId);

    this.loadingService.show();
    this.dataflowService.createDataflow(dataflow)
      .pipe(finalize(() => this.loadingService.hide()))
      .subscribe(result => {
        if (result !== null) {
          this.detailDataflow(result['dfId']);
        }
      });
  }

  private detailDataflow(dfId: string) {
    let recipeId = null;
    this.loadingService.show();
    this.dataflowService
      .getDataflow(dfId)
      .pipe(finalize(() => this.loadingService.hide()))
      .subscribe(
        (r: Dataflow.ValueObjects.Select) => {
          if (!r) {
            return;
          }
          const newDataflow: Dataflow.ValueObjects.Select = r;
          if (newDataflow.diagramData !== null && newDataflow.diagramData.length > 1) {
            for (let i = 0; i < newDataflow.diagramData.length; i = i + 1) {
              if (newDataflow.diagramData[ i ].objType === Dataflow.DataflowDiagram.ObjectType.RECIPE) {
                recipeId = newDataflow.diagramData[ i ].objId;
                break;
              }
            }
          }
          if (recipeId !== null) {
            const param = {};
            param[ 'dfId' ] = dfId;
            param[ 'recipeId' ] = recipeId;
            this.onGotoDataflow.emit(param);
          } else {
            this.onDone.emit();
          }
        },
        e => {
          this.logger.error('[GET] dataflow', e);
        }
      );
  }

  private getFileItemIconName(filenameBeforeUpload: string ): string {
    const className: string = this._getFileFormatForIcon(filenameBeforeUpload).toString();
    return className.toUpperCase();
  }

  public getFileItemIconClassName(filenameBeforeUpload: string ): string {
    const className: string = this._getFileFormatForIcon(filenameBeforeUpload).toString();
    return 'type-' + className.toLowerCase();
  }

  private _getFileFormatForIcon(fileName) {
    const fileTypeArray: string[] = fileName.toUpperCase().split('.');
    const fileType: string = fileTypeArray[fileTypeArray.length - 1];

    const formats = [
      {extension: 'CSV', fileFormat: Dataset.FILE_FORMAT.CSV},
      {extension: 'TXT', fileFormat: Dataset.FILE_FORMAT.TXT},
      {extension: 'JSON', fileFormat: Dataset.FILE_FORMAT.JSON},
      {extension: 'XLSX', fileFormat: 'xlsx'},
      {extension: 'XLS', fileFormat: 'xls'},
    ];
    const idx = _.findIndex(formats, {extension: fileType});
    if (idx !== -1) {
      return formats[idx].fileFormat;
    } else {
      return formats[0].fileFormat;
    }
  }

}

class DatasetInfo {
  name: string;
  value: string;
  svg?: string;
}
