import {Component, ComponentFactoryResolver, Output, Input, ViewContainerRef, EventEmitter} from '@angular/core';
import {RouterUrls} from '../../common/constants/router.constant';
import {Router} from '@angular/router';
import {CreateConnectionComponent} from '../../connection/components/create-connection.component';
import {UpdateConnectionComponent} from '../../connection/components/update-connection.component';
import {CreateDataflowComponent} from '../../dataflow/components/create-dataflow.component';

@Component({
  selector: 'div[lnb]',
  templateUrl: './lnb.component.html',
  styleUrls: ['./lnb.component.css'],
  host: { '[class.pb-layout-lnb]': 'true' }
})
export class LnbComponent {

  public readonly ROUTER_URLS = RouterUrls;

  @Output()
  public readonly onPageRefresh = new EventEmitter();

  @Input()
  public readonly is2DepthEnable: boolean;

  constructor(private readonly componentFactoryResolver: ComponentFactoryResolver,
              private readonly viewContainerRef: ViewContainerRef,
              private readonly router: Router) {
  }
  /**
   * Connection Pop
   */
  public openCreateConnectionPopup() {
    const createConnectionComponentRef = this.viewContainerRef
      .createComponent(this.componentFactoryResolver.resolveComponentFactory(CreateConnectionComponent));
    createConnectionComponentRef.instance.createConnectionInfo();
    createConnectionComponentRef.instance.onClose.subscribe(() => {
      createConnectionComponentRef.destroy();
    });
    createConnectionComponentRef.instance.onDone.subscribe(() => {
      createConnectionComponentRef.destroy();
      // 현재 페이지가 connection list 화면인 경우 리스트 갱신 필요
      this.createConnectionAfterCheck();
    });
  }
  private createConnectionAfterCheck() {
    const url = this.router.url;
    const connectionListPath = `${this.ROUTER_URLS.Managements.ROOT}/${this.ROUTER_URLS.Managements.PREP_BOT}/${this.ROUTER_URLS.Managements.CONNECTION}`;
    if (url.indexOf(connectionListPath) > -1) {
      this.onPageRefresh.emit();
    }
  }

  public openUpdateConnectionPopup(connId: string) {
    const updateConnectionComponentRef = this.viewContainerRef
      .createComponent(this.componentFactoryResolver.resolveComponentFactory(UpdateConnectionComponent));
    updateConnectionComponentRef.instance.connId = connId;
    updateConnectionComponentRef.instance.updateConnectionInfo();
    updateConnectionComponentRef.instance.onClose.subscribe(() => {
      updateConnectionComponentRef.destroy();
    });
    updateConnectionComponentRef.instance.onDone.subscribe(() => {
      updateConnectionComponentRef.destroy();
      // 현재 페이지가 connection list 화면인 경우 리스트 갱신 필요
      this.updateConnectionAfterCheck();
    });

  }
  private updateConnectionAfterCheck() {
    const url = this.router.url;
    const connectionListPath = `${this.ROUTER_URLS.Managements.ROOT}/${this.ROUTER_URLS.Managements.PREP_BOT}/${this.ROUTER_URLS.Managements.CONNECTION}`;
    if (url.indexOf(connectionListPath) > -1) {
      this.onPageRefresh.emit();
    }
  }


  /**
   * Dataflow Pop
   */
  public openCreateDataflowPopup() {
    const url = this.router.url;
    const createDataflowComponentRef = this.viewContainerRef
      .createComponent(this.componentFactoryResolver.resolveComponentFactory(CreateDataflowComponent));
    createDataflowComponentRef.instance.createDataflowInfo();
    createDataflowComponentRef.instance.onClose.subscribe(() => {
      createDataflowComponentRef.destroy();
    });
    createDataflowComponentRef.instance.onDone.subscribe(() => {
      createDataflowComponentRef.destroy();
      // 현재 페이지가 main 또는 dataflow list 화면인 경우 리스트 갱신 필요
      this.createDataflowAfterCheck();
    });
  }
  private createDataflowAfterCheck() {
    const url = this.router.url;
    const dataflowListPath = `${this.ROUTER_URLS.Managements.ROOT}/${this.ROUTER_URLS.Managements.PREP_BOT}/${this.ROUTER_URLS.Managements.FLOWS}`;
    if (url === '/' + `${this.ROUTER_URLS.Managements.ROOT}/${this.ROUTER_URLS.Managements.PREP_BOT}`) {
      this.onPageRefresh.emit();
      return;
    }
    if (url.indexOf(dataflowListPath) > -1) {
      this.onPageRefresh.emit();
      return;
    }
  }

}
