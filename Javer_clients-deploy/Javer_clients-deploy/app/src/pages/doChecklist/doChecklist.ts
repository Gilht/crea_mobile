import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, ToastController } from 'ionic-angular';
import { ServiceUtil, Resident, SubpackageStatus, ChecklistType, message, ApiErrorCodes } from '../../clientsSharedModule/sharedmodule';
import { InputModalPage } from '../../modals/inputModal/inputModal';
import * as _ from "lodash";
import * as jsPDF from "jspdf";
import { CameraModalPage } from '../../modals/cameraModal/cameraModal';
import { ToastService, TemplateService, HouseService, SectionHouseTPSService } from '../../services/services';
import { FileOpener } from '@ionic-native/file-opener';
import { File } from '@ionic-native/file';
import { SharedService } from '../../services/shared.service';
import { SynchroController } from '../../offlinecontrollers/offlineControllers';
import * as moment from 'moment';
// import { default as testData } from '../../../temp/doChecklistReadySections.json';

@IonicPage()
@Component({
  selector: 'page-doChecklist',
  templateUrl: 'doChecklist.html',
  providers: [TemplateService, HouseService, SectionHouseTPSService, File, FileOpener]
})
export class DoChecklistPage {
  // Primary variables
  sections: any = [];
  sectionsExtraAttrs: Array<any> = [];
  resident: any;
  checklistSectionsShouldRefresh: (shouldRefresh: boolean) => Promise<any>;

  // Secondary variables
  position: number = 0;
  loading = false;
  printing = false;

