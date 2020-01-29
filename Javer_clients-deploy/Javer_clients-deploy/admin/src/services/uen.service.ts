import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from "rxjs/Observable";
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import { AppConfig } from '../util/AppConfig';
import { ServiceUtil } from '../clientsSharedModule/ServiceUtil';

@Injectable()

export class UenService {
    private component = "uen";
    private url = AppConfig.apiUrl() + this.component;

    constructor(private http: HttpClient) {

    }

    public getUenList(): Observable<any> {
        return this.http.get(this.url + '/', ServiceUtil.getHeaders())
        .map(ServiceUtil.extractData)
        .catch(ServiceUtil.handleError);
    }

}
