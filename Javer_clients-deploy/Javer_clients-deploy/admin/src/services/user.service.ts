import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from "rxjs/Observable";
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import { AppConfig } from '../util/AppConfig';
import { ServiceUtil } from '../clientsSharedModule/ServiceUtil';

@Injectable()

export class UserService {
    private component = "user";
    private url = AppConfig.apiUrl() + this.component;

    constructor(private http: HttpClient) { }

    public getUsers(): Observable<any> {
        return this.http.get(this.url, ServiceUtil.getHeaders())
            .map(ServiceUtil.extractData)
            .catch(ServiceUtil.handleError);
    }
    public deleteUser(id): Observable<any> {
        return this.http.delete(this.url + '/' + id, ServiceUtil.getHeaders())
            .map(ServiceUtil.extractData)
            .catch(ServiceUtil.handleError);
    }
    public getUser(id): Observable<any> {
        return this.http.get(this.url + '/' + id, ServiceUtil.getHeaders())
            .map(ServiceUtil.extractData)
            .catch(ServiceUtil.handleError);
    }

    public editUser(user): Observable<any> {
        return this.http.put(this.url + '/' + user.id, user, ServiceUtil.getHeaders())
            .map(ServiceUtil.extractData)
            .catch(ServiceUtil.handleError);
    }

    public createUser(user): Observable<any> {
        return this.http.post(this.url, user, ServiceUtil.getHeaders())
            .map(ServiceUtil.extractData)
            .catch(ServiceUtil.handleError);
    }

    public getAllowedProjectsByUserAndUenId(userId, uenId): Observable<any> {
      return this.http.get(this.url + '/' + userId + '/uen/' + uenId + '/projects/allowed', ServiceUtil.getHeaders())
      .map(ServiceUtil.extractData)
      .catch(ServiceUtil.handleError);
    }

    public getNotAllowedProjectsByUserAndUenId(userId, uenId): Observable<any> {
      return this.http.get(this.url + '/' + userId + '/uen/' + uenId + '/projects/notAllowed', ServiceUtil.getHeaders())
      .map(ServiceUtil.extractData)
      .catch(ServiceUtil.handleError);
    }

    public updateAllowedProjects(userId, uenId, projects, freeUenAccess): Observable<any> {
      return this.http.put(this.url + '/' + userId + '/uen/' + uenId + '/projects/allowed', {
        projects: projects,
        userAdminId: ServiceUtil.getCurrentUserId(),
        freeUenAccess: freeUenAccess
      }, ServiceUtil.getHeaders())
      .map(ServiceUtil.extractData)
      .catch(ServiceUtil.handleError);
    }

    // rolAssignment
    public getAllowedRoles(userId): Observable<any> {
      return this.http.get(this.url + '/allowedRoles/' + userId, ServiceUtil.getHeaders())
          .map(ServiceUtil.extractData)
          .catch(ServiceUtil.handleError);
    }

    // rolAssignment
    public getNotAllowedPermissions(userId): Observable<any> {
      return this.http.get(this.url + '/notAllowedRoles/' + userId, ServiceUtil.getHeaders())
          .map(ServiceUtil.extractData)
          .catch(ServiceUtil.handleError);
    }

    // rolAssignment
    public updateAllowedPermission(userId, roles): Observable<any> {
      return this.http.put(this.url + '/allowedRoles/' + userId, {
        roles: roles,
        userAdminId: ServiceUtil.getCurrentUserId()
      }, ServiceUtil.getHeaders())
      .map(ServiceUtil.extractData)
      .catch(ServiceUtil.handleError);
    }
}
