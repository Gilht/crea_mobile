import { Component } from '@angular/core';
import { App, ViewController, NavParams } from 'ionic-angular';
import { SynchroController } from '../../offlinecontrollers/synchroController';
import { ToastService, SharedService } from '../../services/services';
import { ApiErrorCodes } from '../../clientsSharedModule/sharedmodule';
import * as _ from "lodash";

@Component({
    selector: 'page-uploadModal',
    templateUrl: 'uploadModal.html'
})
export class UploadModalPage {
    login = "";
    sectionCounter = 0;
    sectionTotal = 0;
    mailCounter = 0;
    totalMails = 0;

    constructor(
      public viewCtrl: ViewController,
      public params: NavParams,
      private synchroController: SynchroController,
      private toastService: ToastService,
      private sharedService: SharedService,
      public appCtrl: App
    ) {

    }

    ionViewDidEnter() {
        this.login = this.params.get('login') || "";
        this.syncLogicObrv();
    }

    syncLogicObrv() {
      this.synchroController.hasData()
      .then(hasData => {
        if(hasData) {
          this.syncData()
          .then(groupedSectionsResponses => {
            this.sharedService.setSectionHousesSyncError({});

            this.sendMails(groupedSectionsResponses).then(() => {
              this.dismiss(true);
              this.appCtrl.getRootNav().popToRoot();
            }).catch(error => {
              this.dismiss(true);
              this.appCtrl.getRootNav().popToRoot();
            });

            // console.groupEnd();
          }).catch(groupedSectionsResponses => {
            this.sharedService.setSectionHousesSyncError({});

            // Any other error
            const errorResponseKey = _.findKey(groupedSectionsResponses, gsr => _.has(gsr, 'code'));
            if (errorResponseKey) {
              switch(groupedSectionsResponses[errorResponseKey].code) {
                case ApiErrorCodes.GENERAL_UNEXPECTED:
                  this.toastService.presentToast("Ha ocurrido un error inesperado, favor de intentarlo de nuevo o contactar a su administrador.", this.toastService.types.error);
                  break;
                default:
                  this.toastService.presentToast("Ha ocurrido un error al actualizar, favor de intentarlo de nuevo o contactar a su administrador.", this.toastService.types.error);
                  break;
              }
            }

            // We send mails on error because the syncro is made by group of living places
            // this means that a group could fail but the ones behind it could not so we need
            // to make sure to only send the ones that succeeded
            this.sendMails(groupedSectionsResponses).then(() => {
              this.dismiss(false);
              this.appCtrl.getRootNav().popToRoot();
            }).catch(error => {
              this.dismiss(false);
              this.appCtrl.getRootNav().popToRoot();
            });

            // console.groupEnd();
          });

        } else {
          this.dismiss(true);
          // console.log('No data for resident.');
        }
      }).catch(error => {
        // console.log('Storage error...');
      });
    }

    syncData() {
      return this.synchroController.get(this.synchroController.models.section)
      .then((sections) => {
        // console.group('Sync sections process');
        return this.syncSections(sections);
      }).then(groupedSectionsResponses => {
        // console.log('Sync sections process completed...');
        // console.log('Sections cleared...');
        return this.synchroController.set(this.synchroController.models.section, [])
        .then(() => groupedSectionsResponses); // Forward responses
      });
    }

    private syncSections(sections): Promise<any> {
      const filteredSections = ((sections && sections.length) ? sections.filter(section => section.hasChanged) : []);
      // This object is for reference
      const groupedSections = _.groupBy(filteredSections, (section) => section.idLivingPlace);
      // This obj is gonna be mutated
      let groupedSectionsToProcess = _.cloneDeep(groupedSections);

      // console.info('groupedSections: ', groupedSections);

      return this.sendTransactions(groupedSectionsToProcess)
      .catch(groupedSectionsResponses => {
        // console.info('A living place failed to sync, backing up information.');

        const sectionsToDiscard = _.keys(_.pickBy(groupedSectionsResponses, _.isEmpty));
        const sectionsToBackUp = filteredSections.filter(section => _.indexOf(sectionsToDiscard, section.idLivingPlace) < 0 );

        // console.info('sectionsToDiscard: ', sectionsToDiscard);
        // console.info('sectionsToBackUp: ', sectionsToBackUp);
        // console.info('groupedSections: ', groupedSections);
        // console.info('groupedSectionsResponses: ', groupedSectionsResponses);

        const failedCombinationKey = _.findKey(groupedSectionsResponses, gsr => _.has(gsr, 'webserviceResponse'));
        const failedRequestResponse = (failedCombinationKey ? groupedSectionsResponses[failedCombinationKey] : null);

        if (failedRequestResponse) {
          const mappedSections: Array<any> = [];
          _.each(failedRequestResponse.webserviceResponse, s => {
            let section = groupedSections[failedCombinationKey].find(sh => sh.idLivingPlace == s.ViviendaId);
            mappedSections.push({
              transactionId: s.LoadId,
              subdivisionName: section.house.commercialName,
              frontName: section.house.front,
              collectionName: section.house.collection,
              element: section.house.element,
              sectionCode: section.sectionCode,
              errorMessage: s.Error,
            });

            if (s.Processed == 0) {
              // Storage Index
              let sIndex = _.findIndex(sectionsToBackUp, sh => sh.idLivingPlace == s.ViviendaId);
              // Remove section
              if (sIndex >= 0) sectionsToBackUp.splice(sIndex, 1);
            }

          });

          // Signal to display the error modal
          this.sharedService.setSectionHousesSyncError({hasError: true, response: mappedSections});
        }

        return this.synchroController.set(this.synchroController.models.section, sectionsToBackUp)
        .then(() => {
          // console.info('The sections were backed up.');
          throw groupedSectionsResponses;
        });

      });
    }

