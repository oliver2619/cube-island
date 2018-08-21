import {Component, OnInit, ViewChild, ElementRef} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {Subscriber} from 'rxjs/Subscriber';

export enum MessageBoxResult {
    OK, NO, CANCEL
}

export interface MessageBox {
    error(message: string, title?: string): Observable<MessageBoxResult>;

    questionYesNo(message: string, title?: string): Observable<MessageBoxResult>;

    questionOkCancel(message: string, title?: string): Observable<MessageBoxResult>;

    questionYesNoCancel(message: string, title?: string): Observable<MessageBoxResult>;
}

@Component({
    selector: 'app-message-box',
    templateUrl: './message-box.component.html',
    styleUrls: ['./message-box.component.css']
})
export class MessageBoxComponent implements OnInit, MessageBox {

    title: string;
    message: string;
    visible = false;
    okLabel: string;
    noVisible: boolean;
    cancelVisible: boolean;
    icon: string = null;

    private static QUESTION_TITLE = 'Question';
    private static QUESTION_ICON = 'question';
    private static ERROR_TITLE = 'Error';
    private static ERROR_ICON = 'error';

    private subscriber: Subscriber<MessageBoxResult> = null;

    constructor() {}

    error(message: string, title?: string): Observable<MessageBoxResult> {
        this.okLabel = 'OK';
        this.noVisible = false;
        this.cancelVisible = false;
        this.icon = MessageBoxComponent.QUESTION_ICON;
        return this.show(message, title);
    }

    ngOnInit() {
    }

    onOk(): void {
        if (this.subscriber !== null)
            this.subscriber.next(MessageBoxResult.OK);
        this.visible = false;
    }

    onNo(): void {
        if (this.subscriber !== null)
            this.subscriber.next(MessageBoxResult.NO);
        this.visible = false;
    }

    onCancel(): void {
        if (this.subscriber !== null)
            this.subscriber.next(MessageBoxResult.CANCEL);
        this.visible = false;
    }

    questionYesNo(message: string, title?: string): Observable<MessageBoxResult> {
        this.okLabel = 'Yes';
        this.noVisible = true;
        this.cancelVisible = false;
        this.icon = MessageBoxComponent.QUESTION_ICON;
        return this.show(message, title);
    }

    questionOkCancel(message: string, title?: string): Observable<MessageBoxResult> {
        this.okLabel = 'OK';
        this.noVisible = false;
        this.cancelVisible = true;
        this.icon = MessageBoxComponent.QUESTION_ICON;
        return this.show(message, title);
    }

    questionYesNoCancel(message: string, title?: string): Observable<MessageBoxResult> {
        this.okLabel = 'Yes';
        this.noVisible = true;
        this.cancelVisible = true;
        this.icon = MessageBoxComponent.QUESTION_ICON;
        return this.show(message, title);
    }

    private show(message: string, title?: string): Observable<MessageBoxResult> {
        this.title = title !== undefined ? title : MessageBoxComponent.QUESTION_TITLE;
        this.message = message;
        this.visible = true;
        return Observable.create((s: Subscriber<MessageBoxResult>) => {
            this.subscriber = s;
        });
    }
}
