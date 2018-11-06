import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';
import { HomePage } from '../home/home';
import { HelpPage } from '../help/help';
import { PoliticsModalPage } from '../politics-modal/politics-modal';
/**
 * Generated class for the PoliticsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-politics',
  templateUrl: 'politics.html',
})
export class PoliticsPage {

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public modalCtrl: ModalController
    ) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad PoliticsPage');
  }

  gotoHelp(){
  	this.navCtrl.setRoot(HelpPage);
  }

  goBack(){
  	this.navCtrl.setRoot(HomePage);
  }

  presentProfileModal(type) {
    let profileModal = this.modalCtrl.create(PoliticsModalPage, {typeS: type});
    profileModal.present();
  }


}



