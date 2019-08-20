import {Injectable, Injector} from '@angular/core';
import {EngineServiceModule} from './engine-service.module';
import {AbstractService} from '../../common/service/abstract.service';
import {Engine} from '../../domain/engine-monitoring/engine';
import * as _ from 'lodash';
import {PageResult} from '../../domain/common/page';

@Injectable({
  providedIn: EngineServiceModule
})
export class EngineService extends AbstractService {

  private readonly URL_MONITORING = this.API_URL + 'monitoring';

  constructor(protected injector: Injector) {
    super(injector);
  }

  /**
   * Get full server list (including status)
   */
  public getMonitorings(monitoring: Engine.Monitoring,
                        page: PageResult,
                        projection: 'default' | 'forDetailView' | 'forServerHealth' = 'default'): Promise<Engine.Result.Monitoring> {

    let url = `${this.URL_MONITORING}?projection=${projection}`;

    if (_.negate((_.isNil))(monitoring.type)) {
      url += `&type=${monitoring.type}`;
    }

    if (_.negate((_.isNil))(monitoring.port)) {
      url += `&port=${monitoring.port}`;
    }

    if (_.negate((_.isNil))(monitoring.hostname)) {
      url += `&hostname=${monitoring.hostname}`;
    }

    if (_.negate((_.isNil))(monitoring.status)) {
      url += `&status=${monitoring.status}`;
    }

    if (_.negate((_.isNil))(page.number)) {
      url += `&number=${page.number}`;
    }

    if (_.negate((_.isNil))(page.size)) {
      url += `&size=${page.size}`;
    }

    return this.get(url);
  }

  /**
   * Get status inquiry by server type
   */
  public getMonitoringServersHealth(): Promise<Engine.Result.Health> {
    return this.get(this.URL_MONITORING + '/servers/health');
  }

  /**
   * Get chart data
   */
  public getMonitoringQuery() {
    return this.post(this.URL_MONITORING + '/query', null);
  }

  public getInformation(name) {
    return this.get(this.URL_MONITORING + '/information/' + name);
  }

  public getSize() {
    return this.get(this.URL_MONITORING + '/size');
  }

  public getRunningTasks() {
    return this.get(this.URL_MONITORING + '/tasks/running' );
  }
}
