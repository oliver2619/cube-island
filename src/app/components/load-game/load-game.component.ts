import {Component, OnInit, ViewChild} from '@angular/core';
import {NavigationService} from '../../services/navigation.service';
import {MessageBoxComponent, MessageBox, MessageBoxResult} from '../message-box/message-box.component';
import {GameService} from '../../services/game.service';

@Component({
    selector: 'app-load-game',
    templateUrl: './load-game.component.html',
    styleUrls: ['./load-game.component.css']
})
export class LoadGameComponent implements OnInit {

    @ViewChild(MessageBoxComponent)
    messageBox: MessageBox;

    private _selected: string = null;
    private _savedGames: string[] = [];

    constructor(private navigationService: NavigationService, private gameService: GameService) {}

    get mainMenuUrl(): string {return this.navigationService.mainMenuUrl;}

    get savedGames(): string[] {
        return this._savedGames;
    }

    get selected(): string {
        return this._selected;
    }

    canDelete(): boolean {
        return this._selected !== null;
    }

    canLoad(): boolean {
        return this._selected !== null;
    }

    hasSavedGames(): boolean {
        return this._savedGames.length > 0;
    }

    ngOnInit() {
        this.updateList();
    }

    onDelete(): void {
        this.messageBox.questionOkCancel('Do You really want to delete this saved game?').subscribe((r: MessageBoxResult) => {
            if (r === MessageBoxResult.OK) {
                this.gameService.deleteSavedGame(this._selected);
                this._selected = null;
                this.updateList();
            }
        });
    }

    onLoad(): void {
        this.gameService.loadGame(this._selected);
        this.navigationService.showGame();
    }

    select(g: string): void {
        this._selected = g;
    }

    private updateList(): void {
        this._savedGames = this.gameService.getSavedGames();
        this._savedGames.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
    }
}
