import { Component, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AppConfig } from '../../util/AppConfig';
import * as _ from 'lodash';
import { ServiceUtil, SharedHouseService } from '../../clientsSharedModule/sharedmodule';
import { SubdivisionService, ResidentService, MyToastyService, HouseService } from '../../services/services';

@Component({
    selector: 'startDate',
    templateUrl: ('./startDate.component.html'),
    styleUrls: ['./startDate.component.css'],
    providers: [HouseService, SubdivisionService, ResidentService, MyToastyService, SharedHouseService]
})
export class StartDateComponent {
    isSelected: boolean = false;
    isReassign: boolean;
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
    constructor(private route: ActivatedRoute, private router: Router, private residentService: ResidentService, private subdivisionService: SubdivisionService, private sharedHouseService: SharedHouseService, private houseService: HouseService, vcRef: ViewContainerRef, private toastService: MyToastyService) { }

    ngOnInit() {
        this.isReassign = this.router.url == "/app/restartDate";
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
                this.toastService.addToast("Ha ocurrido un problema al pedir los frentes.", this.toastService.toastyType.error)
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
                this.toastService.addToast("Ha ocurrido un problema al pedir los conjuntos", this.toastService.toastyType.error)
            }
        );
    }

    getManzana() {
        this.sharedHouseService.getManzana(this.filter).subscribe(
            result => {
                if (result.length == 0) {
                    this.toastService.addToast("No se han encontrado registros.", this.toastService.toastyType.error)
                }
                this.manzanas = result;
            },
            error => {
                if(error.statusText = 'Method Not Allowed')
                    this.toastService.addToast(error.error, this.toastService.toastyType.error);
                else
                this.toastService.addToast("Ha ocurrido un problema al pedir las manzanas.", this.toastService.toastyType.error)
            }
        );
    }

    getSections() {
        this.houseService.getSections(this.filter).subscribe(
            result => {
                if (result.length == 0) {
                    this.toastService.addToast("No se han encontrado registros.", this.toastService.toastyType.error)
                }
                this._originalData = result;
                this._originalData = this._originalData.filter(x => x.residentId != null || x.residentId != "");
                this.dataToShow = this._originalData;

                this.pageChanged({ page: 1, itemsPerPage: 20 });
                this.filterProjects();
                this.switchPagination = !this.switchPagination;
            },
            error => {
                if(error.statusText = 'Method Not Allowed')
                    this.toastService.addToast(error.error, this.toastService.toastyType.error);
                else
                this.toastService.addToast("Ha ocurrido un problema al pedir las secciones.", this.toastService.toastyType.error)
            }
        );

    }

    configureNewDate() {
        let newProjects = this._originalData.filter(x => x.selected);
        let countNoTemplates = _.reduce(newProjects, (count, x) => (x.hasOwnProperty('templateAdvance') && x.hasOwnProperty('templateDTU') ? count : count += 1), 0);

        if (newProjects.length == 0) {
            this.toastService.addToast("Selecciona los Secciones/Viviendas que desea configurar.", this.toastService.toastyType.error);
            return;
        } else if (newProjects.length > 0 && countNoTemplates > 0) {
            this.toastService.addToast("Una o más Secciones/Viviendas no tienen plantillas asignadas.", this.toastService.toastyType.error);
            return;
        }

        localStorage.setItem('sections', JSON.stringify(newProjects));
        if (this.isReassign) {
            var diferentResident = _.some(newProjects, function (np) { return np.residentId != newProjects[0].residentId });
            if (!diferentResident) {
                this.router.navigateByUrl('/app/restartDateSelect');
            } else {
                this.toastService.addToast("Las Secciones/Viviendas seleccionados deben tener un mismo residente.", this.toastService.toastyType.error)
            }
        } else {
            this.router.navigateByUrl('/app/startDateSelect');
        }
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

    getResidents() {
        this.residentService.getResidents().subscribe(
            result => {
                this.residents = result;
            },
            error => {
                if(error.statusText = 'Method Not Allowed')
                    this.toastService.addToast(error.error, this.toastService.toastyType.error);
                else
                this.toastService.addToast("Ha ocurrido un error al solicitar los residentes.", this.toastService.toastyType.error)
            }
        );
    }

    public pageChanged(evt) {
        let page = evt.page - 1;
        this.sections = this.dataToShow.slice(page * 20, page * 20 + evt.itemsPerPage)
    }

    checkAll() {
        let that = this;
        this.isSelected = !this.isSelected;
        _.each(this.dataToShow, function (p) {
            p.selected = that.isSelected;
        })

        if (this.isSelected) {
            this.toastService.addToast("Se han seleccionado " + this.dataToShow.length + " Secciones/Viviendas", this.toastService.toastyType.error);
        }
    }

}
