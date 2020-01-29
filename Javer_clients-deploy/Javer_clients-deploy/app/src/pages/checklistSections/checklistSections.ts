import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';
import { ServiceUtil, message } from '../../clientsSharedModule/sharedmodule';
import * as _ from "lodash";
import { ToastService, HouseService, TemplateService } from '../../services/services';
import { SharedService } from '../../services/shared.service';
import { LivingPlaceTypeModalPage } from '../../modals/livingPlaceTypeModal/livingPlaceTypeModal';
import { SynchroController } from '../../offlinecontrollers/synchroController';
import { TemplateController } from '../../offlinecontrollers/templateController';

@IonicPage()
@Component({
  selector: 'page-checklistSections',
  templateUrl: 'checklistSections.html',
  providers: [HouseService, ToastService, TemplateService, SharedService]
})
export class ChecklistSectionsPage {
  sections: any = [];
  originalSections: any = [];
  subscription: any;
  selectA: any = false;
  canDtu = false;
  canValid = false;
  isSelected = false;
  loading = true;
  online = false;

  // Callback variables
  shouldRefreshSections: boolean = true;
  shouldGetSectionFromServer: boolean = false;

  constructor (
    public navCtrl: NavController,
    private modalCtrl: ModalController,
    private synchroController: SynchroController,
    public navParams: NavParams,
    private sharedService: SharedService,
    private templateService: TemplateService,
    private houseService: HouseService,
    private toastService: ToastService,
    private templateController: TemplateController
  ) {

  }

  ionViewDidLoad() {
    this.loading = true;
    this.online = this.sharedService.getOnline();
    this.subscription = this.sharedService.response$.subscribe(
      conn => {
        this.online = conn;
      }
    );
  }

  ionViewWillEnter() {
    this.loading = false;
    if (this.shouldRefreshSections) {
      this.initPageVariables();
      this.initSectionsVariables();

      if (this.shouldGetSectionFromServer) {
        this.getSections(); // SectionHouseTPS
      }

    }
  }

  initPageVariables() {
    // We need to handle the refresh logic in a better way due to
    // the page "doChecklist" modify things that need to be updated on this page
    this.sections = (_.isEmpty(this.sections) ? _.cloneDeep(this.navParams.get('sections')).sort(ServiceUtil.compareSectionByHouseElementAndSectionCode) : this.sections);
    this.originalSections = this.sections;
  }

  initSectionsVariables() {
    _.forEach(this.sections, section => {
      // Client property
      section.wasValid = section.valid;
    });
  }

  // This function must be declared like this to be able to access
  // the scope of this controller
  refreshSections = (shouldGetSectionFromServer: boolean) => {
    // Get sections from storage
    return this.templateController.getSectionsTemplate(this.originalSections.map(s => s.id))
    .then(result => {
      this.sections = result || this.sections;
      this.shouldRefreshSections = true;
      this.shouldGetSectionFromServer = shouldGetSectionFromServer;
    });
  }

  selectAll() {
    this.sections = this.sections.map(x => {
      x.selected = this.selectA;
      return x;
    });
    this.checkPermissions();
  }

  selectOne(e) {
    this.checkPermissions();
  }

  getSections() {
    this.loading = true;
    return this.templateService.getSectionsTemplates(this.originalSections.map(s => s.id), this.originalSections, false) // Get sections always from storage
    .then(result => {
      if (!result || result.some(x => !x.sectionHouseTPS)) {
        this.toastService.presentToast(message.checklistSections.list.noTemplateAssigned, this.toastService.types.warning);
        return;
      }
      this.sections = result;
      this.initSectionsVariables();
      this.selectA = false;
      this.selectAll();
      this.shouldRefreshSections = false;
      this.shouldGetSectionFromServer = false;
      this.loading = false;
    }).catch(error => {
      this.toastService.presentToast(message.error, this.toastService.types.error);
    });

  }

