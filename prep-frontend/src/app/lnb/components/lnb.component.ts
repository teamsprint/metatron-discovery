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
    console.info('openUpdateConnectionPopup', connId);
    const updateComponentComponentRef = this.viewContainerRef
      .createComponent(this.componentFactoryResolver.resolveComponentFactory(UpdateConnectionComponent));
    updateComponentComponentRef.instance.connId = connId;
    updateComponentComponentRef.instance.updateConnectionInfo();
    updateComponentComponentRef.instance.onClose.subscribe(() => {
      updateComponentComponentRef.destroy();
    });
    updateComponentComponentRef.instance.onDone.subscribe(() => {
      updateComponentComponentRef.destroy();
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
    const createComponentComponentRef = this.viewContainerRef
      .createComponent(this.componentFactoryResolver.resolveComponentFactory(CreateDataflowComponent));
    createComponentComponentRef.instance.createDataflowInfo();
    createComponentComponentRef.instance.onClose.subscribe(() => {
      createComponentComponentRef.destroy();
    });
    createComponentComponentRef.instance.onDone.subscribe(() => {
      createComponentComponentRef.destroy();
      // 현재 페이지가 dataflow list 화면인 경우 리스트 갱신 필요
      // this.createConnectionAfterCheck();
    });
  }
}
