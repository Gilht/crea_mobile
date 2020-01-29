import { Component, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { EmailValidator } from '@angular/forms';
import { AppConfig } from '../../util/AppConfig';
import * as _ from 'underscore';
import { SharedHouseService, message } from '../../clientsSharedModule/sharedmodule';
import { SubdivisionService, HouseService, ResidentService, MyToastyService, TemplateService } from '../../services/services';

@Component({
    selector: 'assignTemplateSelect',
    templateUrl: ('./assignTemplateSelect.component.html'),
    styleUrls: ['./assignTemplateSelect.component.css'],
    providers: [SubdivisionService, HouseService, TemplateService, MyToastyService, SharedHouseService, ResidentService]
})
export class AssignTemplateSelectComponent {
    isReassign: boolean;
    selectedTemplateAdvance: any = "";
    selectedTemplateDTU: any = "";
    templates: any = [];
    advanceTemplates: any = [];
    dtuTemplates: any = [];
    sections: any;
    sub: any;
    loading = true;
    currentPage: number = 1;
    AppConfig = AppConfig;
    showScreen = 'assignment';
    oldResident: any = {};
    access = localStorage.getItem('access');

    constructor(private route: ActivatedRoute, private router: Router,
        private houseService: HouseService, private templateService: TemplateService,
        vcRef: ViewContainerRef, private toastService: MyToastyService) {
    }

    ngOnInit() {
        this.isReassign = this.router.url == "/app/reassignTemplateSelect";
        this.getHouses();
    }

    getHouses() {
        this.sub = this.route.queryParams.subscribe(params => {
            this.sections = JSON.parse(params['sections']);
            this.getTemplatesByPrototype();
        });
    }

    getTemplatesByPrototype() {
        console.log(this.sections);
        this.templateService.getFullTemplatesByPrototype(this.sections).subscribe(
            result => {
                this.templates = result;
                this.advanceTemplates = this.templates.filter(x => x.type == 2);
                this.dtuTemplates = this.templates.filter(x => x.type == 1);
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

    asignTemplate() {
        if (!(this.selectedTemplateAdvance && this.selectedTemplateDTU)) {
            this.toastService.addToast('Se deben seleccionar ambas plantillas', this.toastService.toastyType.info);
            return;
        }
        this.loading = true;
        var x = {
            "sections": this.sections,
            "templateAdvance": this.selectedTemplateAdvance,
            "templateDTU": this.selectedTemplateDTU
        }
        this.houseService.asignTemplate(x).subscribe(
            prjs => {
                this.toastService.addToast("Las plantillas han sido asignadas correctamente.", this.toastService.toastyType.success);
                this.selectedTemplateAdvance = null;
                this.selectedTemplateDTU = null;
                this.loading = false;
            },
            error => {
                this.loading = false;
                if(error.statusText = 'Method Not Allowed')
                    this.toastService.addToast(error.error, this.toastService.toastyType.error);
                else
                    if (error.status == 406) {
                        this.toastService.addToast("No se pueden modificar las plantillas porque cuentan con avance registrado.", this.toastService.toastyType.error)
                    }
                    else {
                        this.toastService.addToast(message.error, this.toastService.toastyType.error);
                    }
            }
        );
    }

    goBack() {
        if (this.isReassign) {
            this.router.navigateByUrl('/app/reassignTemplate');
        } else {
            this.router.navigateByUrl('/app/assignTemplate');
        }
    }
    ngOnDestroy() {
        this.sub.unsubscribe();
    }
}
