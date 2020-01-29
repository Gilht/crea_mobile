import { Component, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { ServiceUtil, SharedHouseService, message } from '../../clientsSharedModule/sharedmodule';
import { Router, ActivatedRoute } from '@angular/router';
import { AppConfig } from '../../util/AppConfig';
import * as _ from 'underscore';
import { HouseService, MyToastyService, SubdivisionService, ResidentService } from '../../services/services';

@Component({
    selector: 'dtuAndAdvanceReport',
    templateUrl: ('./dtuAndAdvanceReport.component.html'),
    styleUrls: ['./dtuAndAdvanceReport.component.css'],
    providers: [SubdivisionService, HouseService, MyToastyService, SharedHouseService, ResidentService]
})
export class DtuAndAdvanceReportComponent {
    isSelected: boolean = false;
    sections: any = [];
    manzanas: any = [];
    conjuntos: any = [];
    frentes: any = [];
    projects: any = [];
    getListSelected = ServiceUtil.getListSelected;
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
    access = localStorage.getItem('access');
    AppConfig = AppConfig;
    constructor(private route: ActivatedRoute,
        private router: Router,
        private sharedHouseService: SharedHouseService,
        private subdivisionService: SubdivisionService,
        private houseService: HouseService,
        private toastService: MyToastyService) {
    }

    ngOnInit() {
        this.getSubdivisions();
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
                this.toastService.addToast(message.projects, this.toastService.toastyType.error)
            }
        );
    }
    getFrente() {
        this.sharedHouseService.getFrente(this.filter).subscribe(
            result => {
                if (result.length == 0) {
                    this.toastService.addToast(message.noRegistry, this.toastService.toastyType.error)
                }
                this.frentes = result;
            },
            error => {
                if(error.statusText = 'Method Not Allowed')
                    this.toastService.addToast(error.error, this.toastService.toastyType.error);
                else
                    this.toastService.addToast(message.fronts, this.toastService.toastyType.error)
            }
        );
    }
    getConjunto() {
        this.sharedHouseService.getConjunto(this.filter).subscribe(
            result => {
                if (result.length == 0) {
                    this.toastService.addToast(message.noRegistry, this.toastService.toastyType.error)
                }
                this.conjuntos = result;
            },
            error => {
                if(error.statusText = 'Method Not Allowed')
                    this.toastService.addToast(error.error, this.toastService.toastyType.error);
                else
                    this.toastService.addToast(message.collections, this.toastService.toastyType.error)
            }
        );
    }
    getAdvanceExcel() {
        this.loading = true;
        this.houseService.exportAdvanceExcel(this.filter).subscribe(
            result => {
                this.loading = false;
                let filename = "Reporte de Avance-" + this.projects.find(p => p.externalId == this.filter.proyecto).name
                    + (this.filter.frente ? "-" + this.frentes.find(f => f.id == this.filter.frente).value : "")
                    + (this.filter.conjunto ? "-" + this.conjuntos.find(c => c.id == this.filter.conjunto).value : "");
                ServiceUtil.downloadBufferToExcel(result.data, filename, ServiceUtil.mimeTypes.excel);
            },
            error => {
                this.loading = false;
                if(error.statusText = 'Method Not Allowed')
                    this.toastService.addToast(error.error, this.toastService.toastyType.error);
                else
                    if (error.status == 406) {
                        this.toastService.addToast(error.error, this.toastService.toastyType.error);
                    } else {
                        this.toastService.addToast(message.exportExcel, this.toastService.toastyType.error);
                    }
            }
        );
    }
    getDTUExcel() {
        this.loading = true;
        this.houseService.exportDTUExcel(this.filter).subscribe(
            result => {
                this.loading = false;
                let filename = "Reporte de DTU-" + this.projects.find(p => p.externalId == this.filter.proyecto).name
                    + (this.filter.frente ? "-" + this.frentes.find(f => f.id == this.filter.frente).value : "")
                    + (this.filter.conjunto ? "-" + this.conjuntos.find(c => c.id == this.filter.conjunto).value : "");
                ServiceUtil.downloadBufferToExcel(result.data, filename, ServiceUtil.mimeTypes.excel);
            },
            error => {
                this.loading = false;
                if(error.statusText = 'Method Not Allowed')
                    this.toastService.addToast(error.error, this.toastService.toastyType.error);
                else
                    if (error.status == 406) {
                        this.toastService.addToast(error.error, this.toastService.toastyType.error);
                    } else {
                        this.toastService.addToast(message.exportExcel, this.toastService.toastyType.error);
                    }
            }
        );
    }
    cleanFilters() {
        this.filter = {
            proyecto: "",
            frente: "",
            conjunto: "",
        };
    }
}
