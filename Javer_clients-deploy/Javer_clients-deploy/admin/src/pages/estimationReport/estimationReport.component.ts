import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AppConfig } from '../../util/AppConfig';
import * as download from 'downloadjs';
import * as _ from 'lodash';
import { SharedEstimateService, SharedHouseService, ServiceUtil, EstimateStatus, message, ApiErrorCodes } from '../../clientsSharedModule/sharedmodule';
import { SubdivisionService, MyToastyService, EstimateService } from '../../services/services';

@Component({
    selector: 'estimateReport',
    templateUrl: ('./estimationReport.component.html'),
    styleUrls: ['./estimationReport.component.css'],
    providers: [SharedEstimateService, SubdivisionService, SharedHouseService, MyToastyService, EstimateService]
})
export class EstimationReportComponent {
    breadcrum: string = 'REPORTES > Reporte de estimación';
    estimates: any = [];
    fronts: any = [];
    collections: any = [];
    contracts: any = [];
    providers: any = [];
    projects: any = [];
    selectA: boolean = false;
    pdfExtraOptions: any = {};
    fixedStatuses: any = [1, 2, 3];
    statuses: any = [];
    loading = false;
    translatedStatuses: any = {};
    access = localStorage.getItem('access');

    allowedSubdivisions: Array<string> = [];
    requiredFilters: any = {
      project: true,
      provider: true
    };
    filters: any = {
        project: [],
        provider: "",
        status: "",
        front: "",
        collection: "",
        contract: "",
        startDate: "",
        endDate: ""
    };
    translatedFilters: any = {
      project: 'Proyecto',
      provider: 'Proveedor'
    };

    pag: any = {
      total: 0,
      currentPage: 1,
      itemsPerPage: 20
    };


    constructor(
      public estimateService: EstimateService,
      public toastService: MyToastyService,
      private subdivisionService: SubdivisionService,
      private sharedHouseService: SharedHouseService,
      private router: Router,
      private sharedEstimateService: SharedEstimateService
    ) {

    }

    ngOnInit() {
        this.loading = true;
        this.setTranslatedStatuses();
        this.getAllowedSubdivisions()
        .then(() => {
          this.populateProjectsFilter();
        });
    }

    private setTranslatedStatuses() {
      this.translatedStatuses[`${EstimateStatus.SendToBoss}`] = 'Enviado a Jefe';
      this.translatedStatuses[`${EstimateStatus.SendToWorkControl}`] = 'Enviado a CO';
      this.translatedStatuses[`${EstimateStatus.ValidatedByWorkControl}`] = 'Validado por CO';
    }

    searchEstimates() {
      if(this.canSearch()) {
        this.pag.currentPage = 1;
        this.getEstimates(1);
      } else {
        this.toastService.addToast(this.generateRequiredFiltersMessage(), this.toastService.toastyType.error);
      }
    }

    private canSearch() {
      for(let filter in this.requiredFilters) {
        if(_.isEmpty(this.filters[filter])) return false;
      }

      return true;
    }

    private generateRequiredFiltersMessage() {
      let req = [];
      for(let filter in this.requiredFilters) {
        if(_.has(this.requiredFilters, filter)) req.push(this.translatedFilters[filter]);
      }

      return (req.length ? `Seleccione al menos un ${req.map(f => f.toLowerCase()).join(', ')}` : `Ocurrió un error.`);
    }

    private getAllowedSubdivisions() {
      return this.subdivisionService.getSubdivisionsDbTP()
      .then(subdivisions => subdivisions.map(s => s.id))
      .then(subdivisionIds => {
        this.allowedSubdivisions = subdivisionIds;
      }).catch(error => {
          if(error.statusText == 'Method Not Allowed')
              this.toastService.addToast(error.error, this.toastService.toastyType.error);
          else
            this.toastService.addToast("Ha ocurrido un problema al recuperar los fraccionamientos.", this.toastService.toastyType.error);
      });
    }

    getEstimatesFilters(filtersToPopulate) {
      let validFiltersToPopulate = {
        projects: true,
        providers: true,
        fronts: true,
        collections: true,
        contracts: true
      };
      let f = this.genApiFilters();
      this.estimateService.getValidateEstimatesFilters(f, this.allowedSubdivisions)
      .subscribe(
        result => {
          // if (filtersToPopulate.projects) this.projects = result.projects;
          // if (filtersToPopulate.providers) this.providers = result.providers;
          // HTML Select statuses
          this.statuses = result.statuses.map(es => ({
            label: this.translatedStatuses[es],
            value: es
          }));
          // if (filtersToPopulate.fronts) this.fronts = result.fronts;
          // if (filtersToPopulate.collections) this.collections = result.collections;
          // if (filtersToPopulate.contracts) this.contracts = result.contracts;

          for (let key in filtersToPopulate) {
            if (validFiltersToPopulate[key]) this[key] = result[key]
          }
          this.loading = false;
        },
        error => {
            if(error.statusText == 'Method Not Allowed')
                this.toastService.addToast(error.error, this.toastService.toastyType.error);
            else
                this.toastService.addToast("Ha ocurrido un problema al pedir las estimaciones.", this.toastService.toastyType.error);
          this.loading = false;
        }
      );
    }

