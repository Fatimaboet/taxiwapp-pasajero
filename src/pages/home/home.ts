import { Component, ViewChild, ElementRef, Renderer } from '@angular/core';
import { NavController, ModalController, ToastController, Toast, AlertController } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';
import { Vibration } from '@ionic-native/vibration';

import { TranslateService } from '@ngx-translate/core';

import { ServiceDriverPage } from '../service-driver/service-driver';

import { FormGroup, FormControl, Validators } from '@angular/forms';

import { FavoriteLocationComponent } from '../../components/favorite-location/favorite-location';
import { PaymentMethodComponent } from '../../components/payment-method/payment-method';
import { Segurity1Component } from '../../components/segurity/segurity';
import { FinishServiceComponent } from '../../components/finish-service/finish-service';
import { CancelPage } from '../cancel/cancel';
import { SosPage } from '../sos/sos';

import { BaseProvider } from '../../providers/base/base';
import { AuthProvider } from '../../providers/auth/auth';
import { PaymentProvider } from '../../providers/payment/payment';
import { ServiceProvider } from '../../providers/service/service';

import { IntervalObservable } from "rxjs/observable/IntervalObservable";
import { Observable, TimeInterval } from 'rxjs';
import 'rxjs/add/operator/takeWhile';

import { environment } from '../../environments/environment';

import { Service } from '../../class/service';
import { Favorite } from '../../class/favorite';
import { Driver } from '../../class/driver';

import * as moment from 'moment';

declare var google;



