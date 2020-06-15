import {Injectable} from '@angular/core';
import {MainLocalStorageService} from './main-local-storage/main-local-storage.service';
import {ViewMode} from '../../../main/value-objects/view-mode';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  constructor(private readonly mainLocalStorageService: MainLocalStorageService) {
  }

  saveViewMode(viewMode: ViewMode) {
    this.mainLocalStorageService.saveViewMode(viewMode);
  }

  currentViewMode() {
    return this.mainLocalStorageService.currentViewMode();
  }

  setDefaultViewMode() {
    this.mainLocalStorageService.setDefaultViewMode();
  }
}
