import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';
import { Estimate, ServiceUtil, message } from '../../clientsSharedModule/sharedmodule';
import { ToastService, SharedService } from '../../services/services';
import { EstimateService } from '../../services/estimate.service';
import { SynchroController, EstimateController } from '../../offlinecontrollers/offlineControllers';
import uuidv4 from 'uuid/v4';
import { AlertModalPage } from '../../modals/alertModal/alertModal';
@IonicPage()
@Component({
    selector: 'page-estimateSearch',
    templateUrl: 'estimateSearch.html',
    providers: [Estimate, EstimateService]
})
export class EstimateSearchPage {
    loading = false;
    selectedProvider: any = null;
    selectedContract: any = null;
    online = false;
    projects: any = [];
    collections: any = [];
    fronts: any = [];
    subscription: any;
    estimate: any;
    providers: any = [];
    contracts: any = [];
    selectedFront: any = { collections: [] };
    filter: any = {
        proyecto: "",
        frente: "",
        conjunto: ""
    };

    constructor(public navCtrl: NavController, private synchroController: SynchroController, public navParams: NavParams, public modalCtrl: ModalController, private estimateService: EstimateService, private toastService: ToastService, private sharedService: SharedService, private estimateController: EstimateController) {

    }

    ionViewDidLoad() {
        this.online = this.sharedService.getOnline();
        this.subscription = this.sharedService.response$.subscribe(
            conn => {
                this.online = conn;
            }
        );
        this.synchroController.get(this.synchroController.models.project).then(res => {
            this.projects = res || [];
        });
    }
    ionViewDidEnter() {
        this.filter.proyecto = "";
        this.filter.frente = "";
        this.filter.conjunto = "";
        this.selectedContract = null;
        this.selectedProvider = null;
        this.contracts = [];
        this.providers = [];
        this.estimate = null;
    }

    getProvidersContracts() {
        let body = {
            frontId: this.filter.frente,
            collectionId: this.filter.conjunto
        }
        this.loading = true;
        this.estimateService.getProvidersContracts(body, this.online).then(
            result => {
                this.providers = result;
                this.loading = false;
            }
        ).catch(error => {
            this.loading = false;
            this.toastService.presentToast(message.error, this.toastService.types.error);
        });
    }

    getFrontCollection() {
        this.loading = true;
        this.estimateService.getFrontCollection(this.filter, this.online).then(
            result => {
                this.loading = false;
                this.fronts = result;
            }
        ).catch(error => {
            this.loading = false;
            this.toastService.presentToast(message.error, this.toastService.types.error);
        });
    }

    checkEstimate() {
        if (this.filter.proyecto == "" || this.filter.frente == "" || this.filter.conjunto == "" || this.selectedProvider == null || this.selectedContract == null) {
            return;
        }
        this.loading = true;
        let filter = {
            projectCode: this.filter.proyecto,
            proyecto: this.projects.find(x => x.shortName == this.filter.proyecto).name,
            frente: this.filter.frente,
            frenteName: this.fronts.find(x => x.id == this.filter.frente).name,
            conjunto: this.filter.conjunto,
            conjuntoName: this.selectedFront.collections.find(x => x.id == this.filter.conjunto).name,
            provider: this.selectedProvider.id,
            providerName: this.selectedProvider.name,
            contract: this.selectedContract
        }
        this.estimateService.checkEstimate(filter, this.online)
        .then(result => {
                // The result might either come from storage or the server
                // from storage it comes as a sigle estimate object
                // from the server it comer as a response object
                if ( ! result || (! result.hasOwnProperty('id') && ! result.hasOwnProperty('estimate')) ) {
                    this.loading = false;
                    this.toastService.presentToast(message.estimateSearch.noResults, this.toastService.types.warning);
                    return;
                }

                if (this.online && result.hasOwnProperty('estimate')) {
                    // ATM this throw an JSON parse error if the storage key is undefined
                    // and do not execute the "then" function
                    this.estimateController.getWorkingEstimate(filter, null).then(localEstimate => {
                        // Server Estimate
                        result.estimate.id = result.estimate.id ? result.estimate.id : uuidv4();
                        if (localEstimate) {
                            if (result.estimate && result.replaceAll) {
                                if (!localEstimate.modified) {
                                    this.loading = true;
                                    this.estimateController.eraseOldEstimates(filter, result.estimate).then(result => {
                                        this.loading = false;
                                        this.estimate = result;
                                    }).catch(error => {
                                        this.loading = false;
                                        this.toastService.presentToast(message.error, this.toastService.types.error);
                                    });
                                    return;
                                }
                                this.alertModal(result.estimate, filter);
                            } else {
                                this.getOfflineEstimate(filter, result.estimate);
                            }
                            return;
                        } else {
                          // Set server estimate
                          this.estimate = result.estimate;
                          this.loading = false;
                        }
                    });

                } else {
                  // Set Local
                  this.estimate = result;
                  this.loading = false;
                }
            }
        ).catch(error => {
            this.loading = false;
            if (error.status == 400) {
                this.toastService.presentToast(message.error, this.toastService.types.error);
            } else {
                this.toastService.presentToast(message.webserviceError, this.toastService.types.warning);
            }

        });
    }

    getOfflineEstimate(filter, estimate) {
        this.estimateController.getWorkingEstimate(filter, estimate).then(result => {
            this.estimate = result;
            this.loading = false;
        }).catch(error => {
            this.loading = false;
            this.toastService.presentToast(message.error, this.toastService.types.error);
        });
    }

    alertModal(estimate, filter) {
        let modal = this.modalCtrl.create(AlertModalPage, { cssClass: 'alert-modal', enableBackdropDismiss: false });
        modal.onDidDismiss(data => {
            if (data) {
                this.discardEstimates(filter, estimate);
            } else {
                this.getOfflineEstimate(filter, estimate);
            }
        });
        modal.present();
    }

    discardEstimates(filter, estimate) {
        this.estimateService.discardEstimates(filter).then(
            result => {
                this.estimateController.eraseOldEstimates(filter, estimate).then(result => {
                    this.loading = false;
                    this.estimate = result;
                }).catch(error => {
                    this.loading = false;
                    this.toastService.presentToast(message.error, this.toastService.types.error);
                });
            }
        ).catch(error => {
            this.loading = false;
            this.toastService.presentToast(message.error, this.toastService.types.error);
        });
    }
    setFrente(frente) {
        if (frente != "") {
            return frente.split(' ')[1];
        }
    }
    setCollection(front) {
        this.selectedFront = this.fronts.find(x => x.id == this.filter.frente);
    }
    filterContracts() {
        this.contracts = this.selectedProvider.contracts;
    }

    goToEstimate() {
        this.navCtrl.push('EstimationsPage', { estimate: this.estimate })
    }

    ionViewWillUnload() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
}
