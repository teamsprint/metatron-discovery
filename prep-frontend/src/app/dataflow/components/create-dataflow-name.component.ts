import {Component, OnInit, EventEmitter, Output, Input} from '@angular/core';
import {Dataflow} from '../domains/dataflow';
import {Dataset} from '../../dataset/domains/dataset';
import {DataflowService} from '../services/dataflow.service';
import {LoadingService} from '../../common/services/loading/loading.service';
import {finalize} from 'rxjs/operators';

@Component({
  selector: 'create-dataflow-name',
  templateUrl: './create-dataflow-name.component.html'
})
export class CreateDataflowNameComponent implements OnInit{
  @Output()
  public readonly onClose = new EventEmitter();
  @Output()
  public readonly onPrev = new EventEmitter();
  @Output()
  public readonly onDone = new EventEmitter();
  @Input()
  public selectedDatasets: Dataset.SimpleListEntity[] = []; // 선택된 데이터셋 리스트
  @Input()
  public dataflow: Dataflow.ValueObjects.Create;

  public isNameError = false;
  public name = '';
  public description = '';
  public datasetInformationList = [];

  constructor(private readonly dataflowService: DataflowService,
              private readonly loadingService: LoadingService) {
  }

  ngOnInit(): void {
    this._setDatasetInfo();
  }

  /** Complete */
  public complete() {
    this.isNameError = false;
    if (this.name === '' || this.name.length === 0) {
      this.isNameError = true;
    }
    if (this.isNameError) {
      return;
    }
    this.dataflow.name = this.name;
    this.dataflow.description = this.description;

    this.loadingService.show();
    this.dataflowService.createDataflow(this.dataflow)
      .pipe(finalize(() => this.loadingService.hide()))
      .subscribe(result => {
        if (result !== null) {
          this.onDone.emit();
        }
      });
  }

  private _setDatasetInfo() {
    this.datasetInformationList = [];

    for (const dataset of this.selectedDatasets) {
      this.datasetInformationList.push({name : 'Dataset Name', value : dataset.name, header: true});
      if (dataset.importType === Dataset.IMPORT_TYPE.UPLOAD || dataset.importType === Dataset.IMPORT_TYPE.URI) {
        const filepath: string = dataset.filenameBeforeUpload;
        this.datasetInformationList.push({name : 'Type', value : dataset.importType, header: false});
        this.datasetInformationList.push({name : 'File', value : filepath, header: false});
        // EXCEL
        if (this._getFileType(dataset.importType, filepath) === 'EXCEL') {
          this.datasetInformationList.push({name : 'Sheet', value : this.getSheetName(dataset), header: false });
        }

      } else if (dataset.importType === Dataset.IMPORT_TYPE.DATABASE) {
        this.datasetInformationList.push({name : 'Type', value : dataset.importType, header: false});
        if (dataset.dbName !== null && dataset.dbName !== undefined && dataset.dbName !== '') {
          this.datasetInformationList.push({ name : 'Database', value : this.getDatabase(dataset), header: false});
        }
        if (dataset.rsType === Dataset.RS_TYPE.TABLE) {
          this.datasetInformationList.push({ name : 'Table', value : this.getTable(dataset), header: false});
        } else {
          this.datasetInformationList.push({ name : 'SQL', value : this.getQueryStmt(dataset), header: false});
        }
      }
      this.datasetInformationList.push({name: null, value: null, header: false});
    }
  }
  private _getFileType(type: Dataset.IMPORT_TYPE, fileName: string): string {
    let result = 'CSV';
    if (type === Dataset.IMPORT_TYPE.UPLOAD) {
      const extension = new RegExp(/^.*\.(csv|xls|txt|xlsx|json)$/).exec(fileName)[1];
      if (extension.toUpperCase() === 'XLSX' || extension.toUpperCase() === 'XLS') {
        result =  'EXCEL';
      }  else if (extension.toUpperCase() === 'JSON') {
        result =  'JSON';
      }
    }
    return result;
  }
  /**
   * get names of sheet
   */
  private getSheetName(dataset: Dataset.SimpleListEntity): string {
    let result = 'N/A';
    if (dataset.sheetName) {
      result = dataset.sheetName;
    }
    return result;
  }
  private getDatabase(dataset: Dataset.SimpleListEntity) {
    return dataset.dbName;
  }
  private getTable(dataset: Dataset.SimpleListEntity) {
    return dataset.tblName;
  }
  private getQueryStmt(dataset: Dataset.SimpleListEntity) {
    return dataset.queryStmt;
  }

}
