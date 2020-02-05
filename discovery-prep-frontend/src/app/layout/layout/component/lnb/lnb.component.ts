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

import {
  Component,
  ElementRef,
  HostListener,
  Injector,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import {NavigationEnd, NavigationExtras} from '@angular/router';
import {AbstractComponent} from '../../../../common/component/abstract.component';
import {CookieConstant} from '../../../../common/constant/cookie.constant';
import {EventBroadcaster} from '../../../../common/event/event.broadcaster';
import {SYSTEM_PERMISSION} from '../../../../common/permission/permission';
import {CommonUtil} from '../../../../common/util/common.util';
import {Modal} from '../../../../common/domain/modal';
import {ConfirmModalComponent} from '../../../../common/component/modal/confirm/confirm.component';
import {BuildInfo} from "../../../../../environments/build.env";
import {CommonService} from "../../../../common/service/common.service";
import {Extension} from "../../../../common/domain/extension";
import {StringUtil} from "../../../../common/util/string.util";

@Component({
  selector: 'app-lnb',
  templateUrl: './lnb.component.html',
})
export class LNBComponent extends AbstractComponent implements OnInit, OnDestroy {

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 즐겨찾기 플래그
  private isFavorFl: boolean = false;

  // 쿠키정보
  private cookieInfo: any = {
    viewType: null,
    folderId: null,
    folderHierarchies: null
  };

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 메뉴 권한
  public permission = {
    management: false,
    managementDatasource: false,
    // TODO: 추후에 엔진 모니터링 메뉴에 대한 권한이 있는지 검사하는 로직 추가 필요 ( 임시 작업 )
    userAdmin: false,
    // workspaceAdmin: false,
    lineage: false
  };

  // lnb 플래그
  public isShow = false;

  // 폴더 네비게이션 관련
  public isShowFolderNavi: boolean = false;  // 폴더 네비게이션 표시 여부
  public folderNavigation: string[] = [];    // 폴더 네비게이션

  // menu 관리
  public lnbManager = {

    // 매니지먼트
    management: {
      fold: true,
      dataStorage: {fold: true},
      dataPreparation: {fold: true},
      dataMonitoring: {fold: true},
    },
    // 어드민
    administration: {
      fold: true,
      users: {fold: true}
    }
  };

  // Metatron App. 빌드 정보
  public buildInfo = {
    appVersion: BuildInfo.METATRON_APP_VERSION
  };

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Component
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/


  @ViewChild(ConfirmModalComponent)
  private _confirmModalComp: ConfirmModalComponent;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Constructor
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  constructor(private broadCaster: EventBroadcaster,
              private commonService: CommonService,
              protected elementRef: ElementRef,
              protected  injector: Injector) {
    super(elementRef, injector);

    this.router.events.subscribe((val) => {
      if (val instanceof NavigationEnd) {
        // 네비계이션 종료
        switch (val.urlAfterRedirects) {

          case '/management/storage/data-connection' :
            this.depth1Menu1ClickListener('MANAGEMENT');
            break;
          case '/management/datapreparation/dataflow' :
          case '/management/datapreparation/dataset' :
          case '/management/datapreparation/datasnapshot' :
            this.depth1Menu1ClickListener('MANAGEMENT');
            this.mgmtMenuClickListener('DATAPREPARATION');
            break;

          case '/admin/user/members' :
          case '/admin/user/groups' :
            this.depth1Menu1ClickListener('ADMINISTRATION');
            break;
        }
      }
    });
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Override Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  ngOnInit() {
    super.ngOnInit();
    let cookiePermission: string = CommonUtil.getCurrentPermissionString();
    if (cookiePermission && '' !== cookiePermission) {
      this.permission.management = (this.permission.managementDatasource );
      this.permission.userAdmin = (
        -1 < cookiePermission.indexOf(SYSTEM_PERMISSION.MANAGE_USER.toString())
        && -1 < cookiePermission.indexOf(SYSTEM_PERMISSION.MANAGE_SYSTEM.toString())
      );
    }

    // 선택 필터 설정
    this.subscriptions.push(
      this.broadCaster.on<any>('CM_CLOSE_LNB').subscribe(data => {
        this._closeLNB();
      })
    );

    // extensions 설정
    this.commonService.getExtensions('lnb').then(items => {
      if (items && 0 < items.length) {
        const exts: Extension[] = items;
        exts.forEach(ext => {


            if (ext.parent != 'ROOT') {
              (this.lnbManager[ext.parent]) || (this.lnbManager[ext.parent] = {});
              this.lnbManager[ext.parent][ext.name] = {fold: true};
          }
        });
      }
    });
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/
  ObjectKeys = Object.keys;

  /**
   * Document Click Handler ( input class 제거 )
   * @param target
   */
  @HostListener('document:click', ['$event.target'])
  documentClickHandler(target) {
    const $target = $(target);
    if (!$target.hasClass('ddp-layout-lnb') && 0 === $target.closest('.ddp-layout-lnb').length) {
      this._closeLNB();
    }
  } // function - documentClickHandler

  /**
   * 메인 화면으로 이동
   */
  public goMain() {
    this.cookieService.delete(CookieConstant.KEY.CURRENT_WORKSPACE, '/');  // 쿠키 삭제
    if ('/workspace' === this.router.url) {
      this.broadCaster.broadcast('moveFromLnb', 'my');
    } else {
      this.router.navigate(['/workspace']).then(); // 이동
    }
    this._closeLNB();
  } // function - goMain

  /**
   * 대메뉴 클릭 이벤트 리스너
   * @param {string} menuName
   */
  public depth1Menu1ClickListener(menuName: string) {
    this.lnbManager.management.fold = true;
    this.lnbManager.administration.fold = true;
    this.getExtensions('ROOT').forEach(item => {
      this.lnbManager[item.name]['fold'] = true;
    });
    switch (menuName) {
      case 'MANAGEMENT' :
        this.lnbManager.management.fold = false;
        this.mgmtMenuClickListener('DATASTORAGE');
        break;
      case 'ADMINISTRATION' :
        this.lnbManager.administration.fold = false;
        this.adminMenuClickListener('USER');
        break;
      default :
        if (this.lnbManager[menuName]) {
          this.lnbManager[menuName]['fold'] = false;
          this.rootExtensionMenuClickListener(menuName);
        }
    }
  } // function - menuDepth1ClickListener


  /**
   * Management 하위 메뉴 클릭 이벤트 리스너
   * @param {string} menuName
   */
  public mgmtMenuClickListener(menuName: string) {
    this.lnbManager.management.dataStorage.fold = true;
    this.lnbManager.management.dataPreparation.fold = true;
    this.getExtensions('management').forEach(item => {
      this.lnbManager.management[item.name]['fold'] = true;
    });

    switch (menuName) {
      // case 'METADATA' :
      //   this.lnbManager.management.metadata.fold = false;
      //   break;
      case 'DATASTORAGE' :
        this.lnbManager.management.dataStorage.fold = false;
        break;
      case 'DATAPREPARATION' :
        this.lnbManager.management.dataPreparation.fold = false;
        break;
      // case 'DATAMONITORING' :
      //   this.lnbManager.management.dataMonitoring.fold = false;
      //   break;
      // case 'MODELMANAGER' :
      //   this.lnbManager.management.modelManager.fold = false;
      //   break;
      // case 'ENGINE_MONITORING' :
      //   this.lnbManager.management.engineMonitoring.fold = false;
      //   break;
      default :
        if (this.lnbManager.management[menuName]) {
          this.lnbManager.management[menuName]['fold'] = false;
        }
    }
  } // function - mgmtMenuClickListener

  /**
   * Administration 하위 메뉴 클릭 이벤트 리스너
   * @param {string} menuName
   */
  public adminMenuClickListener(menuName: string) {
    this.lnbManager.administration.users.fold = true;
    this.getExtensions('administration').forEach(item => {
      this.lnbManager.administration[item.name]['fold'] = true;
    });
    switch (menuName) {
      case 'USER' :
        this.lnbManager.administration.users.fold = false;
        break;

      default :
        if (this.lnbManager.administration[menuName]) {
          this.lnbManager.administration[menuName]['fold'] = false;
        }
    }
  } // function - adminMenuClickListener

  public rootExtensionMenuClickListener(parent:string, menuName?:string) {
    if (menuName == undefined && this.getExtensions(parent).length > 0) {
      menuName = this.getExtensions(parent)[0].name;
    }
    this.getExtensions(parent).forEach(item => {
      this.lnbManager[parent][item.name]['fold'] = true;
    });

    if (this.lnbManager[parent][menuName]) {
      this.lnbManager[parent][menuName]['fold'] = false;
    }
  } // function - exploreDataMenuClickListener


  /**
   * lnb 이벤트
   */
  public lnbEvent() {
    // lnb hide 상태일때
    if (this.isShow === false) {
    }
    // lnb 상태 변경
    this.isShow = !this.isShow;
    (this.isShow) || (this.isShowFolderNavi = false);
  } // function - lnbEvent

  /**
   * URL 정보에 따라 이동
   * @param {string[]} navigateInfo
   * @param {boolean} isRemoveCookie
   */
  public moveByRouteNavigate(navigateInfo: string[], isRemoveCookie: boolean = true) {
    if (isRemoveCookie) {
    }
    this._closeLNB();
    this.router.navigate(navigateInfo).then(); // 이동
  } // function - moveByRouteNavigate


  /**
   * 해당 메뉴로 이동
   */
  public move(menu: string, extras?: NavigationExtras) {
    if (this.router.url !== '/' + menu) {
      this.loadingShow();

      if (extras) {
        this.router.navigate([menu], extras).then();
      } else {
        this.router.navigate([menu]).then();
      }

      this._closeLNB();
    }
  } // function - move

  public moveExtension(ext: Extension, subKey) {
    if (ext.subContents[subKey].startsWith('http')) {
      this.move('external/' + ext.parent + '_' + ext.name + '_' + subKey);
    } else {
      this.move(ext.subContents[subKey]);
    }
  }

  public extensionPermission(ext: Extension): boolean {
    if (ext.permissions && ext.permissions.length > 0) {
      let cookiePermission: string = CommonUtil.getCurrentPermissionString();
      return ext.permissions.some(permission => cookiePermission.indexOf(permission) > -1 );
    } else {
      return true;
    }
  }

  public getExtensions(parent:string): Extension[] {
    const extensions = CommonService.extensions.filter(item => parent === item.parent);
    if (parent === 'ROOT') {
      return extensions.filter(rootExtension => CommonService.extensions.filter(item => rootExtension.name === item.parent).length > 0);
    } else {
      return extensions;
    }
  }

  public isExtensionSelected(parent:string, name:string): boolean {
    return this.lnbManager[parent][name] != undefined && this.lnbManager[parent][name]['fold'] == false;
  }

  /**
   * 메뉴얼 다운로드
   */
  public downloadManual() {
    const browserLang: string = this.translateService.getBrowserLang();
    const lang: string = browserLang.match(/en/) ? 'en' : 'ko';
    this.commonService.downloadManual(lang);
  } // function - downloadManual


  /**
   * LNB를 닫는다.
   * @private
   */
  private _closeLNB() {
    this.isShow = false;
    this.isShowFolderNavi = false;
  } // function - _closeLNB


  public popupManual() {
    const browserLang:string = this.translateService.getBrowserLang();
    if (browserLang.match(/ko/)) {
      window.open("https://metatron-app.github.io/metatron-doc-discovery/", "_blank");
    } else {
      window.open("https://metatron-app.github.io/metatron-doc-discovery/en", "_blank");
    }
  }
}
