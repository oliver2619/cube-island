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

    constructor(private navigationService: NavigationService, private gameService: GameService, formBuilder: FormBuilder) {
        this.formGroup = formBuilder.group({
            name: ['', Validators.required]
        });
    }

    get gameUrl(): string {return this.navigationService.gameUrl;}

    canSave(): boolean {
        return this.formGroup.valid;
    }

    ngOnInit() {
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

    private save(name: string): void {
        if (!this.gameService.saveGame(name)) {
            this.messageBox.error('Failed to save game.');
            return;
        }
        this.navigationService.showGame();
    }
}
