import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree} from '@angular/router';
import {Observable} from 'rxjs';
import {LocalStorageService} from '../../../common/services/local-storage/local-storage.service';
import * as _ from 'lodash';

@Injectable()
export class PreMainGuard implements CanActivate {

  constructor(private readonly localStorageService: LocalStorageService) {
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    if (_.isNil(this.localStorageService.currentViewMode()) || _.isEmpty(this.localStorageService.currentViewMode())) {
      this.localStorageService.setDefaultViewMode();
    }

    return true;
  }

}
