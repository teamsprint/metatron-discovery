import {Injectable} from '@angular/core';
import {JobResultModule} from '../job-result.module';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: JobResultModule
})
export class JobResultService {

  constructor(private readonly http: HttpClient) {
  }

  createJobResult() {
    return this.http.post(``, {});
  }

  getJobResult() {
    return this.http.get(``);
  }

  getJobResults() {
    return this.http.get(``);
  }

  updateJobResult() {
    return this.http.patch(``, {});
  }

  deleteJobResult() {
    return this.http.delete(``);
  }
}
