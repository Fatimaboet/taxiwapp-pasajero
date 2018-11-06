import { Platform, ActionSheetController } from 'ionic-angular';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { Component, ViewChild, ElementRef, Input, Output, OnChanges, EventEmitter } from '@angular/core';

/**
 * Generated class for the DocumentImageComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'document-image',
  templateUrl: 'document-image.html'
})
export class DocumentImageComponent implements OnChanges {

  private imagen: any;

  @ViewChild('imageInput') imageInput: ElementRef;

  @Input('editImagen') editImagen: boolean = false;
  @Input('form') form: string;
  @Input('disabled') disabled: boolean = false;

  @Output() event: EventEmitter<any> = new EventEmitter<any>();

  constructor(private camera: Camera, private platform: Platform, private actionsheetCtrl: ActionSheetController) {
    console.log(this.editImagen)
  }

  ngOnChanges() { }

  addImagen() {
    if (this.platform.is('cordova')) {
      let actionSheet = this.actionsheetCtrl.create({
        title: 'Foto',
        cssClass: 'action-sheets-basic-page',
        buttons: [
          {
            text: 'Tomar foto',
            role: 'destructive',
            icon: 'ios-camera-outline',
            handler: () => {
              this.cameraCapture();
            }
          },
          {
            text: 'Elegir imagen de galeria',
            icon: 'ios-images-outline',
            handler: () => {
              if (this.imageInput) {
                this.imageInput.nativeElement.click();
              }
            }
          },
        ]
      });
      actionSheet.present();
    } else {
      if (this.imageInput) {
        this.imageInput.nativeElement.click();
      }
    }
  }

  cameraCapture(){
      const options: CameraOptions = {
        quality: 100,
        destinationType: this.camera.DestinationType.DATA_URL,
      }

      this.camera.getPicture(options).then((imageData) => {
       // imageData is either a base64 encoded string or a file URI
       this.imagen = 'data:image/jpeg;base64,' + imageData;
      }, (err) => {
       // Handle error
      });
  }

  fileChanged(event: any) {
    this.readFile(event.target);
  }

  readFile(inputValue: any): void {
    var file: File = inputValue.files[0];
    var myReader: FileReader = new FileReader();

    myReader.onload = (e: any) => {
      this.imagen = e.target.result;
    }
    myReader.readAsDataURL(file);
  }

  changeEmit(){
    this.event.emit(this.imagen);
  }







}
