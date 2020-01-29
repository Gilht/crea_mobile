
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from "rxjs/Observable";
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import { ToastController } from 'ionic-angular';


@Injectable()

export class ToastService {
    public types = { success: "toast-success", warning: "toast-warning", error: "toast-error", info: "toast-info" }
    private options = { message: '', duration: 5000, position: 'top', cssClass: '' }

    constructor(private http: HttpClient, private toastCtrl: ToastController) { }

    presentToast(message, type) {
        this.options.message = message;
        this.options.cssClass = type;
        let toast = this.toastCtrl.create(this.options);
        toast.present();
    }

}





