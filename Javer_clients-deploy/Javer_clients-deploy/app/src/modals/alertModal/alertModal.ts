import { Component } from '@angular/core';
import { ViewController, IonicPage, NavParams } from 'ionic-angular';

@Component({
    selector: 'page-alertModal',
    templateUrl: 'alertModal.html',
})
export class AlertModalPage {

    constructor(public viewCtrl: ViewController, public params: NavParams) {
    }

    dismiss(result: boolean) {
        this.viewCtrl.dismiss(result);
    }

}

