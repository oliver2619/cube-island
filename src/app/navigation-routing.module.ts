import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {GameComponent} from './components/game/game.component';
import {CraftComponent} from './components/craft/craft.component';
import {HelpComponent} from './components/help/help.component';
import {MainMenuComponent} from './components/main-menu/main-menu.component';
import {NewGameMenuComponent} from './components/new-game-menu/new-game-menu.component';
import {LoadGameComponent} from './components/load-game/load-game.component';
import {SettingsComponent} from './components/settings/settings.component';
import {GameMenuComponent} from './components/game-menu/game-menu.component';
import {SaveGameComponent} from './components/save-game/save-game.component';
import {LoadingComponent} from './components/loading/loading.component';
import {InventoryComponent} from './components/inventory/inventory.component';
import {DeadComponent} from './components/dead/dead.component';

const routes: Routes = [
    {path: '', component: LoadingComponent},
    {path: 'main', component: MainMenuComponent},
    {path: 'game', component: GameComponent},
    {path: 'gameOver', component: DeadComponent},
    {path: 'newGame', component: NewGameMenuComponent},
    {path: 'loadGame', component: LoadGameComponent},
    {path: 'settings', component: SettingsComponent},
    {path: 'craft', component: CraftComponent},
    {path: 'inventory', component: InventoryComponent},
    {path: 'gameMenu', component: GameMenuComponent},
    {path: 'saveGame', component: SaveGameComponent},
    {path: 'help', component: HelpComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class NavigationRoutingModule { }
