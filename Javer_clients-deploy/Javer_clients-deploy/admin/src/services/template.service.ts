import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from "rxjs/Observable";
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import { AppConfig } from '../util/AppConfig';
import { ServiceUtil } from '../clientsSharedModule/ServiceUtil';

@Injectable()

export class TemplateService {
    private component = "template";
    private component2 = "templatePackages";
    private url = AppConfig.apiUrl() + this.component;
    private url2 = AppConfig.apiUrl() + this.component2;

    constructor(private http: HttpClient) { }

    public getTemplates(): Observable<any> {
        let opts = ServiceUtil.getHeaders();
        opts['params'] = new HttpParams().set('user', 'y');
        return this.http.get(this.url, opts)
            .map(ServiceUtil.extractData)
            .catch(ServiceUtil.handleError);
    }
    public getSectionsTemplates(body) {
        return this.http.post(this.url + '/sectionsTemplates', body, ServiceUtil.getHeaders())
            .map(ServiceUtil.extractData)
            .catch(ServiceUtil.handleError);
    }

    public getSectionAdvance(id) {
        return this.http.get(this.url + '/sectionsAdvance/' + id, ServiceUtil.getHeaders())
            .map(ServiceUtil.extractData)
            .catch(ServiceUtil.handleError);
    }

    public getFullTemplates(): Observable<any> {
        return this.http.get(this.url + '/fullTemplates', ServiceUtil.getHeaders())
            .map(ServiceUtil.extractData)
            .catch(ServiceUtil.handleError);
    }
    public getFullTemplatesByPrototype(data): Observable<any> {
        return this.http.post(this.url + '/fullTemplatesByPrototype', data, ServiceUtil.getHeaders())
            .map(ServiceUtil.extractData)
            .catch(ServiceUtil.handleError);
    }
    public getTemplatePackages(id): Observable<any> {
        return this.http.get(this.url + '/' + id, ServiceUtil.getHeaders())
            .map(ServiceUtil.extractData)
            .catch(ServiceUtil.handleError);
    }

    public deleteTemplate(id): Observable<any> {
        return this.http.delete(this.url + '/' + id, ServiceUtil.getHeaders())
            .map(ServiceUtil.extractData)
            .catch(ServiceUtil.handleError);
    }

    public editTemplate(pack): Observable<any> {
        return this.http.put(this.url + '/' + pack.id, pack, ServiceUtil.getHeaders())
            .map(ServiceUtil.extractData)
            .catch(ServiceUtil.handleError);
    }
    public createTemplate(pack): Observable<any> {
        return this.http.post(this.url, pack, ServiceUtil.getHeaders())
            .map(ServiceUtil.extractData)
            .catch(ServiceUtil.handleError);
    }
    public getTemplateTypes() {
        return this.http.get(this.url + '/templateTypes', ServiceUtil.getHeaders())
            .map(ServiceUtil.extractData)
            .catch(ServiceUtil.handleError);

    }
    public getSubpackages(id) {
        return this.http.get(this.url2 + '/' + id, ServiceUtil.getHeaders())
            .map(ServiceUtil.extractData)
            .catch(ServiceUtil.handleError);
    }

}
