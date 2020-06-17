import {Component, EventEmitter, HostBinding, Output, ViewChild} from '@angular/core';


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

  public createDatasetInfo() {
    // create-dataset-type
    // create-dataset-file-upload
    // create-dataset-file-select
    // create-dataset-database
    // create-dataset-name
    this.step = 'create-dataset-type';

  }

  public typePageGotoStep(step: string) {
    this.step = step;
  }

  public fileUploadPageGotoStep(step: string) {
    if (step === 'create-dataset-file-select') {
      //
    } else if (step === 'create-dataset-type') {
      //
    }


    this.step = step;
  }

  public databasePageGotoStep(step: string) {
    this.step = step;
  }
}
