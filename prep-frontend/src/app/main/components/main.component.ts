import {Component, OnInit, ViewChild} from '@angular/core';
import {ImageConstant} from '../../common/constants/image.constant';
import {Router} from '@angular/router';
import {CommonUtil} from '../../common/utils/common-util';
import {RouterUrls} from '../../common/constants/router.constant';
import {DataflowService} from '../../dataflow/services/dataflow.service';
import {Page} from '../../common/constants/page';
import {CommonConstant} from '../../common/constants/common.constant';
import {Dataflow} from '../../dataflow/domains/dataflow';
import {LoadingService} from '../../common/services/loading/loading.service';
import {LnbComponent} from '../../lnb/components/lnb.component';
import {finalize} from 'rxjs/operators';

@Component({
  templateUrl: './main.component.html',
})
export class MainComponent implements OnInit {

  @ViewChild(LnbComponent)
  public lnbComponent: LnbComponent;

  public readonly IMAGE_CONSTANT = ImageConstant;
  public readonly COMMON_UTIL = CommonUtil;
  private readonly SEARCH_TEXT = undefined;

  private readonly page = new Page();
  public dataflows: Array<Dataflow.ValueObjects.Select> = [];

  constructor(private readonly router: Router,
              private readonly loadingService: LoadingService,
              private readonly dataflowService: DataflowService) {
  }

  ngOnInit(): void {
    this.initialize();
    this.getDataflows(this.page);
  }

  private initialize() {
    this.page.page = 0;
    this.page.size = 3;
    this.page.sort = CommonConstant.API_CONSTANT.PAGE_SORT_MODIFIED_TIME_DESC;
  }

  public goDataflowDetailView(id: string) {
    this.router.navigate([RouterUrls.Managements.getFlowDetailUrl(id)]).then();
  }

  public goDataflowsView() {
    this.router.navigate([RouterUrls.Managements.getFlowsUrl()]).then();
  }

  public getDataflows(page: Page) {

    this.loadingService.show();

    this.dataflowService
      .getDataflows(this.SEARCH_TEXT, page)
      .pipe(finalize(() => this.loadingService.hide()))
      .subscribe(dataflows => {

        if (!dataflows) {
          this.dataflows = [];
          return;
        }

        this.dataflows = dataflows._embedded.dataflows;
      });
  }

  public openCreateDataflowPopup() {
    this.lnbComponent.openCreateDataflowPopup();

  }
}
