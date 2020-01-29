import { Component } from '@angular/core';
import { ViewController, IonicPage, NavParams } from 'ionic-angular';

@Component({
    selector: 'page-inputModal',
    templateUrl: 'inputModal.html',
})
export class InputModalPage {
    comments: string = "";
    readOnly: boolean = false;

    constructor(public viewCtrl: ViewController, public params: NavParams) {
        this.comments = params.get('comments') || "";
        this.readOnly = params.get('readOnly') || false;
    }

    dismiss(result: boolean) {
        if (!result) {
            this.comments = this.params.get('comments') || "";
        }
        let data = { 'result': this.comments };
        this.viewCtrl.dismiss(data);
    }

}
