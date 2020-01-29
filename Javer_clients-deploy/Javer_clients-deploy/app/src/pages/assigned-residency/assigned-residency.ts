import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { message } from '../../clientsSharedModule/sharedmodule';
import { ToastService, SharedService, BuildingLot, Front, Collection, BuildingLotManagerService, HouseService } from '../../services/services';
import { SynchroController } from '../../offlinecontrollers/synchroController';
import * as _ from "lodash";

@IonicPage()
@Component({
  selector: 'page-assigned-residency',
  templateUrl: 'assigned-residency.html',
  providers: [BuildingLotManagerService]
})
export class AssignedResidencyPage {
  subdivisions: any = [];
  collections: any = [];
  fronts: any = [];
  buildingLots: Array<BuildingLot> = [];
  sections: any = [];
  displayedBlts: any = [];
  selectA: any = false;
  isSelected: boolean = false;
  canBeDownloaded: boolean = false;
  filter_subdivision: string = "";
  filter_front: string = "";
  filter_collection: string = "";
  online = false;
  loading = false;
  progressBar = false;
  downloadProgress: string = '0%';
  subscription: any;
  resident: any;

  pagination = {
    currentPage: 0,
    numBuildingLots: 0,
    numPages: 1,
    buildingLotsPerPage: 3
  };

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private toastService: ToastService,
    private synchroController: SynchroController,
    private sharedService: SharedService,
    private houseService: HouseService,
    private buildingLotManagerService: BuildingLotManagerService
  ) {
    // ATM the "BuildingLotManagerService" is meant to handle only the heavy logic
  }

  ionViewDidLoad() {
    this.online = this.sharedService.getOnline();
    this.subscription = this.sharedService.response$.subscribe(
      conn => {
        this.online = conn;
        this.checkPermissions();
      }
    );

    this.synchroController.get(this.synchroController.models.resident).then(res => {
      this.resident = res;
    });

    this.synchroController.get(this.synchroController.models.subdivision).then(res => {
      this.subdivisions = res || [];
    });
  }

  ionViewWillEnter() {

  }

  getSections() {
    this.loading = true;

    let body = {
      subdivisionId: this.filter_subdivision,
      frontId: this.filter_front,
      collectionId: this.filter_collection,
      residentId: this.resident.id
    }

    if (this.collections.length == 0 && this.filter_collection == "") {
      this.toastService.presentToast("Falta llenar un filtro.", this.toastService.types.info);
    } else {
      this.houseService.getResidentBuildingLots(body, this.online)
      .then(response => {
        if (response.buildingLots.length == 0) {
          this.buildingLotManagerService.buildingLots = [];
          this.loading = false;
          this.toastService.presentToast("No tienen viviendas asignadas en este conjunto.", this.toastService.types.error);
          return;
        } else {
          console.info(response);
          this.buildingLotManagerService.buildingLots = response.buildingLots.map(bl => new BuildingLot(bl.element, bl.numSectionHouses));
          return this.postDownloadActions([]);
        }
      }).then(() => {
        // Paginate
        this.pagination.numBuildingLots = (this.buildingLots.length > 0 ? this.buildingLots.length : 1);
        this.pagination.buildingLotsPerPage = 10;
        this.pagination.numPages = Math.ceil(this.pagination.numBuildingLots / this.pagination.buildingLotsPerPage);
        this.paginate(0, this.pagination.buildingLotsPerPage);
        this.loading = false;

      }).catch(error => {
        this.loading = false;
        this.toastService.presentToast(message.section.list.error, this.toastService.types.error);
        console.info(error);
      });
    }

  }

  getFronts() {
    this.houseService.getFrontsByProject(this.filter_subdivision, this.online)
    .then(response => {
      if (response.length == 0) {
        this.toastService.presentToast(message.noRegistry, this.toastService.types.error);
        return [];
      } else {
        this.fronts = response.map(f => new Front(f.id, f.value));
        return this.fronts;
      }
    }).catch(error => {
      this.toastService.presentToast(message.fronts, this.toastService.types.error);
    });
  }

  getCollections() {
    this.houseService.getCollectionsByFront(this.filter_front, this.online)
    .then(response => {
      if (response.length == 0) {
        this.toastService.presentToast(message.noRegistry, this.toastService.types.error);
      } else {
        this.collections = response.map(c => new Collection(c.id, c.value));
        return this.collections;
      }
    }).catch(error => {
      this.toastService.presentToast(message.collections, this.toastService.types.error);
    });
  }

  downloadSections(selectedBuildingLots: Array<string>): Promise<any> {
    this.loading = true;
    this.progressBar = true;

    return new Promise((resolve, reject) => {
      this.houseService.downloadResidentSections(this.resident.id, this.filter_subdivision, this.filter_front, this.filter_collection, selectedBuildingLots, this.online)
      .subscribe(
        next => {
          this.downloadProgress = Math.round(next.progress) + '%';
        },
        error => {
          reject(error);
        },
        () => {
          resolve(this.postDownloadActions(selectedBuildingLots));
        }
      );
    });
  }

  postDownloadActions(selectedBuildingLots: Array<string>) {
    return this.buildingLotManagerService
    .setDownloadedFlag()
    .then(() => {
      return this.buildingLotManagerService
                  .setAnySectionHasPackagesFlag();
    }).then(() => {
      if (this.online) {
        return this.buildingLotManagerService
                  .setCheckedOnServer(selectedBuildingLots);
      } else {
        return new Promise(resolve => resolve());
      }
    }).then(() => {
      this.pagination.currentPage = 0;
      this.buildingLots = this.buildingLotManagerService.buildingLots;
      this.checkPermissions();

      this.progressBar = false;
      this.downloadProgress = '0%';
    });
  }

  download() {
    let selectedBuildingLots = this.buildingLots
                               .filter(bl => bl.selected)
                               .map(bl => bl.name);

    this.downloadSections(selectedBuildingLots)
    .then(() => {
      this.loading = false;
    });
  }

  goToSections() {
    // this.loading = true;

    let buildingLotsToDownload = this.buildingLots
                                 .filter(bl => bl.selected && !bl.downloaded && !bl.checkedOnServer)
                                 .map(bl => bl.name);

    return this.buildingLotManagerService.canBeSaved(buildingLotsToDownload)
    .then(canBeSaved => {
      if (canBeSaved) {
        let downloadPromise: Promise<any>;
        if (buildingLotsToDownload.length) {
          downloadPromise = this.downloadSections(buildingLotsToDownload);
        } else {
          downloadPromise = new Promise(resolve => resolve());
        }

        downloadPromise
        .then(() => this.synchroController.get(this.synchroController.models.section))
        .then(sections => {
          let selectedBuildingLots = this.buildingLots
                                     .filter(x => x.selected && x.downloaded && x.anySectionHasPackages)
                                     .map(x => x.name);
          let selectedSections = sections.filter(section => selectedBuildingLots.some(blName => blName == section.house.element));

          // Offline and no sections downloaded
          if (!this.online && !selectedSections.length) {
            this.toastService.presentToast(message.online.connectionLost, this.toastService.types.error);
            return new Promise(resolve => resolve(true));
          }

          if (selectedSections.length) {
            return this.navCtrl.push('ChecklistSectionsPage', { sections: selectedSections });
          } else {
            this.toastService.presentToast(message.section.list.noTemplateAssigned, this.toastService.types.warning);
          }
        }).then(() => {
          this.loading = false;
        }).catch(error => {
          this.pagination.currentPage = 0;
          this.progressBar = false;
          this.downloadProgress = '0%';
          this.loading = false;

          if (error.status == 0) {
            this.toastService.presentToast(message.online.connectionLost, this.toastService.types.error);
          } else {
            this.toastService.presentToast(message.error, this.toastService.types.error);
          }
        });
      } else {
        if (this.online) {
          this.toastService.presentToast('Límite de viviendas alcanzado, por favor seleccione menos lotes.', this.toastService.types.error);
        } else {
          this.toastService.presentToast(message.online.connectionLost, this.toastService.types.error);
        }
      }
    });
  }

  selectAll(checked: boolean) {
    if (this.collections.length > 0 && this.filter_collection != "") {
      this.selectA = checked;
      _.each(this.displayedBlts, dbl => {
        dbl.selected = checked;
      });
      this.checkPermissions();
    }
  }

  selectOne(e) {
    this.checkPermissions();
  }

  checkPermissions() {
    this.isSelected = this.buildingLots.some(x => x.selected);
    this.canBeDownloaded = this.online && this.buildingLots.length > 0 && this.buildingLots.some(bl => bl.selected) && !this.buildingLots.find(x => x.selected && x.downloaded);
    this.selectA = _.every(this.displayedBlts, (bl, k, c) => bl.selected) && this.displayedBlts.length;
  }

  getMinPaginationBorder(pageNumber) {
    if(pageNumber <= 0) return 0;
    let minBorder = (pageNumber * this.pagination.buildingLotsPerPage - this.pagination.buildingLotsPerPage);
    return minBorder;
  }

  getMaxPaginationBorder(pageNumber) {
    if(!pageNumber) return this.pagination.buildingLotsPerPage;
    let maxBorder = (pageNumber * this.pagination.buildingLotsPerPage);
    return maxBorder;
  }

  paginate(bottom, top) {
    this.displayedBlts = this.buildingLots.slice(bottom, top);
  }

  setCurrentPage(page) {
    page += 1;
    this.paginate(this.getMinPaginationBorder(page), this.getMaxPaginationBorder(page));
  }


  getPaginationBeforeNextString(getNextString) {
    if( this.pagination.numBuildingLots == 0 ||
       (this.pagination.currentPage == 0 && !getNextString) ||
       (this.pagination.currentPage == this.pagination.numPages - 1 && getNextString)
    ) {
      return (getNextString ? 'Siguiente' : 'Anterior');
    } else {
      let str = (getNextString ? 'Siguientes ' : 'Anteriores ');
      return (str + this.pagination.buildingLotsPerPage);
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

    this.checkPermissions();
  }

  cleanFilters() {
    this.filter_subdivision = "";
    this.filter_front = "";
    this.filter_collection = "";
    this.displayedBlts = [];
    this.pagination = {
      currentPage: 0,
      numBuildingLots: 0,
      numPages: 1,
      buildingLotsPerPage: 3
    };
    this.selectA = false;
  }

  ionViewWillUnload() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
