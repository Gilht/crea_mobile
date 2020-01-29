import { Component, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AppConfig } from '../../util/AppConfig';
import * as _ from 'underscore';
import { ServiceUtil, message } from '../../clientsSharedModule/sharedmodule';
import { SubdivisionService, ResidentService, MyToastyService } from '../../services/services';

@Component({
    selector: 'siteControl',
    templateUrl: ('./siteControl.component.html'),
    styleUrls: ['./siteControl.component.css'],
    providers: [SubdivisionService, MyToastyService, ResidentService]
})
export class SiteControlComponent {
    isSelected = false;
    switchPagination: boolean;
    dataToShow: any;
    residents: any;
    filter: any = {
        project: "",
        dtu: "",
        purchase: "",
        siteControl: ""
    };
    _originalData: any;
    projects: any;
    loading = true;
    currentPage: number = 1;
    getListSelected = ServiceUtil.getListSelected;
    access = localStorage.getItem('access');
    writeFlag : any;
    AppConfig = AppConfig;
    proyects = []
    constructor(private route: ActivatedRoute, private router: Router, private residentService: ResidentService, private subdivisionService: SubdivisionService, vcRef: ViewContainerRef, private toastService: MyToastyService) {
    }

    ngOnInit() {
        this.getSubdivisions();
        this.getResidents();
        this.verifyAccess('CONTROL_OBRA_WRITE');
    }

    getSubdivisions() {
        this.subdivisionService.getSubdivisions().subscribe(
            result => {
                this.loading = false;
                this._originalData = result;
                this.dataToShow = result;
                this.pageChanged({ page: 1, itemsPerPage: 20 });
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
        var newProjects = this._originalData.filter(x => x.selected);
        this.router.navigate(['/app/siteControlAssignment'], { queryParams: { newSubdivisions: JSON.stringify(newProjects) } });
    }

    cleanFilters() {
        this.filter = {
            project: "",
            dtu: "",
            purchase: "",
            siteControl: ""
        };
        this.filterProjects();
    }

    filterProjects() {
        this.dataToShow = this._originalData;
        if (this.filter.project && this.filter.project.length) {
            this.dataToShow = this.dataToShow
                .filter(x => x.name.toLowerCase().indexOf(this.filter.project.toLowerCase()) > -1);
        }
        if (this.filter.purchase) {
            this.dataToShow = this.dataToShow
                .filter(x => x.purchasingAgent && x.purchasingAgent.login == this.filter.purchase.login);
        }
        if (this.filter.dtu) {
            this.dataToShow = this.dataToShow
                .filter(x => x.dtuAgent && x.dtuAgent.login == this.filter.dtu.login);
        }
        if (this.filter.siteControl) {
            this.dataToShow = this.dataToShow
                .filter(x => x.controlAgent && x.controlAgent.login == this.filter.siteControl.login);
        }
        this.pageChanged({ page: 1, itemsPerPage: 20 });
        this.switchPagination = !this.switchPagination;
    }

    getResidents() {
        this.residentService.getResidentUsers().subscribe(
            result => {
                this.residents = result;
            },
            error => {
                if(error.statusText = 'Method Not Allowed')
                    this.toastService.addToast(error.error, this.toastService.toastyType.error);
                else
                this.toastService.addToast(message.error, this.toastService.toastyType.error)
            }
        );
    }

    public pageChanged(evt) {
        let page = evt.page - 1;
        this.projects = this.dataToShow.slice(page * 20, page * 20 + evt.itemsPerPage)
    }

    checkAll() {
        let that = this;
        this.isSelected = !this.isSelected;
        _.each(this.dataToShow, function (p) {//this.projects
            p.selected = that.isSelected;
        })
        if (this.isSelected) {
            this.toastService.addToast("Se han seleccionado " + this.dataToShow.length + " proyectos", this.toastService.toastyType.error);
        }
    }

    verifyAccess(permission){
        if(this.access.includes(permission)) this.writeFlag = true;
    }
}
