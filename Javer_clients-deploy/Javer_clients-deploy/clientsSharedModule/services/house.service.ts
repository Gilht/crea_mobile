
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import { ServiceUtil } from '../ServiceUtil';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { AppConfig } from '../../util/AppConfig';

@Injectable()

export class SharedHouseService {
    private component = "house";
    private url = AppConfig.apiUrl() + this.component;

    constructor(private http: HttpClient) { }

    public getFrente(body): Observable<any> {
        return this.http.post(this.url + '/frente', body, ServiceUtil.getHeaders())
            .map(ServiceUtil.extractData)
            .catch(ServiceUtil.handleError);
    }

    public getConjunto(body): Observable<any> {
        return this.http.post(this.url + '/conjunto', body, ServiceUtil.getHeaders())
            .map(ServiceUtil.extractData)
            .catch(ServiceUtil.handleError);
    }
    public getManzana(body): Observable<any> {
        return this.http.post(this.url + '/manzana', body, ServiceUtil.getHeaders())
            .map(ServiceUtil.extractData)
            .catch(ServiceUtil.handleError);
    }
    public getPrototipo(body): Observable<any> {
        return this.http.post(this.url + '/prototipo', body, ServiceUtil.getHeaders())
            .map(ServiceUtil.extractData)
            .catch(ServiceUtil.handleError);
    }

    public getPrototipo2(): Observable<any> {
        return this.http.get(this.url + '/prototipo2', ServiceUtil.getHeaders())
            .map(ServiceUtil.extractData)
            .catch(ServiceUtil.handleError);
    }

    public getHouseReport(body): Observable<any> {
        return this.http.post(this.url + '/report', body, ServiceUtil.getHeaders())
            .map(ServiceUtil.extractData)
            .catch(ServiceUtil.handleError);
    }
}