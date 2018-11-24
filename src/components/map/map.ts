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
  markers: any = [];
  marketOrigin: google.maps.Marker;
  marketDestiny: google.maps.Marker;
  pointO = '';

  directionsDisplay: google.maps.DirectionsRenderer;
  directionsService: google.maps.DirectionsService;

  @Input() drivers: Array<any>;
  @Input() origin: string;
  @Input() destiny: string;
  @Input() reload: boolean = false;
  @Output() latLngO: EventEmitter<any> = new EventEmitter<any>();
  @Output() addressO: EventEmitter<any> = new EventEmitter<any>();
  @Output() latLngD: EventEmitter<any> = new EventEmitter<any>();
  @Output() addressD: EventEmitter<any> = new EventEmitter<any>();

  constructor(private geolocation: Geolocation, public platform: Platform) {
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
      this.map = new google.maps.Map(document.getElementById('map'), {
        center: myLatLng,
        zoom: 16,
        styles: [
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
            "featureType": "road.highway",
            "elementType": "geometry",
            "stylers": [{"color": '#e1f5fe'}]
          },
          {
            "featureType": "road.highway",
            "elementType": "geometry.stroke",
            "stylers": [{"color": '#b3e5fc'}]
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
          }
        ]
      });
      this.loader = true;
      this.getPosition();
      return true;
    })
  };

  async ngOnChanges() {

    await setTimeout(async () => {
      let latLngOrigin, latLngDestiny, lat, lng;
       
      console.log(this.origin);
      if (this.origin) {
        this.clearMarket();
        lat = this.origin.split(" ")[1];
        lng = this.origin.split(" ")[0];
        latLngOrigin = new google.maps.LatLng(lat, lng);
        this.createMarker(latLngOrigin,'start',true,null,'origen');
      } 
      console.log('entro');

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
          draggable: true
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
      this.geocodeLatLng(latitude,longitude,'start');
    })
    .catch(error =>{
      if (navigator) {
        navigator.geolocation.getCurrentPosition((position) => {
          latitude = position.coords.latitude;
          longitude = position.coords.longitude;
          this.loadMap(latitude, longitude);
          this.geocodeLatLng(latitude,longitude,'start');
        });
      } else {
        if(google.loader.ClientLocation) {
          latitude = google.loader.ClientLocation.latitude;
          longitude = google.loader.ClientLocation.longitude;
          this.loadMap(latitude, longitude);
          this.geocodeLatLng(latitude,longitude,'start');
        }
      }
    })
    return true;
  };

  loadMap(latitude: number, longitude: number){
    console.log(latitude, longitude);

    // create a new map by passing HTMLElement
    let mapEle: HTMLElement = document.getElementById('map');
    let myLatLng = {lat: latitude, lng: longitude};
    //let imagen = '../../assets/imgs/pin-car.png';
    google.maps.event.addListenerOnce(this.map, 'idle', () => {
      this.createMarker(myLatLng,'start',true,null,'Origen');    
      mapEle.classList.add('show-map');
      this.loader = true;
    });
  };

  createMarker(latlng, posRef, draggable, icons, title) {
    /*var icon = {
        url: icons,
        scaledSize: new google.maps.Size(30, 30)
    };*/
    var marker = new google.maps.Marker({
      position: latlng,
      map: this.map,
      draggable: draggable,
      posRef: posRef,
      //icon: icon,
      title: 'Posicion'
    });
    this.markers.push(marker);
    var that = this;
    this.map.setCenter(latlng);
    google.maps.event.addListener(marker, 'dragend', function() {
      if(this.posRef == 'start'){
        var start = this.getPosition();
        let point = {lat: start.lat(), lng: start.lng()};
        //that.latLngO.emit(point);
        that.geocodeLatLng(start.lat(),start.lng(),'start');
      }
    });
  };

  async geocodeLatLng(lat,lng,type) {
    var end = {lat: lat, lng: lng};
    var that = this;
    let geocoder = new google.maps.Geocoder;
    geocoder.geocode({'location': end}, function(results, status) {
      if (status === 'OK') {
        if (results[1]) {
          console.log(results[1].formatted_address);
          if (type === 'start') {
            that.addressO.emit(results[1].formatted_address);
          }
          
        } 
      } else {

      }
    });
  };

  

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

    this.markers.forEach(value=>{
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
