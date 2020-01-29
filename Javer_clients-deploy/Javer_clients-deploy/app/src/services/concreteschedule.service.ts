import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from "rxjs/Observable";
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import { AppConfig } from '../util/AppConfig';
import { ServiceUtil } from '../clientsSharedModule/ServiceUtil';


@Injectable()

export class ConcreteScheduleService {
    private component = "concreteOrder";
    private url = AppConfig.apiUrl() + this.component;
    constructor(private http: HttpClient) { }

    public setOrder(concretOrder): Observable<any> {
        return this.http.post(this.url, concretOrder, ServiceUtil.getHeaders())
            .map(ServiceUtil.extractData)
            .catch(ServiceUtil.handleError);
    }
}