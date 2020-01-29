import { Component } from '@angular/core';
import { ViewController, IonicPage, NavParams, } from 'ionic-angular';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { Geolocation } from '@ionic-native/geolocation';
import { ToastService } from '../../services/services';
import { message } from '../../clientsSharedModule/sharedmodule';

@Component({
    selector: 'page-cameraModal',
    templateUrl: 'cameraModal.html',
    providers: [Camera, Geolocation, ToastService]
})
export class CameraModalPage {
    image: string = "";
    latitude: any;
    longitude: any;
    readOnly: boolean = false;
    options: CameraOptions = {};
    constructor(public viewCtrl: ViewController, public params: NavParams, private camera: Camera, private geolocation: Geolocation, private toastService: ToastService) {
        this.image = params.get('image') || "";
        this.readOnly = params.get('readOnly') || false;
        this.options = {
            quality: 50,
            destinationType: this.camera.DestinationType.DATA_URL,
            encodingType: this.camera.EncodingType.JPEG,
            mediaType: this.camera.MediaType.PICTURE
        }
    }
    galeryPicture() {
        this.options.sourceType = 0;
        this.getPicture();
    }
    cameraPicture() {
        this.options.sourceType = 1;
        this.getPicture();

    }
    albumPicture() {
        this.options.sourceType = 2;
        this.getPicture();

    }

    removePicture() {
      this.image = '';
    }

    getPicture() {
        this.camera.getPicture(this.options).then((imageData) => {
            if (!imageData) {
                return;
            }
            this.image = 'data:image/jpeg;base64,' + imageData;
            this.geolocation.getCurrentPosition().then((resp) => {
                this.latitude = resp.coords.latitude;
                this.longitude = resp.coords.longitude;
            })

        });
    }

    dismiss(result: boolean) {
        if (!result) {
            this.image = this.params.get('image') || "";
        }
        let data = { 'result': this.image, 'latitude': this.latitude, 'longitude': this.longitude, 'wasCanceled': !result };
        this.viewCtrl.dismiss(data);
    }

}
