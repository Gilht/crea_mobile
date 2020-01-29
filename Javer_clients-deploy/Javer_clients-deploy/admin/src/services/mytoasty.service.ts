import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from "rxjs/Observable";
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import { AppConfig } from '../util/AppConfig';
import { ServiceUtil } from '../clientsSharedModule/ServiceUtil';
import { ToastyService, ToastOptions } from 'ng2-toasty';

@Injectable()

export class MyToastyService {
    private component = "package";
    private url = AppConfig.apiUrl() + this.component;
    public toastyType = {
        success: "success",
        warning: "warning",
        wait: "wait",
        info: "info",
        error: "error"
    };
    3
    constructor(private http: HttpClient, private toastyService: ToastyService) { }


    public addToast(msj: string, type: string) {
        var toastOptions: ToastOptions = {
            title: msj,
            //msg: "",
            showClose: true,
            timeout: 5000,
            theme: 'bootstrap',
        };

        this.toastyService[type](toastOptions);
    }
}