import {Component} from '@angular/core';
import {RouterUrls} from '../../common/constants/router.constant';
import {CommonUtil} from '../../common/utils/common-util';

@Component({
  templateUrl: './data-flow-detail.component.html',
  styleUrls: ['./data-flow-detail.component.css']
})
export class DataFlowDetailComponent {

  public readonly ROUTER_URLS = RouterUrls;
  public readonly COMMON_UTIL = CommonUtil;
}
