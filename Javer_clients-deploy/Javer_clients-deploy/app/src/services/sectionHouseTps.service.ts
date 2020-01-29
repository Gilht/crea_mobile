import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from "rxjs/Observable";
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { AppConfig } from '../util/AppConfig';
import { ServiceUtil } from '../clientsSharedModule/ServiceUtil';

@Injectable()
export class SectionHouseTPSService {
    private component = "sectionHouseTPS";
    private url = AppConfig.apiUrl() + this.component;

    constructor(private http: HttpClient) { }

    public getPicture(sectionHouseTpsId): Promise<any> {
        return this.http.get(`${this.url}/${sectionHouseTpsId}/picture`, ServiceUtil.getHeaders())
            .map(ServiceUtil.extractData)
            .catch(ServiceUtil.handleError)
            .toPromise();
    }
}
