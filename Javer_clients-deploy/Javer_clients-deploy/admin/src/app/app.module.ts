import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { SharedModule } from './shared.module';
import { SharedService } from '../services/shared.service';
import { HttpClientModule } from '@angular/common/http';
import { httpInterceptorProviders } from '../http-interceptors';
import { AppComponent } from './app.component';
import { LoginComponent } from '../pages/logIn/login.component';
import { PurchaseComponent } from '../pages/purchase/purchase.component';
import { PurchaseAssignmentComponent } from '../pages/purchaseAssignment/purchaseAssignment.component';
import { AssignResidentComponent } from '../pages/assignResident/assignResident.component';
import { AssignResidentSelectComponent } from '../pages/assignResidentSelect/assignResidentSelect.component';
import { DtuComponent } from '../pages/dtu/dtu.component';
import { SubcategoryFormComponent } from '../pages/subcategoryForm/subcategoryForm.component';
import { SubcategoryComponent } from '../pages/subcategory/subcategory.component';
import { CategoryFormComponent } from '../pages/categoryForm/categoryForm.component';
import { ClientPermissionFormComponent } from '../pages/clientPermissionForm/clientPermissionForm.component';
import { CategoryComponent } from '../pages/category/category.component';
import { ClientPermissionComponent } from '../pages/clientPermission/clientPermission.component';
import { ResourcePermissionComponent } from '../pages/resourcePermission/resourcePermission.component';
import { ResourcePermissionFormComponent } from '../pages/resourcePermissionForm/resourcePermissionForm.component';
import { UserFormComponent } from '../pages/userForm/userForm.component';
import { UserComponent } from '../pages/user/user.component';
import { RolComponent } from '../pages/rol/rol.component';
import { RolFormComponent } from '../pages/rolForm/rolForm.component';
import { RolAssignment } from '../pages/rolAssignment/rolAssignment.component';
import { UserAssignment } from '../pages/userAssignment/userAssignment.component';
import { LoginReportComponent } from '../pages/loginReport/loginReport.component';
import { UenPermissions } from '../pages/uenPermissions/uenPermissions.component';
import { ResourceAssignment } from '../pages/resourceAssignment/resourceAssignment.component';
import { DtuAssignmentComponent } from '../pages/dtuAssignment/dtuAssignment.component';
import { CoreComponent } from '../pages/core/core.component';
import { SubcategoryBulkUploadComponent } from '../pages/subcategoryBulkUpload/subcategoryBulkUpload.component';
import { ValidationDtuComponent } from '../pages/validationDtu/validationDtu.component';
import { PackageComponent } from '../pages/package/package.component';
import { PackageFormComponent } from '../pages/packageForm/packageForm.component';
import { SubpackageFormComponent } from '../pages/subpackageForm/subpackageForm.component';
import { SubpackageComponent } from '../pages/subpackage/subpackage.component';
import { StartDateComponent } from '../pages/startDate/startDate.component';
import { StartDateSelectComponent } from '../pages/startDateSelect/startDateSelect.component';
import { TemplateComponent } from '../pages/template/template.component';
import { TemplateFormComponent } from '../pages/templateForm/templateForm.component';
import { AssignTemplateComponent } from '../pages/assignTemplate/assignTemplate.component';
import { AssignTemplateSelectComponent } from '../pages/assignTemplateSelect/assignTemplateSelect.component';
import { WorkProgramFormComponent } from '../pages/workProgramForm/workProgramForm.component';
import { WorkProgramComponent } from '../pages/workProgram/workProgram.component';
import { EstimateComponent } from '../pages/estimate/estimate.component';
import { TemplateReportComponent } from '../pages/templateReport/templateReport.component';
import { TemplateReportSectionComponent } from '../pages/templateReportSection/templateReportSection.component';
import { TemplateSectionAdvanceComponent } from '../pages/templateSectionAdvance/templateSectionAdvance.component';
import { SiteControlComponent } from '../pages/siteControl/siteControl.component';
import { SiteControlAssignmentComponent } from '../pages/siteControlAssignment/siteControlAssignment.component';
import { EstimateEditComponent } from '../pages/estimateEdit/estimateEdit.component';
import { AproveEstimateComponent } from '../pages/aproveEstimates/aproveEstimates.component';
import { AgmCoreModule } from '@agm/core';
import { WorkProgramReportFormComponent } from '../pages/workProgramReportForm/workProgramReportForm.component';
import { WorkProgramReportComponent } from '../pages/workProgramReport/workProgramReport.component';
import { HouseReportComponent } from '../pages/houseReport/houseReport.component';
import { DtuAndAdvanceReportComponent } from '../pages/dtuAndAdvanceReport/dtuAndAdvanceReport.component';
import { EstimationReportComponent } from '../pages/estimationReport/estimationReport.component';
import { EstimationReportResidentComponent } from '../pages/estimationReportResident/estimationReportResident.component';
import { HouseProgressReportComponent } from '../pages/houseProgressReport/houseProgressReport.component'
import { DualListBoxModule } from './../components/ng2-dual-list-box';
import { AngularMultiSelectModule } from './../components/angular2-multiselect-dropdown_3_2_1/angular2-multiselect-dropdown';
import { ExpiredSessionComponent } from '../modals/expiredSessionModal/expiredSessionModal.component';
import { PolicyAgreementComponent } from '../modals/policyAgreementModal/policyAgreementModal.component';
import { SectionHousesSyncErrorComponent } from '../modals/sectionHousesSyncErrorModal/sectionHousesSyncErrorModal.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    CoreComponent,
    PurchaseComponent,
    PurchaseAssignmentComponent,
    AssignResidentComponent,
    AssignResidentSelectComponent,
    DtuComponent,
    DtuAssignmentComponent,
    CategoryFormComponent,
    ClientPermissionFormComponent,
    ResourcePermissionFormComponent,
    CategoryComponent,
    ClientPermissionComponent,
    ResourcePermissionComponent,
    SubcategoryFormComponent,
    SubcategoryComponent,
    SubcategoryBulkUploadComponent,
    LoginReportComponent,
    UenPermissions,
    ResourceAssignment,
    UserComponent,
    RolComponent,
    RolFormComponent,
    RolAssignment,
    UserAssignment,
    UserFormComponent,
    ValidationDtuComponent,
    PackageComponent,
    PackageFormComponent,
    SubpackageComponent,
    SubpackageFormComponent,
    StartDateComponent,
    StartDateSelectComponent,
    TemplateComponent,
    TemplateFormComponent,
    AssignTemplateComponent,
    AssignTemplateSelectComponent,
    WorkProgramFormComponent,
    WorkProgramComponent,
    WorkProgramReportFormComponent,
    WorkProgramReportComponent,
    DtuAndAdvanceReportComponent,
    EstimateComponent,
    EstimateEditComponent,
    TemplateReportComponent,
    TemplateReportSectionComponent,
    TemplateSectionAdvanceComponent,
    SiteControlComponent,
    SiteControlAssignmentComponent,
    AproveEstimateComponent,
    HouseReportComponent,
    EstimationReportComponent,
    EstimationReportResidentComponent,
    HouseProgressReportComponent,
    ExpiredSessionComponent,
    PolicyAgreementComponent,
    SectionHousesSyncErrorComponent
  ],
  imports: [
    SharedModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyBCRs6o8v-WwaEbudkGz8Q0qd3dUi8FiL8'
    }),
    BrowserModule,
    HttpClientModule,
    DualListBoxModule.forRoot(),
    AngularMultiSelectModule,
    RouterModule.forRoot([
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      {
        path: 'app', component: CoreComponent,
        children: [
          { path: 'purchase', component: PurchaseComponent },
          { path: 'purchaseAssignment', component: PurchaseAssignmentComponent },
          { path: 'siteControl', component: SiteControlComponent },
          { path: 'siteControlAssignment', component: SiteControlAssignmentComponent },
          { path: 'dtu', component: DtuComponent },
          { path: 'dtuAssignment', component: DtuAssignmentComponent },
          { path: 'assignResident', component: AssignResidentComponent },
          { path: 'validationDtu', component: ValidationDtuComponent },
          { path: 'assignResidentSelect', component: AssignResidentSelectComponent },
          { path: 'reassignResidentSelect', component: AssignResidentSelectComponent },
          { path: 'reassignResident', component: AssignResidentComponent },
          { path: 'category', component: CategoryComponent },
          { path: 'clientPermission', component: ClientPermissionComponent },
          { path: 'resourcePermission', component: ResourcePermissionComponent },
          { path: 'category/create', component: CategoryFormComponent },
          { path: 'category/edit/:id', component: CategoryFormComponent },
          { path: 'clientPermission/create', component: ClientPermissionFormComponent },
          { path: 'clientPermission/edit/:id', component: ClientPermissionFormComponent },
          { path: 'resourcePermission/create', component: ResourcePermissionFormComponent },
          { path: 'resourcePermission/edit/:id', component: ResourcePermissionFormComponent },
          { path: 'package', component: PackageComponent },
          { path: 'package/create', component: PackageFormComponent },
          { path: 'package/edit/:id', component: PackageFormComponent },
          { path: 'loginReport', component: LoginReportComponent },
          { path: 'uenPermissions', component: UenPermissions },
          { path: 'resourceAssignment', component: ResourceAssignment },
          { path: 'user', component: UserComponent },
          { path: 'user/create', component: UserFormComponent },
          { path: 'user/edit/:id', component: UserFormComponent },
          { path: 'rol', component: RolComponent },
          { path: 'rol/create', component: RolFormComponent },
          { path: 'rol/edit/:id', component: RolFormComponent },
          { path: 'rolAssignment', component: RolAssignment },
          { path: 'userAssignment', component: UserAssignment },
          { path: 'subcategoryBulkUpload', component: SubcategoryBulkUploadComponent },
          { path: 'subcategory', component: SubcategoryComponent },
          { path: 'subcategory/create', component: SubcategoryFormComponent },
          { path: 'subcategory/edit/:id', component: SubcategoryFormComponent },
          { path: 'subpackage', component: SubpackageComponent },
          { path: 'subpackage/create', component: SubpackageFormComponent },
          { path: 'subpackage/edit/:id', component: SubpackageFormComponent },
          { path: 'template', component: TemplateComponent },
          { path: 'template/create', component: TemplateFormComponent },
          { path: 'template/edit/:id', component: TemplateFormComponent },
          { path: 'assignTemplate', component: AssignTemplateComponent },
          { path: 'templateReport', component: TemplateReportComponent },
          { path: 'templateReportSection', component: TemplateReportSectionComponent },
          { path: 'assignTemplateSelect', component: AssignTemplateSelectComponent },
          { path: 'startDate', component: StartDateComponent },
          { path: 'startDateSelect', component: StartDateSelectComponent },
          { path: 'workProgram/create', component: WorkProgramFormComponent },
          { path: 'workProgram/edit/:id', component: WorkProgramFormComponent },
          { path: 'workProgram', component: WorkProgramComponent },
          { path: 'workProgramReport/review/:id', component: WorkProgramReportFormComponent },
          { path: 'workProgramReport', component: WorkProgramReportComponent },
          { path: 'dtuAndAdvanceReport', component: DtuAndAdvanceReportComponent },
          { path: 'estimate', component: EstimateComponent },
          { path: 'estimate/edit/:id', component: EstimateEditComponent },
          { path: 'aproveEstimate', component: AproveEstimateComponent },
          { path: 'templateSectionAdvance/:id/:type', component: TemplateSectionAdvanceComponent },
          { path: 'houseReport', component: HouseReportComponent },
          { path: 'estimationReport', component: EstimationReportComponent },
          { path: 'estimationReportResident', component: EstimationReportResidentComponent },
          { path: 'houseProgressReport', component: HouseProgressReportComponent }
        ]
      },
      { path: 'login', component: LoginComponent },
    ], { useHash: true }),
  ],
  providers: [RouterModule, HttpClientModule, SharedService, httpInterceptorProviders],
  bootstrap: [AppComponent],
  entryComponents: [ ExpiredSessionComponent, PolicyAgreementComponent, SectionHousesSyncErrorComponent ]
})
export class AppModule { }
