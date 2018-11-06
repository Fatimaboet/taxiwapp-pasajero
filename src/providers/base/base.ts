import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { ToastController, Toast, LoadingController, Loading } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';


/*
  Generated class for the BaseProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class BaseProvider {

  private loader: Loading;
  private toast: Toast;

  constructor(
    public http: HttpClient,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private translate: TranslateService
  ) {
  }

  startLoading(text: string = ''){
    this.loader = this.loadingCtrl.create({
      content: text,
      duration: 3000
    });
    this.loader.present();
  }

  stopLoading(){
    this.loader.dismiss();
  }

  showToast(text?: string, cssClass?: "alert" | "warning",position?: "top" | "bottom" | "middle", duration: number = 4000){
    this.translate.get(text).subscribe( 
      value => {
        this.toast = this.toastCtrl.create({
          message: value,
          position: position,
          duration: duration,
          cssClass: cssClass
        });
        this.toast.present();
    });
  }


}
