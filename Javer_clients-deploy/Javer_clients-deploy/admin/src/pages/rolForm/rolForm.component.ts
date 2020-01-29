import { Component, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AppConfig } from '../../util/AppConfig';
import * as _ from 'lodash';
import { ToastOptions, ToastyService } from 'ng2-toasty';
import { RolService, MyToastyService } from '../../services/services';

@Component({
    selector: 'rolForm',
    templateUrl: ('./rolForm.component.html'),
    styleUrls: ['./rolForm.component.css'],
    providers: [RolService]
})
export class RolFormComponent {
    hasRol = false;
    rolId: any;
    rol: any = {};
    categories: any[];
    filter: any = {
        rol: ""
    };
    _originalData: any;
    loading = true;
    AppConfig = AppConfig;
    access = localStorage.getItem('access');
    constructor(private route: ActivatedRoute, private router: Router, private rolService: RolService, vcRef: ViewContainerRef, private toastService: MyToastyService) {
        this.rolId = route.snapshot.params['id'];

    }

    ngOnInit() {
        this.getRol(this.rolId);
        this.getRoles();
    }

    getRol(id) {
        this.rolService.getRol(id).subscribe(
            result => {
                this.loading = false;
                this.rol = result;
            },
            error => {
                if(error.statusText = 'Method Not Allowed')
                    this.toastService.addToast(error.error, this.toastService.toastyType.error);
                else
                this.toastService.addToast("Ha ocurrido un problema al pedir los roles.", this.toastService.toastyType.error)
            }
        );
    }

    getRoles() {
        this.rolService.getRoles().subscribe(
            result => {
                this.categories = result;
            },
            error => {
                if(error.statusText = 'Method Not Allowed')
                    this.toastService.addToast(error.error, this.toastService.toastyType.error);
                else
                this.toastService.addToast("Ha ocurrido un problema al pedir los roles.", this.toastService.toastyType.error)
            }
        );
    }

    saveRol(rol) {
        this.hasRol = false;
        this.hasRolCheck(rol);
        if (rol.id && !this.hasRol) {
            this.rolService.editRol(rol).subscribe(
                result => {
                    this.toastService.addToast("Se ha guardado exitosamente", this.toastService.toastyType.success)
                    this.router.navigateByUrl('/app/rol');
                },
                error => {
                    let errorObj = error.error;
                    if(error.statusText == 'Method Not Allowed') {
                        this.toastService.addToast(error.error, this.toastService.toastyType.error);
                    } else if (_.has(errorObj, 'errors')) {
                        _.each(errorObj.errors, e => {
                            if (e.validatorKey == 'not_unique') {
                                this.toastService.addToast("Ya existe un rol desactivado con este nombre.", this.toastService.toastyType.error)
                            }
                        });
                    } else {
                        this.toastService.addToast("Ha ocurrido un guardar los roles.", this.toastService.toastyType.error)
                    }
                }
            );
        } else if (!this.hasRol) {
            this.rolService.createRol(rol).subscribe(
                result => {
                    this.toastService.addToast("Se ha guardado exitosamente", this.toastService.toastyType.success)
                    this.router.navigateByUrl('/app/rol');
                },
                error => {
                    let errorObj = error.error;
                    if(error.statusText == 'Method Not Allowed') {
                        this.toastService.addToast(error.error, this.toastService.toastyType.error);
                    } else if (_.has(errorObj, 'errors')) {
                        _.each(errorObj.errors, e => {
                            if (e.validatorKey == 'not_unique') {
                                this.toastService.addToast("Ya existe un rol desactivado con este nombre.", this.toastService.toastyType.error)
                            }
                        });
                    } else {
                        this.toastService.addToast("Ha ocurrido un guardar los roles.", this.toastService.toastyType.error)
                    }
                }
            );
        }

    }
    hasRolCheck(rol) {
        for (let i = 0; i < this.categories.length; i++) {
            if (this.categories[i].name == rol.name && this.categories[i].id != rol.id) {
                this.toastService.addToast("Este rol ya existe", this.toastService.toastyType.error)
                this.hasRol = true;
                break;
            }
        }
    }
}
