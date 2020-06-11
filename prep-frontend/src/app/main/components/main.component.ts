import {Component} from '@angular/core';
import {ImageConstant} from '../../common/constants/image.constant';
import {Router} from '@angular/router';
import {CommonUtil} from '../../common/utils/common-util';
import {RouterUrls} from '../../common/constants/router.constant';

@Component({
  templateUrl: './main.component.html',
})
export class MainComponent {

  public readonly IMAGE_CONSTANT = ImageConstant;
  public readonly COMMON_UTIL = CommonUtil;
  public readonly UUID = this.COMMON_UTIL.Generate.makeUUID();

  constructor(private readonly router: Router) {
  }

  public goFlowDetailView(id: string) {
    this.router.navigate([RouterUrls.Managements.getFlowDetailUrl(id)]).then();
  }
}