    populateProjectsFilter() {
      this.providers = [];
      this.filters.provider = "";
      this.fronts = [];
      this.filters.front = "";
      this.collections = [];
      this.filters.collection = "";
      this.contracts = [];
      this.filters.contract = "";
      this.getEstimatesFilters({projects: true});
    }

    populateProvidersFilter() {
      this.providers = [];
      this.filters.provider = "";
      this.fronts = [];
      this.filters.front = "";
      this.collections = [];
      this.filters.collection = "";
      this.contracts = [];
      this.filters.contract = "";
      this.getEstimatesFilters({providers: true});
    }

    populateFrontsFilter() {
      this.filters.front = "";
      this.collections = [];
      this.filters.collection = "";
      this.contracts = [];
      this.filters.contract = "";
      this.getEstimatesFilters({fronts: true});
    }

    populateCollectionsFilter() {
      this.filters.collection = "";
      this.contracts = [];
      this.filters.contract = "";
      this.getEstimatesFilters({collections: true});
    }

    populateContractsFilter() {
      this.filters.contract = ""
      this.getEstimatesFilters({contracts: true});
    }

    getEstimates(page) {
      let f = this.genApiFilters();
      this.estimateService.getValidateEstimatesSearch(f, this.allowedSubdivisions, page, this.pag.itemsPerPage)
      .subscribe(
        result => {
          this.loading = false;
          this.pag.total = result.total;
          this.estimates = result.estimates;
        },
        error => {
          this.loading = false;
          if(error.statusText == 'Method Not Allowed')
              this.toastService.addToast(error.error, this.toastService.toastyType.error);
          else
            this.toastService.addToast("Ha ocurrido un problema al pedir las estimaciones.", this.toastService.toastyType.error)
        }
      );
    }

    private genApiFilters() {
      let f = _.clone(this.filters);
      if(!_.isNumber(f.status)) {
        f.statuses = this.fixedStatuses;
      } else {
        f.statuses = [this.filters.status];
      }

      delete f.status; // As the api field is statuses
      return f;
    }

    pageChanged(event) {
      this.getEstimates(event.page);
    }

    downloadPDF(estimateId: string) {
      this.estimateService.getEstimateReportPDF(estimateId)
      .subscribe(
        pdfUrlString => {
          let e = this.estimates.find(x => x.id == estimateId);
          download(pdfUrlString,  `${e.projectCode}-${e.project}-${e.frontName}-${e.collectionName}-${e.providerName}-${e.contract}.pdf`);
        },
        error => {
            if(error.statusText == 'Method Not Allowed')
                this.toastService.addToast(error.error, this.toastService.toastyType.error);
            else
                this.toastService.addToast(message.pdf.download.error, this.toastService.toastyType.error)
          console.info(error);
        }
      );
    }

    downloadExcel(estimateId: string, isFinal: number = 0) {
      this.loading = true;
      this.estimateService.getEstimateXLSX(estimateId).subscribe(
        result => {
          this.loading = false;
          ServiceUtil.downloadBufferToExcel(result.data, 'Estimacion' + (isFinal ? ' de cierre de contrato' : ''), ServiceUtil.mimeTypes.excel);
        },
        error => {
          this.loading = false;
          if (error.statusText == 'Method Not Allowed') {
            this.toastService.addToast(error.error, this.toastService.toastyType.error);
          } else {
            switch(error.error.code) {
              case ApiErrorCodes.ESTIMATE_NOT_REQUIRED_STATUS:
                this.toastService.addToast('El estatus de estimación no es válido.', this.toastService.toastyType.error);
                break;
              default:
                this.toastService.addToast(message.exportExcel, this.toastService.toastyType.error);
                break;
            }
          }
        }
      );
    }

    selectAll() {
      _.each(this.estimates, (e, index, arr) => {
        if (this.selectA) {
          e.selected = true;
        } else {
          e.selected = false;
        }
      });
    }

    cleanFilters() {
      this.estimates = [];
      this.filters = {
          project: [],
          provider: "",
          status: "",
          front: "",
          collection: "",
          contract: "",
          startDate: "",
          endDate: ""
      };
      this.pag = {
        total: 0,
        currentPage: 1,
        itemsPerPage: this.pag.itemsPerPage
      };
    }
}
