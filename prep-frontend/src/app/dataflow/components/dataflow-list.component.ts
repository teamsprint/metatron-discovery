import {Component} from '@angular/core';
import {LocalStorageService} from '../../common/services/local-storage/local-storage.service';
import {ViewMode} from '../../main/value-objects/view-mode';

@Component({
  templateUrl: './dataflow-list.component.html',
  styleUrls: ['./dataflow-list.component.css']
})
export class DataflowListComponent {

  public readonly VIEW_MODE = ViewMode;

  constructor(public readonly localStorageService: LocalStorageService) {
  }
}
