import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { BillsProvider } from '../../providers/bills/bills';
import { BaseProvider } from '../../providers/base/base';
import { ServiceProvider } from '../../providers/service/service';
import { HomePage } from '../home/home';
import { DatePipe } from '@angular/common';
import { Geolocation } from '@ionic-native/geolocation';
import { Platform } from 'ionic-angular';

import { Service } from '../../class/service';

/**
 * Generated class for the TravelsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-travels',
  templateUrl: 'travels.html',
})
export class TravelsPage {

  public steps: string = "concluded";
  public showDetails: boolean = true;

  travels: Array<Service>;
  programs: Array<Service>;
  travel: Service;

  loader: boolean = false;
  marketsDrivers: Array<any> = [];
  marketOrigin: any;
  marketDestiny: any;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public bill: BillsProvider,
    public services: ServiceProvider,
    private baseService: BaseProvider,
    private datePipe: DatePipe,
    private geolocation: Geolocation, 
    public platform: Platform
  ) {
    this.travels = [
      {
        id:1,
        idTipoServicio: 3,
        puntoDestino : "-98.97648559999999 19.3429708",
        puntoOrigen : "-98.98172590000001 19.3607947",
        fechaHoraSolicitud: "24 Oct 2018 21:18",
        idEstatusViaje: 6,
        costo: 38,
      },
      {
        id:2,
        idTipoServicio: 3,
        puntoDestino : "-99.15775350000001 19.4303752",
        puntoOrigen : "-99.14669409999999 19.3956294",
        fechaHoraSolicitud: "26 Oct 2018 10:48",
        idEstatusViaje: 6,
        costo: 56.4,
      },

    ];

    this.programs = [
      {
        id:1,
        idTipoServicio: 3,
        puntoDestino : "-98.95648559999999 19.6429708",
        puntoOrigen : "-98.88172590000001 19.5607947",
        fechaHoraSolicitud: "17 Oct 2018 10:45",
        idEstatusViaje: 6,
        costo: 38,
      },
      {
        id:2,
        idTipoServicio: 3,
        puntoDestino : "-99.05775350000001 19.5503752",
        puntoOrigen : "-99.11669409999999 19.4356294",
        fechaHoraSolicitud: "19 Oct 2018 22:29",
        idEstatusViaje: 6,
        costo: 56.4,
      },

    ]
  }

  ionViewDidLoad() {
    this.getProgrames();
    // this.getTravel();

  }

  goBack(){
    if (!this.showDetails && this.steps == 'earnings') {
      this.showDetails = true;
    } else {
      this.navCtrl.setRoot(HomePage);    
    }    
  }






  getTravel(){
    this.services.getLastServices().subscribe(
      resp => {
        console.log(resp);
        if (resp.recordset[0].Mensaje) {
          this.baseService.showToast(resp.recordset[0].Mensaje);
        } else {
          this.travels = resp.recordset[0];
        }
      },
      error => {
      }
    );
  }

  getProgrames(){
    this.services.getProgrames().subscribe(
      resp => {
        console.log(resp);
        if (resp.recordset[0].Mensaje) {
          this.baseService.showToast(resp.recordset[0].Mensaje);
        } else {
          this.travels = resp.recordset[0];
        }
      },
      error => {
      }
    );
  }

  setTravel(t: Service){
    this.travel = t;
  }


}
