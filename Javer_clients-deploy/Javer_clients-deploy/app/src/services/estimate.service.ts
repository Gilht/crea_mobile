import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from "rxjs/Observable";
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';
import { AppConfig } from '../util/AppConfig';
import { ServiceUtil } from '../clientsSharedModule/ServiceUtil';
import { EstimateController } from '../offlinecontrollers/offlineControllers';

@Injectable()

export class EstimateService {
    private component = "estimate";
    private url = AppConfig.apiUrl() + this.component;
    constructor(private http: HttpClient, private estimateController: EstimateController) { }

    public getProvidersContracts(body, online: boolean): Promise<any> {
        if (online) {
            return this.http.post(this.url + "/getContractVendor", body, ServiceUtil.getHeaders())
                .map(ServiceUtil.extractData)
                .catch(ServiceUtil.handleError).toPromise();
        }
        else {
            return this.estimateController.getProvidersContracts(body);
        }
    }
    public getFrontCollection(body, online: boolean): Promise<any> {
        if (online) {
            return this.http.post(this.url + "/frontCollection", body, ServiceUtil.getHeaders())
                .map(ServiceUtil.extractData)
                .catch(ServiceUtil.handleError).toPromise();
        } else {
            return this.estimateController.getFrontCollection(body);
        }

    }
    public getEstimate(body): Observable<any> {
        return this.http.post(this.url, body, ServiceUtil.getHeaders())
            .map(ServiceUtil.extractData)
            .catch(ServiceUtil.handleError);
    }
    public checkEstimate(body, online: boolean): Promise<any> {
        if (online) {
            return this.http.post(this.url + "/checkEstimate", body, ServiceUtil.getHeaders())
                .map(ServiceUtil.extractData)
                .catch(ServiceUtil.handleError).toPromise();
        } else {
            return this.estimateController.getWorkingEstimate(body, null);
        }
    }


    public discardEstimates(body): Promise<any> {
        return this.http.post(this.url + "/discardEstimates", body, ServiceUtil.getHeaders())
            .map(ServiceUtil.extractData)
            .catch(ServiceUtil.handleError).toPromise();
    }
    public createEstimate(body): Observable<any> {
        return this.http.post(this.url, body, ServiceUtil.getHeaders())
            .map(ServiceUtil.extractData)
            .catch(ServiceUtil.handleError);
    }
    public sendBossMail(body): Observable<any> {
        // Async api call, this could be resolved or not due to a plugin on the server that
        // process the request in background, so the server is responsible of notify the user
        // and admin
        return this.http.post(this.url + "/sendBossMail", body, ServiceUtil.getHeaders())
            .map(ServiceUtil.extractData)
            .catch(ServiceUtil.handleError);
    }
    public getMails(body): Observable<any> {
        return this.http.post(this.url + "/getMails", body, ServiceUtil.getHeaders())
            .map(ServiceUtil.extractData)
            .catch(ServiceUtil.handleError);
    }
}
