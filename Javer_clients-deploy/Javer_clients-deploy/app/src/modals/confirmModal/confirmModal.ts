import { Component } from '@angular/core';
import { ViewController, IonicPage, NavParams } from 'ionic-angular';

@Component({
    selector: 'page-confirmModal',
    templateUrl: 'confirmModal.html',
})
export class ConfirmModalPage {
    message: string = "";
    accept: string = "";
    cancel: string = "";

    constructor(public viewCtrl: ViewController, public params: NavParams) {
        this.message = params.get('message') || "";
        this.accept = params.get('accept') || "Aceptar";
        this.cancel = params.get('cancel') || "Cancelar";
    }

    dismiss(result: boolean) {
        this.viewCtrl.dismiss(result);
    }

}

