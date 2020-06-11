import {Component, ComponentFactoryResolver, Input, ViewContainerRef} from '@angular/core';
import {RouterUrls} from '../../common/constants/router.constant';
import {CreateConnectionComponent} from '../../connection/components/create-connection.component';

@Component({
  selector: 'div[lnb]',
  templateUrl: './lnb.component.html',
  styleUrls: ['./lnb.component.css'],
  host: { '[class.pb-layout-lnb]': 'true' }
})
export class LnbComponent {

  public readonly ROUTER_URLS = RouterUrls;

  @Input()
  public readonly is2DepthEnable: boolean;

  constructor(private readonly componentFactoryResolver: ComponentFactoryResolver,
              private readonly viewContainerRef: ViewContainerRef) {
  }

  public openCreateConnectionPopup() {
    const createComponentComponentRef = this.viewContainerRef
      .createComponent(this.componentFactoryResolver.resolveComponentFactory(CreateConnectionComponent));
    createComponentComponentRef.instance.onClose.subscribe(() => {
      createComponentComponentRef.destroy();
    });
  }
}
