import { Component, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AppConfig } from '../../util/AppConfig';
import * as _ from 'underscore';
import { SharedHouseService } from '../../clientsSharedModule/sharedmodule';
import { MyToastyService, WorkProgramService, SubdivisionService } from '../../services/services';

@Component({
    selector: 'workProgram',
    templateUrl: ('./workProgram.component.html'),
    styleUrls: ['./workProgram.component.css'],
    providers: [WorkProgramService, SubdivisionService, MyToastyService, SharedHouseService]
})
export class WorkProgramComponent {
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
    access = localStorage.getItem('access');
    writeFlag: any;
    deleteFlag: any;
    AppConfig = AppConfig;
    constructor(private route: ActivatedRoute, private router: Router, private sharedHouseService: SharedHouseService, private subdivisionService: SubdivisionService, private workProgramService: WorkProgramService, vcRef: ViewContainerRef, private toastService: MyToastyService) {
    }

    ngOnInit() {
        this.getSubdivisions();
        this.verifyAccess('PROGRAMA_OBRA_WRITE');
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
                this.toastService.addToast("Ha ocurrido un problema al pedir los proyectos.", this.toastService.toastyType.error)
            }
        );
    }

    getFrente() {
        this.sharedHouseService.getFrente(this.filter).subscribe(
            result => {
                if (result.length == 0) {
                    this.toastService.addToast("No se han encontrado registros.", this.toastService.toastyType.error)
                }
                this.frentes = result;
            },
            error => {
                if(error.statusText = 'Method Not Allowed')
                    this.toastService.addToast(error.error, this.toastService.toastyType.error);
                else
                this.toastService.addToast("Ha ocurrido un problema al pedir los proyectos.", this.toastService.toastyType.error)
            }
        );
    }

    getConjunto() {
        this.sharedHouseService.getConjunto(this.filter).subscribe(
            result => {
                if (result.length == 0) {
                    this.toastService.addToast("No se han encontrado registros.", this.toastService.toastyType.error)
                }
                this.conjuntos = result;
            },
            error => {
                if(error.statusText = 'Method Not Allowed')
                    this.toastService.addToast(error.error, this.toastService.toastyType.error);
                else
                this.toastService.addToast("Ha ocurrido un problema al pedir los proyectos.", this.toastService.toastyType.error)
            }
        );
    }

    getWorkPrograms() {
        this.workProgramService.getWorkPrograms(this.filter).subscribe(
            result => {
                if (result.length == 0) {
                    this.toastService.addToast("No se han encontrado registros.", this.toastService.toastyType.error)
                    this._originalData = result;
                } else {
                    this._originalData = [_.max(result, x => x.version)];
                }
                this.dataToShow = this._originalData;
                this.pageChanged({ page: 1, itemsPerPage: 20 });
                this.switchPagination = !this.switchPagination;
            },
            error => {
                if(error.statusText = 'Method Not Allowed')
                    this.toastService.addToast(error.error, this.toastService.toastyType.error);
                else
                this.toastService.addToast("Ha ocurrido un problema al pedir los proyectos.", this.toastService.toastyType.error)
            }
        );
    }
    configureNewWorkProgram() {
        this.router.navigateByUrl('/app/workProgram/create');
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
            this.pageChanged({ page: 1, itemsPerPage: 20 });
            this.switchPagination = !this.switchPagination;
        }

    }

    public pageChanged(evt) {
        let page = evt.page - 1;
        this.workPrograms = this.dataToShow.slice(page * 20, page * 20 + evt.itemsPerPage)
    }

    verifyAccess(permission){
        if(permission.indexOf('WRITE')+1)
        if(this.access.includes(permission)) this.writeFlag = true;

        if(permission.indexOf('DELETE')+1)
        if(this.access.includes(permission)) this.deleteFlag = true;
    }
}
