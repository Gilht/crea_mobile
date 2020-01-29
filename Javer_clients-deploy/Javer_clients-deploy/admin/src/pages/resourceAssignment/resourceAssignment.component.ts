import { Component, OnInit } from '@angular/core';
import { AppConfig } from '../../util/AppConfig';
import { Observable } from "rxjs/Observable";
import 'rxjs/add/observable/forkJoin';
import { UserService, UenService, ClientPermissionService, ResourcePermissionService } from '../../services/services';
import { MyToastyService } from '../../services/services';

@Component({
  selector: 'resourceAssignment',
  templateUrl: './resourceAssignment.component.html',
  styleUrls: ['./resourceAssignment.component.css'],
  providers: [UserService, UenService, ClientPermissionService, ResourcePermissionService]
})

export class ResourceAssignment implements OnInit {
  private items: Array<any> = [
    {id: 0, name: 'name 0'},
    {id: 0, name: 'name 1'},
    {id: 0, name: 'name 2'}
  ];
  private userList: Array<any> = [];
  private uenList: Array<any> = [];
  private clientPermissionsList: Array<any> = [];
  private allowedResource: Array<any> = [];
  private notAllowedResource: Array<any> = [];
  private listToSync: Array<any> = [];
  private targetUserId: string = '';
  private clientPermissionsId: string = '';
  private targetUenId: string = '';
  private freeUenAccess: Boolean = false;
  public loading: Boolean = true;
  private couldSave: Boolean = false;
  access = localStorage.getItem('access');

  constructor(private userService: UserService, private uenService: UenService, private clientPermissionService: ClientPermissionService, private resourcePermissionService: ResourcePermissionService, private toastService: MyToastyService) {

  }

  ngOnInit() {
    Observable.forkJoin(
      this.getClientPermissions(),
    ).subscribe(
      result => {
        this.clientPermissionsList = result[0];
        this.loading = false;
      },
      error => {
          if(error.statusText = 'Method Not Allowed')
              this.toastService.addToast(error.error, this.toastService.toastyType.error);
          else
            this.toastService.addToast('Ocurrió un error al recuperar permisos del servidor.', this.toastService.toastyType.error);
      }
    );
  }

  getClientPermissions(){
    return this.clientPermissionService.getClientPermissions();
  }

  getAllowedPermissions(){
    return this.resourcePermissionService.getAllowedResources(this.clientPermissionsId)
  }

  getNotAllowedPermissions(){
    return this.resourcePermissionService.getNotAllowedResources(this.clientPermissionsId);
  }

  syncResourceAccess() {
    this.loading = true;
    Observable.forkJoin(
      this.getAllowedPermissions(),
      this.getNotAllowedPermissions()
    ).subscribe(
      result => {
        this.allowedResource = result[0];
        this.notAllowedResource = result[1];
        this.listToSync = [];
        this.loading = false;
        this.couldSave = false;
      },
      error => {
          if(error.statusText = 'Method Not Allowed')
              this.toastService.addToast(error.error, this.toastService.toastyType.error);
          else
            this.toastService.addToast('Ocurrió un error al recuperar los recursos del servidor.', this.toastService.toastyType.error);
      }
    );
  }

  onClientPermissionChange(clientPermissionsId) {
    this.clientPermissionsId = clientPermissionsId;
    this.syncResourceAccess()
  }

  syncLists(e) {
    this.listToSync = e.selected;
    this.couldSave = true;
  }

  save() {
    this.resourcePermissionService.updateAllowedResources(this.clientPermissionsId, this.listToSync.map(project => project.value))
    .subscribe(
      result => {
        this.toastService.addToast('Los recursos fueron actualizados.', this.toastService.toastyType.success);
      },
      error => {

          if(error.statusText = 'Method Not Allowed')
              this.toastService.addToast(error.error, this.toastService.toastyType.error);
          else
                this.toastService.addToast('Ocurrió un error al actualizar los recursos.', this.toastService.toastyType.error);
      }
    );
  }
}
