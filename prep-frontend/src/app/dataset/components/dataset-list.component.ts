import {Component, OnInit, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {LocalStorageService} from '../../common/services/local-storage/local-storage.service';
import {ViewMode} from '../../main/value-objects/view-mode';
import {Page, PageResult} from '../../common/constants/page';
import {CommonConstant} from '../../common/constants/common.constant';
import {Dataset} from '../domains/dataset';
import {DatasetsService} from '../services/datasets.service';
import {LoadingService} from '../../common/services/loading/loading.service';
import {LnbComponent} from '../../lnb/components/lnb.component';
import {RouterUrls} from '../../common/constants/router.constant';
import {finalize} from 'rxjs/operators';

@Component({
  templateUrl: './dataset-list.component.html',
  styleUrls: ['./dataset-list.component.css']
})
export class DatasetListComponent implements OnInit{

  public readonly ROUTER_URLS = RouterUrls;
  public readonly VIEW_MODE = ViewMode;
  private readonly page = new Page();
  private pageResult: PageResult = new PageResult();
  public searchText = '';

  @ViewChild(LnbComponent)
  public lnbComponent: LnbComponent;

  constructor(private readonly router: Router,
              private readonly datasetService: DatasetsService,
              private readonly loadingService: LoadingService,
              public readonly localStorageService: LocalStorageService) {
  }

  ngOnInit(): void {
    this.initialize();
    this.getDatasets(this.page);
  }

  private initialize() {
    this.page.page = 0;
    this.page.size = 100;
    this.page.sort = CommonConstant.API_CONSTANT.PAGE_SORT_MODIFIED_TIME_DESC;
  }

  private getDatasets(page: Page) {
    const search: string = encodeURI(this.searchText);
    // this.loadingService.show();
  }

  /**
   * Search Dataset
   */
  public searchDatasets(event) {
    if (13 === event.keyCode) {
      this.lnbOnPageRefresh();
    }
  }

  public lnbOnPageRefresh() {
    this.initialize();
    this.getDatasets(this.page);
  }

  public openCreateDatasetPopup() {
    //
  }
}
