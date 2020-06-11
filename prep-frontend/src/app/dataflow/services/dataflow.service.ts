import {Injectable} from '@angular/core';
import {DataflowModule} from '../dataflow.module';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: DataflowModule
})
export class DataflowService {

  constructor(private readonly http: HttpClient) {
  }

  createDataflow() {
    return this.http.post(``, {});
  }

  getDataflow() {
    return this.http.get(``);
  }

  getDataflows() {
    return this.http.get(``);
  }

  updateDataflow() {
    return this.http.patch(``, {});
  }

  deleteDataflow() {
    return this.http.delete(``);
  }
}
