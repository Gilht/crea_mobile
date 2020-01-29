import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from "rxjs/Observable";
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import { AppConfig } from '../util/AppConfig';
import { ServiceUtil } from '../clientsSharedModule/ServiceUtil';

@Injectable()

export class RolService {
    private component = "rol";
    private url = AppConfig.apiUrl() + this.component;


    constructor(private http: HttpClient) { }

    public getRoles(): Observable<any> {
        return this.http.get(this.url, ServiceUtil.getHeaders())
            .map(ServiceUtil.extractData)
            .catch(ServiceUtil.handleError);
    }

    public deleteRoles(id): Observable<any> {
        return this.http.delete(this.url + '/' + id, ServiceUtil.getHeaders())
            .map(ServiceUtil.extractData)
            .catch(ServiceUtil.handleError);
    }
    public getRol(id): Observable<any> {
        return this.http.get(this.url + '/' + id, ServiceUtil.getHeaders())
            .map(ServiceUtil.extractData)
            .catch(ServiceUtil.handleError);
    }

    public editRol(roles): Observable<any> {
        return this.http.put(this.url + '/' + roles.id, roles, ServiceUtil.getHeaders())
            .map(ServiceUtil.extractData)
            .catch(ServiceUtil.handleError);
    }

    public createRol(roles): Observable<any> {
        return this.http.post(this.url, roles, ServiceUtil.getHeaders())
            .map(ServiceUtil.extractData)
            .catch(ServiceUtil.handleError);
    }

    // rolAssignment
    public getAllowedRoles(rolId): Observable<any> {
      return this.http.get(this.url + '/allowedPermissions/' + rolId, ServiceUtil.getHeaders())
          .map(ServiceUtil.extractData)
          .catch(ServiceUtil.handleError);
    }

    // rolAssignment
    public getNotAllowedRoles(rolId): Observable<any> {
      return this.http.get(this.url + '/notAllowedPermissions/' + rolId, ServiceUtil.getHeaders())
          .map(ServiceUtil.extractData)
          .catch(ServiceUtil.handleError);
    }

    // rolAssignment
    public updateAllowedRoles(rolesId, clientPermissionId): Observable<any> {
      return this.http.put(this.url + '/allowedPermissions/' + rolesId, {
        clientPermission: clientPermissionId,
        userAdminId: ServiceUtil.getCurrentUserId()
      }, ServiceUtil.getHeaders())
      .map(ServiceUtil.extractData)
      .catch(ServiceUtil.handleError);
    }
}
