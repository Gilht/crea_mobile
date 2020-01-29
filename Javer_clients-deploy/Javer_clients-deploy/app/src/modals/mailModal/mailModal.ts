import { Component } from '@angular/core';
import { ViewController, IonicPage, NavParams } from 'ionic-angular';

@Component({
    selector: 'page-mailModal',
    templateUrl: 'mailModal.html',
})
export class MailModalPage {
    mails: any = [];
    selectedRow: number;

    constructor(public viewCtrl: ViewController, public params: NavParams) {
        this.mails = params.get('mails') || [];
    }

    dismiss() {
      let data: any;

      if (this.isMailIndexValid()) {
        data = {
          result: this.mails[this.selectedRow]
        };
      }

      this.viewCtrl.dismiss(data);
    }

    isMailIndexValid() {
      return this.selectedRow >= 0;
    }

    selectRow(i) {
        this.selectedRow = i;
    }

}
