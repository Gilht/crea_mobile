import { Component, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AppConfig } from '../../util/AppConfig';
import * as _ from 'underscore';
import { Overlay, overlayConfigFactory } from 'angular2-modal';
import { BSModalContext, Modal } from 'angular2-modal/plugins/bootstrap';
import { DeleteComponentContext, DeleteComponent } from '../../modals/deletemodal/deletemodal.component';
import { TemplateService, MyToastyService } from '../../services/services';
@Component({
    selector: 'templates',
    templateUrl: ('./template.component.html'),
    styleUrls: ['./template.component.css'],
    providers: [TemplateService, MyToastyService]
})
export class TemplateComponent {
    switchPagination: boolean;
    dataToShow: any = [];
    filter: any = {
        template: ""
    };
    _originalData: any = [];
    templates: any = [];
    loading = true;
    currentPage: number = 1;
    access = localStorage.getItem('access');
    writeFlag: any;
    createFlag: any;
    deleteFlag: any;
    AppConfig = AppConfig;
    constructor(private route: ActivatedRoute, private router: Router, public modal: Modal, private templateService: TemplateService, public vcRef: ViewContainerRef, private toastService: MyToastyService) {
        modal.overlay.defaultViewContainer = vcRef;
    }

    ngOnInit() {
        this.getTemplates();
        this.verifyAccess('PLANTILLAS_WRITE');
        this.verifyAccess('PLANTILLAS_DELETE');
        this.verifyAccess('PLANTILLAS_CREATE');
    }

    getTemplates() {
        this.templateService.getTemplates().subscribe(
            result => {
                this.loading = false;
                this._originalData = result;
                this.dataToShow = result;
                this.dataToShow = _.sortBy(this.dataToShow, function (template) { return template.name.toLowerCase(); });
                this.pageChanged({ page: 1, itemsPerPage: 20 });
            },
            error => {
                if(error.statusText = 'Method Not Allowed')
                    this.toastService.addToast(error.error, this.toastService.toastyType.error);
                else
                this.toastService.addToast("Ha ocurrido un problema al pedir las plantillas.", this.toastService.toastyType.error)
            }
        );
    }

    deleteTemplate(template) {
        this.templateService.deleteTemplate(template.id).subscribe(
            result => {
                this.toastService.addToast("la plantilla " + template.name + " ha sido borrada correctamente.", this.toastService.toastyType.success)
                this.getTemplates();
            },
            error => {
                if(error.statusText = 'Method Not Allowed')
                    this.toastService.addToast(error.error, this.toastService.toastyType.error);
                else
                if (error.status == 406) {
                    this.toastService.addToast("No se puede eliminar la plantilla, se encuentra asignada a una vivienda.", this.toastService.toastyType.error)
                } else {
                    this.toastService.addToast("Ha ocurrido un problema al pedir las plantillas.", this.toastService.toastyType.error)
                }
            }
        );
    }

    configureNewTemplate() {
        this.router.navigateByUrl('/app/template/create');
    }


    cleanFilters() {
        this.filter = {
            template: ""
        };
        this.filterTemplate();
    }

    filterTemplate() {
        this.dataToShow = this._originalData;
        if (this.filter.template && this.filter.template.length) {
            this.dataToShow = this.dataToShow
                .filter(x => x.name.toLowerCase().indexOf(this.filter.template.toLowerCase()) > -1);
        }
        this.pageChanged({ page: 1, itemsPerPage: 20 });
        this.switchPagination = !this.switchPagination;
    }

    public pageChanged(evt) {
        let page = evt.page - 1;
        this.templates = this.dataToShow.slice(page * 20, page * 20 + evt.itemsPerPage)
    }

    deleteTempalteModal(template) {
        let context = new DeleteComponentContext();
        this.modal.overlay.defaultViewContainer = this.vcRef;
        var that = this;
        this.modal.open(DeleteComponent, overlayConfigFactory({ msj: 'Seguro que deseas eliminar la plantilla ' + '"' + template.name + '"' + '?' }, BSModalContext))
            .then(function (x) {
                var those = that;
                x.result
                    .then(function (result) {
                        if (result) {
                            that.deleteTemplate(template);
                        }
                    });
            });

    }

    templateType(type) {
        if (type == 1) { return 'DTU' };
        if (type == 2) { return 'Avance' };
    }

    verifyAccess(permission){
        if(permission.indexOf('WRITE') != -1)
        if(this.access.includes(permission)) this.writeFlag = true;

        if(permission.indexOf('CREATE') != -1)
        if(this.access.includes(permission)) this.createFlag = true;

        if(permission.indexOf('DELETE') != -1)
        if(this.access.includes(permission)) this.deleteFlag = true;
    }
}
