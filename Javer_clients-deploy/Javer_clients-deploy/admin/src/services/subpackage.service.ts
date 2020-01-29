import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from "rxjs/Observable";
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import { AppConfig } from '../util/AppConfig';
import { ServiceUtil } from '../clientsSharedModule/ServiceUtil';
@Injectable()

export class SubpackageService {
    private component = "subpackage";
    private url = AppConfig.apiUrl() + this.component;

    constructor(private http: HttpClient) { }

    public getSubpackages(): Observable<any> {
        return this.http.get(this.url, ServiceUtil.getHeaders())
            .map(ServiceUtil.extractData)
            .catch(ServiceUtil.handleError);
    }

    public deleteSubpackage(id): Observable<any> {
        return this.http.delete(this.url + '/' + id, ServiceUtil.getHeaders())
            .map(ServiceUtil.extractData)
            .catch(ServiceUtil.handleError);
    }
    public getSubpackage(id): Observable<any> {
        return this.http.get(this.url + '/' + id, ServiceUtil.getHeaders())
            .map(ServiceUtil.extractData)
            .catch(ServiceUtil.handleError);
    }

    public editSubpackage(pack): Observable<any> {
        return this.http.put(this.url + '/' + pack.id, pack, ServiceUtil.getHeaders())
            .map(ServiceUtil.extractData)
            .catch(ServiceUtil.handleError);
    }

    public createSubpackage(pack): Observable<any> {
        return this.http.post(this.url, pack, ServiceUtil.getHeaders())
            .map(ServiceUtil.extractData)
            .catch(ServiceUtil.handleError);
    }
}