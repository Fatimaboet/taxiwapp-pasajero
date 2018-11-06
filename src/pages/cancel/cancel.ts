import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { HomePage } from '../home/home';

import { environment } from '../../environments/environment';

import { ServiceProvider } from '../../providers/service/service';
import { BaseProvider } from '../../providers/base/base';
/**
 * Generated class for the CancelPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-cancel',
  templateUrl: 'cancel.html',
})
export class CancelPage {

  public id: number;
  public motives: Array<any>;
  public motive: any;
  public driver: any;
  public route = environment.documents;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public service: ServiceProvider,
    public base: BaseProvider) {
  }

  ionViewDidLoad() {
    this.id = this.navParams.get("service");
    this.driver = this.navParams.get("driver");
    this.getMotiveCancel();

  }

  getMotiveCancel() {
    this.base.startLoading();
    this.service.getMotiveCancel().toPromise().then(
      resp => {
        this.base.stopLoading();
        this.motives = resp.recordset;
        console.log(this.motives)
      },
      error => {
        this.base.stopLoading();
      }
    )
  }

  cancelService(){
    this.base.startLoading();
    let index = this.motives.indexOf(this.motive) + 1;
    this.service.addMotiveCancel(this.id, index).toPromise().then(
      resp => {
        console.log(resp);
        this.base.stopLoading();
        if (resp.recordset[0].idViajeCancelacion) {
          this.base.showToast("El viaje a sido cancelado con exito!");
          setTimeout(() => {
            this.navCtrl.push(HomePage);
          }, 500);
        } else {
          this.base.showToast("No se ha podido cancelar el viaje");
        }
      },
      error => {
        this.base.stopLoading();
        this.base.showToast("No se ha podido cancelar el viaje");
        console.log(error)
      }
    );
  }

  goBack(){
    this.navCtrl.pop();
  }


}
