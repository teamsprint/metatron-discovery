import {Injectable} from '@angular/core';
import {ViewMode} from '../../../main/value-objects/view-mode';
import {LocalStorageConstant} from '../../constants/local-storage.constant';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  private readonly VIEW_MODE = ViewMode;
  private readonly DEFAULT_VIEW_MODE = this.VIEW_MODE.CARD;

  setDefaultViewMode() {
    localStorage.setItem(LocalStorageConstant.KEY.MAIN_VIEW_MODE, this.DEFAULT_VIEW_MODE);
  }

  saveViewMode(viewMode: ViewMode) {
    localStorage.setItem(LocalStorageConstant.KEY.MAIN_VIEW_MODE, viewMode);
  }

  getCurrentViewMode() {
    return localStorage.getItem(LocalStorageConstant.KEY.MAIN_VIEW_MODE);
  }
}
