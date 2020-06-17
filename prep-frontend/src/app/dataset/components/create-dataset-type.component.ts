import {Component, EventEmitter, Output, Input} from '@angular/core';

@Component({
  selector: 'create-dataset-type',
  templateUrl: './create-dataset-type.component.html'
})

export class CreateDatasetTypeComponent {
  @Output()
  public readonly onClose = new EventEmitter();
  @Output()
  public readonly onGotoStep = new EventEmitter();
}

