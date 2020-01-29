
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
import * as moment from 'moment';
import { SynchroController } from './synchroController';


@Injectable()
export class HouseController {

    constructor(private synchroController: SynchroController) { }

    validateSections(body) {
        let res = body.map(x => {
            x.validDate = moment.utc().toDate();
            x.hasChanged = true;
            return x;
        })
        return this.synchroController.upsertRange(this.synchroController.models.section, res);
    }

    getSections(body) {
        return this.synchroController.get(this.synchroController.models.section).then(sections => {
            sections = sections.filter(x => x.house.idProject == body.subdivisionId && x.house.idFront == body.frontId && x.house.idCollection == body.collectionId).sort((a, b) => {
                if (a.house.element > b.house.element) {
                    return 1;
                }
                else if (a.house.element < b.house.element) {
                    return -1;
                } else {
                    if (a.sectionCode > b.sectionCode) {
                        return 1;
                    } else if (a.sectionCode < b.sectionCode) {
                        return -1;
                    }
                    return 0;
                }
            })
            return sections;
        });
    }

    getCollections(frontId: string) {
      return this.synchroController.get(this.synchroController.models.assignedResidencyCollections)
      .then(storageValue => {
        if (_.has(storageValue, frontId)) {
          return storageValue[frontId];
        } else {
          return [];
        }
      })
    }

    // A single key is used to save all the collections
    saveCollections(frontId: string, response: Array<Object>) {
      let finalValue = {};
      return this.synchroController.get(this.synchroController.models.assignedResidencyCollections)
      .then(storageValue => {
        let newValue = {};
        newValue[frontId] = response;

        finalValue = (_.isEmpty(storageValue) ? {} : storageValue);
        finalValue = _.merge(finalValue, newValue);
        return this.synchroController.set(this.synchroController.models.assignedResidencyCollections, finalValue);
      });
    }

    getFronts(subdivisionId: string) {
      return this.synchroController.get(this.synchroController.models.assignedResidencyFronts)
      .then(storageValue => {
        if (_.has(storageValue, subdivisionId)) {
          return storageValue[subdivisionId];
        } else {
          return [];
        }
      });
    }

    // A single key is used to save all the fronts
    saveFronts(subdivisionId: string, response: Array<Object>) {
      let finalValue = {};
      return this.synchroController.get(this.synchroController.models.assignedResidencyFronts)
      .then(storageValue => {
        let newValue = {};
        newValue[subdivisionId] = response;

        finalValue = (_.isEmpty(storageValue) ? {} : storageValue);
        finalValue = _.merge(finalValue, newValue);
        return this.synchroController.set(this.synchroController.models.assignedResidencyFronts, finalValue);
      });
    }

    getBuildingLots(subdivisionId: string, frontId: string, collectionId: string) {
      return this.synchroController.get(this.synchroController.models.buildingLots)
      .then(storageValue => {
        if (_.has(storageValue, [subdivisionId, frontId, collectionId, 'data'])) {
          return storageValue[subdivisionId][frontId][collectionId];
        } else {
          return {data: []};
        }
      });
    }

    // A single key is used to save all the building lots
    saveBuildingLots(subdivisionId: string, frontId: string, collectionId: string, response: Array<string>) {
      let finalValue = {};
      return this.synchroController.get(this.synchroController.models.buildingLots)
      .then(storageValue => {
        let newValue = {};
        newValue[subdivisionId] = {};
        newValue[subdivisionId][frontId] = {};
        newValue[subdivisionId][frontId][collectionId] = response;

        finalValue = (_.isEmpty(storageValue) ? {} : storageValue);
        finalValue = _.merge(finalValue, newValue);
        return this.synchroController.set(this.synchroController.models.buildingLots, finalValue);
      });
    }

    validMail(body) {
        let res = body.map(x => {
            x.hasChanged = true;
            return x;
        });
        return this.synchroController.upsertRange(this.synchroController.models.section, res).then(() => {
            return this.synchroController.upsertRange(this.synchroController.models.validMail, res).then(() => {
                return res;
            });
        });
    }

    updateSections(body) {
      return this.synchroController.upsertRange(this.synchroController.models.section, body);
    }

    updateSectionsValidMail(body) {
      return this.synchroController.upsertRange(this.synchroController.models.section, body).then(() => {
          return this.synchroController.upsertRange(this.synchroController.models.validMail, body).then(() => {
              return body;
          });
      });
    }

}
