import { Component } from '@angular/core';
import { Events, ModalController, ViewController, NavParams } from 'ionic-angular';
import { ServiceProvider } from '../../providers/service/service'
import { FavoriteLocationComponent } from '../../components/favorite-location/favorite-location';
import { PaymentProvider } from '../../providers/payment/payment';
import { PaymentMethodComponent } from '../../components/payment-method/payment-method';
import { BaseProvider } from '../../providers/base/base';
import * as moment from 'moment';
/**
 * Generated class for the TypeServiceComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'type-service',
  templateUrl: 'type-service.html'
})
export class TypeServiceComponent {

  public typeServices: Array<any>;
  public idTipoServicio;
  public paymentMethod;
  public payment;
  public dateTrip = {
  	start: '',
  	finish: '',
  	latitude: '',
  	longitude: '',
  	date: moment().format('YYYY-MM-DD HH:mm:ss'),
  	idTipoServicio: ''
  }

  minDate: string = moment().format('YYYY-MM-DD');
  maxDate: string = moment().add(2, 'days').format('YYYY-MM-DD');

  constructor(
  	private nav: NavParams,
  	private services: ServiceProvider, 
  	private viewCtrl: ViewController,
  	private modalCtrl: ModalController,
  	private paymentService: PaymentProvider,
  	public events:Events,
  	private base: BaseProvider
  	) {
    this.dateTrip.start = nav.get('start');
    this.dateTrip.finish = nav.get('finish');
    this.dateTrip.latitude = nav.get('lat');
    this.dateTrip.longitude = nav.get('lng');
    console.log(this.dateTrip);
    this.getTypeServices();
    this.getMethod();
  }

  getTypeServices() {
    this.services.getTypeServices().toPromise().then(
      resp => {
        console.log(resp);
        this.typeServices = resp.recordset;
      },
      error => {
      }
    )
  };

  setTypeService(id){
    this.idTipoServicio = id;
    this.dateTrip.idTipoServicio = id;
  };

  close(){
  	this.viewCtrl.dismiss();
    const modal = this.modalCtrl.create(FavoriteLocationComponent, {start: this.dateTrip.start, finish: this.dateTrip.finish, lat: this.dateTrip.latitude, lng: this.dateTrip.longitude});
    modal.onDidDismiss(data => {
      if (data) {
        
      }
    });
    modal.present();
  };

  getMethod(){
    this.paymentService.getPaymentMethod().toPromise().then(
      resp => {
        this.paymentMethod = resp.recordset;
        for (var i = 0; i < this.paymentMethod.length; ++i) {
        	if (this.paymentMethod[i].Predeterminada) {
        		if (this.paymentMethod[i].numero) {
        			this.payment = this.paymentMethod[i];
        		} else {
        			this.payment.numero = 'Efectivo';
        		}
        	}
        }
      },
      error => {
        console.log(error)
      }
    )
  };

  goPayments(){
    let modal = this.modalCtrl.create(PaymentMethodComponent);
    modal.present();
    modal.onDidDismiss((method) => {
      if (method) {
        if (method.numero) {
			this.payment = method;
		} else {
			this.payment.numero = 'Efectivo';
		}
      }
    })
  };

  send() {  
  	if (this.dateTrip.idTipoServicio != '') {
  		this.events.publish('trip:Status', this.dateTrip);
    	this.viewCtrl.dismiss();
  	} else {
  		this.base.showToast('Debe seleccionar un tipo de servicio')
  	}
  }

}
