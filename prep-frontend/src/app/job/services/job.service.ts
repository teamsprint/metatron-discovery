import {Injectable} from '@angular/core';
import {JobModule} from '../job.module';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: JobModule
})
export class JobService {

  constructor(private readonly http: HttpClient) {
  }

  createJob() {
    return this.http.post(``, {});
  }

  getJob() {
    return this.http.get(``);
  }

  getJobs() {
    return this.http.get(``);
  }

  updateJob() {
    return this.http.patch(``, {});
  }

  deleteJob() {
    return this.http.delete(``);
  }
}
