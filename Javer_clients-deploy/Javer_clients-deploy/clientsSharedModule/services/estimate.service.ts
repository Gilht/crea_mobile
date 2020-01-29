import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/throw';
import 'rxjs/add/observable/empty';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';

import { ServiceUtil } from '../ServiceUtil';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppConfig } from '../../util/AppConfig';

@Injectable()
export class SharedEstimateService {
    private component = "estimate";
    private url = AppConfig.apiUrl() + this.component;
    constructor(private http: HttpClient) { }

    public getEstimate(): Observable<any> {
        return this.http.get(this.url, ServiceUtil.getHeaders())
            .map(ServiceUtil.extractData)
            .catch(ServiceUtil.handleError);
    }

    public updateEstimate(body): Observable<any> {
        return this.http.put(this.url, body, ServiceUtil.getHeaders())
            .map(ServiceUtil.extractData)
            .catch(ServiceUtil.handleError);
    }

    public updateEstimateTP(body): Promise<any> {
        return this.updateEstimate(body)
            .toPromise();
    }

}