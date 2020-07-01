import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree} from '@angular/router';
import {Observable} from 'rxjs';
import * as _ from 'lodash';
import {RecipeLocalStorageService} from '../../common/services/local-storage/recipe-local-storage.service';

@Injectable()
export class PreRecipeDetailGuard implements CanActivate {

  constructor(private readonly recipeLocalStorageService: RecipeLocalStorageService) {
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    const recipeDetailSplitRate = this.recipeLocalStorageService.getRecipeDetailSplitRate();
    if (_.isNaN(recipeDetailSplitRate.left)
      || _.isNaN(recipeDetailSplitRate.right)) {
      this.recipeLocalStorageService.setDefaultRecipeDetailSplitRate();
    }

    return true;
  }
}
