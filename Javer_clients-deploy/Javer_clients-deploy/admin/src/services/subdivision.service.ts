import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from "rxjs/Observable";
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';
import { AppConfig } from '../util/AppConfig';
import { ServiceUtil } from '../clientsSharedModule/ServiceUtil';

@Injectable()

export class SubdivisionService {
    private component = "subdivision";
    private url = AppConfig.apiUrl() + this.component;

    constructor(private http: HttpClient) { }

    public getAllowedSubdivisions(): Observable<any> {
      return this.http.get(this.url + '/allowed', ServiceUtil.getHeaders())
              .map(ServiceUtil.extractData)
              .catch(ServiceUtil.handleError);
    }

    public getSubdivisionsDb(): Observable<any> {
        return this.http.get(this.url + '/dbSubdivisions', ServiceUtil.getHeaders())
            .map(ServiceUtil.extractData)
            .catch(ServiceUtil.handleError);
    }

    public getSubdivisionsDbTP(): Promise<any> {
        return this.getSubdivisionsDb()
            .toPromise();
    }

    public asingnPurchase(body): Observable<any> {
        return this.http.post(this.url + '/asignPurchase', body, ServiceUtil.getHeaders())
            .map(ServiceUtil.extractData)
            .catch(ServiceUtil.handleError);
    }
    public asingnControl(body): Observable<any> {
        return this.http.post(this.url + '/asignControl', body, ServiceUtil.getHeaders())
            .map(ServiceUtil.extractData)
            .catch(ServiceUtil.handleError);
    }
    public getSubdivisions(): Observable<any> {
        return this.http.get(this.url, ServiceUtil.getHeaders())
            .map(ServiceUtil.extractData)
            .catch(ServiceUtil.handleError);
    }
    public asingnDtu(body): Observable<any> {
        return this.http.post(this.url + '/asignDtu', body, ServiceUtil.getHeaders())
            .map(ServiceUtil.extractData)
            .catch(ServiceUtil.handleError);
    }
    public saveEmail(body): Observable<any> {
        return this.http.post(this.url + '/saveEmail', body, ServiceUtil.getHeaders())
            .map(ServiceUtil.extractData)
            .catch(ServiceUtil.handleError);
    }
}