    private sendReadyMails(readyMails): Promise<any> {
      const filteredReadyMails = ((readyMails && readyMails.length) ? _.values(_.groupBy(readyMails, (section) => [section.house.idProject, section.house.idFront, section.house.idCollection].join('.'))) : []);
      const readyMailPromises = this.checkEmptyPromises(filteredReadyMails.map(mails => this.synchroController.uploadReadyMails(mails).toPromise()));
      return Promise.all(readyMailPromises).then(() => {
        // console.info('Ready mails send, num: ', readyMailPromises.length);
        // console.info('Ready mails cleared...');
      }).catch(error => {
        this.synchroController.upsertRange(this.synchroController.models.readyMail, readyMails);
        // console.log('Error sending ready mails, backing up...');
        throw error;
      });
    }

    private sendValidMails(validMails): Promise<any> {
      const filteredValidMails = ((validMails && validMails.length) ? _.values(_.groupBy(validMails, (section) => [section.house.idProject, section.house.idFront, section.house.idCollection].join('.'))) : []);
      const validMailPromises = this.checkEmptyPromises(filteredValidMails.map(mails => this.synchroController.uploadValidMails(mails).toPromise()));
      return Promise.all(validMailPromises).then(() => {
        // console.info('Valid mails send, num: ', validMailPromises.length);
        // console.info('Valid mails cleared...');
      }).catch(error => {
        this.synchroController.upsertRange(this.synchroController.models.validMail, validMails);
        // console.log('Error sending valid mails, backing up...');
        throw error;
      });
    }

    /**
     * Recursive function to iterate the grouped sections and send one request at a time
     * @param  {[Object]}   groupedSections           =   Sections grouped by key conform by projectId, frontId and collectionId
     * @param  {[Object]}   groupedSectionsResponses  =   Responses retrieved by each promise
     */
    private sendTransactions(groupedSections = {}, groupedSectionsResponses = {}): Promise<any> {
      const keys = _.keys(groupedSections);
      const contextKey = (keys.length ? keys[0] : null);
      let sections = (contextKey ? groupedSections[contextKey] : null);

      if (sections) {
        return this.synchroController.uploadServer(sections).toPromise().then(response => {
          groupedSectionsResponses[contextKey] = response;
          delete groupedSections[contextKey];
          return this.sendTransactions(groupedSections, groupedSectionsResponses);
        }).catch(httpError => {
          groupedSectionsResponses[contextKey] = httpError.error;
          throw groupedSectionsResponses;
        });
      } else {
        return Promise.resolve(groupedSectionsResponses);
      }
    }

    private checkEmptyPromises(promises) {
      if(promises.length > 0) {
        return promises;
      } else {
        return [];
      }
    }

    private sendMails(groupedSectionsResponses) {
      return new Promise((resolve, reject) => {
        Promise.all([
          this.synchroController.get(this.synchroController.models.readyMail),
          this.synchroController.get(this.synchroController.models.validMail)
        ]).then(([readyMails, validMails]) => {
          readyMails = (readyMails ? readyMails : []);
          validMails = (validMails ? validMails : []);

          // Filter all the sections that were sync
          const sectionsToDiscard = _.keys(_.pickBy(groupedSectionsResponses, _.isEmpty));

          let readyMailsToSend = [];
          let readyMailsToKeep = [];
          let validMailsToSend = [];
          let validMailsToKeep = [];
          // If this object is empty it means that all the sections were sync and all the
          // remaining mails must be send
          if (_.isEmpty(groupedSectionsResponses)) {
            readyMailsToSend = readyMails.filter(section => !section.isSentReady);
            readyMailsToKeep = [];
            validMailsToSend = validMails.filter(section => !section.isSentValid);
            validMailsToKeep = [];
          } else {
            readyMailsToSend = readyMails.filter(section => _.indexOf(sectionsToDiscard, section.idLivingPlace) > -1 && !section.isSentReady);
            readyMailsToKeep = readyMails.filter(section => _.indexOf(sectionsToDiscard, section.idLivingPlace) < 0 && !section.isSentReady);
            validMailsToSend = validMails.filter(section => _.indexOf(sectionsToDiscard, section.idLivingPlace) > -1 && !section.isSentValid);
            validMailsToKeep = validMails.filter(section => _.indexOf(sectionsToDiscard, section.idLivingPlace) < 0 && !section.isSentValid);
          }

          return Promise.all([
            this.synchroController.set(this.synchroController.models.readyMail, readyMailsToKeep),
            this.synchroController.set(this.synchroController.models.validMail, validMailsToKeep)
          ]).then(() => {
            // console.info('The sections with errors to mail were saved');
            return [readyMailsToSend, validMailsToSend];
          });

        }).then(([readyMails, validMails]) => {

          this.sendReadyMails(readyMails)
          .then(() => {

            this.sendValidMails(validMails)
            .then(() => {
              resolve();
            }).catch(error => {
              setTimeout(() => {
                this.toastService.presentToast("Ha ocurrido un error al enviar los correos de viviendas validadas.", this.toastService.types.error);
              }, 2000);
              reject(error);
            });

          }).catch(error => {
            setTimeout(() => {
              this.toastService.presentToast("Ha ocurrido un error al enviar los correos de viviendas listas.", this.toastService.types.error);
            }, 2000);
            reject(error)
          });

        });
      });
    }

    dismiss(result: boolean) {
        this.viewCtrl.dismiss(result);
    }
}
