import {Component, OnInit, ViewChild, ElementRef} from '@angular/core';
import {NavigationService} from '../../services/navigation.service';
import {Validators, FormGroup, FormBuilder} from '@angular/forms';
import {GameService} from '../../services/game.service';
import {MessageBoxComponent, MessageBox, MessageBoxResult} from '../message-box/message-box.component';

@Component({
    selector: 'app-save-game',
    templateUrl: './save-game.component.html',
    styleUrls: ['./save-game.component.css']
})
export class SaveGameComponent implements OnInit {

    @ViewChild('name')
    input: ElementRef;

    @ViewChild(MessageBoxComponent)
    messageBox: MessageBox;

    formGroup: FormGroup;

    private _selected: string = null;
    private _savedGames: string[] = [];

    constructor(private navigationService: NavigationService, private gameService: GameService, formBuilder: FormBuilder) {
        this.formGroup = formBuilder.group({
            name: [gameService.worldName, Validators.required]
        });
        this.formGroup.get('name').valueChanges.subscribe(c => {
            if (c !== this._selected)
                this._selected = null;
        });
    }

    get gameUrl(): string {return this.navigationService.gameUrl;}

    get savedGames(): string[] {
        return this._savedGames;
    }

    get selected(): string {
        return this._selected;
    }

    canSave(): boolean {
        return this.formGroup.valid;
    }

    hasSavedGames(): boolean {
        return this._savedGames.length > 0;
    }

    ngOnInit() {
        this.updateList();
        (<HTMLElement> this.input.nativeElement).focus();
    }

    onSave(): void {
        const name: string = this.formGroup.get('name').value;
        if (this.gameService.isGameSaved(name)) {
            this.messageBox.questionOkCancel('Game ' + name + ' already exists. Do You want to overwrite Your game state?').subscribe((r: MessageBoxResult) => {
                if (r === MessageBoxResult.OK)
                    this.save(name);
            });
        } else
            this.save(name);
    }

    select(g: string): void {
        this._selected = g;
        this.formGroup.get('name').setValue(g);
    }

    private save(name: string): void {
        if (!this.gameService.saveGame(name)) {
            this.messageBox.error('Failed to save game.');
            return;
        }
        this.navigationService.showGame();
    }

    private updateList(): void {
        this._savedGames = this.gameService.getSavedGames();
        this._savedGames.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
    }
}
