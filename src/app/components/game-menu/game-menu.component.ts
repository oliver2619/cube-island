import {Component, OnInit, ViewChild, AfterViewInit} from '@angular/core';
import {GameService} from '../../services/game.service';
import {MessageBoxComponent, MessageBox, MessageBoxResult} from '../message-box/message-box.component';
import {NavigationService} from '../../services/navigation.service';

@Component({
    selector: 'app-game-menu',
    templateUrl: './game-menu.component.html',
    styleUrls: ['./game-menu.component.css']
})
export class GameMenuComponent implements OnInit, AfterViewInit {

    @ViewChild(MessageBoxComponent)
    messageBox: MessageBox;

    constructor(private gameService: GameService, private navigationService: NavigationService) {}

    get gameUrl(): string {return this.navigationService.gameUrl;}

    ngOnInit() {
        this.gameService.stop();
    }

    ngAfterViewInit(): void {
        if (document.pointerLockElement !== null)
            document.exitPointerLock();
    }

    onExit(): void {
        this.messageBox.questionOkCancel('Do You want to exit this game?').subscribe((r: MessageBoxResult) => {
            if (r === MessageBoxResult.OK) {
                this.gameService.exitGame();
                this.navigationService.showMainMenu();
            }
        });
    }
}
