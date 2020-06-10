import {Injectable} from '@angular/core';
import {MainLocalStorageService} from './main-local-storage/main-local-storage.service';
import {ViewMode} from '../../../main/value-objects/view-mode';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  constructor(private readonly mainLocalStorageService: MainLocalStorageService) {
  }

  saveMainViewMode(viewMode: ViewMode) {
    this.mainLocalStorageService.saveMainViewMode(viewMode);
  }

  currentMainViewMode() {
    return this.mainLocalStorageService.currentMainViewMode();
  }

  setDefaultMainViewMode() {
    this.mainLocalStorageService.setDefaultMainViewMode();
  }
}
