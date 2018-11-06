import { Component, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { ModalController, ViewController } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';
import { ServiceProvider } from '../../providers/service/service';
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

  @ViewChild("places") public places: ElementRef;


  constructor(private viewCtrl: ViewController, private renderer: Renderer2, private er: ElementRef, private service: ServiceProvider) {
    this.getFavorites();
  }

  ionViewDidLoad() {
    setTimeout(() => {
      document.getElementById('places').getElementsByTagName('input')[0].focus();
      // this.renderer.selectRootElement('#places').focus();
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

  send() {
    let data = {text: this.text, lat: this.latitude, lng: this.longitude};
    this.viewCtrl.dismiss(data);
  }

  getFavorites() {
    this.service.getFavorites().toPromise().then(
      resp => {
        console.log(resp)
        this.locations = resp.recordset;
        //this.locations = [{Direccion: "Millenium", lat:8.5611234, lng: -71.1933088}, {Direccion: "Las tapias", lat:8.5715283, lng: -71.1811638}]
      },
      error => {
        console.log(error)

      }

    )
  }

  selectLocation(item){
    console.log(item)
    //this.latitude = item.puntoGeografico.points[0].x
    //this.longitude = item.puntoGeografico.points[0].y
    this.latitude = item.lat;
    this.longitude = item.lng;
    this.text = item.Direccion

    document.getElementById('places').getElementsByTagName('input')[0].value = this.text;
  }

}
