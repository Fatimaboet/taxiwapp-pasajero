import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';

import { Observable } from 'rxjs';

import { HomePage } from '../home/home';

import { AuthProvider } from '../../providers/auth/auth';
import { BaseProvider } from '../../providers/base/base';

/**
 * Generated class for the SosPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-sos',
  templateUrl: 'sos.html',
})
export class SosPage {

  count: number;
  id: number;
  stop = false;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public auth: AuthProvider,
    public base: BaseProvider,
    public alertCtrl: AlertController
  ) {
    this.count = 5;
  }

  ionViewDidLoad() {
    this.id = this.navParams.get("service");
    this.discount();
  }

  discount(){
    Observable.interval(1000)
    .takeWhile(() => (!this.stop && this.count > 0 ) )
    .subscribe(i => { 
      this.count--;
      if (this.count == 0) {
        this.sos();
      }
    })
  }

  sos(){
    this.auth.SOS(this.id).toPromise().then(
      resp => {
        this.base.showToast('Alarma enviada con exito!')
        setTimeout(()=>{
          this.navCtrl.setRoot(HomePage);
        }, 2000)        
      },
      error => {
        this.base.showToast('error');
      }
    )
  }
  cancel(){
    // this.stop = true;
    const confirm = this.alertCtrl.create({
      title: 'Emergencia SOS',
      message: 'Dejar de llamar',
      buttons: [
        {
          text: 'Cancelar',
          handler: () => {
            console.log('Disagree clicked');
            this.stop = false;
          }
        },
        {
          text: 'De acuerdo',
          handler: () => {
            console.log('Agree clicked');
            this.stop = true;
            this.navCtrl.pop();
          }
        }
      ]
    });
    confirm.present();
  } 
}
