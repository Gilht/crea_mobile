import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from "rxjs/Observable";
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import { AppConfig } from '../util/AppConfig';
import { ServiceUtil } from '../clientsSharedModule/ServiceUtil';
@Injectable()

export class PrototypeService {
    private component = "prototype";
    private url = AppConfig.apiUrl() + this.component;
    constructor(private http: HttpClient) { }

    public getPrototypes(): Observable<any> {
        return this.http.get(this.url, ServiceUtil.getHeaders())
            .map(ServiceUtil.extractData)
            .catch(ServiceUtil.handleError);
    }

    public getPrototypesFilter(): Observable<any> {
        return this.http.get(this.url + "/prototypesFilter", ServiceUtil.getHeaders())
            .map(ServiceUtil.extractData)
            .catch(ServiceUtil.handleError);
    }

    public getSubcategoriesPrototype(body): Observable<any> {
        return this.http.post(this.url + "/subcategories", body, ServiceUtil.getHeaders())
            .map(ServiceUtil.extractData)
            .catch(ServiceUtil.handleError);
    }

    public getFileUrl(subcategoryPrototypeId: string) {
      let headersObj = ServiceUtil.getHeaders();
      headersObj['responseType'] = 'text';

      return this.http.get(this.url + '/getFile/' + subcategoryPrototypeId, headersObj)
        .map(ServiceUtil.extractData)
        .catch(ServiceUtil.handleError);
    }
}
