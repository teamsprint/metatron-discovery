import {Component} from '@angular/core';
import {RouterUrls} from '../../common/constants/router.constant';
import {CommonUtil} from '../../common/utils/common-util';

@Component({
  templateUrl: './dataflow-detail.component.html',
  styleUrls: ['./dataflow-detail.component.css']
})
export class DataflowDetailComponent {

  public readonly ROUTER_URLS = RouterUrls;
  public readonly COMMON_UTIL = CommonUtil;
  public readonly UUID = this.COMMON_UTIL.Generate.makeUUID();
}
