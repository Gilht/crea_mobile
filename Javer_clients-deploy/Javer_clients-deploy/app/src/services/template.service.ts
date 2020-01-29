import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';
import { AppConfig } from '../util/AppConfig';
import { ServiceUtil } from '../clientsSharedModule/ServiceUtil';
import { TemplateController, SynchroController } from '../offlinecontrollers/offlineControllers';
import * as _ from 'lodash';

@Injectable()

export class TemplateService {
    private component = "template";
    private url = AppConfig.apiUrl() + this.component;

    constructor(private http: HttpClient, private synchroController: SynchroController, private templateController: TemplateController) { }

    public getSectionsTemplates(body, sections, online: boolean) {
        if (online) {
            return this.http.post(this.url + '/sectionsTemplates', body, ServiceUtil.getHeaders())
                .map(ServiceUtil.extractData)
                .catch(ServiceUtil.handleError)
                .toPromise()
                .then(result => {
                    let sectionsTemplates = sections.map(section => {
                        section.sectionHouseTPS = result.filter(tps => tps.sectionId == section.id);
                        section.selected = false;
                        return section;
                    });

                    return this.synchroController.upsertRange(this.synchroController.models.section, sectionsTemplates)
                    .then(() => {
                        return sectionsTemplates;
                    });
                });

        } else {
            return this.templateController.getSectionsTemplate(body);
        }
    }
    public saveTemplates(body, online) {
        if (online) {
            return this.http.post(this.url + '/saveTemplates', body, ServiceUtil.getHeaders())
                .map(ServiceUtil.extractData)
                .catch(ServiceUtil.handleError)
                .toPromise()
                .then(response => {
                  // Remove images to avoid sending them again to the server,
                  // The images only are sync when "saveTemplates" is called
                  _.forEach(body, section => {
                    _.forEach(section.sectionHouseTPS, sp => {
                      delete sp['file'];
                    });
                  });

                  // Save local object
                  return this.templateController.saveTemplates(body)
                  .then(() => {
                    return response;
                  });
                });
        }
        else {
            return this.templateController.saveTemplates(body);
        }
    }
    public sendReadyMail(body, online: boolean) {
        if (online) {
            return this.http.post(this.url + '/sendReadyMail', body, ServiceUtil.getHeaders())
                .map(ServiceUtil.extractData)
                .catch(ServiceUtil.handleError)
                .toPromise()
                .then(result => {
                  _.forEach(body, section => {
                    section.isSentReady = true;
                  });
                  return this.templateController.updateSectionsReadyMail(body);
                });
        } else {
            return this.templateController.readyMail(body);
        }
    }
}
