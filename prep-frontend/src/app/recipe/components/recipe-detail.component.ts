import {Component} from '@angular/core';
import {Location} from '@angular/common';
import {ViewMode} from '../../main/value-objects/view-mode';
import {LocalStorageService} from '../../common/services/local-storage/local-storage.service';

@Component({
  templateUrl: './recipe-detail.component.html',
  styleUrls: ['./recipe-detail.component.css']
})
export class RecipeDetailComponent {

  public readonly VIEW_MODE = ViewMode;

  constructor(public readonly location: Location,
              public readonly localStorageService: LocalStorageService) {
  }
}
