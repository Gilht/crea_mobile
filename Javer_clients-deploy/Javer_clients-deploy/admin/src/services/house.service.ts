import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from "rxjs/Observable";
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import { AppConfig } from '../util/AppConfig';
import { ServiceUtil } from '../clientsSharedModule/ServiceUtil';
import * as moment from 'moment-timezone';

@Injectable()

export class HouseService {
    private component = "house";
    private url = AppConfig.apiUrl() + this.component;


    constructor(private http: HttpClient) { }

    public getHouse(body): Observable<any> {
        return this.http.post(this.url, body, ServiceUtil.getHeaders())
            .map(ServiceUtil.extractData)
            .catch(ServiceUtil.handleError);
    }

    public getSections(body): Observable<any> {
        return this.http.post(this.url + '/sections', body, ServiceUtil.getHeaders())
            .map(ServiceUtil.extractData)
            .catch(ServiceUtil.handleError);
    }
    public exportExcel(body): Observable<any> {
        return this.http.post(this.url + '/export', body, ServiceUtil.getHeaders())
            .map(ServiceUtil.extractData)
            .catch(ServiceUtil.handleError);
    }
    public exportAdvanceExcel(body): Observable<any> {
        return this.http.post(this.url + '/export/advance', body, ServiceUtil.getHeaders())
            .map(ServiceUtil.extractData)
            .catch(ServiceUtil.handleError);
    }

    public exportDTUExcel(body): Observable<any> {
        return this.http.post(this.url + '/export/dtu', body, ServiceUtil.getHeaders())
            .map(ServiceUtil.extractData)
            .catch(ServiceUtil.handleError);
    }

    public getSectionsWP(body): Observable<any> {
        return this.http.post(this.url + '/sectionsWP', body, ServiceUtil.getHeaders())
            .map(ServiceUtil.extractData)
            .catch(ServiceUtil.handleError);
    }

    public dtuValidationSave(body): Observable<any> {
        return this.http.post(this.url + '/dtuValidationSave', body, ServiceUtil.getHeaders())
            .map(ServiceUtil.extractData)
            .catch(ServiceUtil.handleError);
    }
    public sendDtuMail(sections): Observable<any> {
        return this.http.post(this.url + '/sendDtuMail', {
          sections: sections,
          tzOffset: moment.tz(AppConfig.timezone).format('Z')
        }, ServiceUtil.getHeaders())
            .map(ServiceUtil.extractData)
            .catch(ServiceUtil.handleError);
    }
    public sendRejetedMail(body): Observable<any> {
        return this.http.post(this.url + '/sendRejetedMail', body, ServiceUtil.getHeaders())
            .map(ServiceUtil.extractData)
            .catch(ServiceUtil.handleError);
    }

    public getResidentHouse(body): Observable<any> {
        return this.http.post(this.url + '/resident', body, ServiceUtil.getHeaders())
            .map(ServiceUtil.extractData)
            .catch(ServiceUtil.handleError);
    }

    public asignResident(body): Observable<any> {
        return this.http.post(this.url + '/asignResident', body, ServiceUtil.getHeaders())
            .map(ServiceUtil.extractData)
            .catch(ServiceUtil.handleError);
    }

    public unassignResident(body): Observable<any> {
        return this.http.post(this.url + '/unassignResident', body, ServiceUtil.getHeaders())
            .map(ServiceUtil.extractData)
            .catch(ServiceUtil.handleError);
    }

    public getHouseDb(body): Observable<any> {
        return this.http.post(this.url + '/list', body, ServiceUtil.getHeaders())
            .map(ServiceUtil.extractData)
            .catch(ServiceUtil.handleError);
    }
    public asignTemplate(body): Observable<any> {
        return this.http.post(this.url + '/asignTemplate', body, ServiceUtil.getHeaders())
            .map(ServiceUtil.extractData)
            .catch(ServiceUtil.handleError);
    }
    public getHouseDtu(body): Observable<any> {
        return this.http.post(this.url + '/dtuReport', body, ServiceUtil.getHeaders())
            .map(ServiceUtil.extractData)
            .catch(ServiceUtil.handleError);
    }
    public saveHouses(body): Observable<any> {
        return this.http.post(this.url + '/save', body, ServiceUtil.getHeaders())
            .map(ServiceUtil.extractData)
            .catch(ServiceUtil.handleError);
    }
    public asignDate(sections, startDate): Observable<any> {
        let tzDate = moment.tz(startDate, AppConfig.timezone);

        return this.http.post(this.url + '/asignDate', {
            sections,
            date: tzDate.format()
        }, ServiceUtil.getHeaders())
            .map(ServiceUtil.extractData)
            .catch(ServiceUtil.handleError);
    }

    public getSectionHouseProgressReportExcel(subdivisionIds, templateType, startDate, endDate) {
        let { headers } = ServiceUtil.getHeaders();
        let params = new HttpParams().set('export', 'y');

        let msDate: moment = moment(startDate);
        let meDate: moment = moment(endDate);

        if (msDate.isValid()) startDate = msDate.format('YYYY-MM-DDT00:00:00Z');
        if (meDate.isValid()) endDate = meDate.format('YYYY-MM-DDT23:59:59Z');

        return this.http.post(
            AppConfig.apiUrl() + 'sectionHouseProgressHistory/modifiedSectionHouses',
            {
                subdivisionIds: subdivisionIds,
                templateType: templateType,
                startDate: startDate,
                endDate: endDate
            },
            { headers: headers, params: params })
            .map(ServiceUtil.extractData)
            .catch(ServiceUtil.handleError);
    }
}
