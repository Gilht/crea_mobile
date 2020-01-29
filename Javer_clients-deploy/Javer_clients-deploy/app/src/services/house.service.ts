import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpRequest, HttpEventType } from '@angular/common/http';
import { Observable } from "rxjs/Observable";
import 'rxjs/add/observable/throw';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/from';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/delayWhen';
import 'rxjs/add/operator/mergeMap';
import { AppConfig } from '../util/AppConfig';
import { ServiceUtil, SharedHouseService } from '../clientsSharedModule/sharedmodule';
import { SynchroController, HouseController } from '../offlinecontrollers/offlineControllers';
import * as _ from "lodash";


@Injectable()
export class HouseService {
    private component = "house";
    private url = AppConfig.apiUrl() + this.component;

    constructor(
      private http: HttpClient,
      private sharedHouseService: SharedHouseService,
      private synchroController: SynchroController,
      private houseController: HouseController
    ) {

    }

    public validateSections(sections, online) {
        if (online) {
            return this.http.post(this.url + '/validateSections', sections, ServiceUtil.getHeaders())
                .map(ServiceUtil.extractData)
                .catch(ServiceUtil.handleError)
                .toPromise()
                .then(response => {
                  if (_.has(response, 'accepted') && _.has(response, 'rejected')) {
                    const idsToKeep = response.accepted.map(s => s.id);
                    const idsToRemove = response.rejected.map(s => s.id);

                    const sectionsToUpdate = sections.filter(sh => _.indexOf(idsToKeep, sh.id) >= 0);

                    let firstActionPromise = null;

                    if (response.rejected.length) {
                      firstActionPromise = this.synchroController.removeSectionHousesById(idsToRemove);
                    } else {
                      firstActionPromise = Promise.resolve();
                    }

                    return firstActionPromise.then(() => {
                      return this.houseController.updateSections(sectionsToUpdate);
                    }).then(() => {
                      return response;
                    });
                  } else {
                    return {
                      accepted: [],
                      rejected: []
                    };
                  }
                });
        } else {
            return this.houseController.validateSections(sections).then(() => {
              return {
                accepted: sections,
                rejected: []
              };
            });
        }
    }
    public getPDF(body) {
        return this.http.post(this.url + '/getPDF', body, ServiceUtil.getHeaders())
            .map(ServiceUtil.extractData)
            .catch(ServiceUtil.handleError);
    }
    public sendValidMail(body, online: boolean): Promise<any> {
        if (online) {
            return this.http.post(this.url + '/sendValidMail', body, ServiceUtil.getHeaders())
                .map(ServiceUtil.extractData)
                .catch(ServiceUtil.handleError)
                .toPromise()
                .then(result => {
                  _.forEach(body, section => {
                    section.isSentValid = true;
                  });
                  return this.houseController.updateSectionsValidMail(body);
                });
        } else {
            return this.houseController.validMail(body);
        }

    }

    public getHouse(body): Observable<any> {
        return this.http.post(this.url, body, ServiceUtil.getHeaders())
            .map(ServiceUtil.extractData)
            .catch(ServiceUtil.handleError);
    }

    public downloadResidentSections(residentId: string, projectId: string, frontId: string, collectionId: string, selectedBuildingLots: Array<string>, online: boolean): Observable<any> {
        if (online) {
          let { headers } = ServiceUtil.getHeaders();
          let reqObj = new HttpRequest('POST', this.url + '/resident/sections', {
            residentId: residentId,
            projectId: projectId,
            frontId: frontId,
            collectionId: collectionId,
            selectedBuildingLots: selectedBuildingLots
          }, {
            headers: headers,
            reportProgress: true
          });

          return this.http.request(reqObj)
                 .map(event => this.mapProgressObj(event))
                 .delayWhen(mappedResponse => {
                   if (mappedResponse.eventType == HttpEventType.Response) {
                     let sections = mappedResponse.response.map(section => {
                       // Client property
                       section.selected = false;
                       return section;
                     });

                     mappedResponse.response = sections;

                     return Observable.from(this.synchroController.upsertRange(this.synchroController.models.section, mappedResponse.response))
                            .mergeMap(p => Observable.of(mappedResponse));
                   } else {
                     return Observable.of(mappedResponse);
                   }
                 });
        } else {
            return Observable.from(this.houseController.getSections({subdivisionId: projectId, frontId: frontId, collectionId: collectionId}))
                  .map(sections => this.mapProgressObj({type: HttpEventType.Response, body: sections}));
        }
    }

    private mapProgressObj(event) {
      let po = {
        progress: 0,
        response: null,
        eventType: event.type
      };

      switch(event.type) {
        case HttpEventType.DownloadProgress:
          // const percentDone = Math.round(100 * event.loaded / event.total);
          const percentDone = (100 * event.loaded / event.total);
          po.progress = percentDone;
          break;

        case HttpEventType.Response:
          po.progress = 100;
          po.response = event.body;
          break;

        default:
          break;
      }

      return po;
    }

    public getFrontsByProject(projectId: string, online: boolean): Promise<any> {
      if (online) {
        return this.sharedHouseService.getFrente({
          proyecto: projectId
        })
        .toPromise()
        .then(response => {
          return this.houseController.saveFronts(projectId, response)
          .then(() => response);
        });
      } else {
        return this.houseController.getFronts(projectId);
      }
    }

    public getCollectionsByFront(frontId: string, online: boolean) {
      if (online) {
        return this.sharedHouseService.getConjunto({
          frente: frontId
        })
        .toPromise()
        .then(response => {
          return this.houseController.saveCollections(frontId, response)
          .then(() => response);
        });
      } else {
        return this.houseController.getCollections(frontId);
      }
    }

    // This service is thought to reduce the data tranfer as it only returns the building lots
    public getResidentBuildingLots(filters: any, online: boolean): Promise<any> {
      if (online) {
        return this.http.post(this.url + '/resident/buildingLots', filters, ServiceUtil.getHeaders())
        .map(ServiceUtil.extractData)
        .catch(ServiceUtil.handleError)
        .toPromise()
        .then(response => {
          return this.houseController.saveBuildingLots(filters.subdivisionId, filters.frontId, filters.collectionId, response)
          .then(() => response);
        });
      } else {
        return this.houseController.getBuildingLots(filters.subdivisionId, filters.frontId, filters.collectionId);
      }
    }
}
