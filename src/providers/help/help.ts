import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

/*
  Generated class for the HelpProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class HelpProvider {

  constructor(public http: HttpClient) {
    console.log('Hello HelpProvider Provider');
  }

  getConversation(): Observable<any>{
    const data = {
    	"idUsuario": localStorage.getItem('idUsuario'),
  		"Idioma": localStorage.getItem('lang')=='es'?'esp':"eng"
    }
    let headers = new HttpHeaders().set('Content-Type', 'application/json');
    headers = headers.set('authorization', localStorage.getItem('TokenTWP'));
    return this.http.post(`${environment.api}/st_usuarioBandejaMSJ_Consulta`, data, {
      headers: headers
    });
  }

  sendConversation(text): Observable<any>{
    const data = {
      "texto": text,
      "idUsuario": localStorage.getItem('idUsuario'),
      "Idioma": localStorage.getItem('lang')=='es'?'esp':"eng"
    }
    let headers = new HttpHeaders().set('Content-Type', 'application/json');
    headers = headers.set('authorization', localStorage.getItem('TokenTWP'));
    return this.http.post(`${environment.api}/st_usuariosBandejaMensajes_inserta`, data, {
      headers: headers
    });
  }

}
