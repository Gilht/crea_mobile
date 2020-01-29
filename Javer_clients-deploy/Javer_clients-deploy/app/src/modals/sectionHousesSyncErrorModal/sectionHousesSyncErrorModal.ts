import { Component } from '@angular/core';
import { ViewController, NavParams } from 'ionic-angular';

@Component({
    selector: 'page-sectionHousesSyncErrorModal',
    templateUrl: 'sectionHousesSyncErrorModal.html'
})
export class SectionHousesSyncErrorModalPage {
    sectionHouses: any;


    constructor(
        public viewCtrl: ViewController,
        public params: NavParams
    ) {

    }

    ionViewDidEnter() {
        this.sectionHouses = this.params.get('sectionHouses') || {};
    }

    dismiss() {
        this.viewCtrl.dismiss();
    }
}


