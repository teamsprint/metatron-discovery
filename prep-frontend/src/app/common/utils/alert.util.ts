/* tslint:disable:no-unused-expression */

declare let toastr;

export class Alert {

  public static ERROR_NAME: string;
  public static MORE_BTN_DESC: string;
  public static CLOSE_BTN: string;

  private static _setDefaultOpts() {
    toastr.options = {
      closeButton: true,
      onlyShowNewest: true,
      newestOnTop: false,
      escapeHtml: true,
      positionClass: 'toast-top-center',
      showMethod: 'slideDown',
      showEasing: 'linear',
      hideMethod: 'slideUp',
      showDuration: 300,
      hideDuration: 300,
      timeOut: 3000,
      onCustomAction: null
    };
  }

  public static info(message: string): void {
    this._setDefaultOpts();
    setTimeout(() => {
      toastr.info(message, 'Information');
    }, Math.random() * 1000);
  }

  public static success(message: string): void {
    this._setDefaultOpts();
    setTimeout(() => {
      toastr.success(message, 'Success');
    }, Math.random() * 1000);
  }

  public static warning(message: string): void {
    this._setDefaultOpts();
    setTimeout(() => {
      toastr.warning(message, 'Warning');
    }, Math.random() * 1000);
  }

  public static fail(message: string): void {
    this._setDefaultOpts();
    setTimeout(() => {
      toastr.warning(message, 'Failed');
    }, Math.random() * 1000);
  }

  public static error(message: string): void {
    this._setDefaultOpts();
    setTimeout(() => {
      toastr.error(message, 'Error');
    }, Math.random() * 1000);
  }

  public static errorDetail(message: string, detailMsg: string): void {
    this._setDefaultOpts();
    toastr.options.escapeHtml = false;
    toastr.options.onCustomAction = () => {
      const modal = new Modal();
      modal.name = this.ERROR_NAME;
      modal.description = detailMsg;
      modal.isShowCancel = false;
      modal.isScroll = true;
      modal.btnName = this.CLOSE_BTN;
      this.confirm(modal);
    };
    setTimeout(() => {
      toastr.error(message + `<br/><a class="toast-custom-action-button" href="javascript:" >` + this.MORE_BTN_DESC + `</a>`, 'Error');
    }, Math.random() * 1000);
  }

  private static confirm(confirmData: Modal) {
    const $popupContainer = $('.sys-global-confirm-popup');

    // 스크롤 여부에 따른 상태 설정
    const $popupBox = $popupContainer.children();
    $popupBox.removeClass('ddp-box-popup-type1 ddp-box-popup-type3');
    const $scrollContentsBox = $popupContainer.find('.ddp-box-detail');
    const $nonScrollContentsBox = $popupContainer.find('.ddp-pop-detail');
    if (confirmData.isScroll) {
      $popupBox.addClass('ddp-box-popup-type3');
      $nonScrollContentsBox.hide();
      $scrollContentsBox.show();
    } else {
      $popupBox.addClass('ddp-box-popup-type1');
      $scrollContentsBox.hide();
      $nonScrollContentsBox.show();
    }

    // 닫기 이벤트 설정
    $popupContainer.find('.ddp-btn-close').one('click', () => $popupContainer.hide());

    // 타이틀 설정
    if (confirmData.name) {
      $popupContainer.find('.ddp-pop-title').html(confirmData.name);
    } else {
      $popupContainer.find('.ddp-pop-title').html('');
    }

    // 설명 설정
    let description = '';
    (confirmData.description) && (description = description + confirmData.description);
    (confirmData.subDescription) && (description = description + '<br/>' + confirmData.subDescription);
    if (confirmData.isScroll) {
      $scrollContentsBox.find('.ddp-txt-detail').html(description);
    } else {
      $nonScrollContentsBox.html(description);
    }

    // 버튼 설정
    const $btnCancel = $popupContainer.find('.ddp-btn-type-popup:first');
    const $btnDone = $btnCancel.next();
    if (confirmData.isShowCancel) {
      $btnCancel.show();
      $btnCancel.text(confirmData.btnCancel ? confirmData.btnCancel : $btnCancel.attr('data-defaultMsg'));
      $btnCancel.off('click').one('click', () => $popupContainer.hide());
    } else {
      $btnCancel.hide();
    }
    $btnDone.text(confirmData.btnName ? confirmData.btnName : $btnDone.attr('data-defaultMsg'));

    $btnDone.off('click').one('click', () => {
      (confirmData.afterConfirm) && (confirmData.afterConfirm(confirmData));
      $popupContainer.hide();
    });

    $popupContainer.show();
  }
}

class Modal {
  name: string;
  description: string;
  subDescription?: string;
  btnName: string;
  btnCancel?: string;
  isShowCancel = true;
  isScroll = false;
  data?;
  afterConfirm?: Function;
}