  // Tertiary variables
  online = false;
  subscription: any;
  today: Date = new Date();
  type: number = 0;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private file: File,
    private fileOpener: FileOpener,
    private houseService: HouseService,
    private sectionHouseTPSService: SectionHouseTPSService,
    public modalCtrl: ModalController,
    private templateService: TemplateService,
    public toastService: ToastService,
    private sharedService: SharedService,
    private synchroController: SynchroController
  ) {

  }

  ionViewDidLoad() {
    this.sections.forEach(section => {
      section.sectionHouseTPS.forEach(x => {
        if (x.subpackageStatus > SubpackageStatus.InProgress) {
          x.wasDone = true;
        }
      });
    });
    this.today = new Date;
    this.online = this.sharedService.getOnline();
    this.subscription = this.sharedService.response$.subscribe(
      conn => {
        this.online = conn;
      }
    );


    this.sortSubpackages();

  }

  ionViewCanEnter() {
    return this.synchroController.get(this.synchroController.models.resident).then(res => {
      this.resident = res;
    }).then(() => {
      return new Promise((resolve, reject) => {
        this.sections = _.cloneDeep(this.navParams.get('sections'));
        this.sectionsExtraAttrs = _.cloneDeep(this.navParams.get('sectionsExtraAttrs'));
        this.type = _.cloneDeep(this.navParams.get('type'));
        this.checklistSectionsShouldRefresh = this.navParams.get('refreshSections');

        // Testing code
        // this.sections = testData.sections;
        // this.sectionsExtraAttrs = testData.sectionsExtraAttrs;
        // this.type = testData.type;

        resolve();
      });
    });
  }

  ionViewWillEnter() {
    this.synchroController.get(this.synchroController.models.resident).then(res => {
      this.resident = res;
    })
  }

  isDisabled(x: number) {
    let section = this.sections[this.position];
    let subpackage = section.sectionHouseTPS[x];
    let sectionExtraAttrs = this.sectionsExtraAttrs[this.position];

    if (this.type == ChecklistType.Dtu) {
      return subpackage.doneDate != null && subpackage.subpackageStatus > SubpackageStatus.InProgress && sectionExtraAttrs.dtuPercent >= 100;
    } else if (this.type == ChecklistType.Advance) {
      return subpackage.doneDate != null && subpackage.subpackageStatus > SubpackageStatus.InProgress && sectionExtraAttrs.advancePercent >= 80;
    }
  }

  changeStatus(x: number) {
    if (this.isDisabled(x) || !this.hasWritePermission()) return;

    let date = moment().format('YYYY-MM-DD HH:mm:ss');
    this.sections[this.position].sectionHouseTPS[x].subpackageStatus = ++this.sections[this.position].sectionHouseTPS[x].subpackageStatus % 4;
    this.sections[this.position].sectionHouseTPS[x].backCompleteDate  = this.sections[this.position].sectionHouseTPS[x].backCompleteDate === undefined ?
      null : this.sections[this.position].sectionHouseTPS[x].backCompleteDate;
    this.sections[this.position].sectionHouseTPS[x].backLogin  = this.sections[this.position].sectionHouseTPS[x].backLogin === undefined ?
      null : this.sections[this.position].sectionHouseTPS[x].backLogin;

    if(this.sections[this.position].sectionHouseTPS[x].subpackageStatus == 2) {
      this.sections[this.position].sectionHouseTPS[x].backCompleteDate = this.sections[this.position].sectionHouseTPS[x].completeDate;
      this.sections[this.position].sectionHouseTPS[x].completeDate = date;
      this.sections[this.position].sectionHouseTPS[x].backLogin = this.sections[this.position].sectionHouseTPS[x].login
      this.sections[this.position].sectionHouseTPS[x].login = localStorage.getItem('CurrentUser');
    } else {
      this.sections[this.position].sectionHouseTPS[x].completeDate = this.sections[this.position].sectionHouseTPS[x].backCompleteDate;
      this.sections[this.position].sectionHouseTPS[x].login = this.sections[this.position].sectionHouseTPS[x].backLogin;
    }
  }

  addComments(x: number) {
    let modal = this.modalCtrl.create(InputModalPage, { comments: this.sections[this.position].sectionHouseTPS[x].comments, readOnly: (this.isDisabled(x) || !this.hasWritePermission()) });

    modal.onDidDismiss(data => {
      this.sections[this.position].sectionHouseTPS[x].comments = data.result;
    });

    modal.present();

  }

  sortSubpackages() {
    this.sections.forEach(section => {
      section.sectionHouseTPS.sort((a, b) => {
        if (a.tPS.templatePackage.packageOrder > b.tPS.templatePackage.packageOrder) {
          return 1;
        }
        else if (a.tPS.templatePackage.packageOrder < b.tPS.templatePackage.packageOrder) {
          return -1
        }
        else {
          if (a.tPS.order > b.tPS.order) {
            return 1
          }
          if (a.tPS.order < b.tPS.order) {
            return -1
          }
        }
        return 0;
      });
    });
  }

  sectionHasPicture(file) {
    return !_.isEmpty(file);
  }

  addPicture(x: number) {
    if (!this.hasWritePermission()) return;

    let sectionHouseTPS = this.sections[this.position].sectionHouseTPS[x];
    let localHasPicture = this.sectionHasPicture(sectionHouseTPS.file);
    let isDisabled = this.isDisabled(x);

    if (this.online) {
      if (sectionHouseTPS.srv_hasPicture && !localHasPicture) { // Download picture
        this.loading = true;
        this.sectionHouseTPSService.getPicture(sectionHouseTPS.id)
        .then(response => {
          this.showPictureModal(response.file, x);
          this.loading = false;
        }).catch(error => {
          console.info(error);
          this.loading = false;
          this.toastService.presentToast(message.camera.picture.error, this.toastService.types.error);
        });
      } else if ( sectionHouseTPS.srv_hasPicture && localHasPicture ) { // Show downloaded picture
        this.showPictureModal(sectionHouseTPS.file, x);
      } else if ( !sectionHouseTPS.srv_hasPicture && !localHasPicture && !isDisabled ) {
        this.showPictureModal(null, x);
      } else if ( !sectionHouseTPS.srv_hasPicture && localHasPicture && !isDisabled) {
        this.showPictureModal(sectionHouseTPS.file, x);
      }
    } else {
      // offline validations
      if (localHasPicture) {
        this.showPictureModal(sectionHouseTPS.file, x);
      } else if (!localHasPicture && !isDisabled) {
        this.showPictureModal(null, x);
      } else if (sectionHouseTPS.srv_hasPicture) {
        this.toastService.presentToast(message.onlyAvailableOnline, this.toastService.types.warning);
      }
    }

  }

  showPictureModal(file, index) {
    let modal = this.modalCtrl.create(CameraModalPage, { image: file, readOnly: (this.isDisabled(index) || !this.hasWritePermission()) });

    modal.onDidDismiss(data => {
      let subpackage = this.sections[this.position].sectionHouseTPS[index];
      if (data) {
        if (!_.isEmpty(data.result)) {
          subpackage.srv_hasPicture = 1;
        } else if(!data.wasCanceled) {
          subpackage.srv_hasPicture = 0;
        }
        subpackage.file = data.result;
        if (data.longitude) {
          subpackage.longitude = data.longitude;
          subpackage.latitude = data.latitude;
        }
      }
    });

    modal.present();
  }

  getColor(packageId: string) {
    let total = this.getPercent(packageId);
    if (total <= 30) {
      return "#f9321c";
    }
    else if (total >= 80) {
      return "#85e085";
    }
    else {
      return "#fef79a";
    }
  }

  getPercent(packageId) {
    let filteredSubpackages = this.sections[this.position].sectionHouseTPS.filter(x => x.tPS.subpackage.packageId == packageId);
    var total = 0;
    filteredSubpackages.forEach(sectionTPS => {
      if (sectionTPS.subpackageStatus == SubpackageStatus.Completed || sectionTPS.subpackageStatus == SubpackageStatus.Na) {
        total += sectionTPS.tPS.subpackageEffortWeight;
      }
    });
    return total;
  }

  hasWritePermission() {
    return !ServiceUtil.getIsAuditor();
  }

  saveAll() {
    this.loading = true;
    // Set sections ready fields
    if (this.type == ChecklistType.Advance) {
      this.sections = this.sections.map(section => {
        if (!section.ready) {
          section.ready = (this.getTotal(section.sectionHouseTPS) >= 80);
          if (section.ready)
            section.readyDate = new Date();
        }
        return section;
      });
    }
    // Set sections done date
    this.sections.forEach(section => {
      section.sectionHouseTPS.forEach(x => {
        if (x.subpackageStatus > SubpackageStatus.InProgress && !x.wasDone) {
          x.doneDate = new Date();
        }
      });
    });

    // Save
    this.templateService.saveTemplates(this.sections, this.online).then(response => {
      let responsePromise = null;

      if (_.has(response, 'webserviceResponse')) {
        responsePromise = this._processResponseWithError(response);
      } else {
        responsePromise = Promise.resolve();
      }

      responsePromise.then(() => {
        // Set default status again
        this.sharedService.setSectionHousesSyncError({});

        if (this.type == ChecklistType.Advance) {
          let mailSections = this.sections.filter(x => x.ready && !x.isSentReady);
          if (mailSections.length > 0) {
            this.sendReadyMail(mailSections);
          } else {
            this.checklistSectionsShouldRefresh(true)
            .then(() => {
              this.loading = false;
              this.navCtrl.pop();
            });
            this.toastService.presentToast(message.save, this.toastService.types.success);
          }
        } else {
          this.checklistSectionsShouldRefresh(true)
          .then(() => {
            this.navCtrl.pop();
          });
          this.toastService.presentToast(message.save, this.toastService.types.success);
          this.loading = false;
        }
      });

    }).catch(errorObj => {
      this.loading = false;
      this.toastService.presentToast(message.error, this.toastService.types.error);
    });
  }

  _processResponseWithError(response) {
    let apiError = response;

    this.loading = false;

    return this.synchroController.get(this.synchroController.models.section)
    .then(storageSections => {

      if (_.has(apiError, 'webserviceResponse')) {

        const mappedSections: Array<any> = [];
        _.each(apiError.webserviceResponse, s => {
          let section = this.sections.find(sh => sh.idLivingPlace == s.ViviendaId);

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
            let sIndex = _.findIndex(storageSections, sh => sh.idLivingPlace == s.ViviendaId);
            // Remove section
            if (sIndex >= 0) storageSections.splice(sIndex, 1);
          }

        });

        return this.synchroController.set(this.synchroController.models.section, storageSections)
        .then(() => {
          // Signal to display the error modal
          this.sharedService.setSectionHousesSyncError({hasError: true, response: mappedSections});
        });

      } else {
        switch(apiError.code) {
          case ApiErrorCodes.TEMPLATE_SECTION_HOUSE_NOT_VALID:
            this.toastService.presentToast("Hay viviendas que no cumplen con las validaciones.", this.toastService.types.error);
            break;
          default:
            this.toastService.presentToast(message.error, this.toastService.types.error);
            break;
        }
      }

    });
  }

  sendReadyMail(mailSections) {
    // console.info('send mail stuff...');
    this.templateService.sendReadyMail(mailSections, this.online)
    .then(result => {
        this.loading = false;

        this.checklistSectionsShouldRefresh(true)
        .then(() => {
          this.navCtrl.pop();
        });

        if (this.online) {
          if (result.constructor === Object && Object.keys(result).length === 0) {
            this.toastService.presentToast("Falta configuración para enviar correos, guardado exitoso.", this.toastService.types.success);
          } else {
            this.toastService.presentToast("Los correos se han enviado exitosamente y se han guardado los cambios.", this.toastService.types.success);
          }
        } else {
          this.toastService.presentToast(message.save, this.toastService.types.success);
        }
      }).catch(error => {
        this.loading = false;
        this.toastService.presentToast(message.error, this.toastService.types.error);
      });
  }

  sendReadyMailTest() {
    let testSections = _.cloneDeep(this.sections);
    // console.info('this.sections', testSections);

    // Set section done
    _.forEach(testSections, section => {
      section.ready = true;
      section.readyDate = new Date();
      section.isSentReady = false;

      _.forEach(section.sectionHouseTPS, sp => {
        sp.doneDate = new Date();
      });
    });

    this.templateService.sendReadyMail(testSections, this.online)
    // this.houseService.sendValidMail(testSections, this.online)
    .then(resp => {
      console.info('Ready Mails Sent: ', true);
    });

  }

  download() {
    if (!this.online) {
      this.toastService.presentToast(message.online.error, this.toastService.types.error);
      return;
    }
    this.houseService.getPDF({ section: this.sections[this.position], resident: this.resident }).subscribe(
      result => {
        if (result) {
          this.file.writeFile(this.file.externalApplicationStorageDirectory, 'temp.pdf', this.byteArraytoBlob(result.data, "aplication/pdf"), { replace: true }).then(res => {
            this.fileOpener.open(
              res.toInternalURL(),
              'application/pdf'
            ).then((res) => {

            });
          }).catch(err => {
            this.toastService.presentToast(message.pdf.generate.error, this.toastService.types.error);
          });
        } else {
          this.toastService.presentToast(message.pdf.download.error, this.toastService.types.error);
        }
        this.loading = false;
      },
      error => {
        this.toastService.presentToast(message.pdf.one.error, this.toastService.types.error);
      });
  }

  next() {
    this.position = ++this.position % this.sections.length;
  }

  back() {
    this.position = (--this.position + this.sections.length) % this.sections.length;
  }

  byteArraytoBlob(data, contentType: string) {
    var byteArray = new Uint8Array(data);
    return new Blob([byteArray], { type: contentType });
  }

  getTotalSectionDtu(section) {
    let filteredSectionTPS = (!_.isEmpty(section) && _.has(section, 'sectionHouseTPS') ? section.sectionHouseTPS.filter(x => x.tPS.templatePackage.template.type == ChecklistType.Dtu) : []);
    return this.getTotal(filteredSectionTPS);
  }

  getTotalSectionAdvance(section) {
    let filteredSectionTPS = (!_.isEmpty(section) && _.has(section, 'sectionHouseTPS') ? section.sectionHouseTPS.filter(x => x.tPS.templatePackage.template.type == ChecklistType.Advance) : []);
    return this.getTotal(filteredSectionTPS);
  }

  getTotal(filteredSectionTPS) {
    var currentPackage: any;
    var total = 0;
    var accum = 0;
    filteredSectionTPS.forEach(sectionTPS => {
      if (!currentPackage || sectionTPS.tPS.templatePackage.packageId != currentPackage) {
        currentPackage = sectionTPS.tPS.templatePackage.packageId;
        if (filteredSectionTPS.indexOf(sectionTPS) != 0) {
          total += ((filteredSectionTPS[filteredSectionTPS.indexOf(sectionTPS) - 1].tPS.templatePackage.packageWeighing * 100) * accum);
          accum = 0;
        }
      }
      if (sectionTPS.subpackageStatus == SubpackageStatus.Completed || sectionTPS.subpackageStatus == SubpackageStatus.Na) {
        accum += sectionTPS.tPS.subpackageEffortWeight;
      }

      if (filteredSectionTPS.indexOf(sectionTPS) == filteredSectionTPS.length - 1) {
        total += ((sectionTPS.tPS.templatePackage.packageWeighing * 100) * accum);
      }
    });
    return total / 10000;
  }

  ionViewWillUnload() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

}
