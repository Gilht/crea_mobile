import { Component, OnInit } from '@angular/core';
import { AppConfig } from '../../util/AppConfig';
import { Observable } from "rxjs/Observable";
import 'rxjs/add/observable/forkJoin';
import { UserService, UenService, ClientPermissionService, RolService } from '../../services/services';
import { MyToastyService } from '../../services/services';

@Component({
  selector: 'userAssignment',
  templateUrl: './userAssignment.component.html',
  styleUrls: ['./userAssignment.component.css'],
  providers: [UserService, UenService, ClientPermissionService, RolService]
})

export class UserAssignment implements OnInit {
  private items: Array<any> = [
    {id: 0, name: 'name 0'},
    {id: 0, name: 'name 1'},
    {id: 0, name: 'name 2'}
  ];
  private userList: Array<any> = [];
  private uenList: Array<any> = [];
  private usersList: Array<any> = [];
  private allowedProjects: Array<any> = [];
  private notAllowedProjects: Array<any> = [];
  private listToSync: Array<any> = [];
  private targetUserId: string = '';
  private userId: string = '';
  private targetUenId: string = '';
  private freeUenAccess: Boolean = false;
  public loading: Boolean = true;
  private couldSave: Boolean = false;
  access = localStorage.getItem('access');

  constructor(private userService: UserService, private uenService: UenService, private clientPermissionService: ClientPermissionService, private rolPermissionService: RolService, private toastService: MyToastyService) {

  }

  ngOnInit() {
    Observable.forkJoin(
      //this.getUserList(),
      //this.getUenList(),
      this.getRoles(),
    ).subscribe(
      result => {
        this.usersList = result[0];
        this.loading = false;
      },
      error => {
          if(error.statusText = 'Method Not Allowed')
              this.toastService.addToast(error.error, this.toastService.toastyType.error);
          else
              this.toastService.addToast('Ocurrió un error al recuperar las listas del servidor.', this.toastService.toastyType.error);
      }
    );
  }

  getRoles(){
    return this.userService.getUsers();
  }

  getAllowedPermissions(){
    return this.userService.getAllowedRoles(this.userId)
  }

  getNotAllowedPermissions(){
    return this.userService.getNotAllowedPermissions(this.userId);
  }

  getNotAllowedProjectsByUserAndUenId() {
    return this.userService.getNotAllowedProjectsByUserAndUenId(this.targetUserId, this.targetUenId);
  }

  syncProjectsAccess() {
    this.loading = true;
    Observable.forkJoin(
      this.getAllowedPermissions(),
      this.getNotAllowedPermissions()
    ).subscribe(
      result => {
        this.allowedProjects = result[0];
        this.notAllowedProjects = result[1];
        this.listToSync = [];
        this.loading = false;
        this.couldSave = false;
      },
      error => {
          if(error.statusText = 'Method Not Allowed')
              this.toastService.addToast(error.error, this.toastService.toastyType.error);
          else
            this.toastService.addToast('Ocurrió un error al recuperar los permisos del servidor.', this.toastService.toastyType.error);
      }
    );
  }

  onRolChange(userId) {
    this.userId = userId;
    this.syncProjectsAccess()
  }

  syncLists(e) {
    this.listToSync = e.selected;
    this.couldSave = true;
  }

  save() {
    this.userService.updateAllowedPermission(this.userId, this.listToSync.map(project => project.value))
    .subscribe(
      result => {
        this.toastService.addToast('Los permisos fueron actualizados.', this.toastService.toastyType.success);
      },
      error => {
          if(error.statusText = 'Method Not Allowed')
              this.toastService.addToast(error.error, this.toastService.toastyType.error);
          else
              this.toastService.addToast('Ocurrió un error al actualizar los permisos.', this.toastService.toastyType.error);
      }
    );
  }
}
