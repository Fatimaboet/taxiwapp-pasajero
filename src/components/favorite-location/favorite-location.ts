import { Component, ViewChild, ElementRef, Renderer2, NgZone } from '@angular/core';
import { ModalController, ViewController, NavParams } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';
import { ServiceProvider } from '../../providers/service/service';
import { BaseProvider } from '../../providers/base/base';
import { Favorite } from '../../class/favorite';
import { Service } from '../../class/service';
import { TypeServiceComponent } from '../../components/type-service/type-service';

import * as moment from 'moment';

declare var google;
/**
 * Generated class for the FavoriteLocationComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'favorite-location',
  templateUrl: 'favorite-location.html'
})
export class FavoriteLocationComponent {

  text: string;
  latitude: string;
  longitude: string;
  locations: Array<any>;

  public favorite: Favorite;
  public favoriteStart: Favorite = new Favorite();
  public favoriteFinish: Favorite = new Favorite();
  public addDescriptionFavorite: boolean = false;

  public directions = {
    "start": '',
    "finish": '',
    "date": moment().format('YYYY-MM-DD HH:mm:ss'),
    "favorite": '',
    "puntoGeo": ''
  }

  @ViewChild("places") public places: ElementRef;


  constructor(private nav: NavParams, 
    private viewCtrl: ViewController, 
    private renderer: Renderer2, 
    private er: ElementRef, 
    private service: ServiceProvider,
    private base: BaseProvider,
    private modalCtrl: ModalController,
    private zone: NgZone
  ) {
    if (nav.get('start')) {
      this.directions.start = nav.get('start');
    }
    if (nav.get('finish')) {
      this.directions.finish = nav.get('finish');
    }
    if (nav.get('lat')) {
      this.latitude = nav.get('lat');
    }
    if (nav.get('lng')) {
      this.longitude = nav.get('lng');
    }
    this.getFavorites();
  }

  ionViewDidLoad() {
    setTimeout(() => {
      document.getElementById('places').getElementsByTagName('input')[0].focus();
      console.log('mapa')
      this.initMap();
    }, 500);
  }

  close(){
    this.viewCtrl.dismiss();
  }

  initMap() {
    const options = {
      types: ['address'],
      componentRestrictions: { country: "mx" }
    };
    if (document.getElementById('places')) {
      const inputElement = document.getElementById('places').getElementsByTagName('input')[0];
      let autocomplete = new google.maps.places.Autocomplete(inputElement, options);
      google.maps.event.addListener(autocomplete, 'place_changed', () => {
        let place = autocomplete.getPlace();
        this.latitude = place.geometry.location.lat();
        this.longitude = place.geometry.location.lng();
        this.text = place.formatted_address;
        this.directions.finish = place.formatted_address;
        this.directions.puntoGeo = this.longitude + ' ' + this.latitude;
        console.log(this.text);
        console.log(this.latitude, this.longitude);
        place.address_components.map(value => {
          if (value.types[0] === "locality") {
            //this.text = value.short_name;
            console.log(this.text);
          }
        })
      });
    }
  }

  getFavorites() {
    this.service.getFavorites().toPromise().then(
      resp => {
        console.log(resp)
        this.locations = resp.recordset;
      },
      error => {
        console.log(error)
      }
    )
  }

  selectLocation(item){
    console.log(item)
    this.latitude = item.puntoGeografico.points[0].x
    this.longitude = item.puntoGeografico.points[0].y
    this.text = item.Direccion;
    this.directions.finish = item.Direccion;
    document.getElementById('places').getElementsByTagName('input')[0].value = this.text;
  }

  addFavorite(control: string){
    if (this.directions.finish == '') {
      this.base.showToast('addaddressBefore')
    } else {
      this.favoriteFinish = {
        select: true,
        Descripcion: '',
        Direccion: this.directions.finish,
        puntoGeografico: this.directions.puntoGeo,
      };
      this.favorite = this.favoriteFinish;
      this.addDescriptionFavorite = true;
    }
  };

  saveFavorite(){
    this.favorite.Descripcion = this.directions.favorite;
    if (this.favorite.Descripcion) {
      this.base.startLoading('');
      this.service.addFavorite(this.favorite).toPromise().then(
        resp => {
          if(resp.recordset[0].idUbicacionFavorita){
            this.addDescriptionFavorite = false;
            this.base.stopLoading();
            this.base.showToast('placesavedFavorites');
            this.getFavorites();
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
  };

  accept() {
    if (this.directions.finish != '') {
      this.viewCtrl.dismiss();
      const modal = this.modalCtrl.create(TypeServiceComponent, {start: this.directions.start, finish: this.directions.finish, lat: this.latitude, lng: this.longitude});
      modal.onDidDismiss(data => {
        if (data) {
          console.log(data);
        }
      });
      modal.present();
    } else {
      this.base.showToast('Ingrese o seleccione una dirección de destino')
    };
  };


}
