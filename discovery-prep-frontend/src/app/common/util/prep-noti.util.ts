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

import * as $ from 'jquery';

export class PrepNotiUtil {

    private static inInterval: any;
    private static removeInterval: any;
    private static delayTime: number = 800;
    private static fadeTime: number = 500;
    private static fadeOutTime: number = 500;
    private static removeTime: number = 4500;
    public static notiRecord: NotificationValue[] = [];

    // pb-layer-notification

    /*
    * Noti Div 표시
    * title: string, detail: string
    */
    public static NotiShow(title: string, detail: string) {

        $('#nodiTitle').html('');
        $('#nodiDetail').html('');
        $('#nodiTime').html('');


        const date: Date = new Date();
        let ampm: string = 'AM';
        let displayhour: string ='';
        let displaymin: string ='';
        let hour: number = date.getHours();
        let min: number = date.getMinutes();
        if(12 <= hour) {
            ampm = 'PM';
        }
        if(12 >= hour) {
            displayhour = '0' + hour;
        }else{
            displayhour = '0' + (hour -12);
        }
        if(min<10) {
            displaymin = '0' + min;
        }else{
            displaymin += min;
        }

        $('#nodiTitle').html(title);
        $('#nodiDetail').html(detail);
        $('#nodiTime').html(ampm+' ' + displayhour+':'+displaymin);

        // notification list hide
       this.notificationListHide();

        const value: NotificationValue =  new NotificationValue();
        value.timestamp = date.getTime();
        value.title = title;
        value.detail = detail.replace(/<\/?("[^"]*"|'[^']*'|[^>])*(>|$)/g, ' ');
        value.displayDate = ampm+' ' + displayhour+':'+displaymin;
        value.readBoolean = false;

        this.notiRecord.unshift(value);



        if(this.removeInterval != null) {
            clearTimeout(this.removeInterval);
            this. removeInterval = null;
        }
        if(this.inInterval != null) {
            clearTimeout(this.inInterval);
            this. inInterval = null;
        }

        const vthis = this;
        this.inInterval = setTimeout(function () {
            vthis.fadeIn();
            vthis.hide();
            clearTimeout(vthis.inInterval);
        }, vthis.delayTime)

        // $('.pb-wrap-noti').fadeIn(this.fadeTime);

    }

    private static fadeIn(): void {
        $('.pb-wrap-noti').fadeIn(this.fadeTime);
    }


    /*
    * Noti Popup 숨김
    * */
    public static hide() {
        if(this.removeInterval != null) {
            clearTimeout(this.removeInterval);
            this. removeInterval = null;
        }

        const vthis = this;
        this.removeInterval = setTimeout(function () {
            vthis.fadeOut();
            clearTimeout(vthis.removeInterval);
        }, vthis.removeTime)
        // setTimeout(this.fadeOut(), 5000);
    }

    public static stop() {
        clearTimeout(this.removeInterval);
    }



    public static fadeOut(): void {
        $('.pb-wrap-noti').fadeOut(this.fadeOutTime);
        if(this.removeInterval != null) {
            clearTimeout(this.removeInterval);
            this. removeInterval = null;
        }
        if(this.inInterval != null) {
            clearTimeout(this.inInterval);
            this. inInterval = null;
        }
    }


    public static notificationListShow(): void {
        for(let i: number =0; i < PrepNotiUtil.notiRecord.length; i ++) {
            const value: NotificationValue = PrepNotiUtil.notiRecord[i];
            value.readBoolean = true;
        };

        $('.pb-layer-notification').show();
    }
    public static notificationListHide(): void {
        $('.pb-layer-notification').hide();
    }


    public static removeNotificationList(removeTarget: number[]): void {
        if(removeTarget !=null && removeTarget.length > 0) {
            const temp: NotificationValue[] = [];
            for(let i: number = 0; i < this.notiRecord.length; i ++) {
                let chk: number = -1;

                for(let j: number = 0; j < removeTarget.length; j ++) {
                    if(removeTarget[j] == this.notiRecord[i].timestamp) {
                        chk = i;
                        break;
                    }
                }
                if(chk == -1) {
                    temp.push(this.notiRecord[i]);
                }
            }
            this.notiRecord = [];
            this.notiRecord = temp;
        }
    }

    public static todayCutline(): number {
        const date: Date = new Date();
        const displayyear: string = String(date.getFullYear());
        let displayMonth: string ='';
        let displayDate: string ='';
        const month: number = date.getMonth() + 1;
        const days: number = date.getDate();

        if(month<10) {
            displayMonth = '0' + month;
        }else{
            displayMonth = String(month);
        }

        if(days<10) {
            displayDate = '0' + days;
        }else{
            displayDate = String(days);
        }

        const cutlineDate: Date = new Date(displayyear+'-' + displayMonth+ '-' + displayDate+' 00:00:00');
        return cutlineDate.getTime();
    }

}

export class NotificationValue {
    timestamp : number;
    title : string;
    detail : string;
    displayDate: string;
    readBoolean: boolean;
}