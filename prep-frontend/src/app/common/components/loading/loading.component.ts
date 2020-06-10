import {Component, HostBinding, OnDestroy, OnInit} from '@angular/core';
import {LoadingService} from '../../services/loading/loading.service';
import * as _ from 'lodash';
import {Subscription} from 'rxjs';
import {delay} from 'rxjs/operators';

@Component({
  selector: 'div[loading]',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.css']
})
export class LoadingComponent implements OnInit, OnDestroy {

  @HostBinding('class.ddp-loading')
  public readonly classDdpLoading = true;

  @HostBinding('style.z-index')
  public readonly zIndex = 10010;

  @HostBinding('style.display')
  public display = 'none';

  private readonly subscriptions: Subscription[] = [];

  constructor(private readonly loadingService: LoadingService) {
  }

  ngOnInit(): void {

    this.subscriptions.push(
      this.loadingService
        .loading$
        .pipe(delay(100))
        .subscribe(v => {

          if (_.isNil(v)) {
            return;
          }

          this.display = v ? 'block' : 'none';
        })
    );
  }

  ngOnDestroy(): void {
    if (this.subscriptions) {
      this.subscriptions
        .filter(v => _.negate(_.isNil)(v))
        .forEach(v => v.unsubscribe());
    }
  }
}
