import { Component, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { AppConfig } from '../../util/AppConfig';
import { SharedHouseService, message } from "./../../clientsSharedModule/sharedmodule";
import { ToastService, WorkProgramService, SubdivisionService } from '../../services/services';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';
import { ConfirmModalPage } from '../../modals/confirmModal/confirmModal';
import * as _ from 'lodash';
import { SynchroController } from '../../offlinecontrollers/synchroController';

@IonicPage()
@Component({
    selector: 'page-workprogramreportlist',
    templateUrl: './workProgramReportList.html',
    providers: [WorkProgramService, SubdivisionService, ToastService, SharedHouseService]
})
export class WorkProgramReportListPage {
    conjuntos: any = [];
    frentes: any = [];
    workPrograms: any = [];
    projects: any = [];
    switchPagination: boolean;
    dataToShow: any;
    residents: any;
    filter: any = {
        proyecto: "",
        frente: "",
        conjunto: "",
    };
    _originalData: any = [];
    loading = true;
    currentPage: number = 1;
    AppConfig = AppConfig;
    constructor(private sharedHouseService: SharedHouseService, public modalCtrl: ModalController, private subdivisionService: SubdivisionService, private workProgramService: WorkProgramService, vcRef: ViewContainerRef, private toastService: ToastService, public navCtrl: NavController, private synchroController: SynchroController) {
    }

    ngOnInit() {
        this.getSubdivisions();
    }

    getSubdivisions() {
        this.synchroController.get(this.synchroController.models.subdivision).then(res => {
            this.loading = false;
            this.projects = res || [];
        }).catch(error => {
            this.toastService.presentToast(message.projects, this.toastService.types.error)
        });
    }

    getFrente() {
        this.sharedHouseService.getFrente(this.filter).subscribe(
            result => {
                if (result.length == 0) {
                    this.toastService.presentToast(message.noRegistry, this.toastService.types.error)
                }
                this.frentes = result;
            },
            error => {
                this.toastService.presentToast(message.fronts, this.toastService.types.error)
            }
        );
    }

    getConjunto() {
        this.sharedHouseService.getConjunto(this.filter).subscribe(
            result => {
                if (result.length == 0) {
                    this.toastService.presentToast(message.noRegistry, this.toastService.types.error)
                }
                this.conjuntos = result;
            },
            error => {
                this.toastService.presentToast(message.collections, this.toastService.types.error)
            }
        );
    }

    getWorkPrograms() {
        this.workProgramService.getWorkPrograms(this.filter).subscribe(
            result => {
                if (result.length == 0) {
                    this.toastService.presentToast(message.noRegistry, this.toastService.types.error)
                    this._originalData = result;
                } else {
                    this._originalData = result.filter(x => x.authorized);
                    this._originalData = [_.maxBy(this._originalData, x => x.version)];
                    if (!this._originalData || this._originalData.length == 0) {
                        this.confirmModal();
                        return
                    }
                }
                this.dataToShow = this._originalData;
                this.workPrograms = this._originalData;
            },
            error => {
                this.toastService.presentToast(message.workProgram.list.error, this.toastService.types.error)
            }
        );
    }

    confirmModal() {
        let modal = this.modalCtrl.create(ConfirmModalPage, { message: "Para poder visualizar un programa, será necesario que este previamente autorizado en el portal, favor de contactar al jefe de Edificación." }, { cssClass: 'notification-modal' });

        modal.present();
    }

    cleanFilters() {
        this.filter = {
            resident: "",
            proyecto: "",
            frente: "",
            conjunto: "",
            manzana: "",
            prototipo: ""
        };
        this.filterProjects();
    }

    filterProjects() {
        if (this._originalData) {
            this.dataToShow = this._originalData;
            if (this.filter.resident) {
                this.dataToShow = this.dataToShow
                    .filter(x => x.resident && x.resident.login == this.filter.resident.login);
            }
        }
        this.workPrograms = this.dataToShow;

    }

    goToWorkProgram(id) {
        this.navCtrl.push('WorkProgramReportPage', { workProgramId: id });
    }

    showComments(comments) {
        if (!comments) {
            this.toastService.presentToast(message.noComments, this.toastService.types.error)
            return;
        }
        let modal = this.modalCtrl.create(ConfirmModalPage, { message: comments }, { cssClass: 'notification-modal' });
        modal.present();
    }
}
