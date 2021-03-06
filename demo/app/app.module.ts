import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { PermissionsModule } from '../../src/app/app';


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    PermissionsModule.forRoot({
      items: [
        'free1'
      ]
    }),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

