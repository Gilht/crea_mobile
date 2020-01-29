import { Component, ViewContainerRef, ViewEncapsulation } from '@angular/core';;
import { Router, ActivatedRoute } from '@angular/router';
import { AppConfig } from '../../util/AppConfig';
import { SharedHouseService, message, ApiErrorCodes } from '../../clientsSharedModule/sharedmodule';
import { MyToastyService, SubdivisionService, ResidentService, HouseService } from '../../services/services';

import { Overlay, overlayConfigFactory } from 'angular2-modal';
import { Modal, BSModalContext } from 'angular2-modal/plugins/bootstrap';
import { SectionHousesSyncErrorComponent, SectionHousesSyncErrorContext } from '../../modals/sectionHousesSyncErrorModal/sectionHousesSyncErrorModal.component';

import 'rxjs/add/operator/toPromise';

import * as _ from 'lodash';
import moment from 'moment-timezone';

@Component({
    selector: 'validationDtu',
    templateUrl: ('./validationDtu.component.html'),
    styleUrls: ['./validationDtu.component.css'],
    providers: [SharedHouseService, HouseService, MyToastyService, SubdivisionService, ResidentService]
})
export class ValidationDtuComponent {
    isReassign: boolean;
    sections: any = [];
    manzanas: any = [];
    conjuntos: any = [];
    frentes: any = [];
    projects: any = [];
    switchPagination: boolean;
    dataToShow: any;
    residents: any;
    filter: any = {
        resident: "",
        proyecto: "",
        frente: "",
        conjunto: "",
        manzana: "",
    };
    _originalData: any = [];
    loading = true;
    currentPage: number = 1;
    access = localStorage.getItem('access');
    AppConfig = AppConfig;

    constructor(
      private route: ActivatedRoute,
      private router: Router,
      private subdivisionService: SubdivisionService,
      private residentService: ResidentService,
      private sharedHouseService: SharedHouseService,
      private houseService: HouseService,
      private vcRef: ViewContainerRef,
      private modal: Modal,
      private toastService: MyToastyService
    ) {
      this.modal.overlay.defaultViewContainer = this.vcRef;
    }

    ngOnInit() {
        this.isReassign = this.router.url == "/app/revalidationDtu";
        this.getSubdivisions();
        this.getResidents();
    }

    getSubdivisions() {
        this.subdivisionService.getSubdivisionsDb().subscribe(
            result => {
                this.loading = false;
                this.projects = result;
            },
            error => {
                if(error.statusText = 'Method Not Allowed')
                    this.toastService.addToast(error.error, this.toastService.toastyType.error);
                else
                this.toastService.addToast(message.error, this.toastService.toastyType.error)
            }
        );
    }

    getFrente() {
        this.sharedHouseService.getFrente(this.filter).subscribe(
            result => {
                this.frentes = result;
            },
            error => {
                if(error.statusText = 'Method Not Allowed')
                    this.toastService.addToast(error.error, this.toastService.toastyType.error);
                else
                this.toastService.addToast(message.error, this.toastService.toastyType.error)
            }
        );
    }

    getConjunto() {
        this.sharedHouseService.getConjunto(this.filter).subscribe(
            result => {
                this.conjuntos = result;
            },
            error => {
                if(error.statusText = 'Method Not Allowed')
                    this.toastService.addToast(error.error, this.toastService.toastyType.error);
                else
                this.toastService.addToast(message.error, this.toastService.toastyType.error)
            }
        );
    }

    getManzana() {
        this.sharedHouseService.getManzana(this.filter).subscribe(
            result => {
                this.manzanas = result;
            },
            error => {
                if(error.statusText = 'Method Not Allowed')
                    this.toastService.addToast(error.error, this.toastService.toastyType.error);
                else
                this.toastService.addToast(message.error, this.toastService.toastyType.error)
            }
        );
    }

    private getSections() {
        return this.houseService.getSections(this.filter)
        .toPromise()
        .then(result => {
            this._originalData = result;
            this.dataToShow = result;
            this._originalData.forEach(section => {
                // This flag is used to know which sections already have a "dtuDate" assigned
                // and avoid a comparison on the server side
                section.cli_wasProcessed = (section.dtu || section.dti) && !_.isEmpty(section.dtuDate);
                section.shouldAssignDate = false;
            });
            this.loading = false;
            this.pageChanged({ page: 1, itemsPerPage: 20 });
            this.switchPagination = !this.switchPagination;
        });
    }

    private selectAllAvailable() {
        this._originalData.forEach(sh =>  {
            if (this.canSectionBeProcessed(sh) && !sh.rejected) {
                sh.shouldAssignDate = true;
            }
        });
    }

