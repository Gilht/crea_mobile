import { Component, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { EmailValidator } from '@angular/forms';
import { message, ApiErrorCodes } from '../../clientsSharedModule/sharedmodule';
import { AppConfig } from '../../util/AppConfig';
import { MyToastyService, HouseService } from '../../services/services';

import { Overlay, overlayConfigFactory } from 'angular2-modal';
import { Modal, BSModalContext } from 'angular2-modal/plugins/bootstrap';
import { SectionHousesSyncErrorComponent, SectionHousesSyncErrorContext } from '../../modals/sectionHousesSyncErrorModal/sectionHousesSyncErrorModal.component';

import 'rxjs/add/operator/toPromise';

import * as _ from 'lodash';
import * as moment from 'moment';

@Component({
    selector: 'startDateSelect',
    templateUrl: ('./startDateSelect.component.html'),
    styleUrls: ['./startDateSelect.component.css'],
    providers: [MyToastyService, HouseService]
})
export class StartDateSelectComponent {
    isReassign: boolean;
    selectedDate: Date;
    sections: any = [];
    loading = true;
    startDate: any = new Date();
    endDate: any = new Date();
    currentPage: number = 1;
    today = new Date();
    AppConfig = AppConfig;
    showScreen = 'assignment';
    oldResident: any = {};
    access = localStorage.getItem('access');

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private houseService: HouseService,
        private vcRef: ViewContainerRef,
        private modal: Modal,
        private toastService: MyToastyService
    ) {
        this.modal.overlay.defaultViewContainer = this.vcRef;

        this.startDate = moment(this.startDate).startOf('month');
        this.endDate = moment(this.endDate).endOf('year');
    }

    ngOnInit() {
        this.isReassign = this.router.url == "/app/restartDateSelect";
        this.getHouses();
        this.today = new Date();
    }

    getHouses() {
        this.sections = JSON.parse(localStorage.getItem('sections'));
        this.loading = false;
    }

    updateHouses(acceptedSections) {
      const newSections = this.sections.reduce((accum, section) => {
        if (acceptedSections.findIndex(s => s.id == section.id) >= 0) {
          section.startDate = this.selectedDate;
        }

        accum.push(section);
        return accum;
      }, []);

      localStorage.setItem('sections', JSON.stringify(newSections));
    }

    asignDate() {
      if (!moment(this.selectedDate).isBetween(this.startDate.toDate(), this.endDate.toDate(), null, '[]')) {
          this.toastService.addToast("La fecha seleccionada no es válida.", this.toastService.toastyType.error);
          return;
      }

      const currentSelectedDate = moment(this.selectedDate).format('YYYY-MM-DD');
      const filteredSections = this.sections.filter(section => _.isEmpty(section.startDate) || (moment(section.startDate).isValid() && moment(section.startDate).format('YYYY-MM-DD') != currentSelectedDate));

      this.saveStartDate(filteredSections)
      .then(response => {
        let responsePromise = null;
        let sdSections = [];

        if (_.has(response, 'webserviceResponse')) {
          responsePromise = this._processResponseWithError(response);
          sdSections = filteredSections.filter(sh => response.webserviceResponse.findIndex(s => s.ViviendaId == sh.idLivingPlace) < 0);
        } else {
          responsePromise = Promise.resolve();
          sdSections = filteredSections;
        }

        return responsePromise
        .then(response => sdSections);

      }).then(acceptedSections => {
        this.updateHouses(acceptedSections);
        this.getHouses();
        if (acceptedSections.length == 0) {
          this.toastService.addToast(message.error, this.toastService.toastyType.error);
        } else {
          this.toastService.addToast(this.selectedDate + " ha sido asignado correctamente.", this.toastService.toastyType.success);
        }
        this.selectedDate = null;
        this.loading = false;
      }).catch(error => {
        switch(error.code) {
          // case ApiErrorCodes.GENERAL_WEB_SERVICE_UNTAGGED_ERROR:
          //   this.toastService.addToast(message.error, this.toastService.toastyType.error);
          //   break;
          case ApiErrorCodes.GENERAL_UNAUTHORIZED_REQUEST:
            this.toastService.addToast(message.error, this.toastService.toastyType.error);
            this.getHouses();
            break;
          case 'CLIENT_START_DATE_NOTHING_TO_UPDATE':
            this.toastService.addToast('No hay viviendas válidas para actualizar.', this.toastService.toastyType.error);
            break;
          default:
            this.toastService.addToast(message.error, this.toastService.toastyType.error);
            this.getHouses();
            break;
        }

        this.loading = false;
      });
    }

    saveStartDate(filteredSections): Promise<any> {
      if (filteredSections.length == 0) {
        return Promise.reject({
          code: 'CLIENT_START_DATE_NOTHING_TO_UPDATE',
          message: 'Error generated by the client...'
        });
      }

      // This object is for reference
      const groupedSections = filteredSections;
      // This obj is gonna be mutated
      let groupedSectionsToProcess = _.cloneDeep(groupedSections);

      return this.houseService.asignDate(groupedSectionsToProcess, this.selectedDate).toPromise();
    }

    private _processResponseWithError(response) {
      if (_.has(response, 'webserviceResponse')) {
        const mappedSections: Array<any> = [];
        _.each(response.webserviceResponse, s => {
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
        });

        // Display modal
        this.modal.open(SectionHousesSyncErrorComponent, overlayConfigFactory({
          sectionHouses: mappedSections
        }, SectionHousesSyncErrorContext))
        .then((dref) => dref.result);

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

    goBack() {
        if (this.isReassign) {
            this.router.navigateByUrl('/app/restartDate');
        } else {
            this.router.navigateByUrl('/app/startDate');
        }
    }

}
