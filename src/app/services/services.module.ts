import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RenderService } from './render.service';
import { GameService } from './game.service';
import { InputControlService } from './input-control.service';
import { NavigationService } from './navigation.service';
import { AssetsService } from './assets.service';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [],
  providers: [RenderService, GameService, InputControlService, NavigationService, AssetsService]
})
export class ServicesModule { }
