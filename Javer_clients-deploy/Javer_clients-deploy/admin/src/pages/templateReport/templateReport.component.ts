import { Component, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AppConfig } from '../../util/AppConfig';
import * as _ from 'underscore';
import { Resident, House, SharedHouseService, ServiceUtil } from '../../clientsSharedModule/sharedmodule';
import { SubdivisionService, HouseService, ResidentService, MyToastyService } from '../../services/services';
import { message } from '../../clientsSharedModule/Messages';

@Component({
    selector: 'templateReport',
    templateUrl: ('./templateReport.component.html'),
    styleUrls: ['./templateReport.component.css'],
    providers: [SubdivisionService, HouseService, SharedHouseService, ResidentService, MyToastyService]
})
export class TemplateReportComponent {
    isSelected: boolean = false;
    houses: House[] = [];
    conjuntos: any = [];
    frentes: any = [];
    projects: any = [];
    getListSelected = ServiceUtil.getListSelected;
    switchPagination: boolean;
    dataToShow: any;
    residents: Resident[] = [];
    filter: any = {
        resident: "",
        proyecto: "",
        frente: "",
        conjunto: ""
    };
    _originalData: any = [];
    loading = true;
    currentPage: number = 1;
    access = localStorage.getItem('access');
    AppConfig = AppConfig;
    constructor(private route: ActivatedRoute, private subdivisionService: SubdivisionService, private residentService: ResidentService,
        private sharedhouseService: SharedHouseService, private houseService: HouseService, private router: Router, vcRef: ViewContainerRef, private toastService: MyToastyService) {
    }

    ngOnInit() {
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
        this.sharedhouseService.getFrente(this.filter).subscribe(
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
        this.sharedhouseService.getConjunto(this.filter).subscribe(
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

    getHouse() {
        this.loading = true;
        if (this.filter.resident) {
            this.getResidentHouse();
        } else {
            this.sharedhouseService.getHouseReport(this.filter).subscribe(
                result => {
                    if (result.length == 0) {
                        this.toastService.addToast("No se han encontrado registros.", this.toastService.toastyType.error)
                    }

                    this._originalData = result;
                    this.dataToShow = result;
                    this.pageChanged({ page: 1, itemsPerPage: 20 });
                    this.filterProjects();
                    this.switchPagination = !this.switchPagination;
                    this.loading = false;
                },
                error => {
                    if(error.statusText = 'Method Not Allowed')
                        this.toastService.addToast(error.error, this.toastService.toastyType.error);
                    else
                    this.toastService.addToast("Ha ocurrido un problema al pedir los proyectos.", this.toastService.toastyType.error)
                }
            );
        }

    }

    getResidentHouse() {
        this.houseService.getResidentHouse(this.filter).subscribe(
            result => {
                if (result.length == 0) {
                    this.toastService.addToast(message.noRegistry, this.toastService.toastyType.error)
                }
                this._originalData = result;

                this._originalData = this._originalData.map(x => {
                    x.sections = x.sections.filter(s => s.residentId != null);
                    return x;
                })
                this.dataToShow = this._originalData;
                this.pageChanged({ page: 1, itemsPerPage: 20 });
                this.switchPagination = !this.switchPagination;
                this.loading = false;
            },
            error => {
                if(error.statusText = 'Method Not Allowed')
                    this.toastService.addToast(error.error, this.toastService.toastyType.error);
                else
                this.toastService.addToast(message.error, this.toastService.toastyType.error)
            }
        );
    }

    configureNewProject() {
        var that = this;
        var newProjects = _.flatten(that._originalData.filter(house => house.selected).map(house => house.sections.map(section => ({
            id: section.id,
            commercialName: house.commercialName,
            prototypeName: house.prototypeName,
            collection: house.collection,
            front: house.front,
            lotName: house.lotName,
            blockName: house.blockName,
            interiorNumber: section.interiorNumber,
            idLivingPlace: section.idLivingPlace,
            privativeUnit: house.privativeUnit,
            element: house.element,
            sectionCode: section.sectionCode,
        }))));
        if (newProjects.length == 0) {
            this.toastService.addToast("Selecciona los proyectos que desea configurar.", this.toastService.toastyType.error)
            return
        }
        this.router.navigate(['/app/templateReportSection']);
        localStorage.setItem("sectionsReports", JSON.stringify(newProjects));
    }

    cleanFilters() {
        this.filter = {
            resident: "",
            proyecto: "",
            frente: "",
            conjunto: "",
        };
        this.filterProjects();
    }

    filterProjects() {
        if (this._originalData) {
            this.dataToShow = this._originalData;
            if (this.filter.resident) {
                this.dataToShow = this.dataToShow.map(x => {
                    x.sections = x.sections.filter(section => section.resident && section.resident.login == this.filter.resident.login);
                    return x;
                })
            }

            this.pageChanged({ page: 1, itemsPerPage: 20 });
            this.switchPagination = !this.switchPagination;

        }
    }

    getResidents() {
        this.residentService.getResidentsDb().subscribe(
            result => {
                this.residents = result.filter(x => x.ownsHouses);
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
        this.houses = this.dataToShow.slice(page * 20, page * 20 + evt.itemsPerPage)
    }

    checkAll() {
        let that = this;
        this.isSelected = !this.isSelected;
        _.each(this.dataToShow, function (p) {
            p.selected = that.isSelected;
        })

        if (this.isSelected) {
            this.toastService.addToast("Se han seleccionado " + this.dataToShow.length + " proyectos", this.toastService.toastyType.error);
        }
    }

}
