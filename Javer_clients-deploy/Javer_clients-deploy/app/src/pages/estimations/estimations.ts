import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';
import { Estimate, ServiceUtil, message, SharedEstimateService } from '../../clientsSharedModule/sharedmodule';
import { ToastService, SharedService } from '../../services/services';
import { SignatureModalPage } from '../../modals/signatureModal/signatureModal';
import { EstimateService } from '../../services/estimate.service';
import * as _ from "lodash";
import { MailModalPage } from '../../modals/mailModal/mailModal';
import { SynchroController } from '../../offlinecontrollers/synchroController';
import uuidv4 from 'uuid/v4';
import { EstimateController } from '../../offlinecontrollers/estimateController';
// Saved Response for testing purposes
// import { default as checkEstimateResponse } from '../../../temp/estimations-obj-1.json';

@IonicPage()
@Component({
  selector: 'page-estimations',
  templateUrl: 'estimations.html',
  providers: [Estimate, EstimateService, SharedEstimateService]
})

export class EstimationsPage {
  signing = false;
  subpackageSize = 0;
  estimateId: any;
  selectedSubpackage = "";
  coloredView: any = [];
  estimate: any;
  subpackagesToShow: any = [];
  filteredSubpackages: Array<any> = [];
  showSubtotal = false;
  loading = false;
  subscription: any;
  online = false;
  resident: any = {};
  rating = {
    currentValue: 0,
    availableElements: []
  };

  pagination = {
    currentPage: 0,
    list: [],
    numSections: 0,
    numSubpackages: 0,
    packagesPerPage: 3,
    numPages: 0,
  };

  filters = {
    showAvailable: true,
    toggleUnitCost: false
  };

  constructor(public navCtrl: NavController, public navParams: NavParams, private estimateService: EstimateService, private sharedEstimateService: SharedEstimateService, private toastService: ToastService, public modalCtrl: ModalController, private sharedService: SharedService, private synchroController: SynchroController, private estimateController: EstimateController) {
    this.subpackagesToShow = [];
    this.rating.availableElements = this.range(1,10).reverse();
    this.estimate = _.cloneDeep(this.navParams.get("estimate"));

    // Code to test this page
    // this.estimate = checkEstimateResponse;
    // this.estimate = checkEstimateResponse;
  }

  ionViewDidLoad() {
    this.online = this.sharedService.getOnline();
    this.subscription = this.sharedService.response$.subscribe(
      conn => {
        this.online = conn;
      }
    );
    this.synchroController.get(this.synchroController.models.resident).then(resident => {
      this.resident = resident;
    });
  }

  ionViewWillEnter() {
    // Set the initial data
    this.applyFilters();
  }

  applyFilters() {
    this.pagination.currentPage = 0;
    this.filteredSubpackages = this.filterSubpackages(this.estimate.subpackages);
    this.genPagination(this.estimate.sections.length, this.filteredSubpackages.length);
    this.setSubpackagesToShow(this.filteredSubpackages, this.getMinPaginationBorder(this.pagination.currentPage), this.getMaxPaginationBorder(this.pagination.currentPage));
  }

  // Generate Pagination Options
  genPagination(numSections, numSubpackages) {
    this.pagination.numSections = (numSections > 0 ? numSections : 1);
    this.pagination.numSubpackages = numSubpackages;
    // max cells to display divided by number of sections
    this.pagination.packagesPerPage = Math.floor(500 / this.pagination.numSections);
    this.pagination.numPages = Math.ceil(this.pagination.numSubpackages / this.pagination.packagesPerPage);

    // Set page list
    this.genPagesList();
  }

  // Generate page list for the select component
  genPagesList() {
    this.pagination.list = [];
    for(let i = 1; i <= this.pagination.numPages; i++) {
      let minBorder = (this.getMinPaginationBorder(i) + 1);
      let maxBorder = this.getMaxPaginationBorder(i);
      maxBorder = (i == this.pagination.numPages ? (maxBorder != this.pagination.numSubpackages ? this.pagination.numSubpackages : maxBorder) : maxBorder);

      this.pagination.list.push(minBorder + ' - ' +  maxBorder);
    }
    this.pagination.currentPage = 0;
  }

  getMinPaginationBorder(pageNumber) {
    if(pageNumber <= 0) return 0;
    let minBorder = (pageNumber * this.pagination.packagesPerPage - this.pagination.packagesPerPage);
    return minBorder;
  }

  getMaxPaginationBorder(pageNumber) {
    if(!pageNumber) return this.pagination.packagesPerPage;
    let maxBorder = (pageNumber * this.pagination.packagesPerPage);
    return maxBorder;
  }

  getPaginationBeforeNextString(getNextString) {
    if( this.pagination.numSubpackages == 0 ||
       (this.pagination.currentPage == 0 && !getNextString) ||
       (this.pagination.currentPage == this.pagination.numPages - 1 && getNextString)
    ) {
      return (getNextString ? 'Siguiente' : 'Anterior');
    } else {
      let str = (getNextString ? 'Siguientes ' : 'Anteriores ');
      return (str + this.pagination.packagesPerPage);
    }
  }

