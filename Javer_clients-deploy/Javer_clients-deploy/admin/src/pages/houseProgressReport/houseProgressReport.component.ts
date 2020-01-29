import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AppConfig } from '../../util/AppConfig';
import * as _ from 'underscore';
import * as moment from 'moment';
import { SharedHouseService, ServiceUtil, message } from '../../clientsSharedModule/sharedmodule';
import { HouseService, MyToastyService, SubdivisionService } from '../../services/services';

@Component({
  selector: 'houseProgressReport',
  templateUrl: ('./houseProgressReport.html'),
  styleUrls: ['./houseProgressReport.component.css'],
  providers: [HouseService, SubdivisionService]
})
export class HouseProgressReportComponent {
  allowedSubdivisions: Array<any> = [];
  access = localStorage.getItem('access');
  filter: any = {
    projects: [],
    templateType: 2,
    startDate: null,
    endDate: null
  };
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private toastService: MyToastyService,
    private houseService: HouseService,
    private subdivisionService: SubdivisionService
  ) {

  }

  ngOnInit() {
    this.getAllowedSubdivisions()
    .then(() => {
      this.loading = false;
    }).catch(error => {
      console.info(error);
      this.loading = false;
    });
  }

  private getAllowedSubdivisions() {
    return this.subdivisionService.getSubdivisionsDbTP()
    .then(subdivisions => subdivisions.map(s => ({id: s.id, externalId: s.externalId, itemName: s.name})))
    .then(subdivisions => {
      this.allowedSubdivisions = subdivisions;
    });
  }

  private canSearch() {
    if (!this.filter.projects.length || !this.filter.projects.some(p => p.id.length)) {
      this.toastService.addToast("Seleccione al menos un proyecto.", this.toastService.toastyType.error);
      return false;
    }

    let startDate = moment(this.filter.startDate);
    let endDate = moment(this.filter.endDate);
    let dateDiff = endDate.diff(startDate, 'months', true);

    if (dateDiff > 1 || dateDiff < -1) {
      this.toastService.addToast("El rango de fechas debe ser menor a un mes.", this.toastService.toastyType.error);
      return false;
    }

    return true;
  }

  downloadReport() {
    if (this.canSearch()) {
      this.houseService.getSectionHouseProgressReportExcel(this.filter.projects.filter(p => !_.isEmpty(p.id)).map(p => p.id), this.filter.templateType, this.filter.startDate, this.filter.endDate)
      .subscribe(
        response => ServiceUtil.downloadBufferToExcel(response.data, 'CargaAvancedeObra', ServiceUtil.mimeTypes.excel),
        error => {
          console.info(error);
          if(error.statusText = 'Method Not Allowed')
              this.toastService.addToast(error.error, this.toastService.toastyType.error);
          else
            this.toastService.addToast(message.error, this.toastService.toastyType.error);
        }
      );
    }
  }

  cleanFilters() {
    this.filter = {
      projects: [],
      templateType: 2,
      startDate: null,
      endDate: null
    };
  }
}
