import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CanvasComponent} from './canvas/canvas.component';
import {GameComponent} from './game/game.component';
import {CraftComponent} from './craft/craft.component';
import {HelpComponent} from './help/help.component';
import {DialogComponent} from './dialog/dialog.component';
import {MainMenuComponent} from './main-menu/main-menu.component';
import {NewGameMenuComponent} from './new-game-menu/new-game-menu.component';
import {SettingsComponent} from './settings/settings.component';
import {LoadGameComponent} from './load-game/load-game.component';
import {RouterModule} from '@angular/router';
import {SaveGameComponent} from './save-game/save-game.component';
import {GameMenuComponent} from './game-menu/game-menu.component';
import {ReactiveFormsModule, FormsModule} from '@angular/forms';
import {LoadingComponent} from './loading/loading.component';
import {MessageBoxComponent} from './message-box/message-box.component';
import {InventoryComponent} from './inventory/inventory.component';
import {DeadComponent} from './dead/dead.component';

@NgModule({
    imports: [
        CommonModule, RouterModule, ReactiveFormsModule, FormsModule
    ],
    exports: [
        CanvasComponent
    ],
    declarations: [CanvasComponent, GameComponent, CraftComponent, HelpComponent, DialogComponent, MainMenuComponent, NewGameMenuComponent, SettingsComponent, LoadGameComponent, SaveGameComponent, GameMenuComponent, LoadingComponent, MessageBoxComponent, InventoryComponent, DeadComponent]
})
export class ComponentsModule {}
