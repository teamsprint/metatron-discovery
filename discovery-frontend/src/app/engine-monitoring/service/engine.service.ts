import {Injectable, Injector} from '@angular/core';
import {EngineServiceModule} from './engine-service.module';
import {AbstractService} from '../../common/service/abstract.service';

@Injectable({
  providedIn: EngineServiceModule
})
export class EngineService extends AbstractService {

  private readonly URL_MONITORING = this.API_URL + 'monitoring';

  constructor(protected injector: Injector) {
    super(injector);
  }

  /**
   * 전체 서버 목록 조회(상태 포함)
   */
  public getMonitoring() {
    return this.get(this.URL_MONITORING);
  }

  /**
   * 서버 타입별 상태 조회
   */
  public getMonitoringServersHealth() {
    return this.get(this.URL_MONITORING + '/servers/health');
  }

  /**
   * 차트조회
   */
  public getMonitoringQuery() {
    return this.get(this.URL_MONITORING + '/query');
  }
}
