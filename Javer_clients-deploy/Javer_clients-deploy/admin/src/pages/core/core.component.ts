import { Component } from '@angular/core';
import { SharedUserService } from '../../clientsSharedModule/sharedmodule';
import { AppConfig } from '../../util/AppConfig';
import { MyToastyService } from '../../services/services';
import { message } from '../../clientsSharedModule/sharedmodule';

@Component({
  selector: 'core-root',
  templateUrl: './core.component.html',
  styleUrls: ['./core.component.css'],
  providers: [SharedUserService, MyToastyService]
})
export class CoreComponent {
  version = AppConfig.version;
  title = 'app';
  user = localStorage.getItem('CurrentUser');
  username = localStorage.getItem('UserName');
  permissions: any = {};
  access = localStorage.getItem('access');
  hidden = false;
  collapseable: any = {
    config: false,
    houses: false,
    blueprints: false,
    roles: false,
    users: false,
    checklist: false,
    workControl: false,
    reports: false,
    developer: false,
  };

  constructor(private userService: SharedUserService, private toastService: MyToastyService) {

  }

  ngOnInit() {
    this.getPermissions();
  }

  getPermissions() {
    this.userService.getPermissions(this.username).subscribe(
      result => {
        localStorage.setItem('user', JSON.stringify(result.user));
        localStorage.setItem('access', result.access);
        this.permissions = result.permissions;
      },
      error => {
          if(error.statusText = 'Method Not Allowed')
              this.toastService.addToast(error.error, this.toastService.toastyType.error);
          else
            this.toastService.addToast(message.user.permissions.error, this.toastService.toastyType.error);
      }
    );
  }
}
