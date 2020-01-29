import { Component, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AppConfig } from '../../util/AppConfig';
import * as _ from 'underscore';
import { ToastOptions, ToastyService } from 'ng2-toasty';
import { ClientPermissionService, MyToastyService } from '../../services/services';

@Component({
    selector: 'clientPermissionForm',
    templateUrl: ('./clientPermissionForm.component.html'),
    styleUrls: ['./clientPermissionForm.component.css'],
    providers: [ClientPermissionService]
})
export class ClientPermissionFormComponent {
    hasClientPermission = false;
    clientPermissionId: any;
    clientPermission: any = {};
    categories: any[];
    filter: any = {
        clientPermission: ""
    };
    _originalData: any;
    loading = true;
    access = localStorage.getItem('access');
    AppConfig = AppConfig;
    constructor(private route: ActivatedRoute, private router: Router, private clientPermissionService: ClientPermissionService, vcRef: ViewContainerRef, private toastService: MyToastyService) {
        this.clientPermissionId = route.snapshot.params['id'];

    }

    ngOnInit() {
        this.getClientPermission(this.clientPermissionId);
        this.getClientPermissions();
    }

    getClientPermission(id) {
        this.clientPermissionService.getClientPermission(id).subscribe(
            result => {
                this.loading = false;
                this.clientPermission = result;
            },
            error => {
                if(error.statusText = 'Method Not Allowed')
                    this.toastService.addToast(error.error, this.toastService.toastyType.error);
                else
                    this.toastService.addToast("Ha ocurrido un problema al pedir los permisos.", this.toastService.toastyType.error)
            }
        );
    }

    getClientPermissions() {
        this.clientPermissionService.getClientPermissions().subscribe(
            result => {
                this.categories = result;
            },
            error => {
                if(error.statusText = 'Method Not Allowed')
                    this.toastService.addToast(error.error, this.toastService.toastyType.error);
                else
                    this.toastService.addToast("Ha ocurrido un problema al pedir los permisos.", this.toastService.toastyType.error)
            }
        );
    }

    saveClientPermission(clientPermission) {
        this.hasClientPermission = false;
        this.hasClientPermissionCheck(clientPermission);
        if (clientPermission.id && !this.hasClientPermission) {
            this.clientPermissionService.editClientPermission(clientPermission).subscribe(
                result => {
                    this.toastService.addToast("Se ha guardado exitosamente", this.toastService.toastyType.success)
                    this.router.navigateByUrl('/app/clientPermission');
                },
                error => {
                    if(error.statusText = 'Method Not Allowed')
                        this.toastService.addToast(error.error, this.toastService.toastyType.error);
                    else
                        this.toastService.addToast("Ha ocurrido un guardar el permiso.", this.toastService.toastyType.error)
                }
            );
        } else if (!this.hasClientPermission) {
            this.clientPermissionService.createClientPermission(clientPermission).subscribe(
                result => {
                    this.toastService.addToast("Se ha guardado exitosamente", this.toastService.toastyType.success)
                    this.router.navigateByUrl('/app/clientPermission');
                },
                error => {
                    if(error.statusText = 'Method Not Allowed')
                        this.toastService.addToast(error.error, this.toastService.toastyType.error);
                    else
                        this.toastService.addToast("Ha ocurrido un guardar el permiso.", this.toastService.toastyType.error)
                }
            );
        }

    }
    hasClientPermissionCheck(clientPermission) {
        for (let i = 0; i < this.categories.length; i++) {
            if (this.categories[i].name == clientPermission.name && this.categories[i].id != clientPermission.id) {
                this.toastService.addToast("Este permiso ya existe", this.toastService.toastyType.error)
                this.hasClientPermission = true;
                break;
            }
        }
    }
}
