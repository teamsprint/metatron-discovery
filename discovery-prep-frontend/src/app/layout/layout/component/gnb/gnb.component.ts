/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {Component, ElementRef, Injector, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {AbstractComponent} from '../../../../common/component/abstract.component';
import {CookieConstant} from '../../../../common/constant/cookie.constant';
import {UserService} from '../../../../user/service/user.service';
import {User} from '../../../../domain/user/user';
import {ProfileComponent} from '../../../../user/profile/profile.component';
import {CommonUtil} from '../../../../common/util/common.util';

import {PrepNotiUtil, NotificationValue} from '../../../../common/util/prep-noti.util';

import {LocalStorageConstant} from "../../../../common/constant/local-storage.constant";
import {Language, Theme, UserSetting} from "../../../../common/value/user.setting.value";
import {EventBroadcaster} from "../../../../common/event/event.broadcaster";
import * as $ from 'jquery';

@Component({
  selector: 'app-gnb',
  templateUrl: './gnb.component.html',
})
export class GnbComponent extends AbstractComponent implements OnInit, OnDestroy {
  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  public defaultProfileImageSrc = '/assets/images/img_photo.png';

  // my info show/hide
  public isMyInfoShow = false;
  public isLanguageShow = false;

  // UI에서 사용할 유저객체
  public user: User;

  public constTheme = Theme;

  public greetings: string = 'Good morning';

  @ViewChild(ProfileComponent)
  public profileComponent: ProfileComponent;


  public notificationTodayList: NotificationValue[] = [];
  public notificationYesterdayList: NotificationValue[] = [];




  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(private userService: UserService,
              protected broadCaster: EventBroadcaster,
              protected elementRef: ElementRef,
              protected injector: Injector) {

    super(elementRef, injector);
    this.user = new User();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Override Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // Init
  public ngOnInit() {
    // Init
    super.ngOnInit();

    // 개인정보 가져오기
    const userId:string = CommonUtil.getLoginUserId();
    this.userService.getUser(userId).then((user) => {
      this.user = user;
    }).catch((err) => this.commonExceptionHandler(err));

    this.checkGreetings();
  }

  // Destroy
  public ngOnDestroy() {
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  public goToMain(): void {
    this.router.navigate(['/management/prepbot']).then(); // 이동
  }

  /**
   * 사용자 프로필 show
   */
  public userProfile(): void {
    this.profileComponent.init(this.user);
  }

  public getCurrentLang(): string {
    return this.getLanguage();
  }

  public changeLanguage(lang: string): void {
    if (this.getCurrentLang() != lang) {
      this.setLanguage(lang);
      this._saveUserSetting(null, UserSetting.getLanguage(lang));
    }
    this.isLanguageShow = false;
  }

  /**
   * 사용자 정보 수정 완료
   * @param userData
   */
  public updatedUser(userData): void {
    delete this.user.imageUrl;
    this.safelyDetectChanges();
    setTimeout(() => {
      this.user = userData;
      this.safelyDetectChanges();
    }, 250 );
  }

  /**
   * 사용자 프로필 이미지
   * @returns {string}
   */
  public getUserImage(): string {
    if( this.user && this.user.hasOwnProperty('imageUrl') ) {
      return '/api/images/load/url?url=' + this.user.imageUrl + '/thumbnail';
    } else {
      return this.defaultPhotoSrc;
    }
  } // function - getUserImage



    public isThemeDark(): boolean {
    return $('body').hasClass(Theme.DARK);
  }

  public themeCheckboxClick(theme: Theme) {
    CommonUtil.setThemeCss(theme);
    this.broadCaster.broadcast('CHANGE_THEME', theme);
    this._saveUserSetting(theme, null);
  }

  public logout() {
    if( CommonUtil.isSamlSSO() ) {
      location.href = '/saml/logout';
    } else {
      this.cookieService.delete(CookieConstant.KEY.LOGIN_TOKEN, '/');
      this.cookieService.delete(CookieConstant.KEY.LOGIN_TOKEN_TYPE, '/');
      this.cookieService.delete(CookieConstant.KEY.LOGIN_USER_ID, '/');
      this.cookieService.delete(CookieConstant.KEY.REFRESH_LOGIN_TOKEN, '/');
      this.cookieService.delete(CookieConstant.KEY.CURRENT_WORKSPACE, '/');
      this.cookieService.delete(CookieConstant.KEY.MY_WORKSPACE, '/');
      this.cookieService.delete(CookieConstant.KEY.PERMISSION, '/');
      this.router.navigate(['/user/login']).then();
    }
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  private _saveUserSetting(theme:Theme, language:Language): void {
    let userData: UserSetting = CommonUtil.getUserSetting();
    if (!userData) {
      userData = new UserSetting();
    }

    if (theme != null) {
      userData.theme = theme;
    }
    if (language != null) {
      userData.language = language;
    }

    CommonUtil.setLocalStorage(LocalStorageConstant.KEY.USER_SETTING, JSON.stringify(userData));
  }

  private checkGreetings(): void {
    const date: Date = new Date();
    const hour: number = date.getHours();
    if(hour >= 12 && hour < 18) {
      this.greetings = 'Good afternoon';
    } else if(hour >= 18 && hour < 24) {
      this.greetings = 'Good evening';
    } else{
        this.greetings = 'Good morning';
    }
  }

  public checkNotReadNoti(): boolean {
    let notRead: boolean = false;
    if(PrepNotiUtil.notiRecord == null || PrepNotiUtil.notiRecord.length == 0) {
        notRead = false;
    }else{
      for(let i: number =0; i < PrepNotiUtil.notiRecord.length; i ++) {
          const value: NotificationValue = PrepNotiUtil.notiRecord[i];
          if(value.readBoolean == false) {
              notRead = true;
            break;
          }
      }
    }
    return notRead;
  }



  public openNotiList(): void {
      this.makeNotiList();
      PrepNotiUtil.notificationListShow();
  }


  private makeNotiList(): void {
      this.notificationTodayList = [];
      this.notificationYesterdayList = [];

      if(PrepNotiUtil.notiRecord != null &&  PrepNotiUtil.notiRecord.length > 0) {
          const cutlinenumber: number  = PrepNotiUtil.todayCutline();
          for(let i: number =0; i < PrepNotiUtil.notiRecord.length; i ++) {
              const value: NotificationValue = PrepNotiUtil.notiRecord[i];
              if(value.timestamp >= cutlinenumber) {
                  this.notificationTodayList.push(value);

              }else{
                  this.notificationYesterdayList.push(value);
              }
          }
      }
  }


  public closeNotiList(): void {
      PrepNotiUtil.notificationListHide();
  }

  public notiMouseOver(): void {
      PrepNotiUtil.stop();
  }
  public notiMouseLeave(): void {
      PrepNotiUtil.fadeOut();
  }

  public removeNotiList(targetnum: number): void {
      const removeTarget: number[] = [];
      if(targetnum == 0) {
          for(let i: number = 0; i < this.notificationTodayList.length; i ++) {
              removeTarget.push(this.notificationTodayList[i].timestamp);
          }

      }else if(targetnum == 1) {
          for(let i: number = 0; i < this.notificationYesterdayList.length; i ++) {
              removeTarget.push(this.notificationYesterdayList[i].timestamp);
          }
      }

      PrepNotiUtil.removeNotificationList(removeTarget);
      this.makeNotiList();
  }

}
