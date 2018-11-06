import { Component, ElementRef, Renderer, ViewChild, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';

import { FavoriteLocationComponent } from '../../components/favorite-location/favorite-location';
import { PaymentMethodComponent } from '../../components/payment-method/payment-method';
import { Segurity1Component } from '../../components/segurity/segurity';
import { CancelPage } from '../cancel/cancel';
import { SosPage } from '../sos/sos';
import { HomePage } from '../home/home';

import { ServiceProvider } from '../../providers/service/service';
import { PaymentProvider } from '../../providers/payment/payment';
import { BaseProvider } from '../../providers/base/base';

import { environment } from '../../environments/environment';


import * as moment from 'moment';

/**
 * Generated class for the ServiceDriverPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-service-driver',
  templateUrl: 'service-driver.html',
})
export class ServiceDriverPage implements OnInit {

  id: number;
  expanded: boolean;
  newPoint: string;
  paymentMethods: Array<any>;
  payment: any;
  driver: any;
  coord: string;
  init: boolean = false;
  public route = environment.documents;
  puntoOrigen: any;
  puntoDestino: any;
  costo: number;
  @ViewChild('accordionContent') elementView: ElementRef;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public renderer: Renderer,
    private modalCtrl: ModalController,
    private services: ServiceProvider,
    private base: BaseProvider,
    private paymentService: PaymentProvider,
  ) {
  }

  ngOnInit() {
    this.id = this.navParams.get("service");
    this.driver = this.navParams.get("driver");
    let location = this.navParams.get("location");
    if (location) {
      this.puntoOrigen = location.puntoOrigen;
      this.puntoDestino = location.puntoDestino;
    }
    if (!this.driver) {
      this.navCtrl.setRoot(HomePage);
      return;
    }
    this.costo = this.driver.costoinicial;
    this.get(this.id);
    this.renderer.setElementStyle(this.elementView.nativeElement, 'height', 0 + 'px');
    this.getMethod();
  }

  setLatLng(latLng){
    this.coord = latLng.lng +' '+ latLng.lat;
  }

  toggleAccordion() {
    this.expanded = !this.expanded;
    const newHeight = this.expanded ? '100%' : '0px';
    this.renderer.setElementStyle(this.elementView.nativeElement, 'height', newHeight);
  }

  get(id) {
    this.services.get(id).toPromise().then(
      data => {
        console.log(data)
      }
    );
  }

  edit() {
    const modal = this.modalCtrl.create(FavoriteLocationComponent);
    modal.onDidDismiss(data => {
      if (data) {
        let coord = data.lng +' '+ data.lat;
        this.newPoint = coord;
        console.log(coord);
      }
    });
    modal.present();
  }

  getMethod(){
    this.paymentService.getPaymentMethod().toPromise().then(
      resp => {
        console.log(resp);
        this.paymentMethods = resp.recordset;
        this.payment = this.paymentMethods;
      },
      error => {
        console.log(error)
      }
    )
  }

  goPayments(){
    let modal = this.modalCtrl.create(PaymentMethodComponent);
    modal.present();
    modal.onDidDismiss((method) => {
      if (method) {
        this.payment = method;
      }
    })
  }

  segurity(){
    let modal = this.modalCtrl.create(Segurity1Component, {id: this.id});
    modal.present();
    modal.onDidDismiss(() => {
    })
  }

  cancelService(){
    this.navCtrl.push(CancelPage, {service: this.id, driver: this.driver});
  }

  finish(){

  }
  sos(){
    this.navCtrl.push(SosPage, {id: this.id});
  }

  initService(){
    this.base.startLoading();
    this.services.initService({id: this.id, puntopartida: this.newPoint || this.puntoOrigen }).toPromise().then(
      resp => {
        console.log(resp)
        this.base.stopLoading();
        if (resp.recordset[0].idViajeIniciado){
          this.base.showToast('Viaje iniciado');
          this.init = true;
        } else {
          this.base.showToast('error','alert');
        }
      },
      error => {
        this.base.stopLoading();
        this.base.showToast('error','alert');
        console.log(error)

      }
    )
  }

}
