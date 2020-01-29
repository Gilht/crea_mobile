import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from "rxjs/Observable";
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import { AppConfig } from '../util/AppConfig';
import { ServiceUtil } from '../clientsSharedModule/ServiceUtil';

@Injectable()

export class ResourcePermissionService {
    private component = "resourcePermission";
    private url = AppConfig.apiUrl() + this.component;


    constructor(private http: HttpClient) { }

    public getResourcePermissions(): Observable<any> {
        return this.http.get(this.url, ServiceUtil.getHeaders())
            .map(ServiceUtil.extractData)
            .catch(ServiceUtil.handleError);
    }

    public deleteResourcePermission(id): Observable<any> {
        return this.http.delete(this.url + '/' + id, ServiceUtil.getHeaders())
            .map(ServiceUtil.extractData)
            .catch(ServiceUtil.handleError);
    }
    public getResourcePermission(id): Observable<any> {
        return this.http.get(this.url + '/' + id, ServiceUtil.getHeaders())
            .map(ServiceUtil.extractData)
            .catch(ServiceUtil.handleError);
    }

    public editResourcePermission(resourcePermission): Observable<any> {
        return this.http.put(this.url + '/' + resourcePermission.id, resourcePermission, ServiceUtil.getHeaders())
            .map(ServiceUtil.extractData)
            .catch(ServiceUtil.handleError);
    }

    public createResourcePermission(resourcePermission): Observable<any> {
        return this.http.post(this.url, resourcePermission, ServiceUtil.getHeaders())
            .map(ServiceUtil.extractData)
            .catch(ServiceUtil.handleError);
    }

    // resourceAssignment
    public getAllowedResources(permissionsId): Observable<any> {
      return this.http.get(this.url + '/allowedPermissions/' + permissionsId, ServiceUtil.getHeaders())
          .map(ServiceUtil.extractData)
          .catch(ServiceUtil.handleError);
    }

    // resourceAssignment
    public getNotAllowedResources(permissionsId): Observable<any> {
      return this.http.get(this.url + '/notAllowedPermissions/' + permissionsId, ServiceUtil.getHeaders())
          .map(ServiceUtil.extractData)
          .catch(ServiceUtil.handleError);
    }

    public updateAllowedResources(clientPermissionsId, resourcePermissionId): Observable<any> {
      return this.http.put(this.url + '/allowedPermissions/' + clientPermissionsId, {
        resourcePermission: resourcePermissionId,
        userAdminId: ServiceUtil.getCurrentUserId()
      }, ServiceUtil.getHeaders())
      .map(ServiceUtil.extractData)
      .catch(ServiceUtil.handleError);
    }
}
