import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {CommonConstant} from '../../common/constants/common.constant';
import {Page} from '../../common/constants/page';
import {CommonUtil} from '../../common/utils/common-util';
import {Dataset} from '../domains/dataset';
import {of} from 'rxjs';
import * as _ from 'lodash';

@Injectable()
export class DatasetsService {

  constructor(private readonly http: HttpClient) {
  }

  createDataset(dataset: Dataset.Entity) {
    const url = `${CommonConstant.API_CONSTANT.API_URL}/datasets`;

    if (!dataset) {
      return of(new HttpErrorResponse({
        url,
        status: 400,
        statusText: 'Invalid connection value'
      }));
    }

    return this.http.post(url, JSON.stringify(dataset));
  }

  getDataset(dsId: string, preview = 'true') {
    const url = `${CommonConstant.API_CONSTANT.API_URL}/datasets/${dsId}`;

    if (!dsId) {
      return of(new HttpErrorResponse({
        url,
        status: 400,
        statusText: 'Invalid connectionId value'
      }));
    }
    let params = {};
    if (preview) {
      params = _.merge({ preview }, params);
    }
    return this.http.get(url, { params: CommonUtil.Http.makeQueryString(params) });
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
      { params: CommonUtil.Http.makeQueryString(params) });
  }


  updateDataset() {
    return this.http.patch(``, {});
  }

  deleteDataset() {
    return this.http.delete(``);
  }

  /**
   * 1st step of 3-way negotiation for file uploading
   */
  public getFileUploadNegotiation() {
    const url = `${CommonConstant.API_CONSTANT.API_URL}/preparationdatasets/file_upload`;
    return this.http.get(url);
  }

  public getFileGridInfo(param: {storedUri: string, delimiter?: string, quoteChar?: string, manualColumnCount?: number}) {

    let url = `${CommonConstant.API_CONSTANT.API_URL}/preparationdatasets/file_grid?storedUri=` + encodeURI(param.storedUri);

    if (param.delimiter) {
      url += `&delimiterCol=${encodeURI(param.delimiter)}`;
    }
    if (param.quoteChar !== undefined) {
      url += `&quoteChar=${encodeURI(param.quoteChar)}`;
    }
    if (param.manualColumnCount){
      url += `&manualColumnCount=${param.manualColumnCount}`;
    }

    return this.http.get(url);
  }
}
