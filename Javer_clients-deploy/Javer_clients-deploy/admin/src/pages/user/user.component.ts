import { Component, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AppConfig } from '../../util/AppConfig';
import * as _ from 'underscore';
import { MyToastyService, UserService, ResidentService } from '../../services/services';
import { Modal, BSModalContext } from 'angular2-modal/plugins/bootstrap';
import { DeleteComponentContext, DeleteComponent } from '../../modals/deletemodal/deletemodal.component';
import { overlayConfigFactory } from 'angular2-modal';

@Component({
    selector: 'user',
    templateUrl: ('./user.component.html'),
    styleUrls: ['./user.component.css'],
    providers: [MyToastyService, UserService, ResidentService]
})
export class UserComponent {
    residents: any;
    switchPagination: boolean;
    dataToShow: any;
    filter: any = {
        user: "",
        resident: "",
    };
    _originalData: any;
    categories: any;
    loading = true;
    canAddRoles: boolean = false;
    currentPage: number = 1;
    access = localStorage.getItem('access');
    AppConfig = AppConfig;
    constructor(private route: ActivatedRoute, private router: Router, private userService: UserService,
        public vcRef: ViewContainerRef, private toastService: MyToastyService, public modal: Modal, private residentService: ResidentService) {
    }

    ngOnInit() {
        this.getCategories();
        this.getResidents();
    }

    getCategories() {
        this.userService.getUsers().subscribe(
            result => {
                this._originalData = result;
                this.dataToShow = result;
                this.pageChanged({ page: 1, itemsPerPage: 20 });
            },
            error => {
                if(error.statusText = 'Method Not Allowed')
                    this.toastService.addToast(error.error, this.toastService.toastyType.error);
                else
                    this.toastService.addToast("Ha ocurrido un problema al pedir los proyectos.", this.toastService.toastyType.error)
            }
        );
    }

    getResidents() {
        this.residentService.getResidentUsers().subscribe(
            result => {
                this.residents = result;
                this.loading = false;
            },
            error => {
                if(error.statusText = 'Method Not Allowed')
                    this.toastService.addToast(error.error, this.toastService.toastyType.error);
                else
                    this.toastService.addToast("Error al pedir los residentes.", this.toastService.toastyType.error)
            }
        );
    }

    deleteUser(user) {
        var username = user.workName + " " + user.lastName + " " + user.lastNameMother;
        this.userService.deleteUser(user.id).subscribe(
            result => {
                this.toastService.addToast("Los permisos del usuario " + username + " han sido borrados correctamente.", this.toastService.toastyType.success)
                this.getCategories();
            },
            error => {
                if(error.statusText = 'Method Not Allowed')
                    this.toastService.addToast(error.error, this.toastService.toastyType.error);
                else
                    this.toastService.addToast("Ha ocurrido un problema al pedir los proyectos.", this.toastService.toastyType.error)
            }
        );
    }

    configureNewUser() {
        localStorage.setItem('newUser', JSON.stringify(this.filter.resident));
        this.router.navigateByUrl('/app/user/create');
    }

    checkResidentRoles() {
        if (this.filter.resident == '') {
            this.canAddRoles = false;
            return;
        }

        const listUser = this._originalData.find(u => u.login.toLowerCase() == this.filter.resident.login.toLowerCase());

        if (listUser) {
            this.canAddRoles = (listUser.UserId_Rol.length == 0);
        } else {
            this.canAddRoles = true;
        }
    }


    cleanFilters() {
        this.filter = {
            user: "",
            resident: "",
        };
        this.filterCategories();
    }

    filterCategories() {
        this.dataToShow = this._originalData;
        if (this.filter.user && this.filter.user.length) {
            this.dataToShow = this.dataToShow
                .filter(x => x.name.toLowerCase().indexOf(this.filter.user.toLowerCase()) > -1);
        }
        this.pageChanged({ page: 1, itemsPerPage: 20 });
        this.switchPagination = !this.switchPagination;
    }

    disableAddButton() {
        return  (this.filter.resident == '');
    }

    public pageChanged(evt) {
        let page = evt.page - 1;
        this.categories = this.dataToShow.slice(page * 20, page * 20 + evt.itemsPerPage)
    }

    deleteUserModal(user) {
        let context = new DeleteComponentContext();
        this.modal.overlay.defaultViewContainer = this.vcRef;
        var that = this;
        this.modal.open(DeleteComponent, overlayConfigFactory({ msj: 'Seguro que deseas eliminar el usuario ' + '"' + user.workName + " " + user.lastName + " " + user.lastNameMother + '"' + '?' }, BSModalContext))
            .then(function (x) {
                var those = that;
                x.result
                    .then(function (result) {
                        if (result) {
                            that.deleteUser(user);
                        }
                    });
            });

    }
}
