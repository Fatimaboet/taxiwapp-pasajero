import { Component, ViewChild, ElementRef, Renderer, NgZone } from '@angular/core';
import { Events, NavController, ModalController, ToastController, Toast, AlertController, Platform } from 'ionic-angular';
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
  public route = environment.documents;

  public submited: boolean = false;

  public typeServices: Array<any>;

  paymentMethods: Array<any> = [];
  payment: any;

  public toast: Toast;

  expanded: boolean;
  costo: number;

  propina: number;

  pin: string;

  intervalAwait: any;

  loader: boolean = false;
  map: google.maps.Map;
  marketsDrivers: Array<any> = [];
  markers: any = [];
  marketOrigin: google.maps.Marker;
  marketDestiny: google.maps.Marker;
  datos: any;

  directionsDisplay: google.maps.DirectionsRenderer;
  directionsService: google.maps.DirectionsService;

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
    private vibration: Vibration,
    private geolocation: Geolocation,
    private zone: NgZone,
    public platform: Platform,
    public events:Events
  ) {
    this.form = new FormGroup({
      "start": new FormControl('', Validators.compose([Validators.required])),
      "finish": new FormControl('', Validators.compose([Validators.required])),
      "date": new FormControl(moment().format('YYYY-MM-DD HH:mm:ss')),
      "favorite": new FormControl(''),
    });
    this.directionsDisplay = new google.maps.DirectionsRenderer();
    this.directionsService = new google.maps.DirectionsService();
    console.log({service: this.service});
    this.events.subscribe('trip:Status', data => {
      console.log(data);
      this.datos = data;
      if (this.datos) {
        this.service.idTipoServicio = this.datos.idTipoServicio;
        this.service.puntoDestino = this.datos.longitude + ' ' + this.datos.latitude;
        this.form.patchValue({finish: this.datos.finish});
        this.form.patchValue({date: this.datos.date});
        this.addService();
      }
    })
  }

  ionViewDidLoad() {
    this.getPosition();
    //this.getTypeServices();
  }

  ionViewCanEnter() {
    return !!this.auth.guardAuthenticated();
  }

  /*getTypeServices() {
    this.services.getTypeServices().toPromise().then(
      resp => {
        console.log(resp);
        this.typeServices = resp.recordset;
      },
      error => {
      }
    )
  };*/

  getPosition(){
    let latitude: number;
    let longitude: number;
    let optionsGPS = {timeout: 13000, enableHighAccuracy: true};
    this.geolocation.getCurrentPosition().then( response => {
      latitude = response.coords.latitude;
      longitude = response.coords.longitude;
      let location = longitude +' '+ latitude;
      if (this.service.puntoOrigen) {
        console.log('entro');
        this.markers.forEach(value=>{
          if (value.posRef === 'start') value.setMap(null);
        });
        let latLng = new google.maps.LatLng(latitude, longitude);
        this.createMarker(latLng,'start',true,null,'Origen');
      } else {
        this.loadMap(latitude, longitude);
      }    
      this.geocodeLatLng(latitude,longitude);
      this.getDrivers(location);
    })
    .catch(error =>{
      if (navigator) {
        navigator.geolocation.getCurrentPosition((position) => {
          latitude = position.coords.latitude;
          longitude = position.coords.longitude;
          let location = longitude +' '+ latitude;
          if (this.service.puntoOrigen) {
            this.markers.forEach(value=>{
              if (value.posRef === 'start') value.setMap(null);
            });
            let latLng = new google.maps.LatLng(latitude, longitude);
            this.createMarker(latLng,'start',true,null,'Origen');
          } else {
            this.loadMap(latitude, longitude);
          } 
          this.geocodeLatLng(latitude,longitude);
          this.getDrivers(location);
        });
      } else {
        if(google.loader.ClientLocation) {
          latitude = google.loader.ClientLocation.latitude;
          longitude = google.loader.ClientLocation.longitude;
          let location = longitude +' '+ latitude;
          if (this.service.puntoOrigen) {
            this.markers.forEach(value=>{
              if (value.posRef === 'start') value.setMap(null);
            });
            let latLng = new google.maps.LatLng(latitude, longitude);
            this.createMarker(latLng,'start',true,null,'Origen');
          } else {
            this.loadMap(latitude, longitude);
          } 
          this.geocodeLatLng(latitude,longitude);
          this.getDrivers(location);
        }
      }
    })
  };

  loadMap(latitude: number, longitude: number){
    let myLatLng = {lat: latitude, lng: longitude};
    let mapEle: HTMLElement = document.getElementById('map');
    
    this.map = new google.maps.Map(mapEle, {
      center: myLatLng,
      zoom: 16,
      styles: [
        {
          "elementType": "geometry",
          "stylers": [
            {
              "color": "#f5f5f5"
            }
          ]
        },
        {
          "elementType": "labels.icon",
          "stylers": [
            {
              "visibility": "off"
            }
          ]
        },
        {
          "elementType": "labels.text.fill",
          "stylers": [
            {
              "color": "#616161"
            }
          ]
        },
        {
          "elementType": "labels.text.stroke",
          "stylers": [
            {
              "color": "#f5f5f5"
            }
          ]
        },
        {
          "featureType": "administrative.land_parcel",
          "elementType": "labels.text.fill",
          "stylers": [
            {
              "color": "#bdbdbd"
            }
          ]
        },
        {
          "featureType": "poi",
          "elementType": "geometry",
          "stylers": [
            {
              "color": "#eeeeee"
            }
          ]
        },
        {
          "featureType": "poi",
          "elementType": "labels.text.fill",
          "stylers": [
            {
              "color": "#757575"
            }
          ]
        },
        {
          "featureType": "poi.park",
          "elementType": "geometry",
          "stylers": [
            {
              "color": "#e5e5e5"
            }
          ]
        },
        {
          "featureType": "poi.park",
          "elementType": "labels.text.fill",
          "stylers": [
            {
              "color": "#9e9e9e"
            }
          ]
        },
        {
          "featureType": "road",
          "elementType": "geometry",
          "stylers": [
            {
              "color": "#ffffff"
            }
          ]
        },
        {
          "featureType": "road.arterial",
          "elementType": "labels.text.fill",
          "stylers": [
            {
              "color": "#757575"
            }
          ]
        },
        {
          "featureType": "road.highway",
          "elementType": "geometry",
          "stylers": [
            {
              "color": "#e1f5fe"
            }
          ]
        },
        {
          "featureType": "road.highway",
          "elementType": "geometry.stroke",
          "stylers": [
            {
              "color": "#b3e5fc"
            }
          ]
        },
        {
          "featureType": "road.highway",
          "elementType": "labels.text.fill",
          "stylers": [
            {
              "color": "#616161"
            }
          ]
        },
        {
          "featureType": "road.local",
          "elementType": "labels.text.fill",
          "stylers": [
            {
              "color": "#9e9e9e"
            }
          ]
        },
        {
          "featureType": "transit.line",
          "elementType": "geometry",
          "stylers": [
            {
              "color": "#e5e5e5"
            }
          ]
        },
        {
          "featureType": "transit.station",
          "elementType": "geometry",
          "stylers": [
            {
              "color": "#eeeeee"
            }
          ]
        },
        {
          "featureType": "water",
          "elementType": "geometry",
          "stylers": [
            {
              "color": "#c9c9c9"
            }
          ]
        },
        {
          "featureType": "water",
          "elementType": "labels.text.fill",
          "stylers": [
            {
              "color": "#9e9e9e"
            }
          ]
        }
      ]  
    });
    google.maps.event.addListenerOnce(this.map, 'idle', () => {
      this.createMarker(myLatLng,'start',true,null,'Origen');    
      mapEle.classList.add('show-map');
      this.loader = false;
    });
  };

  createMarker(latlng, posRef, draggable, icons, title) {
    var marker = new google.maps.Marker({
      position: latlng,
      map: this.map,
      draggable: draggable,
      posRef: posRef,
      title: title
    });
    this.markers.push(marker);
    var that = this;
    this.map.setCenter(latlng);
    google.maps.event.addListener(marker, 'dragend', function() {
      var point = this.getPosition();
      that.map.setCenter(point);
      that.geocodeLatLng(point.lat(),point.lng());
    });
  };

  geocodeLatLng(lat,lng) {
    var end = {lat: lat, lng: lng};
    var that = this;
    let geocoder = new google.maps.Geocoder;
    geocoder.geocode({'location': end}, function(results, status) {
      if (status === 'OK') {
        if (results[1]) {
          that.form.patchValue({start: results[1].formatted_address});
          that.service.puntoOrigen = lng + ' ' + lat;
          /*if (that.service.puntoOrigen && that.service.puntoDestino) {
            let lat1 = that.service.puntoOrigen.split(" ")[1];
            let lng1 = that.service.puntoOrigen.split(" ")[0];
            let lat2 = that.service.puntoDestino.split(" ")[1];
            let lng2 = that.service.puntoDestino.split(" ")[0];
            that.shortestRoute(new google.maps.LatLng(lat1, lng1),new google.maps.LatLng(lat2, lng2));
          }*/
        } 
      }
    });
  };

  getDrivers(location) {
    this.services.getDrivers(this.service.idTipoServicio, location).toPromise().then(
      resp => {
        console.log(resp);
        this.drivers = resp.recordset;
        this.clearMarket();
        this.setDriversPositions();
      },
      error => {
      }
    )
  };

  clearMarket(){
    this.marketsDrivers.forEach(value=>{
      if (value) value.setMap(null);
    })
  };
  
  setDriversPositions(){
    this.marketsDrivers = [];
    let imagen = '../../assets/imgs/pin-car.png';
    console.log(this.drivers);
    this.drivers.forEach((value: any)=>{
      if (value) {
        if (value.UbicacionConductor) {
          console.log(value.UbicacionConductor)
          let point = new google.maps.LatLng(value.UbicacionConductor.split(" ")[1],value.UbicacionConductor.split(" ")[0]);
          let label = '';
          let marker = this.setMarker(point, label, imagen);
          this.marketsDrivers.push(marker);
        };
      };
    });
  }

  setMarker(position, label, imagen?) {
    return new google.maps.Marker({
      position: position,
      map: this.map,
      title: 'Position',
      icon: imagen || false,
      label: label,
      labelClass: "labels",
    });
  }

  shortestRoute(latLngOrigin:google.maps.LatLng, latLngDestiny:google.maps.LatLng) { 
    this.directionsDisplay.setMap(this.map);
    this.directionsService.route({
        origin: latLngOrigin,
        destination: latLngDestiny,
        avoidTolls: true,
        travelMode: google.maps.TravelMode.DRIVING
    }, (response, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
          this.directionsDisplay.setDirections(response);
          this.directionsDisplay.setOptions({
            suppressMarkers: true,
            preserveViewport: true,
            polylineOptions: { strokeColor: "#03a9f4" }
          });
        } else {
        }
    });
  }

  addLocation(control: string) {
    const modal = this.modalCtrl.create(FavoriteLocationComponent, {start: this.form.value.start});
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
  };

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
        if (method.numero) {
          this.payment = method;
        } else {
          this.payment.numero = 'Efectivo';
        }
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

  saveService(){
    if (this.form.invalid || !this.service.idTipoServicio || !this.service.puntoOrigen || !this.service.puntoDestino) {
      this.base.showToast('completeFields');
    } else if (!this.driver)
      this.base.showToast('selecione un conductor');
    else {
      console.log(this.form.value.date);
      if (this.form.value.date != '') {
        this.service.fechaHoraSolicitud = new Date(this.form.value.date).toISOString();
      }     
      this.base.startLoading();
      this.services.addService(this.service).toPromise().then(
        resp => {
          console.log(resp);
          if (resp.recordset) {
            this.service.id = resp.recordset[0].idViajes;
            this.services.addDriverService({id: this.service.id, idConductor: this.driver.idConductor, idVehiculo: this.driver.idVehiculo})
            .toPromise().then(
              resp => {
                this.base.showToast('El conductor ha sido invitado con exito');
                this.service.idEstatusViaje = 1;
                this.awaitDriver();
              },
              error => {
                console.log(error);
                this.base.showToast('error', 'alert');
              }
            );
            this.base.stopLoading();
          }
        },
        error => {
          console.log(error);
          this.base.showToast('error', 'alert');
        }
      );
    };
  };

  selectDriver(driver){
    console.log(driver);
    this.driver = driver;
    this.saveService();
  }
 
  selectDriverNot(){
    this.translate.get("selectDriver").subscribe(
      value => {
        this.toast = this.toastCtrl.create({
          message: value,
          position: "top",
          cssClass: "warning"
          //showCloseButton: true,
          //closeButtonText: "cancelar"
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
      if (this.toast) this.toast.dismiss(); 
      this.service = new Service();
      this.form.reset();
      this.drivers = null;
      this.submited = false;
      this.service.idEstatusViaje = 0; 
      this.getPosition();   
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
          cssClass: "warning"
          //showCloseButton: true,
          //closeButtonText: "cancelar"
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
          if (this.toast) this.toast.dismiss();
          this.base.showToast('Viaje cancelado');
          this.service = new Service();
          this.form.reset();
          this.drivers = null;
          this.submited = false;
          this.getPosition();
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
          this.getPosition();
        },
        error => this.base.showToast('Error', 'alert')
      );
    })
  }




}
