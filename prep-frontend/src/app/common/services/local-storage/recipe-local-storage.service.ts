import {Injectable} from '@angular/core';
import {LocalStorageConstant} from '../../constants/local-storage.constant';
import * as _ from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class RecipeLocalStorageService {

  private readonly RECIPE_DETAIL_SPLIT_LEFT = '75';

  setDefaultRecipeDetailSplitRate() {
    localStorage.setItem(LocalStorageConstant.KEY.RECIPE_DETAIL_SPLIT_LEFT, this.RECIPE_DETAIL_SPLIT_LEFT);
  }

  saveRecipeDetailSplitRate(leftRate: number) {

    let left;

    try {
      left = leftRate.toString();
    } catch (e) {
      this.setDefaultRecipeDetailSplitRate();
    }

    localStorage.setItem(LocalStorageConstant.KEY.RECIPE_DETAIL_SPLIT_LEFT, left);
  }

  getRecipeDetailSplitRate() {

    const leftRate = _.toNumber(localStorage.getItem(LocalStorageConstant.KEY.RECIPE_DETAIL_SPLIT_LEFT));

    if (_.isNaN(leftRate)) {
      return {
        left: _.toNumber(this.RECIPE_DETAIL_SPLIT_LEFT),
        right: Math.abs(_.toNumber(this.RECIPE_DETAIL_SPLIT_LEFT) - 100)
      };
    }

    return {
      left: leftRate,
      right: Math.abs(leftRate - 100)
    };
  }
}
