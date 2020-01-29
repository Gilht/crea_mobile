import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppConfig } from '../../util/AppConfig';
import { Observable } from "rxjs/Observable";
import 'rxjs/add/observable/forkJoin';
import { UserService, UenService } from '../../services/services';
import { MyToastyService } from '../../services/services';

@Component({
  selector: 'uenPermissions',
  templateUrl: './uenPermissions.component.html',
  styleUrls: ['./uenPermissions.component.css'],
  providers: [UserService, UenService]
})

export class UenPermissions implements OnInit {
  private items: Array<any> = [
    {id: 0, name: 'name 0'},
    {id: 0, name: 'name 1'},
    {id: 0, name: 'name 2'}
  ];
  private userList: Array<any> = [];
  private uenList: Array<any> = [];
  private allowedProjects: Array<any> = [];
  private notAllowedProjects: Array<any> = [];
  private listToSync: Array<any> = [];
  private targetUserId: string = '';
  private targetUenId: string = '';
  private freeUenAccess: Boolean = false;
  public loading: Boolean = true;
  private couldSave: Boolean = false;
  access = localStorage.getItem('access');

  constructor(private router: Router, private userService: UserService, private uenService: UenService, private toastService: MyToastyService) {

  }

  ngOnInit() {
    Observable.forkJoin(
      this.getUserList(),
      this.getUenList()
    ).subscribe(
      result => {
        this.userList = result[0];
        this.uenList = result[1].data;

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

  getUserList() {
    return this.userService.getUsers();
  }

  getUenList() {
    return this.uenService.getUenList();
  }

  getAllowedProjectsByUserAndUenId() {
    return this.userService.getAllowedProjectsByUserAndUenId(this.targetUserId, this.targetUenId);
  }

  getNotAllowedProjectsByUserAndUenId() {
    return this.userService.getNotAllowedProjectsByUserAndUenId(this.targetUserId, this.targetUenId);
  }

  syncProjectsAccess() {
    if (this.targetUserId == "" || this.targetUenId == "") {
      return;
    }

    this.loading = true;
    Observable.forkJoin(
      this.getAllowedProjectsByUserAndUenId(),
      this.getNotAllowedProjectsByUserAndUenId()
    ).subscribe(
      result => {
        this.allowedProjects = result[0].data;
        this.notAllowedProjects = result[1].data;
        this.freeUenAccess = result[0].freeUenAccess;
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

  onUserChange(targetUserId) {
    this.targetUserId = targetUserId;
    this.syncProjectsAccess()
  }

  onUenChange(targetUenId) {
    this.targetUenId = targetUenId;
    this.syncProjectsAccess()
  }

  syncLists(e) {
    this.listToSync = e.selected;
    this.couldSave = true;
  }

  redirectTo() {
    this.router.navigate(['/app']);
  }

  save() {
    this.userService.updateAllowedProjects(this.targetUserId, this.targetUenId, this.listToSync.map(project => project.value), this.freeUenAccess)
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
