import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from "rxjs/Observable";
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import { AppConfig } from '../util/AppConfig';
import { ServiceUtil } from '../clientsSharedModule/ServiceUtil';

@Injectable()

export class WorkProgramService {
    private component = "workProgram";
    private url = AppConfig.apiUrl() + this.component;


    constructor(private http: HttpClient) { }

    public getWorkPrograms(body): Observable<any> {
        return this.http.post(this.url + '/list', body, ServiceUtil.getHeaders())
            .map(ServiceUtil.extractData)
            .catch(ServiceUtil.handleError);
    }
    public getWorkProgram(id): Observable<any> {
        return this.http.get(this.url + '/' + id, ServiceUtil.getHeaders())
            .map(ServiceUtil.extractData)
            .catch(ServiceUtil.handleError);
    }

    public createWorkProgram(pack): Observable<any> {
        return this.http.post(this.url, pack, ServiceUtil.getHeaders())
            .map(ServiceUtil.extractData)
            .catch(ServiceUtil.handleError);
    }

    public getSectionsTemplates(body): Observable<any> {
        return this.http.post(this.url + '/getSectionsTemplates', body, ServiceUtil.getHeaders())
            .map(ServiceUtil.extractData)
            .catch(ServiceUtil.handleError);
    }
    public exportExcel(body): Observable<any> {
        return this.http.post(this.url + '/export', body, ServiceUtil.getHeaders())
            .map(ServiceUtil.extractData)
            .catch(ServiceUtil.handleError);
    }
}