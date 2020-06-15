import {Injectable} from '@angular/core';
import {ViewMode} from '../../../../main/value-objects/view-mode';
import {LocalStorageConstant} from '../constants/local-storage.constant';

@Injectable({
  providedIn: 'root'
})
export class MainLocalStorageService {

  private readonly VIEW_MODE = ViewMode;
  private readonly DEFAULT_VIEW_MODE = this.VIEW_MODE.CARD;

  saveViewMode(viewMode: ViewMode) {
    localStorage.setItem(LocalStorageConstant.KEY.MAIN_VIEW_MODE, viewMode);
  }

  currentViewMode() {
    return localStorage.getItem(LocalStorageConstant.KEY.MAIN_VIEW_MODE);
  }

  setDefaultViewMode() {
    localStorage.setItem(LocalStorageConstant.KEY.MAIN_VIEW_MODE, this.DEFAULT_VIEW_MODE);
  }
}
