



import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from "rxjs/Observable";
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import { AppConfig } from '../util/AppConfig';
import { ServiceUtil } from '../clientsSharedModule/ServiceUtil';

@Injectable()

export class ContactService {
    private component = "contact";
    private url = AppConfig.apiUrl() + this.component;


    constructor(private http: HttpClient) { }

    public deleteContact(id, body): Observable<any> {
        return this.http.put(this.url + '/' + id, body, ServiceUtil.getHeaders())
            .map(ServiceUtil.extractData)
            .catch(ServiceUtil.handleError);
    }

    public projectContacts(body): Observable<any> {
        return this.http.post(this.url + '/subdivisionContacts', body, ServiceUtil.getHeaders())
            .map(ServiceUtil.extractData)
            .catch(ServiceUtil.handleError);
    }
}