  checkPermissions() {
    let selectedSections = this.sections.filter(x => x.selected == true);
    this.isSelected = selectedSections.length > 0;
    this.canDtu = selectedSections.every(section => {
      let filteredSectionTPS = section.sectionHouseTPS.filter(x => x.tPS.templatePackage.template.type == 2);
      return this.getTotal(filteredSectionTPS) >= 80;
    }) && selectedSections.length > 0;

    selectedSections = this.sections.filter(x => x.valid && !x.wasValid);
    this.canValid = selectedSections.every(section => {
      let filteredSectionTPSA = section.sectionHouseTPS.filter(x => x.tPS.templatePackage.template.type == 2);
      let filteredSectionTPS = section.sectionHouseTPS.filter(x => x.tPS.templatePackage.template.type == 1);
      return this.getTotal(filteredSectionTPS) == 100 && this.getTotal(filteredSectionTPSA) >= 80
    }) && selectedSections.length > 0;


    if (ServiceUtil.getIsAuditor()) this.canValid = false;
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
      if (sectionTPS.subpackageStatus == 2 || sectionTPS.subpackageStatus == 3) {
        accum += sectionTPS.tPS.subpackageEffortWeight;
      }

      if (filteredSectionTPS.indexOf(sectionTPS) == filteredSectionTPS.length - 1) {
        total += ((sectionTPS.tPS.templatePackage.packageWeighing * 100) * accum);
      }
    });
    return total / 10000;
  }

  getTotalSectionDtu(section) {
    let filteredSectionTPS = section.sectionHouseTPS.filter(x => x.tPS.templatePackage.template.type == 1);
    return this.getTotal(filteredSectionTPS);

  }

  getTotalSectionAdvance(section) {
    let filteredSectionTPS = section.sectionHouseTPS.filter(x => x.tPS.templatePackage.template.type == 2);
    return this.getTotal(filteredSectionTPS);
  }

  goToChecklist(type: number) {
    this.loading = true;
    let selectedSections = _.cloneDeep(this.sections.filter(x => x.selected == true));
    let result = selectedSections.map(x => {
      x.sectionHouseTPS = x.sectionHouseTPS.filter(y => y.tPS.templatePackage.template.type === type);
      return x;
    });

    let sectionsExtraAttrs: Array<any> = [];
    result.forEach(section => {
      sectionsExtraAttrs.push({
        dtuPercent: this.getTotalSectionDtu(section),
        advancePercent: this.getTotalSectionAdvance(section)
      });
    });

    this.navCtrl.push('DoChecklistPage', {
      sections: result,
      sectionsExtraAttrs:  sectionsExtraAttrs,
      type: type,
      refreshSections: this.refreshSections
    });
  }

  getColor(section) {
    var filteredSectionTPS = section.sectionHouseTPS.filter(x => x.tPS.templatePackage.template.type == 2);
    var total = this.getTotal(filteredSectionTPS);

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

  testValidatedSection() {
    this.loading = true;
    let selectedSections = _.take(this.sections, 15).map(section => {
      // section.hasChanged = true; // test
      section.isSentValid = true;
      section.validDate = new Date();
      return section;
    });
    this.synchroController.upsertRange(this.synchroController.models.section, selectedSections).then(() => {
      return this.synchroController.upsertRange(this.synchroController.models.validMail, selectedSections).then(() => {
          return selectedSections;
      })
    }).then(result => {
      this.loading = false;
      console.info(result);
    }).catch(error => {
      this.loading = false;
      console.info(error);
    });
  }

  validSections() {
    this.loading = true;
    let selectedSections = this.sections
                           .filter(sh => sh.valid == true && !sh.wasValid)
                           .map(sh => {
                             sh.wasValid = true;
                             return sh;
                           });

    this.selectLivingPlaceType().then(type => {
      selectedSections = selectedSections.map(sh => {
        if (type === 'DTU') {
          sh.dtu = true;
        } else if (type === 'DTI') {
          sh.dti = true;
        }

        return sh;
      });

      this.houseService.validateSections(selectedSections, this.online)
      .then(response => {
          // Sections objects
          const acceptedIds = response.accepted.map(s => s.id);
          const acceptedSections = this.sections.filter(s => (acceptedIds.indexOf(s.id) >= 0 && s.valid == true && s.isSentValid == false));
          this.sendValidMail(acceptedSections);
      }).catch(error => {
        this.toastService.presentToast(message.error, this.toastService.types.error);
        this.getSections(); // On error refresh sections
      });
    }).catch(error => {
      selectedSections = selectedSections.map(sh => {
        sh.wasValid = false;
        return sh;
      });
      this.loading = false;
    });

  }

  private selectLivingPlaceType() {
    return new Promise((resolve, reject) => {
      let modal = this.modalCtrl.create(LivingPlaceTypeModalPage, {}, {cssClass: 'section-houses-living-place-type-modal-page'});

      modal.onDidDismiss(data => {
        if (data) {
          resolve(data);
        } else {
          reject(data);
        }
      });

      modal.present();
    });
  }

  sendValidMail(sections) {
    if (sections.length > 0) {
      this.houseService.sendValidMail(sections, this.online).then(
        result => {
          this.canValid = false;
          this.shouldGetSectionFromServer = true;
          this.getSections();
          if (this.online)
            this.toastService.presentToast(message.save + message.mail, this.toastService.types.success);
          else
            this.toastService.presentToast(message.save, this.toastService.types.success);

        }).catch(error => {
          this.loading = false;
          this.toastService.presentToast(message.error, this.toastService.types.error);
        });
    } else {
      this.toastService.presentToast(message.save, this.toastService.types.success);
      this.getSections();
    }
  }

  ionViewWillUnload() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  disableValid(section) {
    let filteredSectionTPS = section.sectionHouseTPS.filter(x => x.tPS.templatePackage.template.type == 1);
    return !(this.getTotal(filteredSectionTPS) == 100);
  }

}
