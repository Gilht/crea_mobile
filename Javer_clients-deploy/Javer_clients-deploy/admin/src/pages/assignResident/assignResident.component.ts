import { Component, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AppConfig } from '../../util/AppConfig';
import * as _ from 'lodash';
import { Resident, House, SharedHouseService, ServiceUtil, message, ApiErrorCodes } from '../../clientsSharedModule/sharedmodule';
import { SubdivisionService, HouseService, ResidentService, MyToastyService } from '../../services/services';

@Component({
    selector: 'assignResident',
    templateUrl: ('./assignResident.component.html'),
    styleUrls: ['./assignResident.component.css'],
    providers: [SubdivisionService, HouseService, SharedHouseService, ResidentService, MyToastyService]
})
export class AssignResidentComponent {
    isSelected: boolean = false;
    isReassign: boolean;
    houses: House[] = [];
    manzanas: any = [];
    conjuntos: any = [];
    frentes: any = [];
    projects: any = [];
    switchPagination: boolean;
    dataToShow: any;
    residents: Resident[] = [];
    access = localStorage.getItem('access');
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

    constructor(
        private route: ActivatedRoute,
        private subdivisionService: SubdivisionService,
        private residentService: ResidentService,
        private sharedhouseService: SharedHouseService,
        private houseService: HouseService,
        private router: Router,
        vcRef: ViewContainerRef,
        private toastService: MyToastyService
    ) {

    }

