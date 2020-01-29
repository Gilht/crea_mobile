import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from "rxjs/Observable";
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import { AppConfig } from '../util/AppConfig';
import { ServiceUtil } from '../clientsSharedModule/ServiceUtil';
@Injectable()

export class ResidentService {
    private component = "resident";
    private url = AppConfig.apiUrl() + this.component;

    constructor(private http: HttpClient) { }

    // Residents from our database
    public getResidentsDb(): Observable<any> {
        return this.http.get(this.url + '/dbResidents', ServiceUtil.getHeaders())
            .map(ServiceUtil.extractData)
            .catch(ServiceUtil.handleError);
    }
    // Residents from Javer Web Service
    public getResidents(): Observable<any> {
        return this.http.get(this.url, ServiceUtil.getHeaders())
            .map(ServiceUtil.extractData)
            .catch(ServiceUtil.handleError);
    }
    public getResidentUsers(): Observable<any> {
        return this.http.get(this.url + '/users', ServiceUtil.getHeaders())
            .map(ServiceUtil.extractData)
            .catch(ServiceUtil.handleError);
    }
    public sendNotification(projects: any): Observable<any> {
        return this.http.post(this.url + '/sendNotifications', projects, ServiceUtil.getHeaders())
            .map(ServiceUtil.extractData)
            .catch(ServiceUtil.handleError);
    }
}