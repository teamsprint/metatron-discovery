import {Injectable} from '@angular/core';
import {DatasetModule} from '../dataset.module';
import {HttpClient} from '@angular/common/http';
import {CommonConstant} from '../../common/constants/common.constant';
import {Page} from '../../common/constants/page';
import {CommonUtil} from '../../common/utils/common-util';
import {Dataset} from '../domains/dataset';
import * as _ from 'lodash';

@Injectable({
  providedIn: DatasetModule
})
export class DatasetsService {

  constructor(private readonly http: HttpClient) {
  }

  createDataset() {
    return this.http.post(``, {});
  }

  getDataset() {
    return this.http.get(``);
  }


  getDatasets(searchText: string, page: Page, projection = 'forListView') {

    let params = {};

    if (searchText) {
      params = _.merge({ name: searchText }, params);
    }
    if (!searchText) {
      params = _.merge({ name: '' }, params);
    }
    if (page) {
      params = _.merge(page, params);
    }
    if (projection) {
      params = _.merge({ projection }, params);
    }
    return this.http.get<Dataset.Result.GetDatasets.SearchedData>(`${CommonConstant.API_CONSTANT.API_URL}/datasets/search/findByNameContaining`,
      {params: CommonUtil.Http.makeQueryString(params)});
  }



  updateDataset() {
    return this.http.patch(``, {});
  }

  deleteDataset() {
    return this.http.delete(``);
  }
}
