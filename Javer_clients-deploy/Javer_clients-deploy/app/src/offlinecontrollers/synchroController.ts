
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from "rxjs/Observable";
import { delay } from "rxjs/operators";
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

@Injectable()

export class SynchroController {
    // See how Storage Works --> https://ionicframework.com/docs/storage/
    public models = {
      section: "section",
      resident: "resident",
      subdivision: "subdivision",
      collection: "collection",
      project: "project",
      front: "front",
      subdivisionEmail: "subdivisionEmail",
      estimate: "estimate",
      readyMail: "readyMail",
      validMail: "validMail",
      assignedResidencyFronts: "assignedResidencyFronts",
      assignedResidencyCollections: "assignedResidencyCollections",
      buildingLots: "buildingLots",
      _isAuditorMaps: "_isAuditorMaps"
    }

    private url = AppConfig.apiUrl();

    constructor(
      private storage: Storage,
      private http: HttpClient,
      private toastService: ToastService
    ) {

    }

    get(model: string) {
        return this.storage.get(model).then(result => {
            try {
                return JSON.parse(result)
            } catch (e) {
                return null
            }
        });
    }

    set(model: string, value) {
        return this.storage.set(model, JSON.stringify(value));
    }

    removeSectionHousesById(ids: Array<string>) {
        return this.removeSectionHousesByKey('id', ids);
    }

    removeSectionHousesByIdLivingPlace(ids: Array<string>) {
        return this.removeSectionHousesByKey('idLivingPlace', ids);
    }

    protected removeSectionHousesByKey(key: string, values: Array<string>) {
        return this.get(this.models.section).then(storageSections => {
            _.each(values, val => {
                // Storage Index
                let sIndex = _.findIndex(storageSections, sh => sh[key] == val);
                // Remove section
                if (sIndex >= 0) storageSections.splice(sIndex, 1);
            });

            return this.set(this.models.section, storageSections);
        });
    }

    //Send in value only the properties that you want to modify
    update(model: string, value) {
        return this.get(model).then(res => {
            let finalValue = res;
            let index = res.findIndex(x => x.id == value.id);

            if (model == this.models.section && value.sectionHouseTPS && finalValue[index].sectionHouseTPS) {
                value.sectionHouseTPS.forEach(newValue => {
                    let originalValue = finalValue[index].sectionHouseTPS.find(x => x.id == newValue.id);
                    _.extend(originalValue, newValue);
                });
                delete value.sectionHouseTPS;
            }
            _.extend(finalValue[index], value);
            return this.set(model, finalValue).then(() => {
                return finalValue;
            });
        });
    }
    //Send in value only the properties that you want to modify
    upsert(model: string, value) {
        return this.get(model).then(res => {
            res = res ? res : [];
            let finalValue = res;
            let index = res.findIndex(x => x.id == value.id);
            if (index == -1) {
                finalValue.push(value);
            } else {
                if (model == this.models.section && value.sectionHouseTPS && finalValue[index].sectionHouseTPS) {
                    value.sectionHouseTPS.forEach(newValue => {
                        let originalValue = finalValue[index].sectionHouseTPS.find(x => x.id == newValue.id);
                        _.extend(originalValue, newValue);
                    });
                    delete value.sectionHouseTPS;
                }
                _.extend(finalValue[index], value);
            }
            return this.set(model, finalValue).then(() => {
                return finalValue;
            });
        });
    }
    upsertRange(model: string, values) {
        return this.get(model).then(res => {
            let finalValue = res ? res : [];
            values.forEach(value => {
                let index = finalValue.findIndex(x => x.id == value.id);
                if (index == -1) {
                    finalValue.push(value);
                } else {
                    if (model == this.models.section && value.sectionHouseTPS && finalValue[index].sectionHouseTPS) {
                        value.sectionHouseTPS.forEach(newValue => {
                            let originalValueIndex = finalValue[index].sectionHouseTPS.findIndex(x => x.id == newValue.id);
                            _.extend(finalValue[index].sectionHouseTPS[originalValueIndex], newValue);
                        });
                        value.sectionHouseTPS = finalValue[index].sectionHouseTPS;
                    }
                    _.extend(finalValue[index], value);
                }
            });
            return this.set(model, finalValue);
        });
    }
    //Send in value only the properties that you want to modify
    bulkUpdate(model: string, ids: string[], value) {
        return this.get(model).then(res => {
            let finalValue = res;
            finalValue.forEach(element => {
                if (ids.some(id => id == element.id)) {
                    _.extend(element, value);
                    return;
                }

            });
            return this.set(model, finalValue).then(() => {
                return finalValue;
            });
        });
    }
    hasData() {
        return this.get(this.models.resident);
    }

    download(login) {
        return this.downloadServer(login).toPromise().then(
            (result: any) => {
                this.set(this.models.subdivision, result.subdivisions);
                this.set(this.models.resident, result.resident);
                this.set(this.models.project, result.projects);
                this.set(this.models.front, result.fronts);
                this.set(this.models.collection, result.collections);
                this.set(this.models.subdivisionEmail, result.subdivisionEmails);
            },
            error => {
                this.toastService.presentToast(message.error, this.toastService.types.error);
            }
        )

    }

    saveIsAuditor(login, isAuditor) {
        return this.get(this.models._isAuditorMaps).then(kvals => {
            let toSave = (kvals != null ? kvals : {});
            toSave[login] = isAuditor;
            return this.set(this.models._isAuditorMaps, toSave);
        });
    }

    public uploadServer(body) {
        return this.http.post(this.url + 'house/syncApp', body, ServiceUtil.getHeaders())
            .map(ServiceUtil.extractData)
            .catch(ServiceUtil.handleError);
    }
    public uploadValidMails(body) {
        return this.http.post(this.url + 'house/syncValidMails', body, ServiceUtil.getHeaders())
            .map(ServiceUtil.extractData)
            .catch(ServiceUtil.handleError);
    }
    public uploadReadyMails(body) {
        return this.http.post(this.url + 'house/syncReadyMails', body, ServiceUtil.getHeaders())
            .map(ServiceUtil.extractData)
            .catch(ServiceUtil.handleError);
    }
    public downloadServer(name: string) {
        return this.http.get(this.url + 'resident/downloadServer/' + name, ServiceUtil.getHeaders())
            .map(ServiceUtil.extractData)
            .catch(ServiceUtil.handleError);
    }

    public downloadFile(url) {
        const header = ServiceUtil.getHeaders()
        header.headers.set('Accept', 'application/octet-stream')
        header['responseType'] = 'blob'

        return this.http.get(url, header)
            .catch(ServiceUtil.handleError)
            .map(this.fileToJSON)
    }

    fileToJSON(file) {
        let promise = new Promise((resolve, rejected) => {
            var reader = new FileReader();
            reader.onloadend = function (e: any) {
                const text = e.srcElement.result
                resolve(JSON.parse(text));
            };
            reader.readAsText(file);
        });
        return promise;
    }

    fakeRequestToServer(...args: any[]) {
      return new Promise((resolve, reject) => {
        let id = setTimeout(() => {
          clearTimeout(id);
          resolve(_.last(args));
        }, 250);
      });
    }
}
