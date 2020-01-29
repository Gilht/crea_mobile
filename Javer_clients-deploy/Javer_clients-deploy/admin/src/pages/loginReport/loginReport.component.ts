import { Component } from '@angular/core';
import { SharedUserService } from '../../clientsSharedModule/sharedmodule';
import { AppConfig } from '../../util/AppConfig';
import { message } from '../../clientsSharedModule/sharedmodule';
import { LogService, MyToastyService } from '../../services/services';
import { ServiceUtil } from '../../clientsSharedModule/ServiceUtil';
import * as moment from 'moment';

@Component({
  selector: 'loginReport',
  templateUrl: './loginReport.component.html',
  styleUrls: ['./loginReport.component.css'],
  providers: [SharedUserService, LogService, MyToastyService]
})

export class LoginReportComponent {
  dateRange = {
    startDate: new Date(),
    endDate: new Date()
  };
  loading: boolean = true;
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalLogs: number = 0;
  logData: Array<any> = [];
  access = localStorage.getItem('access');

  constructor(private userService: SharedUserService, private logService: LogService, private toastService: MyToastyService) {
  }

  ngOnInit() {
    this.getLoginLogsByDateRange(this.dateRange.startDate, this.dateRange.endDate, this.currentPage, this.itemsPerPage);
  }

  pageChanged(event) {
    this.getLoginLogsByDateRange(this.dateRange.startDate, this.dateRange.endDate, event.page, this.itemsPerPage);
  }

  getLoginLogsByDateRange(startDate, endDate, page, itemsPerPage) {
    this.logService.getLoginLogsByDateRange(
      startDate,
      endDate,
      page,
      itemsPerPage
    ).subscribe(
      result => {
        this.totalLogs = result.total,
        this.logData = result.logs;
        this.loading = false;
      },
      error => {
          if(error.statusText = 'Method Not Allowed') {
            this.toastService.addToast(error.error, this.toastService.toastyType.error);
          } else {
            console.error(error);
          }
      }
    );
  }

  getExcel(startDate, endDate) {
    this.loading = true;
    if(window.confirm('Esto exportará ' + this.totalLogs + ' registros, desea continuar?')) {
      this.logService.getExcel(startDate, endDate)
      .subscribe(
        result => {
          ServiceUtil.downloadBufferToCsv(result.data, 'Reporte de inicio de sesión', ServiceUtil.mimeTypes.csv);
          this.loading = false;
        },
        error => {
            if(error.statusText = 'Method Not Allowed') {
              this.toastService.addToast(error.error, this.toastService.toastyType.error);
            } else {
              console.error('Export error', error);
              this.loading = false;
            }
        }
      );
    } else {
      this.loading = false;
    }
  }

}
