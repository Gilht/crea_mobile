import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/catch';

import { SharedService } from '../services/shared.service';
import { SessionStatus } from '../clientsSharedModule/Enums';


@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  constructor(
    private sharedService: SharedService
  ) {

  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req)
    .catch((error: any, caught) => {
      if (error instanceof HttpErrorResponse && error.status == 401) {
        // Trigger redirect flag
        this.sharedService.setSessionStatus(SessionStatus.Expired);
      }

      return Observable.throw(error);
    });
  }

}