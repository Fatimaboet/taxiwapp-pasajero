import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { TranslateService } from '@ngx-translate/core';

/*
  Generated class for the LanguageProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class LanguageProvider {

  constructor(public http: HttpClient, private translate: TranslateService) {
    
  }

  switchLanguage(language: string) {
    this.translate.use(language);
    localStorage.setItem('lang',language);
  }

}
