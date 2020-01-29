import { Component, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AppConfig } from '../../util/AppConfig';
import * as _ from 'underscore';
import { Resident, House, SharedHouseService, ServiceUtil } from '../../clientsSharedModule/sharedmodule';
import { SubdivisionService, HouseService, ResidentService, MyToastyService, TemplateService } from '../../services/services';

@Component({
    selector: 'templateReport',
    templateUrl: ('./templateReportSection.component.html'),
    styleUrls: ['./templateReportSection.component.css'],
    providers: [SubdivisionService, TemplateService, SharedHouseService,HouseService, MyToastyService]
})
export class TemplateReportSectionComponent {
    sections: any;
    isSelected: boolean = false;
    projects: any = [];
    switchPagination: boolean;
    dataToShow: any;
    _originalData: any = [];
    loading = true;
    currentPage: number = 1;
    access = localStorage.getItem('access');
    AppConfig = AppConfig;
    constructor(private route: ActivatedRoute, private sharedhouseService: SharedHouseService, private houseService: HouseService,
        private templateService: TemplateService, private router: Router, vcRef: ViewContainerRef, private toastService: MyToastyService) {
    }

    ngOnInit() {
        this.getSections();
    }

    getSections() {
        this.sections = JSON.parse(localStorage.getItem("sectionsReports"));
        this.loading = false;
    }

    selectHouse(house){
        this.sections.forEach(section => {
            section.selected = section.id == house.id;
        });
    }

    viewAdvance(type){
        var selected = this.sections.find(section => section.selected);
        if(!selected){
            this.toastService.addToast("Selecciona la seccion que deseas ver", this.toastService.toastyType.error);
            return
        }
        this.router.navigate(['/app/templateSectionAdvance', selected.id, type])
    }

    checkAll() {
        let that = this;
        this.isSelected = !this.isSelected;
        _.each(this.sections, function (p) {
            p.selected = that.isSelected;
        })

        if (this.isSelected) {
            this.toastService.addToast("Se han seleccionado " + this.sections.length + " secciones", this.toastService.toastyType.error);
        }
    }

}
