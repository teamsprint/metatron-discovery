import {Component} from '@angular/core';
import {Location} from '@angular/common';
import {ViewMode} from '../../main/value-objects/view-mode';
import {LocalStorageService} from '../../common/services/local-storage/local-storage.service';

@Component({
  templateUrl: './dataset.component.html',
  styleUrls: ['./dataset.component.css']
})
export class DatasetComponent {

  public readonly VIEW_MODE = ViewMode;

  constructor(public readonly location: Location,
              public readonly localStorageService: LocalStorageService) {
  }
}
