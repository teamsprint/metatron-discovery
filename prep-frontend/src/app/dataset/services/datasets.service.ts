/* tslint:disable */
import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {CommonConstant} from '../../common/constants/common.constant';
import {CookieConstant} from '../../common/constants/cookie.constant';
import {Page} from '../../common/constants/page';
import {CommonUtil} from '../../common/utils/common-util';
import {Dataset} from '../domains/dataset';
import {Observable, of} from 'rxjs';
import * as _ from 'lodash';
import {HTTPStatusCode} from '../../common/domain/http-status-code';
import {HttpHeaders} from "@angular/common/http";
import {CookieService} from 'ngx-cookie-service';

@Injectable()
export class DatasetsService {

  constructor(private readonly http: HttpClient,
              private readonly cookieService: CookieService) {
  }

  createDataset(dataset: Dataset.Entity) {
    const url = `${CommonConstant.API_CONSTANT.API_URL}/datasets`;

    if (!dataset) {
      return of(new HttpErrorResponse({
        url,
        status: HTTPStatusCode.BadRequest,
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
        status: HTTPStatusCode.BadRequest,
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

  public downloadDataset(dsId: string, fileFormat: string): Observable<any> {
    let mineType: string;
    if (fileFormat === 'csv') {
      mineType = 'application/csv';
    } else if (fileFormat === 'json') {
      mineType = 'application/json';
    }
    let headers = new HttpHeaders({
      'Accept': mineType,
      'Content-Type': 'application/octet-binary',
      'Authorization': this.cookieService.get(CookieConstant.KEY.LOGIN_TOKEN_TYPE) + ' ' + this.cookieService.get(CookieConstant.KEY.LOGIN_TOKEN)
    });

    let option: Object = {
      headers: headers,
      responseType: 'blob'
    };

    return this.http.get(`${CommonConstant.API_CONSTANT.API_URL}/datasets/${dsId}/download?fileType=`+fileFormat, option)
  }
}
