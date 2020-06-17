import {Component, OnInit, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {LocalStorageService} from '../../common/services/local-storage/local-storage.service';
import {ViewMode} from '../../main/value-objects/view-mode';
import {Page, PageResult} from '../../common/constants/page';
import {CommonConstant} from '../../common/constants/common.constant';
import {Dataflow} from '../domains/dataflow';
import {DataflowService} from '../services/dataflow.service';
import {LoadingService} from '../../common/services/loading/loading.service';
import {LnbComponent} from '../../lnb/components/lnb.component';
import {RouterUrls} from '../../common/constants/router.constant';
import {finalize} from 'rxjs/operators';

@Component({
  templateUrl: './dataflow-list.component.html',
  styleUrls: ['./dataflow-list.component.css']
})
export class DataflowListComponent implements OnInit{

  public readonly ROUTER_URLS = RouterUrls;

  @ViewChild(LnbComponent)
  public lnbComponent: LnbComponent;
  public readonly VIEW_MODE = ViewMode;
  private readonly page = new Page();
  private pageResult: PageResult = new PageResult();
  public searchText = '';
  public dataflows: Array<Dataflow.ValueObjects.Select> = [];

  constructor(private readonly router: Router,
              private readonly dataflowService: DataflowService,
              private readonly loadingService: LoadingService,
              public readonly localStorageService: LocalStorageService) {
  }

  ngOnInit(): void {
    this.initialize();
    this.getDataflows(this.page);
  }

  /**
   * Search Dataflow
   */
  public searchDataflows(event) {
    if (13 === event.keyCode) {
      this.lnbOnPageRefresh();
    }
  }

  private initialize() {
    this.page.page = 0;
    this.page.size = 100;
    this.page.sort = CommonConstant.API_CONSTANT.PAGE_SORT_MODIFIED_TIME_DESC;
  }

  private getDataflows(page: Page) {
    const search: string = encodeURI(this.searchText);
    this.loadingService.show();
    this.dataflowService
      .getDataflows(search, page)
      .pipe(finalize(() => this.loadingService.hide()))
      .subscribe(dataflows => {
        if (!dataflows) {
          this.dataflows = [];
          return;
        }
        this.dataflows = dataflows._embedded.dataflows;
        this.pageResult  = dataflows.page;
      });
  }

  public returnListNumber(num: number): number {
    let rtn = 0;
    if (this.pageResult !== null) {
      rtn = this.pageResult.totalElements - (this.pageResult.number * this.pageResult.size + num);
    }
    return rtn;
  }
  public openCreateDataflowPopup() {
    this.lnbComponent.openCreateDataflowPopup();
  }
  public lnbOnPageRefresh() {
    this.initialize();
    this.getDataflows(this.page);
  }

  public goDataflowDetailView(id: string) {
    this.router.navigate([RouterUrls.Managements.getFlowDetailUrl(id)]).then();
  }
}
