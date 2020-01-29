import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from "rxjs/Observable";
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import { AppConfig } from '../util/AppConfig';
import { ServiceUtil } from '../clientsSharedModule/ServiceUtil';


@Injectable()

export class BlueprintsService {
    private component = "prototype";
    private url = AppConfig.apiUrl() + this.component;
    constructor(private http: HttpClient) { }

    public getHousePrototype(residentId: string): Observable<any> {
        return this.http.get(this.url + '/resident/' + residentId, ServiceUtil.getHeaders())
            .map(ServiceUtil.extractData)
            .catch(ServiceUtil.handleError);
    }

    public getFile(subcategoryPrototypeId: string): Observable<any> {
        let headersObj = ServiceUtil.getHeaders();
        headersObj['responseType'] = 'text';

        return this.http.get(this.url + '/getFile/' + subcategoryPrototypeId, headersObj)
            .map(ServiceUtil.extractData)
            .catch(ServiceUtil.handleError);
    }

}