import { Component,Input, Output, EventEmitter, OnChanges, OnInit } from '@angular/core';
import { IonicPage, Platform } from 'ionic-angular';
import { Geolocation, Geoposition } from '@ionic-native/geolocation';

declare var google: any;
import {} from 'googlemaps';
/**
 * Generated class for the MapComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'map',
  templateUrl: 'map.html'
})
export class MapComponent implements OnChanges{

  loader: boolean = false;
  map: google.maps.Map;
  marketsDrivers: Array<any> = [];
  marketOrigin: google.maps.Marker;
  marketDestiny: google.maps.Marker;

  directionsDisplay: google.maps.DirectionsRenderer;
  directionsService: google.maps.DirectionsService;

  @Input() drivers: Array<any>;
  @Input() origin: string;
  @Input() destiny: string;
  @Input() reload: boolean = false;
  @Output() latLng: EventEmitter<any> = new EventEmitter<any>();

  constructor(private geolocation: Geolocation, public platform: Platform) {
    // this.getMap();
    this.directionsDisplay = new google.maps.DirectionsRenderer();
    this.directionsService = new google.maps.DirectionsService();
  }

  ngAfterViewInit(){
    this.getMap();
  }


  ngOnDestroy() {
    this.map = null;
  }

  async getMap(): Promise<any>{
    this.platform.ready().then(() => {
      let myLatLng = {lat: 19.4279, lng: -99.1655};
      setTimeout(() => {
      this.map = new google.maps.Map(document.getElementById('map'), {
        center: myLatLng,
        zoom: 12
      });
      this.loader = true;
      this.getPosition();
      return true;
      }, 1000)
    })
  }

  async ngOnChanges() {
    // this.getMap();
    await setTimeout(async () => {
      let latLngOrigin, latLngDestiny, lat, lng;
      //this.map = null;
      //await this.getPosition();
      if (this.marketOrigin) {
        console.log('delete market')
        this.marketOrigin.setMap(null);
      }
      if (this.origin) {
        console.log(this.marketOrigin);
        lat = this.origin.split(" ")[1];
        lng = this.origin.split(" ")[0];
        latLngOrigin = new google.maps.LatLng(lat, lng);
        //this.marketOrigin = await this.setMarker(latLngOrigin, "origen");
        this.marketOrigin = await new google.maps.Marker({
          position: latLngOrigin,
          map: this.map,
          title: 'Position',
          label: 'origen',
          labelClass: "labels",
        });
        this.map.setCenter(latLngOrigin);
      } 

      if (this.marketDestiny) this.marketDestiny.setMap(null);
      if (this.destiny) {
        lat = this.destiny.split(" ")[1];
        lng = this.destiny.split(" ")[0];
        latLngDestiny = new google.maps.LatLng(lat, lng);
        // this.marketDestiny = await this.setMarker(latLngDestiny, "destino");
        this.marketDestiny = await new google.maps.Marker({
          position: latLngDestiny,
          map: this.map,
          title: 'Position',
          label: 'destino',
          labelClass: "labels",
        });
        this.map.setCenter(latLngDestiny);
      }

      if (this.origin && this.destiny) {
        this.shortestRoute(latLngOrigin, latLngDestiny);
      } else {
        this.directionsDisplay.setMap(null);
      }

      if (this.drivers) {
        this.setDriversPositions();
      } else {
        this.clearMarket();
      }
    },100)
  }

  getPosition(){
    let latitude: number;
    let longitude: number;
    this.geolocation.getCurrentPosition().then( response => {
      latitude = response.coords.latitude;
      longitude = response.coords.longitude;
      this.loadMap(latitude, longitude);
      // this.loadMap(19.4279, -99.1655);
    })
    .catch(error =>{

      if (navigator) {
        navigator.geolocation.getCurrentPosition((position) => {

          latitude = position.coords.latitude;
          longitude = position.coords.longitude;
          this.loadMap(latitude, longitude);
        });
      } else {
        if(google.loader.ClientLocation) {
          latitude = google.loader.ClientLocation.latitude;
          longitude = google.loader.ClientLocation.longitude;
          this.loadMap(latitude, longitude);
        }
      }
    })
    return true;
  }

  loadMap(latitude: number, longitude: number){
    console.log(latitude, longitude);

    // create a new map by passing HTMLElement
    let mapEle: HTMLElement = document.getElementById('map');

    // create LatLng object
    let myLatLng = {lat: latitude, lng: longitude};

    this.latLng.emit(myLatLng);

    // create map
   /* this.map = new google.maps.Map(mapEle, {
      center: myLatLng,
      zoom: 12
    });*/

    //let imagen = '../../assets/imgs/pin-car.png';
    google.maps.event.addListenerOnce(this.map, 'idle', async () => {
      this.map.setCenter(myLatLng);
      
      let marker = new google.maps.Marker({
        position: myLatLng,
        map: this.map,
        title: 'Position',
        //icon: imagen
      });
      
      // this.marketOrigin = await marker;
      this.calcRoute();
      mapEle.classList.add('show-map');
      this.loader = true;
    });
  }

  async setDriversPositions(){
    this.marketsDrivers = [];
    let imagen = '../../assets/imgs/pin-car.png';
    console.log(this.drivers);
    this.drivers.forEach( async (value: any)=>{
      if (value) {
        if (value.UbicacionConductor) {
          console.log(value.UbicacionConductor)
          let point = new google.maps.LatLng(value.UbicacionConductor.split(" ")[1],value.UbicacionConductor.split(" ")[0]);
          //let label = `${value.nombre} ${value.tiempo}`;
          let label = '';
          let marker = await this.setMarker(point, label, imagen);
          this.marketsDrivers.push(marker);
          console.log(this.marketsDrivers)
        }
      }
    });
  }

  async setMarker(position, label, imagen?): Promise<any>{
    await google.maps.event.addListenerOnce(this.map, 'idle', async () => {
       return new google.maps.Marker({
        position: position,
        map: this.map,
        title: 'Position',
        icon: imagen || false,
        label: label,
        labelClass: "labels",
      });
    });
  }

  clearMarket(){
    this.marketsDrivers.forEach(value=>{
      if (value) value.setMap(null);
    })
  }

  async calcRoute() {

    //this.shortestRoute();
    /*return;
    let fastest = Number.MAX_VALUE,
      shortest = Number.MAX_VALUE,
      route = await this.shortestRoute();

    console.log(route);
    route.routes.map((rou, index) => {
      new google.maps.DirectionsRenderer({
          map:this.map,
          directions:route,
          routeIndex:index,
          polylineOptions:{
              strokeColor: rou.legs[0].duration.value == fastest? "red":rou.legs[0].distance.value == shortest?"darkgreen":"blue",
              strokeOpacity: rou.legs[0].duration.value == fastest? 0.8:rou.legs[0].distance.value == shortest? 0.9: 0.5,
              strokeWeight: rou.legs[0].duration.value == fastest? 9:rou.legs[0].distance.value == shortest? 8: 3,
          }
      });
    });*/
  }

  async shortestRoute(latLngOrigin:google.maps.LatLng, latLngDestiny:google.maps.LatLng) {
    

    this.directionsDisplay.setMap(this.map);
    this.directionsService.route({
        origin: latLngOrigin,
        destination: latLngDestiny,
        provideRouteAlternatives: true,
        avoidTolls: true,
        travelMode: google.maps.TravelMode.DRIVING

    }, (response, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
          this.directionsDisplay.setDirections(response);
          this.directionsDisplay.setOptions({
            suppressMarkers: true,
            preserveViewport: true
          });
        } else {
        }
    });
  }


}
