import { Component, ViewChild, Output, Input, EventEmitter } from '@angular/core';
import { NavController, ViewController, IonicPage, NavParams } from 'ionic-angular';
import { SignaturePad } from 'angular2-signaturepad/signature-pad';
import { Storage } from '@ionic/storage';

@Component({
    selector: 'page-signatureModal',
    templateUrl: 'signatureModal.html'
})
export class SignatureModalPage {
    signature: string;
    isDrawing: boolean = false;
    wasPadTouched: boolean = false;

    @ViewChild(SignaturePad) signaturePad: SignaturePad;
    private signaturePadOptions: Object = { // Check out https://github.com/szimek/signature_pad
        'minWidth': 2,
        'canvasWidth': 450,
        'canvasHeight': 350,
        'backgroundColor': '#f6fbff',
        'penColor': '#666a73'
    };

    constructor(public viewCtrl: ViewController, public params: NavParams) { }

    ionViewDidEnter() {
        this.signaturePad.clear();
        this.signature = this.params.get('signature') || "";
    }

    drawComplete() {
        this.isDrawing = false;
        if ( ! this.wasPadTouched ) this.wasPadTouched = true;
    }

    drawStart() {
        this.isDrawing = true;
    }

    clearPad() {
        this.signaturePad.clear();
    }


    dismiss(result: boolean) {
        this.signature = this.signaturePad.toDataURL();
        if (!result) {
            this.signature = this.params.get('signature') || '';
        }
        let data = { 'result':  (this.wasPadTouched && !this.signaturePad.isEmpty() ? this.signature : null) };
        this.signaturePad.clear();
        this.viewCtrl.dismiss(data);
    }
}
