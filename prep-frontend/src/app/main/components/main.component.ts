import {Component} from '@angular/core';
import {ImageConstant} from '../../common/constants/image.constant';
import {Router} from '@angular/router';
import {CommonUtil} from '../../common/utils/common-util';
import {RouterUrls} from '../../common/constants/router.constant';

@Component({
  selector: 'div[main]',
  templateUrl: './main.component.html',
  host: { '[class.pb-page-main]': 'true' }
})
export class MainComponent {

  public readonly IMAGE_CONSTANT = ImageConstant;
  public readonly COMMON_UTIL = CommonUtil;

  constructor(private readonly router: Router) {
  }

  public goFlowDetailView(id: string) {
    this.router.navigate([RouterUrls.Managements.getFlowDetailUrl(id)]).then();
  }
}
