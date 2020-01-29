import { Component, ViewContainerRef, ViewEncapsulation } from '@angular/core';

import { Router, ActivatedRoute } from '@angular/router';
import { EstimationReportComponent } from '../estimationReport/estimationReport.component';
import { SharedEstimateService, SharedHouseService, ServiceUtil } from '../../clientsSharedModule/sharedmodule';
import { SubdivisionService, ResidentService, MyToastyService, EstimateService } from '../../services/services';
import { AppConfig } from '../../util/AppConfig';

import * as _ from 'underscore';

@Component({
    selector: 'estimate',
    templateUrl: ('./aproveEstimates.component.html'),
    styleUrls: ['./aproveEstimates.component.css'],
    providers: [SharedEstimateService, SubdivisionService, SharedHouseService, MyToastyService, EstimateService]
})
export class AproveEstimateComponent extends EstimationReportComponent {
    requiredFilters: any = {};
    fixedStatuses: any = [2];
    pag: any = {
      total: 0,
      currentPage: 1,
      itemsPerPage: 100
    };

    canValid() {
        return this.estimates.filter(x => x.selected).length > 0;
    }

    validateEstimates() {
        let estimateIds = this.estimates.filter(x => x.selected).map(x => x.id);
        this.loading = true;
        if (estimateIds.length > 0) {
            this.estimateService.validateEstimates(estimateIds).subscribe(
                result => {
                    this.toastService.addToast("Las estimaciones han sido validadas.", this.toastService.toastyType.success);
                    this.getEstimates(this.pag.currentPage);
                },
                error => {
                    if(error.statusText == 'Method Not Allowed')
                        this.toastService.addToast(error.error, this.toastService.toastyType.error);
                    else
                        this.toastService.addToast("Ha ocurrido un problema al pedir las estimaciones.", this.toastService.toastyType.error)

                    this.loading = false;
                }
            );
        }
    }

}