  changePage(goNext) {
    if(goNext && this.pagination.currentPage < this.pagination.numPages - 1) {
      this.pagination.currentPage += 1;
      this.setCurrentPage(this.pagination.currentPage);
    } else if (!goNext && this.pagination.currentPage > 0) {
      this.pagination.currentPage -= 1;
      this.setCurrentPage(this.pagination.currentPage);
    }
  }

  setCurrentPage(page) {
    page += 1;
    this.setSubpackagesToShow(this.filteredSubpackages, this.getMinPaginationBorder(page), this.getMaxPaginationBorder(page) + 1);
  }

  setSubpackagesToShow(spkgs, bottom, top) {
    this.subpackagesToShow = spkgs.slice(bottom, top);
    this.subpackageSize = 65 * (this.subpackagesToShow.length) + 40;
    this.getSubpackageMatrix();
  }

  filterSubpackages(spkgs) {
    let finalSubpackages = this.estimate.subpackages;
    if (this.selectedSubpackage.length) finalSubpackages = this.filterByName(spkgs);
    if (this.filters.showAvailable) finalSubpackages = this.filterByAvailable(finalSubpackages);
    return finalSubpackages;
  }

  filterByAvailable(spkgs) {
    return spkgs.filter(sp => {
      return this.getPendingSections(sp) > 0;
    });
  }

  filterByName(spkgs) {
    return spkgs.filter(sp => (sp.subpackageName.toLowerCase().indexOf(this.selectedSubpackage.toLowerCase()) != -1));
  }

  test() {
    this.pagination.currentPage++;
  }

  getSubpackageTotal() {
    var total = 0;
    this.estimate.sections.forEach(section => {
      section.subpackages.forEach(subpackage => {
        if (subpackage.estimateNumber === this.estimate.estimateNumber && subpackage.toEstimate == true) {
          (total += subpackage.cost * 100);
        }
      });
    });
    return (total / 100);
  }
  getSubpackageRowTotal(sp) {
    var total = 0;
    this.estimate.sections.forEach(section => {
      let subpackage = section.subpackages.find(x => x.subpackageCode == sp.subpackageCode && sp.cost == x.cost);
      try {
        if (subpackage.estimateNumber == this.estimate.estimateNumber && subpackage.toEstimate) {
          total++;
        }
      } catch (error) {

      }
    });
    return total;
  }

  getPendingSections(sp) {
    return this.getSubpackageSections(sp) - this.getSectionsDone(sp);
  }

  getSubpackageSections(sp) {
    var total = 0;
    this.estimate.sections.forEach(section => {
      let subpackage = section.subpackages.find(x => x.subpackageCode == sp.subpackageCode && sp.cost == x.cost);
      try {
        if (subpackage.cost) {
          total++;
        }
      } catch (error) {

      }
    });
    return total;
  }

  getSectionsDone(sp) {
    var total = 0;
    this.estimate.sections.forEach(section => {
      let subpackage = section.subpackages.find(x => x.subpackageCode == sp.subpackageCode && sp.cost == x.cost);
      try {
        if (subpackage.pendingQuantity == 0) {
          total++;
        }
      } catch (error) {

      }

    });
    return total;
  }


  getSubpackageMatrix() {
    this.coloredView = Array(this.estimate.sections)
      .fill(Array(this.subpackagesToShow.length).fill(0));
  }
  paintCell(i: number, j: number) {
    try {
      let sectionSubpackage = this.estimate.sections[i].subpackages
        .find(x => x.subpackageCode == this.subpackagesToShow[j].subpackageCode && this.subpackagesToShow[j].sections.some(x => x == this.estimate.sections[i].sectionCode) && this.subpackagesToShow[j].cost == x.cost);
      if (sectionSubpackage.pendingQuantity == 0) {
        return "#3D7445"; // Dark Green
      }
      else if (sectionSubpackage.estimateNumber != null && sectionSubpackage.estimateNumber != this.estimate.estimateNumber) {
        return "#2eb82e"; // Light Green
      }
      else if (sectionSubpackage.toEstimate == true) {
        return "#efd32d"; // Yellow
      }
      else {
        return "white";
      }
    } catch (error) {
      return "#a5a5a5"; // Grey
    }
  }

  getCellNumber(i: number, j: number) {
    try {
      let sectionSubpackage = this.estimate.sections[i].subpackages
        .find(x => x.subpackageCode == this.subpackagesToShow[j].subpackageCode && this.subpackagesToShow[j].sections.some(x => x == this.estimate.sections[i].sectionCode) && this.subpackagesToShow[j].cost == x.cost);
      return sectionSubpackage.estimateNumber ? sectionSubpackage.estimateNumber : "";
    } catch (error) {
      return "";
    }
  }
  toEstimate(i: number, j: number) {
    if (!this.hasWritePermission()) return;

    try {
      let sectionSubpackage = this.estimate.sections[i].subpackages
        .find(x => x.subpackageCode == this.subpackagesToShow[j].subpackageCode && this.subpackagesToShow[j].sections.some(x => x == this.estimate.sections[i].sectionCode) && this.subpackagesToShow[j].cost == x.cost);
      if (sectionSubpackage.pendingQuantity != 0 && (sectionSubpackage.estimateNumber == null || sectionSubpackage.estimateNumber == this.estimate.estimateNumber)) {
        sectionSubpackage.toEstimate = !sectionSubpackage.toEstimate;
        if (sectionSubpackage.toEstimate) {
          sectionSubpackage.estimateNumber = this.estimate.estimateNumber;
        } else {
          sectionSubpackage.estimateNumber = null;
        }
      }
    } catch (error) {

    }
  }

