import {Component, OnInit, ViewChild, ElementRef} from '@angular/core';
import {FormGroup, FormBuilder, Validators} from '@angular/forms';
import {GameService} from '../../services/game.service';
import {NavigationService} from '../../services/navigation.service';

interface ClimaZone {
    id: string;
    name: string;
}

interface MapSize {
    size: number;
    name: string;
}

@Component({
    selector: 'app-new-game-menu',
    templateUrl: './new-game-menu.component.html',
    styleUrls: ['./new-game-menu.component.css']
})
export class NewGameMenuComponent implements OnInit {

    @ViewChild('name')
    input: ElementRef;

    formGroup: FormGroup;

    constructor(private gameService: GameService, private navigationService: NavigationService, formBuilder: FormBuilder) {
        this.formGroup = formBuilder.group({
            name: ['Hello world', Validators.required],
            mapSize: [this.mapSizes[0].size],
            climate: [this.climates[1].id],
            monsters: [{value: false, disabled: true}],
            infiniteLife: [false]
        });
    }

    get climates(): ClimaZone[] {
        return [
            {id: 'subpolar', name: 'Subpolar'},
            {id: 'temperate', name: 'Temperate'},
            {id: 'mediterranean', name: 'Mediterranean'},
            {id: 'subtropical', name: 'Subtropical'},
            {id: 'tropics', name: 'Tropics'}
        ];
    }

    get mapSizes(): MapSize[] {
        return [
            {size: 20, name: 'Small'},
            {size: 35, name: 'Medium'},
            {size: 50, name: 'Big'}
        ];
    }

    get mainMenuUrl(): string {return this.navigationService.mainMenuUrl;}

    ngOnInit() {
        (<HTMLElement> this.input.nativeElement).focus();
    }

    canStart(): boolean {
        return this.formGroup.valid;
    }

    onStart(): void {
        const name: string = this.formGroup.get('name').value;
        this.gameService.newGame({
            numberOfClusters: this.formGroup.get('mapSize').value,
            monsters: this.formGroup.get('monsters').value,
            infiniteLife: this.formGroup.get('infiniteLife').value
        });
        this.navigationService.showGame();
    }
}
