import {Component, HostBinding, OnInit} from '@angular/core';
import {Select} from '@ngxs/store';
import {Observable} from 'rxjs';
import {Router} from '@angular/router';
import {ImageConstant} from '../../common/constants/image.constant';
import {UserStore} from '../../user/services/store/user-store.service';
import {UserRouterUrl} from '../../user/constants/user-router-url';
import {RouterUrls} from '../../common/constants/router.constant';
import {User} from '../../user/domains/user';

@Component({
  selector: 'div[gnb]',
  templateUrl: './gnb.component.html',
  styleUrls: ['./gnb.component.css']
})
export class GnbComponent implements OnInit {

  public readonly IMAGE_CONSTANT = ImageConstant;

  @HostBinding('class.pb-layout-gnb')
  public readonly pbLayoutGnbClass = true;

  @Select(UserStore.getUserFullName)
  public readonly userFullName$: Observable<User>;

  @Select(UserStore.get)
  public readonly user$: Observable<User>;

  public user: User;

  public isShowProfile: boolean;

  constructor(private readonly router: Router) {
  }

  ngOnInit(): void {
    this.user$
      .subscribe(v => this.user = v);
  }

  public toggleProfile() {
    this.isShowProfile = !this.isShowProfile;
  }

  public hideProfile() {
    this.isShowProfile = false;
  }

  public logout() {
    this.router.navigate([UserRouterUrl.getLoginUrl()]).then();
  }

  public goMainPage() {
    this.router.navigate([RouterUrls.Managements.getMainUrl()]).then();
  }
}
