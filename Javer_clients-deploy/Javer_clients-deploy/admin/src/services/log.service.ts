import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from "rxjs/Observable";
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import { AppConfig } from '../util/AppConfig';
import { ServiceUtil } from '../clientsSharedModule/ServiceUtil';
import * as moment from 'moment-timezone';

@Injectable()

export class LogService {
    private component = "log";
    private url = AppConfig.apiUrl() + this.component;

    constructor(private http: HttpClient) {

    }

    public getLoginLogsByDateRange(startDate, endDate, page, itemsPerPage): Observable<any> {
        return this.http.post(this.url + '/search', {
          'operation': 'Inicio Sesion',
          'startDate': moment(startDate).tz(AppConfig.timezone).format('YYYY-MM-DDT00:00:00Z'),
          'endDate': moment(endDate).tz(AppConfig.timezone).format('YYYY-MM-DDT23:59:59Z'),
          'page': page,
          'itemsPerPage': itemsPerPage,
          'tzOffset': moment.tz(AppConfig.timezone).format('Z')
        }, ServiceUtil.getHeaders())
        .map(ServiceUtil.extractData)
        .catch(ServiceUtil.handleError);
    }

    public getExcel(startDate, endDate): Observable<any> {
      return this.http.post(this.url + '/search/export', {
        'operation': 'Inicio Sesion',
        'startDate': moment(startDate).tz(AppConfig.timezone).format('YYYY-MM-DDT00:00:00Z'),
        'endDate': moment(endDate).tz(AppConfig.timezone).format('YYYY-MM-DDT23:59:59Z'),
        'tzOffset': moment.tz(AppConfig.timezone).format('Z'),
        'export': true
      }, ServiceUtil.getHeaders())
      .map(ServiceUtil.extractData)
      .catch(ServiceUtil.handleError);
    }

}
