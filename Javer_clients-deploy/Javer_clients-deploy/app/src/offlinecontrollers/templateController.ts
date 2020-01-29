
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from "rxjs/Observable";
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';
import { AppConfig } from '../util/AppConfig';
import { ServiceUtil } from '../clientsSharedModule/ServiceUtil';
import { Storage } from '@ionic/storage';
import { ToastService } from '../services/toast.service';
import { message } from '../clientsSharedModule/Messages';
import * as _ from "lodash";
import { SynchroController } from './synchroController';


@Injectable()
export class TemplateController {

    constructor(private synchroController: SynchroController) { }

    getSectionsTemplate(body) {
        return this.synchroController.get(this.synchroController.models.section)
        .then(res => {
            return res.filter(value => body.some(id => id == value.id))
            .sort(ServiceUtil.compareSectionByHouseElementAndSectionCode);
        });
    }
    saveTemplates(body) {
        body = body.map(element => {
            element.hasChanged = true;
            element.selected = false;
            return element;
        });
        return this.synchroController.upsertRange(this.synchroController.models.section, body);
    }
    readyMail(body) {
        let res = body.map(x => {
            x.hasChanged = true;
            x.selected = false;
            return x;
        });

        return this.synchroController.upsertRange(this.synchroController.models.section, res).then(() => {
            return this.synchroController.upsertRange(this.synchroController.models.readyMail, res).then(() => {
                return res;
            })
        });
    }

    updateSectionsReadyMail(body) {
      return this.synchroController.upsertRange(this.synchroController.models.section, body).then(() => {
          return this.synchroController.upsertRange(this.synchroController.models.readyMail, body).then(() => {
              return body;
          });
      });
    }
}
