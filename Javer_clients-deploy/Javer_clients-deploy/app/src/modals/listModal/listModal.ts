import { Component } from '@angular/core';
import { ViewController, IonicPage, NavParams } from 'ionic-angular';

@Component({
    selector: 'page-listModal',
    templateUrl: 'listModal.html',
})
export class ListModalPage {
    list: any = [];
    displayProperty: string;
    selectedRow: any;
    title: string;
    constructor(public viewCtrl: ViewController, public params: NavParams) {
        this.list = params.get('list') || [];
        this.displayProperty = params.get('displayProperty');
        this.title = params.get('title')
    }
    dismiss() {
        let data = { 'result': this.list[this.selectedRow] };
        this.viewCtrl.dismiss(data);
    }
    selectRow(i) {
        this.selectedRow = i;
    }
}