    ngOnInit() {
        this.isReassign = this.router.url == "/app/reassignResident";
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
        this.filter.frente = "";
        this.sharedhouseService.getFrente(this.filter).subscribe(
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
                    this.toastService.addToast(message.error, this.toastService.toastyType.error)
            }
        );
    }

    getConjunto() {
        this.filter.conjunto = "";
        this.sharedhouseService.getConjunto(this.filter).subscribe(
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
                    this.toastService.addToast(message.error, this.toastService.toastyType.error)
            }
        );
    }

    getManzana() {
        this.filter.manzana = "";
        this.sharedhouseService.getManzana(this.filter).subscribe(
            result => {
                if (result.length == 0) {
                    this.toastService.addToast(message.filter.noBlocks, this.toastService.toastyType.error);
                }
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

    getHouse() {
        this.loading = true;

        if (this.filter.resident && this.isReassign) {
            // Get the houses that exists in the database and have an assigned resident
            this.getResidentHouse();
        } else {
            // Get the houses from the web services as this could not exists in the database
            this.houseService.getHouse(this.filter).subscribe(
                result => {
                    if (result.length == 0) {
                        this.toastService.addToast(message.noRegistry, this.toastService.toastyType.error)
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
                        this.toastService.addToast(message.error, this.toastService.toastyType.error)
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
                if (this.isReassign) {
                    this._originalData = this._originalData.map(x => {
                        x.sections = x.sections.filter(s => s.residentId != null);
                        return x;
                    })
                }
                this.dataToShow = this._originalData;
                this.pageChanged({ page: 1, itemsPerPage: 20 });
                this.filterProjects();
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
        var newProjects = this.dataToShow.filter(x => x.sections.some(x => x.selected));
        if (newProjects.length == 0) {
            this.toastService.addToast("Selecciona los proyectos que desea configurar.", this.toastService.toastyType.error)
            return
        }

        newProjects = newProjects.map(x => {
            x.sections = x.sections.filter(x => x.selected);
            return x;
        });
        if (this.isReassign) {
            let diferentResident = newProjects.some(house => house.sections.some(section => section.residentId != newProjects[0].sections[0].residentId || section.resident == null));
            if (!diferentResident) {
                this.router.navigate(['/app/reassignResidentSelect'], { queryParams: { livingPlaceToConfigure: JSON.stringify(newProjects) } });
            } else {
                this.toastService.addToast("Las viviendas seleccionadas deben tener un residente y tiene que ser el mismo residente.", this.toastService.toastyType.error)
            }
        } else {
            if (newProjects.some(house => house.resident != null)) {
                this.toastService.addToast("Una o más de las viviendas ya tienen un residente asignado.", this.toastService.toastyType.error)
            }
            else {
                this.router.navigate(['/app/assignResidentSelect'], { queryParams: { livingPlaceToConfigure: JSON.stringify(newProjects) } });
            }
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
            this.dataToShow = _.cloneDeep(this._originalData);
            this.dataToShow = this.dataToShow.filter(house => {
                if (this.filter.proyecto && house.idProject != this.filter.proyecto) return false;
                if (this.filter.frente && house.idFront != this.filter.frente) return false;
                if (this.filter.conjunto && house.idCollection != this.filter.conjunto) return false;
                if (this.filter.manzana && house.idBlock != this.filter.manzana) return false;

                if (this.filter.resident) {
                    house.sections = house.sections.filter(section => {
                        // Set client properties
                        section.selected = false;

                        return section.resident && section.resident.login == this.filter.resident.login
                    });

                    if (house.sections.length == 0) {
                        return false;
                    }
                }

                return true;
            });

            this.pageChanged({ page: 1, itemsPerPage: 20 });
            this.switchPagination = !this.switchPagination;

        }
    }

    getResidents() {
        this.residentService.getResidentsDb().subscribe(
            result => {
                if (this.isReassign) {
                    this.residents = result.filter(x => x.ownsHouses);
                    this.orderAscResidents(this.residents);
                }
                else {
                    this.residents = result;
                }
            },
            error => {
                if(error.statusText == 'Method Not Allowed')
                    this.toastService.addToast(error.error, this.toastService.toastyType.error);
                else
                    this.toastService.addToast(message.error, this.toastService.toastyType.error)
            }
        );
    }

    private orderAscResidents(residents) {
        if (residents) {
            return residents.sort((a, b) => {
                let nameA = [a.workName, a.lastName, a.lastNameMother].join(' ').toUpperCase();
                let nameB = [b.workName, b.lastName, b.lastNameMother].join(' ').toUpperCase();

                if (nameA < nameB) return -1;
                if (nameA > nameB) return 1;

                return 0;
            });
        } else {
            return [];
        }
    }

    unassignResident() {
        let selectedSections = _.flatten(this.houses.map(h => h.sections.filter(sh => this.isAssignSectionSelected(sh)).map(sh => sh.id)));
        this.houseService.unassignResident({ sectionIds: selectedSections }).subscribe(
            result => {
                this.getHouse();
            },
            error => {
                let errorResponse = error.error;
                switch(errorResponse.code) {
                    case ApiErrorCodes.GENERAL_UNAUTHORIZED_REQUEST:
                        this.toastService.addToast(message.unauthorizedRequest, this.toastService.toastyType.error);
                        break;
                    case ApiErrorCodes.SECTION_HOUSE_HAS_PROGRESS:
                        this.toastService.addToast('Algunas viviendas seleccionadas cuentan con avance.', this.toastService.toastyType.error);
                        break;
                    default:
                        this.toastService.addToast(message.error, this.toastService.toastyType.error);
                        break;
                }
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

        this.dataToShow.forEach(house => {
            house.sections.forEach(section => {
                if (!this.isReassign && !section.resident) {
                    section.selected = this.isSelected;
                } else if (this.isReassign && section.resident) {
                    section.selected = this.isSelected;
                }
            });
        });

        var nsections = _.flatten(this.dataToShow.map(x => x.sections.filter(section => section.selected))).length;
        if (this.isSelected) {
            this.toastService.addToast("Se han seleccionado " + nsections + " elementos", this.toastService.toastyType.error);
        }
    }

    getListSelected() {
        return this.houses.some(x => x.sections.some(y => y.selected));
    }

    isAssignSectionSelected(sh) {
        return sh.selected && !_.isEmpty(sh.residentId);
    }

    areAssignedSectionsSelected() {
        return this.houses.some(h => h.sections.some(sh => this.isAssignSectionSelected(sh)))
    }

}