    saveDtu() {
        this.loading = true;

        const filteredSections = this._originalData.filter(sh => sh.rejected || this.shouldSectionBeProcessed(sh));
        this.dtuValidationSave(filteredSections).then(response => {
            let responsePromise = null;
            let dtSections = [];
            let rjSections = [];

            if (_.has(response, 'webserviceResponse')) {
                responsePromise = this._processResponseWithError(response);
                dtSections = filteredSections.filter(sh => this.shouldSectionBeProcessed(sh) && response.webserviceResponse.findIndex(s => s.ViviendaId == sh.idLivingPlace) < 0);
                rjSections = filteredSections.filter(sh => sh.rejected && response.webserviceResponse.findIndex(s => s.ViviendaId == sh.idLivingPlace) < 0);
            } else {
                responsePromise = Promise.resolve();
                dtSections = filteredSections.filter(sh => this.shouldSectionBeProcessed(sh));
                rjSections = filteredSections.filter(sh => sh.rejected);
            }

            return responsePromise.then(response => ({
                dtSections,
                rjSections
            }));
        }).then(groupedSections => {
            return this.sendRejectedMail(groupedSections.rjSections)
            .then(() => groupedSections);
        }).then(groupedSections => {
            return this.sendDtuMail(groupedSections.dtSections);
        }).then(() => {
            return this.getSections();
        }).then(() => {
            this.toastService.addToast(message.mail, this.toastService.toastyType.success);
            this.loading = false;
        }).catch(error => {
            switch(error.code) {
              // case ApiErrorCodes.GENERAL_WEB_SERVICE_UNTAGGED_ERROR:
              //   this.toastService.addToast(message.error, this.toastService.toastyType.error);
              //   break;
              // case ApiErrorCodes.GENERAL_UNAUTHORIZED_REQUEST:
              //   this.toastService.addToast(message.error, this.toastService.toastyType.error);
              //   break;
              default:
                this.toastService.addToast(message.error, this.toastService.toastyType.error);
                return this.getSections();
            }
        });
    }

    isModified() {
        return this._originalData.length > 0 ? this._originalData.some(x => x.rejected || this.shouldSectionBeProcessed(x)) : false;
    }

    cleanFilters() {
        this.filter = {
            resident: "",
            proyecto: "",
            frente: "",
            conjunto: "",
            manzana: "",
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
            this.pageChanged({ page: 1, itemsPerPage: 20 });
            this.switchPagination = !this.switchPagination;
        }

    }

    private getResidents() {
        return this.residentService.getResidentsDb()
        .toPromise()
        .then(residentsResponse => {
            this.residents = residentsResponse;
        });
    }

    private dtuValidationSave(filteredSections) {
        return this.houseService.dtuValidationSave(filteredSections).toPromise();
    }

    private sendRejectedMail(rejectedSections) {
        if (rejectedSections.length > 0) {
            return this.houseService.sendRejetedMail(rejectedSections)
            .toPromise();
        } else {
            return Promise.resolve();
        }
    }

    private sendDtuMail(dtuSections) {
        if (dtuSections.length > 0) {
            return this.houseService.sendDtuMail(dtuSections)
            .toPromise();
        } else {
            return Promise.resolve();
        }
    }

    private _processResponseWithError(response) {
        if (_.has(response, 'webserviceResponse')) {
            const mappedSections: Array<any> = [];
            _.each(response.webserviceResponse, s => {
                let section = this._originalData.find(sh => sh.idLivingPlace == s.ViviendaId);
                mappedSections.push({
                    transactionId: s.LoadId,
                    subdivisionName: section.house.commercialName,
                    frontName: section.house.front,
                    collectionName: section.house.collection,
                    element: section.house.element,
                    sectionCode: section.sectionCode,
                    errorMessage: s.Error,
                });
            });

            // Display modal
            this.modal.open(SectionHousesSyncErrorComponent, overlayConfigFactory({
                        sectionHouses: mappedSections
                    }, SectionHousesSyncErrorContext
                )
            ).then((dref) => dref.result);

            return Promise.resolve(response);
        } else {
            // Any other error
            if (_.has(response, 'code')) {
              throw response;
            } else {
                throw {
                    code: 'GENERAL_GENERATING_RESPONSE',
                    message: 'This error was generated by the client...'
                };
            }
        }
    }

    private shouldSectionBeProcessed(sh) {
        return this.canSectionBeProcessed(sh) && sh.shouldAssignDate;
    }

    private canSectionBeProcessed(sh) {
        return (!this.wasSectionProcessed(sh) && (sh.valid && sh.ready));
    }

    private wasSectionProcessed(sh) {
        return sh.cli_wasProcessed;
    }

    public pageChanged(evt) {
        let page = evt.page - 1;
        this.sections = this.dataToShow.slice(page * 20, page * 20 + evt.itemsPerPage);
        this.currentPage = evt.page;
    }
}
