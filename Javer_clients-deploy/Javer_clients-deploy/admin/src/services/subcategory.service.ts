import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from "rxjs/Observable";
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import { AppConfig } from '../util/AppConfig';
import { ServiceUtil } from '../clientsSharedModule/ServiceUtil';
@Injectable()

export class SubcategoryService {
    private component = "subcategory";
    private url = AppConfig.apiUrl() + this.component;

    constructor(private http: HttpClient) { }

    public getSubcategories(): Observable<any> {
        return this.http.get(this.url, ServiceUtil.getHeaders())
            .map(ServiceUtil.extractData)
            .catch(ServiceUtil.handleError);
    }

    public deleteSubcategory(id): Observable<any> {
        return this.http.delete(this.url + '/' + id, ServiceUtil.getHeaders())
            .map(ServiceUtil.extractData)
            .catch(ServiceUtil.handleError);
    }
    public getSubcategory(id): Observable<any> {
        return this.http.get(this.url + '/' + id, ServiceUtil.getHeaders())
            .map(ServiceUtil.extractData)
            .catch(ServiceUtil.handleError);
    }

    public editSubcategory(category): Observable<any> {
        return this.http.put(this.url + '/' + category.id, category, ServiceUtil.getHeaders())
            .map(ServiceUtil.extractData)
            .catch(ServiceUtil.handleError);
    }

    public createSubcategory(category): Observable<any> {
        return this.http.post(this.url, category, ServiceUtil.getHeaders())
            .map(ServiceUtil.extractData)
            .catch(ServiceUtil.handleError);
    }
}