/*6  Viaje Pagado
5  Viaje Finalizado
4  Cancelado Trayecto
3  En trayecto
2  Confirmado
1  Solicitado*/

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  public service: Service = new Service();

  public drivers: Array<Driver>;
  public driver: Driver;

  public form: FormGroup;
  public lat: number;
  public lng: number;
  public location: string;

  public selectTypeService: boolean;
  public addDescriptionFavorite: boolean;
  public route = environment.documents;

  public submited: boolean = false;

  public typeServices: Array<any>;

  public favorite: Favorite;
  public favoriteStart: Favorite = new Favorite();
  public favoriteFinish: Favorite = new Favorite();

  paymentMethods: Array<any> = [];
  payment: any;

  public toast: Toast;

  expanded: boolean;
  costo: number;

  propina: number;

  pin: string;



  @ViewChild('accordionContent') elementView: ElementRef;

  minDate: string = moment().format('YYYY-MM-DD');
  maxDate: string = moment().add(2, 'days').format('YYYY-MM-DD');

  constructor(
    public navCtrl: NavController,
    private modalCtrl: ModalController,
    public renderer: Renderer,
    private auth: AuthProvider,
    private services: ServiceProvider,
    private base: BaseProvider,
    public paymentService: PaymentProvider,
    public toastCtrl: ToastController,
    public translate: TranslateService,
    public alertCtrl: AlertController,
    private vibration: Vibration
  ) {

    this.addDescriptionFavorite = false;
    this.form = new FormGroup({
      "start": new FormControl('', Validators.compose([Validators.required])),
      "finish": new FormControl('', Validators.compose([Validators.required])),
      "date": new FormControl(moment().format('YYYY-MM-DD HH:mm:ss')),
      "favorite": new FormControl(''),
    });
    console.log({service: this.service})
    this.getTypeServices();
  }

  ionViewDidLoad() {

    // this.getDrivers();
    // this.getMethod();

  }

  ionViewCanEnter() {
    return !!this.auth.guardAuthenticated();
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
  }

  async getDrivers(location) {
    await this.services.getDrivers(this.service.idTipoServicio, location).toPromise().then(
      resp => {
        console.log(resp);
        return this.drivers = resp.recordset;
      },
      error => {
      }
    )
  }

  setPosition(control: string) {
    let lat = this.lat;
    let lng = this.lng;
    let geocoder = new google.maps.Geocoder;
    console.log({lat, lng, control});
    geocoder.geocode({'location': {lat, lng}}, (results, status) => {
      if (status === 'OK') {
        console.log(results)
        this.form.controls[control].setValue(results[0].formatted_address);
        let coord = lng +' '+ lat;
        if (control === "start") {
          this.service.puntoOrigen = coord;
        } else {
          this.service.puntoDestino = coord;
        }
      } else {
        // window.alert('Geocoder failed due to: ' + status);
      }
    });
  }

  setTypeService(id){
    this.service.idTipoServicio = id;
    this.selectTypeService = false;
  }

  setLatLng(latLng){
    this.lat = latLng.lat;
    this.lng = latLng.lng;
    this.location = latLng.lng +' '+ latLng.lat;
    this.getDrivers(this.location);
  }

  addLocation(control: string) {
    const modal = this.modalCtrl.create(FavoriteLocationComponent);
    modal.onDidDismiss(data => {
      if (data) {
        this.form.controls[control].setValue(data.text);
        let coord = data.lng +' '+ data.lat;
        if (control === "start") {
          this.service.puntoOrigen = coord;
          console.log(this.service.puntoOrigen)
        } else {
          this.service.puntoDestino = coord;
          console.log(this.service.puntoDestino)
        }
      }
    });
    modal.present();
  }

  addFavorite(control: string){
    if (!this.form.controls[control].value) {
      this.base.showToast('addaddressBefore')
    } else {
      if (control=='start') {
        this.favoriteStart = {
          select: true,
          Descripcion: '',
          Direccion: this.form.controls[control].value,
          puntoGeografico: this.service.puntoOrigen,
        };
        this.favorite = this.favoriteStart;
      } else {
        this.favoriteFinish = {
          select: true,
          Descripcion: '',
          Direccion: this.form.controls[control].value,
          puntoGeografico: this.service.puntoDestino,
        };
        this.favorite = this.favoriteFinish;
      }
      this.addDescriptionFavorite = true;
    }
  }

  saveFavorite(){
    this.favorite.Descripcion = this.form.value.favorite;
    this.addDescriptionFavorite = false;
    if (this.favorite.Descripcion) {
      this.services.addFavorite(this.favorite).toPromise().then(
        resp => {
          if(resp.recordset[0].idUbicacionFavorita){
            this.base.showToast('placesavedFavorites');
          } else {
            this.base.showToast('Error',"alert");
          }
        },
        error => {
          this.base.showToast('Error',"alert");
        }
      );
    } else {
      this.base.showToast('completeFields');
    }
  }

  toggleAccordion() {
    this.expanded = !this.expanded;
    const newHeight = this.expanded ? '100%' : '0px';
    this.renderer.setElementStyle(this.elementView.nativeElement, 'height', newHeight);
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
    let modal = this.modalCtrl.create(Segurity1Component, {id: this.service.id});
    modal.present();
    modal.onDidDismiss(() => {
    })
  }

  cancelService(){
    this.navCtrl.push(CancelPage, {service: this.service.id, driver: this.driver});
  }

  sos(){
    this.navCtrl.push(SosPage, {id: this.service.id});
  }

  submit() {
    console.log(this.service);
    if (this.submited)
      this.saveService();
    else
      this.addService();
  }

  async addService(){
    if (this.form.invalid || !this.service.idTipoServicio || !this.service.puntoOrigen || !this.service.puntoDestino) {
      this.base.showToast('completeFields');
    } else {
      this.base.startLoading();
      this.submited = true;
      this.selectDriverNot();
      await this.getDrivers(this.service.puntoOrigen);
      this.base.stopLoading();
    }
  }

  async saveService(){
    if (this.form.invalid || !this.service.idTipoServicio || !this.service.puntoOrigen || !this.service.puntoDestino) {
      this.base.showToast('completeFields');
    } else if (!this.driver)
      this.base.showToast('selecione un conductor');
    else {
      console.log(this.form.value.date);
      this.service.fechaHoraSolicitud = new Date(this.form.value.date).toISOString();
      this.base.startLoading();
      await this.services.addService(this.service).toPromise().then(
        resp => {
          this.service.id = resp.recordset[0].idViajes;
        },
        error => {
          this.base.showToast('error', 'alert');
        }
      );

      if (this.service.id) {
        await this.services.addDriverService({id: this.service.id, idConductor: this.driver.idConductor, idVehiculo: this.driver.idVehiculo})
          .toPromise().then(
            resp => {
              this.base.showToast('El conductor ha sido invitado con exito');
              this.service.idEstatusViaje = 1;
              this.awaitDriver();
            },
            error => {
              this.base.showToast('error', 'alert');
            }
        )
      } else {
        this.base.showToast('error','alert');
      }
      this.base.stopLoading();
    }

  }

  selectDriver(driver){
    console.log(driver);
    this.driver = driver;
  }
 

  selectDriverNot(){
    this.translate.get("selectDriver").subscribe(
      value => {
        this.toast = this.toastCtrl.create({
          message: value,
          position: "top",
          cssClass: "warning",
          showCloseButton: true,
          closeButtonText: "cancelar"
        });
        this.toast.present();
        this.toast.onDidDismiss(()=>{
          this.cancel();
        })
      }
    );
  }

  cancel(){
    console.log(this.service);
    if(this.service.idEstatusViaje == 0){
      this.service = new Service();
      this.form.reset();
      this.drivers = null;
      this.submited = false;
      this.service.idEstatusViaje = 0;
    }
  }

  awaitDriver(){
    this.awaitReplay();
    if (this.toast) this.toast.dismiss();
    this.translate.get("awaitDriver").subscribe(
      value => {
        this.toast = this.toastCtrl.create({
          message: value,
          position: "top",
          cssClass: "warning",
          showCloseButton: true,
          closeButtonText: "cancelar"
        });
        this.toast.present();
        this.toast.onDidDismiss(()=>{
          this.cancelDriver();
        })
      }
    );
  }

  cancelDriver(){
    console.log(this.service);
    if(this.service.idEstatusViaje !== 2){
      this.driver = null;
      //this.selectDriverNot();
      this.services.cancelDriverTravel(this.service.id).subscribe(
        resp => {
          this.base.showToast('Viaje cancelado');
          this.service = new Service();
          this.form.reset();
          this.drivers = null;
          this.submited = false;
        },
        error => {
          this.base.showToast('Error', 'alert');
        }
      );
    }
  }

  awaitReplay(){
    console.log(this.service)
    if (this.service.id) {
      console.log('paso 3')
      this.services.getStatus(this.service.id).toPromise().then(
        resp => {
          console.log(resp)
          this.service.idEstatusViaje = resp.recordset[0].idEstatusViaje;

          if (resp.recordset[0].idEstatusViaje == 2) {
            this.goServiceDriver();
          } 

          if (resp.recordset[0].idEstatusViaje == 3) {
            this.calcTaximetro();
            //this.getAlert();
          }

          if (resp.recordset[0].idEstatusViaje == 5) {
           this.setPropine();
          }

          if(resp.recordset[0].idEstatusViaje == 7  || resp.recordset[0].idEstatusViaje == 4) {
            this.cancelDriver();
          }

          if(resp.recordset[0].idEstatusViaje < 4 ) {
            setTimeout(() => {
              this.awaitReplay();
            },10000);
          } else {
            this.toast.dismiss();
          }
        },
        error => {
        }
      )
    
    }

  }

  goServiceDriver(){
    this.service.idEstatusViaje = 2;
    this.costo = this.driver.costoinicial;
    this.toast.dismiss();
    setTimeout(()=>this.renderer.setElementStyle(this.elementView.nativeElement, 'height', 0 + 'px'));
  }

  calcTaximetro(){
    this.services.getTaximetro(this.service.id).subscribe(
      resp => {
        console.log({taximentro: resp})
        if (resp.recordset[0].SubTotal) {
          
        }
      },
      error => {

      }
    )
  }

  getAlert(){
    if (!this.pin) {
      setTimeout(()=>{
        this.vibration.vibrate(1000);
        let alert = this.alertCtrl.create({
          title: 'PIN de seguridad',
          cssClass: 'blue',
          inputs: [
            {
              name: 'pin',
              placeholder: 'pin',
              type: 'password',
            },
          ],
          buttons: [
            {
              text: 'Aceptar',
              handler: data => {
                console.log(data.pin)
                this.pin = data.pin;
                this.services.getPin({pin: this.pin, id: this.service.id}).subscribe(
                  resp => {
                    this.base.showToast('Notificación de seguridad enviada con exito!')
                  },
                  error => {

                  }
                )
              }
            }
          ],
        });
        alert.present();
      }, 30000);
    }
  }

  initService(){
    this.base.startLoading();
    this.services.initService({id: this.service.id, puntopartida: this.service.puntoOrigen }).toPromise().then(
      resp => {
        console.log(resp)
        this.base.stopLoading();
        if (resp.recordset[0].idViajeIniciado){
          this.base.showToast('Viaje iniciado');
          this.service.idEstatusViaje = 3;
          this.calcTaximetro();
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

  setPropine(){
    let alert = this.alertCtrl.create();
    alert.setTitle('Finalizar');
    alert.setSubTitle('¿Has llegado a tu destino correcto?');

    alert.addInput({
      type: 'radio',
      label: 'Agregar propina 10%',
      value: '10',
      checked: true
    });
    alert.addInput({
      type: 'radio',
      label: 'Agregar propina 15%',
      value: '15'
    });
    alert.addInput({
      type: 'radio',
      label: 'Agregar propina 20%',
      value: '20'
    });
    alert.addInput({
      type: 'radio',
      label: 'No deseo agregar propina',
      value: '0'
    });

    alert.addButton('Cancel');
    alert.addButton({
      text: 'OK',
      handler: data => {
        this.propina = data;
        console.log(data);
        this.finish()
      }
    });
    alert.present();
  }

  finish(){
    let data = {
      id: this.service.id,
      propine: this.propina,
      base: this.driver.costoinicial,
      // method: this.paymentMethods
    }
    let modal = this.modalCtrl.create(FinishServiceComponent, data);
    modal.present();
    modal.onDidDismiss(() => {
      this.base.startLoading();
      this.services.finishService({id: this.service.id, propine: this.propina, point: this.service.puntoDestino}).subscribe(
        resp => {
          this.service.idEstatusViaje = 5;
          this.base.showToast('Viaje finalizado con exito!')
          this.base.stopLoading();
          this.service = new Service();
          this.form.reset();
          this.drivers = null;
          this.submited = false;
          this.costo = 0;
        },
        error => this.base.showToast('Error', 'alert')
      );
    })
  }




}
