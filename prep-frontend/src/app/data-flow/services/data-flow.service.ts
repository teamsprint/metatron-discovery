import {Injectable} from '@angular/core';
import {DataFlowModule} from '../data-flow.module';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: DataFlowModule
})
export class DataFlowService {

  constructor(private readonly http: HttpClient) {
  }

  createDataFlow() {
    return this.http.post(``, {});
  }

  getDataFlow() {
    return this.http.get(``);
  }

  getDataFlows() {
    return this.http.get(``);
  }

  updateDataFlow() {
    return this.http.patch(``, {});
  }

  deleteDataFlow() {
    return this.http.delete(``);
  }
}
