import { Component, ViewContainerRef, ViewEncapsulation } from '@angular/core';

import { Router, ActivatedRoute } from '@angular/router';
import { AppConfig } from '../../util/AppConfig';
import * as _ from 'underscore';
import { SharedEstimateService, SharedHouseService, ServiceUtil } from '../../clientsSharedModule/sharedmodule';
import { SubdivisionService, ResidentService, MyToastyService, EstimateService } from '../../services/services';
@Component({
    selector: 'estimate',
    templateUrl: ('./estimate.component.html'),
    styleUrls: ['./estimate.component.css'],
    providers: [SharedEstimateService, SubdivisionService, SharedHouseService, MyToastyService, EstimateService]
})
export class EstimateComponent {

    estimates: any = [];
    fronts: any = [];
    collections: any = [];
    contracts: any = [];
    providers: any = [];
    projects: any = [];
    access = localStorage.getItem('access');
    dataToShow: any;
    filter: any = {
        project: "",
        front: "",
        collection: "",
        provider: "",
        contract: ""
    };
    loading = true;
    constructor(private route: ActivatedRoute, private subdivisionService: SubdivisionService, private sharedHouseService: SharedHouseService, private estimateService: EstimateService, private router: Router, private sharedEstimateService: SharedEstimateService, vcRef: ViewContainerRef, private toastService: MyToastyService) {
    }

    ngOnInit() {
        this.getEstimates();
    }

    getEstimates() {
        this.estimateService.getBossEstimates().subscribe(
            result => {
                this.loading = false;
                this.estimates = result.estimates;
                this.fronts = result.fronts;
                this.providers = result.providers;
                this.projects = result.projects;
                this.collections = result.collections;
                this.contracts = result.contracts;
                this.dataToShow = this.estimates;
            },
            error => {
                if(error.statusText = 'Method Not Allowed')
                    this.toastService.addToast(error.error, this.toastService.toastyType.error);
                else
                    this.toastService.addToast("Ha ocurrido un problema al pedir las estimaciones.", this.toastService.toastyType.error)
            }
        );
    }
    filterEstimates() {
        this.dataToShow = this.estimates;
        if (this.filter.project != "") {
            this.dataToShow = this.dataToShow.filter(x => x.project == this.filter.project);
        }
        if (this.filter.front != "") {
            this.dataToShow = this.dataToShow.filter(x => x.frontName == this.filter.front);
        }
        if (this.filter.collection != "") {
            this.dataToShow = this.dataToShow.filter(x => x.collectionName == this.filter.collection);
        }
        if (this.filter.provider != "") {
            this.dataToShow = this.dataToShow.filter(x => x.providerName == this.filter.provider);
        }
        if (this.filter.contract != "") {
            this.dataToShow = this.dataToShow.filter(x => x.contract == this.filter.contract);
        }
    }
    cleanFilters() {
        this.dataToShow = this.estimates;
        this.filter = {
            project: "",
            front: "",
            collection: "",
            provider: "",
            contract: ""
        };
    }
}
