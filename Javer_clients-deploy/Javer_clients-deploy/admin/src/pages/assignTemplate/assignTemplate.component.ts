import { Component, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AppConfig } from '../../util/AppConfig';
import * as _ from 'underscore';
import { SharedHouseService, ServiceUtil, message } from '../../clientsSharedModule/sharedmodule';
import { SubdivisionService, HouseService, ResidentService, MyToastyService } from '../../services/services';

@Component({
    selector: 'assignTemplate',
    templateUrl: ('./assignTemplate.component.html'),
    styleUrls: ['./assignTemplate.component.css'],
    providers: [SubdivisionService, HouseService, MyToastyService, SharedHouseService, ResidentService]
})
export class AssignTemplateComponent {
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
    AppConfig = AppConfig;
    access = localStorage.getItem('access');
    constructor(private route: ActivatedRoute,
        private router: Router,
        private residentService: ResidentService,
        private sharedHouseService: SharedHouseService,
        private subdivisionService: SubdivisionService,
        private houseService: HouseService,
        private toastService: MyToastyService) {
    }

    ngOnInit() {
        this.isReassign = this.router.url == "/app/reassignTemplate";
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
                    this.toastService.addToast("Ha ocurrido un problema al pedir los proyectos.", this.toastService.toastyType.error)
            }
        );
    }

    getSections() {
        this.loading = true;
        this.houseService.getSections(this.filter).subscribe(
            result => {
                this.loading = false;
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
                    this.toastService.addToast("Ha ocurrido un problema al pedir los proyectos.", this.toastService.toastyType.error)
            }
        );

    }

    getResidentHouse() {
        this.houseService.getResidentHouse(this.filter).subscribe(
            result => {
                if (result.length == 0) {
                    this.toastService.addToast("No se han encontrado registros.", this.toastService.toastyType.error)
                }
                this._originalData = result;
                this.dataToShow = result;
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
    configureNewTemplate() {
        this.loading = true;
        var newProjects = this._originalData.filter(x => x.selected);
        if (newProjects.length == 0) {
            this.toastService.addToast("Selecciona los proyectos que desea configurar.", this.toastService.toastyType.error)
            return
        }

        if (this.isReassign) {
            var diferentResident = _.any(newProjects, function (np) { return np.residentId != newProjects[0].residentId });
            if (!diferentResident) {
                this.router.navigate(['/app/reassignTemplateSelect'], { queryParams: { sections: JSON.stringify(newProjects) } });
            } else {
                this.toastService.addToast("Los proyectos seleccionados deben tener un mismo residente.", this.toastService.toastyType.error)
            }
        } else {
            this.router.navigate(['/app/assignTemplateSelect'], { queryParams: { sections: JSON.stringify(newProjects) } });
        }
        this.loading = false;
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
        this.residentService.getResidentsDb().subscribe(
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
            this.toastService.addToast("Se han seleccionado " + this.dataToShow.length + " Secciones/Viviendas.", this.toastService.toastyType.error);
        }
    }

}
