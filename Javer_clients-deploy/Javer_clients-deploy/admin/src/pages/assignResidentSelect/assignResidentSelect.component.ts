import { Component, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import { AppConfig } from '../../util/AppConfig';
import * as _ from 'underscore';
import { Resident, House } from '../../clientsSharedModule/sharedmodule';
import { HouseService, ResidentService, MyToastyService } from '../../services/services';

@Component({
    selector: 'assignResidentSelect',
    templateUrl: ('./assignResidentSelect.component.html'),
    styleUrls: ['./assignResidentSelect.component.css'],
    providers: [ResidentService, HouseService, MyToastyService]
})
export class AssignResidentSelectComponent {
    isReassign: boolean;
    residents: Resident[];
    resident: Resident;
    houses: any;
    loading = true;
    currentPage: number = 1;
    AppConfig = AppConfig;
    showScreen = 'assignment';
    sub: any;
    oldResident: Resident;
    access = localStorage.getItem('access');

    constructor(private route: ActivatedRoute, private router: Router,
        private residentService: ResidentService,
        vcRef: ViewContainerRef, private houseService: HouseService,
        private toastService: MyToastyService) {
    }

    ngOnInit() {
        this.isReassign = this.router.url.includes("/app/reassignResidentSelect");
        this.getHouses();
        this.getResidents();
    }

    getHouses() {
        this.sub = this.route.queryParams.subscribe(params => {
            this.houses = JSON.parse(params['livingPlaceToConfigure']);
        });
        if (this.isReassign) {
            this.oldResident = this.houses[0].sections[0].resident;
        }
    }

    getResidents() {
        this.residentService.getResidents().subscribe(
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

    asingnResident() {
        this.loading = true;
        var x = {
            "houses": this.houses,
            "resident": this.resident
        }
        this.houseService.asignResident(x).subscribe(
            houses => {
                this.houses = houses
                this.houses.forEach(house => {
                    house.resident = this.resident;
                });

                this.toastService.addToast(this.resident.workName + " ha sido asignado correctamente.", this.toastService.toastyType.success);

                this.loading = false;

                if (this.isReassign) {
                    this.oldResident = this.resident;
                }

                this.goBack();
            },
            error => {
                if(error.statusText = 'Method Not Allowed')
                    this.toastService.addToast(error.error, this.toastService.toastyType.error);
                else
                    this.toastService.addToast("No se pudo restablecer la contraseña, inténtelo de nuevo.", this.toastService.toastyType.error)
            }
        );
    }

    goBack() {
        let navigationExtras: NavigationExtras = {
            replaceUrl: true
        };

        if (this.isReassign) {
            this.router.navigateByUrl('/app/reassignResident');
        } else {
            this.router.navigate(['/app/assignResident'], navigationExtras);
        }
    }
    ngOnDestroy() {
        this.sub.unsubscribe();
    }
}
