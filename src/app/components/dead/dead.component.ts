import {Component, OnInit} from '@angular/core';
import {NavigationService} from '../../services/navigation.service';

@Component({
    selector: 'app-dead',
    templateUrl: './dead.component.html',
    styleUrls: ['./dead.component.css']
})
export class DeadComponent implements OnInit {

    mainMenuUrl: string;

    constructor(navigationService: NavigationService) {
        this.mainMenuUrl = navigationService.mainMenuUrl;
    }

    ngOnInit() {
        if (document.pointerLockElement !== null)
            document.exitPointerLock();
    }
}
