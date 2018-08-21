import {Component, OnInit, AfterViewInit} from '@angular/core';
import {InputControlService} from '../../services/input-control.service';
import {GameService} from '../../services/game.service';

@Component({
    selector: 'app-game',
    templateUrl: './game.component.html',
    styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit, AfterViewInit {

    constructor(private inputControlService: InputControlService, private gameService: GameService) {}

    ngOnInit() {
    }

    ngAfterViewInit(): void {
        this.inputControlService.startPointerLock();
        this.gameService.start();
    }
}
