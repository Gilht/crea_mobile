import { Component, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AppConfig } from '../../util/AppConfig';
import * as _ from 'underscore';
import { ToastOptions, ToastyService } from 'ng2-toasty';
import { ResourcePermissionService, MyToastyService } from '../../services/services';

@Component({
    selector: 'resourcePermissionForm',
    templateUrl: ('./resourcePermissionForm.component.html'),
    styleUrls: ['./resourcePermissionForm.component.css'],
    providers: [ResourcePermissionService]
})
export class ResourcePermissionFormComponent {
    hasResourcePermission = false;
    resourcePermissionId: any;
    resourcePermission: any = {};
    categories: any[];
    filter: any = {
        resourcePermission: ""
    };
    _originalData: any;
    loading = true;
    access = localStorage.getItem('access');
    AppConfig = AppConfig;
    constructor(private route: ActivatedRoute, private router: Router, private resourcePermissionService: ResourcePermissionService, vcRef: ViewContainerRef, private toastService: MyToastyService) {
        this.resourcePermissionId = route.snapshot.params['id'];

    }

    ngOnInit() {
        this.getResourcePermission(this.resourcePermissionId);
        this.getResourcePermissions();
    }

    getResourcePermission(id) {
        this.resourcePermissionService.getResourcePermission(id).subscribe(
            result => {
                this.loading = false;
                this.resourcePermission = result;
            },
            error => {
                if(error.statusText = 'Method Not Allowed')
                    this.toastService.addToast(error.error, this.toastService.toastyType.error);
                else
                    this.toastService.addToast("Ha ocurrido un problema al pedir los recursos.", this.toastService.toastyType.error)
            }
        );
    }

    getResourcePermissions() {
        this.resourcePermissionService.getResourcePermissions().subscribe(
            result => {
                this.categories = result;
            },
            error => {
                if(error.statusText = 'Method Not Allowed')
                    this.toastService.addToast(error.error, this.toastService.toastyType.error);
                else
                    this.toastService.addToast("Ha ocurrido un problema al pedir los recursos.", this.toastService.toastyType.error)
            }
        );
    }

    saveResourcePermission(resourcePermission) {
        this.hasResourcePermission = false;
        this.hasResourcePermissionCheck(resourcePermission);
        if (resourcePermission.id && !this.hasResourcePermission) {
            this.resourcePermissionService.editResourcePermission(resourcePermission).subscribe(
                result => {
                    this.toastService.addToast("Se ha guardado exitosamente", this.toastService.toastyType.success)
                    this.router.navigateByUrl('/app/resourcePermission');
                },
                error => {
                    if(error.statusText = 'Method Not Allowed')
                        this.toastService.addToast(error.error, this.toastService.toastyType.error);
                    else
                        this.toastService.addToast("Ha ocurrido un guardar el recurso.", this.toastService.toastyType.error)
                }
            );
        } else if (!this.hasResourcePermission) {
            this.resourcePermissionService.createResourcePermission(resourcePermission).subscribe(
                result => {
                    this.toastService.addToast("Se ha guardado exitosamente", this.toastService.toastyType.success)
                    this.router.navigateByUrl('/app/resourcePermission');
                },
                error => {
                    if(error.statusText = 'Method Not Allowed')
                        this.toastService.addToast(error.error, this.toastService.toastyType.error);
                    else
                        this.toastService.addToast("Ha ocurrido un guardar el recurso.", this.toastService.toastyType.error)
                }
            );
        }

    }
    hasResourcePermissionCheck(resourcePermission) {
        for (let i = 0; i < this.categories.length; i++) {
            if (this.categories[i].name == resourcePermission.name && this.categories[i].id != resourcePermission.id) {
                this.toastService.addToast("Este recurso ya existe", this.toastService.toastyType.error)
                this.hasResourcePermission = true;
                break;
            }
        }
    }
}
