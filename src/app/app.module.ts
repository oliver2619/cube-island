import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';


import { AppComponent } from './app.component';
import { NavigationModule } from './/navigation.module';
import { ComponentsModule } from './components/components.module';
import {RouterModule} from '@angular/router';
import { ServicesModule } from './services/services.module';


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    NavigationModule,
    RouterModule,
    ComponentsModule,
    ServicesModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
