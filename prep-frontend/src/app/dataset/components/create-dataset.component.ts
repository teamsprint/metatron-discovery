import {Component, EventEmitter, HostBinding, Output, ViewChild} from '@angular/core';
import {CreateDatasetFileUploadComponent} from './create-dataset-file-upload.component';
import {CreateDatasetDatabaseComponent} from './create-dataset-database.component';
import {Dataset} from '../domains/dataset';

@Component({
  selector: 'div[create-dataset]',
  templateUrl: './create-dataset.component.html',
  styleUrls: ['./create-dataset.component.css']
})


export class CreateDatasetComponent {
  @HostBinding('class.pb-layout-popup')
  public readonly pbLayoutPopupClass = true;
  @Output()
  public readonly onClose = new EventEmitter();
  @Output()
  public readonly onDone = new EventEmitter();
  public step = '';
  public datasetFiles: Dataset.DatasetFile[] = [];
  public importType: Dataset.IMPORT_TYPE;
  public dbTypeDataset: Dataset.Entity;
  public fileTypeDatasets: Dataset.Entity[] = [];

  @ViewChild(CreateDatasetFileUploadComponent)
  public fileUploadComponent: CreateDatasetFileUploadComponent;

  @ViewChild(CreateDatasetDatabaseComponent)
  public databaseComponent: CreateDatasetDatabaseComponent;

  public createDatasetInfo() {
    // create-dataset-type
    // create-dataset-file-upload
    // create-dataset-file-select
    // create-dataset-database
    // create-dataset-name
    this.step = 'create-dataset-type';

  }

  public commonPageGotoStep(step: string) {
    this.step = step;
  }

  public fileUploadPageGotoStep(step: string) {
    if (step === 'create-dataset-file-select') {
      //
      this.datasetFiles = this.fileUploadComponent.returnDatasetFiles();
    } else if (step === 'create-dataset-type') {
      //
    }
    this.step = step;
  }
  public fileSelectPageGotoStep(step: string) {

    this.step = step;
  }

  public databasePageGotoStep(step: string) {
    if (step === 'create-dataset-name') {
      this.importType = Dataset.IMPORT_TYPE.DATABASE;
      this.dbTypeDataset = this.databaseComponent.returnDbTypeDataset();
    }
    this.step = step;
  }
}
