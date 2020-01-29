import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from "rxjs/Observable";
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import { ServiceUtil } from '../ServiceUtil';
import { AppConfig } from '../../util/AppConfig';

@Injectable()

export class SharedUserService {
    private component = "user";
    private url = AppConfig.apiUrl() + this.component;

    constructor(private http: HttpClient) { }

    public getPermissions(username: string): Observable<any> {
        return this.http.get(this.url + '/permissions/' + username, ServiceUtil.getHeaders())
            .map(ServiceUtil.extractData)
            .catch(ServiceUtil.handleError);
    }
    public login(user: any, isApp: boolean = false): Observable<any> {
        const frontObj = (isApp ? {appVersion: AppConfig.version} : {adminVersion: AppConfig.version});

        return this.http.post(this.url + '/login/v2', {
            ...frontObj,
            ...user
        }, ServiceUtil.getHeaders())
            .map(ServiceUtil.extractData)
            .catch(ServiceUtil.handleError);
    }
    public verifyAdmin(username: string): Observable<any> {
        return this.http.get(this.url + '/verifyAdmin/' + username, ServiceUtil.getHeaders())
            .map(ServiceUtil.extractData)
            .catch(ServiceUtil.handleError);
    }
    public checkServerVersion(appVersion, desiredServerVersion, isApp): Observable<any> {
        let frontObj = (isApp ? {appVersion: appVersion} : {adminVersion: appVersion});

        return this.http.post(AppConfig.apiUrl() + 'version', {
            ...frontObj,
            desiredServerVersion: desiredServerVersion
        }, ServiceUtil.getHeaders())
            .map(ServiceUtil.extractData)
            .catch(ServiceUtil.handleError);
    }

    public getServicePolicy(type: string): Observable<any> {
        return this.http.get(AppConfig.apiUrl() + 'servicePolicy/' + type, ServiceUtil.getHeaders())
                .map(ServiceUtil.extractData)
                .catch(ServiceUtil.handleError);
    }

    public updateLatestAgreedServicePolicy(username: string, policy: string): Observable<any> {
        return this.http.put(this.url + '/' + username + '/servicePolicy/' + policy, {}, ServiceUtil.getHeaders())
            .map(ServiceUtil.extractData)
            .catch(ServiceUtil.handleError);
    }

    public checkPoliciesAgreements(username: string): Observable<any> {
        return this.http.get(this.url + '/' + username + '/checkPoliciesAgreements', ServiceUtil.getHeaders())
                .map(ServiceUtil.extractData)
                .catch(ServiceUtil.handleError);
    }
}