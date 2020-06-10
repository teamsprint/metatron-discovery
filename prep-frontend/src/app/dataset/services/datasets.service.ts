import {Injectable} from '@angular/core';
import {DatasetModule} from '../dataset.module';
import {HttpClient} from '@angular/common/http';

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

  getDatasets() {
    return this.http.get(``);
  }

  updateDataset() {
    return this.http.patch(``, {});
  }

  deleteDataset() {
    return this.http.delete(``);
  }
}
