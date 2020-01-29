
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { CalendarModule } from 'primeng/primeng';
import { PaginationDirective } from './../components/angular2-bootstrap-pagination/directives/pagination.directive';
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastyModule } from 'ng2-toasty';
import { UiSwitchModule } from 'ngx-ui-switch'
import { ModalModule } from 'angular2-modal';
import { BootstrapModalModule } from 'angular2-modal/plugins/bootstrap';
import { DeleteComponent } from '../modals/deletemodal/deletemodal.component';
import { AddSubpackageComponent } from '../modals/addSubpackageModal/addSubpackageModal.component';
import { ImageViewModalComponent } from '../modals/imageViewModal/imageViewModal.component';
import { InputModalComponent } from '../modals/inputModal/inputmodal.component';
import { MapComponent } from '../modals/mapModal/mapModal.component';

@NgModule({
    declarations: [
        PaginationDirective,
        DeleteComponent,
        MapComponent,
        ImageViewModalComponent,
        AddSubpackageComponent,
        InputModalComponent
    ],
    imports: [
        FormsModule,
        CommonModule,
        CalendarModule,
        BrowserModule,
        BrowserAnimationsModule,
        ModalModule.forRoot(),
        BootstrapModalModule,
        ToastyModule.forRoot(),
        UiSwitchModule
    ],
    entryComponents: [
        DeleteComponent,
        MapComponent,
        ImageViewModalComponent,
        AddSubpackageComponent,
        InputModalComponent
    ],
    exports: [
        RouterModule,
        CommonModule,
        FormsModule,
        ModalModule,
        BootstrapModalModule,
        HttpClientModule,
        ReactiveFormsModule,
        BrowserModule,
        BrowserAnimationsModule,
        ToastyModule,
        CalendarModule,
        PaginationDirective,
        UiSwitchModule

    ],
    providers: [HttpClient],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SharedModule { }