  addSignature(resident) {
    this.signing = true;
    let modal = null;
    if (resident && (!this.estimate.residentSignature || this.estimate.residentSignature == '')) {
      modal = this.modalCtrl.create(
        SignatureModalPage,
        { signature: this.estimate.residentSignature },
        { cssClass: 'signature-modal' }
      );
    } else if (!this.estimate.contractSignature || this.estimate.contractSignature == '') {
      modal = this.modalCtrl.create(
        SignatureModalPage,
        { signature: this.estimate.contractSignature },
        { cssClass: 'signature-modal' }
      );
    } else {
      this.toastService.presentToast("La firma ya ha sido guardada.", this.toastService.types.error);
      return;
    }

    modal.onDidDismiss(data => {
      this.signing = false;
      if (data) {
        if (resident)
          this.estimate.residentSignature = data.result;
        else
          this.estimate.contractSignature = data.result;
      }
    });
    modal.present();
  }

  hasWritePermission() {
    return !ServiceUtil.getIsAuditor();
  }

  save() {
    this.estimate.status = 0;
    this.updateLocalEstimate();
  }
  send() {
    if (!this.estimate.contractSignature || !this.estimate.residentSignature || (this.estimate.rating == null || this.estimate.rating == 0)) {
      this.toastService.presentToast("Falta llenar las firmas o seleccionar calificación.", this.toastService.types.error);
      return;
    }

    this.estimate.dateToBoss = new Date();
    this.estimate.status = 1;
    this.loading = true;
    this.getMails();
  }
  updateLocalEstimate() {
    this.estimate.status = 0;
    this.estimate.modified = true;
    this.synchroController.upsert(this.synchroController.models.estimate, this.estimate);
    this.toastService.presentToast(message.save, this.toastService.types.success);
    this.navCtrl.pop();
  }

  getMails() {
    this.loading = true;
    this.estimateService.getMails(this.estimate).subscribe(
      result => {
        this.loading = false;
        this.selectMail(result);
      },
      error => {
        this.loading = false;
        this.toastService.presentToast(message.error, this.toastService.types.error);
      }
    );
  }

  selectMail(mails) {
    let modal = this.modalCtrl.create(MailModalPage, { mails: mails }, { cssClass: 'mail-modal' });
    modal.onDidDismiss(data => {
      if (data) {
        this.sendBossMail(data.result);
      }
    });
    modal.present();
  }
  sendBossMail(selectedMail) {
    let filter = {
      projectCode: this.estimate.projectCode,
      proyecto: this.estimate.project,
      frente: this.estimate.front,
      frenteName: this.estimate.frontName,
      conjunto: this.estimate.collection,
      conjuntoName: this.estimate.collectionName,
      provider: this.estimate.provider,
      providerName: this.estimate.providerName,
      contract: this.estimate.contract,
    }
    this.loading = true;

    this.estimateService.sendBossMail({
      estimate: this.estimate,
      mail: selectedMail,
      resident: {
        username: this.resident.login,
        fullName: this.resident.workName + ' ' + this.resident.lastName + ' ' + this.resident.lastNameMother
      }
    }).subscribe(
      result => {
        this.estimate.estimateNumber += 1;
        this.estimate.status = 0;
        this.estimate.id = uuidv4();
        this.estimate.contractSignature = undefined;
        this.estimate.residentSignature = undefined;
        this.estimate.rating = null;

        this.estimateController.eraseOldEstimates(filter, this.estimate)
        .then(result => {
          this.loading = false;
          this.navCtrl.pop();
        }).catch(error => {
          this.loading = false;
          this.toastService.presentToast(message.error, this.toastService.types.error);
        });
        this.toastService.presentToast(message.mail, this.toastService.types.success);
      },
      error => {
        this.loading = false;

        if (error.status == 0) {
          this.toastService.presentToast(message.online.connectionLost, this.toastService.types.error);
        } else {
          this.toastService.presentToast(message.error, this.toastService.types.error);
        }
      }
    );
  }

  getSectionWidth(section) {
    let result = ((this.estimate.sections.filter(x => x.element == section.element).length) * 45);
    return result > 90 ? result : 135;
  }

  getColSize(section) {
    let sectionLength = this.estimate.sections.filter(x => x.element == section.element).length;
    return sectionLength > 2 ? 45 : (135 / sectionLength);
  }

  getCutString(s: string) {
    let limit = 20;
    return s.substring(0, (s.length >= limit ? limit : s.length)) + (s.length > limit ? "..." : "");
  }

  range(start, end) {
    return (new Array(end - start + 1)).fill(undefined).map((_, i) => i + start);
  }

  ionViewWillUnload() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

}
