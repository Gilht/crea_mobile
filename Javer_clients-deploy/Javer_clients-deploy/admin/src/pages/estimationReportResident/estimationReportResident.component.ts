import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AppConfig } from '../../util/AppConfig';
import { EstimationReportComponent } from '../estimationReport/estimationReport.component';
import * as download from 'downloadjs';
import * as _ from 'lodash';
import { SharedEstimateService, SharedHouseService, ServiceUtil, EstimateStatus, message } from '../../clientsSharedModule/sharedmodule';
import { SubdivisionService, MyToastyService, EstimateService } from '../../services/services';

@Component({
    selector: 'estimateReportResident',
    templateUrl: ('../estimationReport/estimationReport.component.html'),
    styleUrls: ['../estimationReport/estimationReport.component.css'],
    providers: [SharedEstimateService, SubdivisionService, SharedHouseService, MyToastyService, EstimateService]
})
export class EstimationReportResidentComponent extends EstimationReportComponent {
  breadcrum: string = 'REPORTES > Reporte de estimación Residente';
  access = localStorage.getItem('access');
  pdfExtraOptions: any = {
    forceResidentReport: true
  };
  requiredFilters: any = {
    project: true,
    provider: true
  }
}
