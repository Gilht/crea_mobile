import { Component, ViewChild, Output, Input, EventEmitter } from '@angular/core';
import { NavController, ViewController, IonicPage, NavParams } from 'ionic-angular';
import { Storage } from '@ionic/storage';

@Component({
    selector: 'page-notificationModal',
    templateUrl: 'notificationModal.html'
})
export class NotificationModalPage {
    title: string;
    message: string;
    isDrawing = false;


    constructor(public viewCtrl: ViewController, public params: NavParams) { }

    ionViewDidEnter() {
        this.title = this.params.get('title') || "";
        this.message = this.params.get('message') || "";
    }

    drawComplete() {
        this.isDrawing = false;
    }

    drawStart() {
        this.isDrawing = true;
    }

    dismiss() {
        this.viewCtrl.dismiss();
    }
}


