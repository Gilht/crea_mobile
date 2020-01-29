import { Component } from '@angular/core';
import { ViewController, NavParams } from 'ionic-angular';

@Component({
    selector: 'page-expiredSessionModal',
    templateUrl: 'expiredSessionModal.html'
})
export class ExpiredSessionModalPage {
    title: string;
    message: string;

    constructor(public viewCtrl: ViewController, public params: NavParams) {

    }

    ionViewDidEnter() {
        this.title = this.params.get('title') || "";
        this.message = this.params.get('message') || "";
    }

    accept() {
        this.viewCtrl.dismiss({});
    }
}
