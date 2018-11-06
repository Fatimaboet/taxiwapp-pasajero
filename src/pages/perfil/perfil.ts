import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { FormGroup, FormControl } from '@angular/forms';
import { RegisterProvider } from '../../providers/register/register';
import { DocumentImageComponent } from '../../components/document-image/document-image';
import { BaseProvider } from '../../providers/base/base';
import { ProfileProvider } from '../../providers/profile/profile';
import { HomePage } from '../home/home';

import { environment } from '../../environments/environment';
/**
 * Generated class for the PerfilPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-perfil',
  templateUrl: 'perfil.html',
})
export class PerfilPage {
	public editImagen = false;
	public genders: any = [];
	public infoUser: any = [];
	public dataUserForm: FormGroup;
	public image: string = "../../assets/imgs/perfil.png";
	private imageProfile = {
	    nombreDocumento: 'Foto Perfil',
	    numeroDocumento: '',
	    Vigencia: new Date(),
	    documento: '',
	    mimeType: '',
	    idUsuario: localStorage.getItem('idUsuario'),
	    Idioma: localStorage.getItem('lang')=='es'?'esp':"eng"
	}
	private userInfo = {
		"genero": '',
        "email": '',
        "contrasena": '',
        "Telefono": '',
        "idUsuario": localStorage.getItem('idUsuario'),
	    "Idioma": localStorage.getItem('lang')=='es'?'esp':"eng"
	}

  constructor(
  	public navCtrl: NavController, 
  	public navParams: NavParams, 
  	private register: RegisterProvider,
  	private profileService: ProfileProvider,
  	private alertCtrl: AlertController,
  	private baseService: BaseProvider,
  	private registerService: RegisterProvider
  	) {
  	this.dataUserForm = new FormGroup({
        "nombre": new FormControl({value: '', disabled: true}),
        "apellidos": new FormControl({value: '', disabled: true}),
        "genero": new FormControl('') 
    }); 
  }

  ionViewDidLoad() {
    this.getInfo();
  }

  goBack(){
  	this.navCtrl.setRoot(HomePage);
  }

  //Show image country
	prepareImageSelector() {
		setTimeout(() => {
			let buttonElements = document.querySelectorAll('div.alert-radio-group button');
			if (!buttonElements.length) {
				this.prepareImageSelector();
			} else {
				for (let index = 0; index < buttonElements.length; index++) {
					let buttonElement = buttonElements[index];
					let optionLabelElement = buttonElement.querySelector('.alert-radio-label');
					let image = optionLabelElement.innerHTML.trim();
					buttonElement.classList.add('imageselect', 'image_' + image);
					if (image == this.dataUserForm.value.idPaisTelefono) {
						buttonElement.classList.add('imageselected');
					}
				}
			}
		}, 100);
	}

  //Select image country
	selectImage(image) {
		let buttonElements = document.querySelectorAll('div.alert-radio-group button.imageselect');
		for (let index = 0; index < buttonElements.length; index++) {
			let buttonElement = buttonElements[index];
			buttonElement.classList.remove('imageselected');
			if (buttonElement.classList.contains('image_' + image)) {
				buttonElement.classList.add('imageselected');
			}
		}
	}

	getGender() {
	    this.register.getGender().subscribe(
	      resp => {
	        this.genders = resp.recordset;
	      },
	      error => {
	        console.log(error);
	      }
	    );
	}

	getInfo() {
		this.baseService.startLoading();
	    this.profileService.getUser().subscribe(
	      resp => {
	      	this.baseService.stopLoading();
	        this.getGender();
	        this.infoUser = resp.recordset[0];
	        this.dataUserForm.patchValue({nombre: this.infoUser.Nombre});
	        this.dataUserForm.patchValue({apellidos: this.infoUser.Apellidos});	        
	        if (this.infoUser.Genero == 'F') {
	        	this.dataUserForm.patchValue({genero: 'Femenino'});
	        } else if (this.infoUser.Genero == 'M') {
	        	this.dataUserForm.patchValue({genero: 'Masculino'});
	        } else {
	        	this.dataUserForm.patchValue({genero: 'Otros'});
	        }
	        this.userInfo.genero = this.infoUser.Genero;
	        this.userInfo.email = this.infoUser.correoElectronico;
	        this.userInfo.contrasena = this.infoUser.contrasena;
	        this.image = environment.documents + this.infoUser.ruta +'?'+ new Date().getTime();
	      },
	      error => {
	      	this.baseService.stopLoading();
	        console.log(error);
	        this.getGender();
	      }
	    );
	}

	presentConfirm(title,value,type,placeholder) {
	  let alert = this.alertCtrl.create({
	    title: title,
	    inputs: [
	      {
	        name: 'campo',
	        value: value,
	        placeholder: placeholder
	      }
	    ],
	    buttons: [
	      {
	        text: 'Cancelar',
	        role: 'cancel',
	        handler: data => {
	          console.log('Cancel clicked');
	        }
	      },
	      {
	        text: 'Actualizar',
	        handler: data => {
	        	if (type == 0) {
	        		this.userInfo.email = data.campo;
	        	}
	        	if (type == 2) {
	        		this.userInfo.contrasena = data.campo;
	        	}
	        	this.profileService.setInfo(this.userInfo).subscribe(
			        resp => {
			          this.baseService.showToast('Información actualizada con éxito')
			        },
			        error => {
			          console.log(error);
			        }
			    );
	        }
	      }
	    ]
	  });
	  alert.present();
	}

	changeImagen(event){
		console.log(event)
		this.editImagen = false;
	    this.image = event;
	    this.imageProfile.documento = this.getBase64Split(event);
	    this.imageProfile.mimeType = this.getMime(event);
	    this.uploadDocumentUser(this.imageProfile.documento);
	}

	getBase64Split(img){
	    let toArray =  img.split(",");
	    return toArray[1];
	}

	getMime(img){
		let toArray =  img.split(",");
		let Array1 = toArray[0].split("/");
		let Array2 = Array1[1].split(";");
		return Array2[0];
	}

	uploadDocumentUser(foto){
      this.register.insertDocument(foto, localStorage.getItem('idUsuario'), 11).subscribe(
        resp => {
          if (resp.recordset[0].codigo == 1) {
            this.baseService.showToast(resp.recordset[0].Mensaje);
          } else {
            this.baseService.showToast('Imagen actualizada con éxito');
          }
        },
        error => {
          console.log(error);
        }
      );
  	};

  	setGender(){
  		if (this.dataUserForm.value.genero == 'Femenino') {
  			this.userInfo.genero = 'F';
  		} else if (this.dataUserForm.value.genero == 'Masculino') {
  			this.userInfo.genero = 'M';
  		} else {
  			this.userInfo.genero = 'O';
  		}
  		this.profileService.setInfo(this.userInfo).subscribe(
	        resp => {
	          this.baseService.showToast('Información actualizada con éxito')
	        },
	        error => {
	          console.log(error);
	        }
	    );
  	}

  	setDocuments(type){
  		//this.navCtrl.setRoot(AddDocumentsPage, {tipo: type});
  	}


}
