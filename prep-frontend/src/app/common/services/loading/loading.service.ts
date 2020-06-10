import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {

  public readonly loading$ = new Subject();

  show() {
    this.loading$.next(true);
  }

  hide() {
    this.loading$.next(false);
  }
}
