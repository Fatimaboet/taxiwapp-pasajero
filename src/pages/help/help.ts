import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { HomePage } from '../home/home';
import { HelpProvider } from '../../providers/help/help';
import { BaseProvider } from '../../providers/base/base';
/**
 * Generated class for the HelpPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-help',
  templateUrl: 'help.html',
})
export class HelpPage {

  public message: string = '';
  public listConversation: any = [];

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public help: HelpProvider,
    private baseService: BaseProvider
    ) {
  }

  ionViewDidLoad() {
    this.getConversations();
  }

  goBack(){
  	this.navCtrl.setRoot(HomePage);
  }

  getConversations() {
    this.help.getConversation().subscribe(
      resp => {
        if (resp.recordset[0].codigo == 1) {
          this.baseService.showToast(resp.recordset[0].Mensaje);
        } else {
          this.listConversation = resp.recordset;
        }
      },
      error => {
        console.log(error);
      }
    );
  };

  sendConversations() {
    this.baseService.startLoading('Enviando mensaje...');
    this.help.sendConversation(this.message).subscribe(
      resp => {
        this.baseService.stopLoading();
        if (resp.recordset[0].codigo == 1) {
          this.baseService.showToast(resp.recordset[0].Mensaje);
        } else {
          this.message = '';
          this.getConversations();
        }
      },
      error => {
        console.log(error);
      }
    );
  };

}
