import { Observable } from "rxjs";
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AppConfig } from '../util/AppConfig';
import { ServiceUtil } from '../clientsSharedModule/ServiceUtil';
import * as _ from 'lodash';
import * as moment from 'moment-timezone';


@Injectable()

export class EstimateService {
    private component = "estimate";
    private url = AppConfig.apiUrl() + this.component;
    constructor(private http: HttpClient) { }

    public getEstimateById(estimateId: string): Observable<any> {
        return this.http.get(this.url + "/" + estimateId, ServiceUtil.getHeaders())
            .map(ServiceUtil.extractData)
            .catch(ServiceUtil.handleError);
    }
    public getBossEstimates(): Observable<any> {
        return this.http.get(this.url + "/getBossEstimates", ServiceUtil.getHeaders())
            .map(ServiceUtil.extractData)
            .catch(ServiceUtil.handleError);
    }
    public getValidateEstimates(estimatesStatus = [2]): Observable<any> {
        let { headers } = ServiceUtil.getHeaders();
        let params = new HttpParams().set('estimatesStatus', estimatesStatus.toString());

        return this.http.get(this.url + "/getValidateEstimates", {headers: headers, params: params})
            .map(ServiceUtil.extractData)
            .catch(ServiceUtil.handleError);
    }

    public getValidateEstimatesFilters(filters: any = {}, subdivisionIds: Array<string> = []): Observable<any> {
        let requestFilters = this.getValidateEstimatesSearchRequest(filters);
        requestFilters.sds = subdivisionIds;

        return this.http.post(this.url + '/getValidateEstimatesSearchFilters', requestFilters, ServiceUtil.getHeaders())
            .map(ServiceUtil.extractData)
            .catch(ServiceUtil.handleError);
    }

    public getValidateEstimatesSearch(filters: any = {}, subdivisionIds: Array<string> = [], page: number = 1, limit: number = 20): Observable<any> {
        let requestFilters = this.getValidateEstimatesSearchRequest(filters, page, limit);
        requestFilters.sds = subdivisionIds;

        return this.http.post(this.url + '/getValidateEstimatesSearch', requestFilters, ServiceUtil.getHeaders())
            .map(ServiceUtil.extractData)
            .catch(ServiceUtil.handleError);
    }

    private getValidateEstimatesSearchRequest(filters: any = {}, page?: number, limit?: number): any {
        let availableFilters: Array<string> = ['project', 'provider', 'front', 'collection', 'contract'];
        let requestFilters: any = {};

        for(let i = 0; i < availableFilters.length; i++) {
            let fl = availableFilters[i];
            if (!_.isEmpty(filters[fl])) requestFilters[fl] = filters[fl];
        }

        let rf: any = requestFilters; // Alias
        let statuses: Array<number> = filters.statuses;
        let msDate: moment = moment(filters.startDate);
        let meDate: moment = moment(filters.endDate);

        if (statuses && statuses.length) rf.statuses = statuses;
        if (msDate.isValid()) rf.startDate = msDate.format('YYYY-MM-DDT00:00:00Z');
        if (meDate.isValid()) rf.endDate = meDate.format('YYYY-MM-DDT23:59:59Z');

        return {
            filters: rf,
            page,
            limit
        };
    }

    public sendSiteControlMail(body): Observable<any> {
        return this.http.post(this.url + "/sendSiteControlMail", body, ServiceUtil.getHeaders())
            .map(ServiceUtil.extractData)
            .catch(ServiceUtil.handleError);
    }

    public sendSiteControlMailTP(body): Promise<any> {
        return this.sendSiteControlMail(body)
            .toPromise();
    }

    public validateEstimates(body): Observable<any> {
        return this.http.post(this.url + "/validateEstimates", body, ServiceUtil.getHeaders())
            .map(ServiceUtil.extractData)
            .catch(ServiceUtil.handleError);
    }

    public getEstimateReportPDF(estimateId: string, extraOptions: any = {}): Observable<any> {
      let headersObj = ServiceUtil.getHeaders();
      headersObj['responseType'] = 'text';

      return this.http.post(this.url + '/getEstimateReportPDF/' + estimateId, {
        options: extraOptions,
        tzOffset: moment.tz(AppConfig.timezone).format('Z')
      }, headersObj)
        .map(ServiceUtil.extractData)
        .catch(ServiceUtil.handleError);
    }

    public getEstimateXLSX(estimateId: string, extraOptions: any = {}): Observable<any> {
      return this.http.post(this.url + '/getEstimateXLSX/' + estimateId, {
        options: extraOptions,
        tzOffset: moment.tz(AppConfig.timezone).format('Z')
      }, ServiceUtil.getHeaders())
        .map(ServiceUtil.extractData)
        .catch(ServiceUtil.handleError);
    }

}
