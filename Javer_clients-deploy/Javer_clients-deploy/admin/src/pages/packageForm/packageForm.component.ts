import { Component, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AppConfig } from '../../util/AppConfig';
import * as _ from 'underscore';
import { PackageService, MyToastyService } from '../../services/services'

@Component({
    selector: 'packageForm',
    templateUrl: ('./packageForm.component.html'),
    styleUrls: ['./packageForm.component.css'],
    providers: [PackageService, MyToastyService]
})
export class PackageFormComponent {
    hasPackage = false;
    packageId: any;
    package: any = {};
    packages: any[];
    filter: any = {
        package: ""
    };
    _originalData: any;
    loading = true;
    access = localStorage.getItem('access');
    AppConfig = AppConfig;
    constructor(private packageService: PackageService, private route: ActivatedRoute, private router: Router, vcRef: ViewContainerRef, private toastService: MyToastyService) {
        this.packageId = route.snapshot.params['id'];

    }

    ngOnInit() {
        this.getPackage(this.packageId);
        this.getPackages();
    }

    getPackage(id) {
        this.packageService.getPackage(id).subscribe(
            result => {
                this.loading = false;
                this.package = result;
            },
            error => {
                if(error.statusText = 'Method Not Allowed')
                    this.toastService.addToast(error.error, this.toastService.toastyType.error);
                else
                    this.toastService.addToast("Ha ocurrido un problema al pedir los paquetes.", this.toastService.toastyType.error)
            }
        );
    }

    getPackages() {
        this.packageService.getPackages().subscribe(
            result => {
                this.packages = result;
            },
            error => {
                if(error.statusText = 'Method Not Allowed')
                    this.toastService.addToast(error.error, this.toastService.toastyType.error);
                else
                    this.toastService.addToast("Ha ocurrido un problema al pedir los proyectos.", this.toastService.toastyType.error)
            }
        );
    }

    savePackage(pack) {
        this.hasPackage = false;
        this.hasPackageCheck(pack);
        if (pack.id && !this.hasPackage) {
            this.packageService.editPackage(pack).subscribe(
                result => {
                    this.toastService.addToast("Se ha guardado exitosamente.", this.toastService.toastyType.success)
                    this.router.navigateByUrl('/app/package');
                },
                error => {
                    if(error.statusText = 'Method Not Allowed')
                        this.toastService.addToast(error.error, this.toastService.toastyType.error);
                    else
                        this.toastService.addToast("Ha ocurrido un error al guardar el paquete.", this.toastService.toastyType.error)
                }
            );
        } else if (!this.hasPackage) {
            this.packageService.createPackage(pack).subscribe(
                result => {
                    this.toastService.addToast("Se ha guardado exitosamente.", this.toastService.toastyType.success)
                    this.router.navigateByUrl('/app/package');
                },
                error => {
                    if(error.statusText = 'Method Not Allowed')
                        this.toastService.addToast(error.error, this.toastService.toastyType.error);
                    else
                        this.toastService.addToast("Ha ocurrido un error al guardar el paquete.", this.toastService.toastyType.error)
                }
            );
        }

    }

    hasPackageCheck(pack) {
        for (let i = 0; i < this.packages.length; i++) {
            if (this.packages[i].name == pack.name && this.packages[i].id != pack.id) {
                this.toastService.addToast("Este nombre ya esta asignado en otro paquete, por favor elija otro.", this.toastService.toastyType.error)
                this.hasPackage = true;
                break;
            }
        }
    }
}
