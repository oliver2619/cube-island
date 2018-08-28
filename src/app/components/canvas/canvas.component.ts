import {Component, OnInit, ViewChild, ElementRef, AfterViewInit, Input} from '@angular/core';
import {WebGLRenderer, PCFShadowMap} from 'three';

@Component({
    selector: 'app-canvas',
    templateUrl: './canvas.component.html',
    styleUrls: ['./canvas.component.css']
})
export class CanvasComponent implements OnInit, AfterViewInit {

    @Input()
    public fullscreen: string;

    @ViewChild('canvas')
    private _canvas: ElementRef;

    private _renderer: WebGLRenderer;

    get canvas(): HTMLCanvasElement {return this._canvas.nativeElement;}

    get renderer(): WebGLRenderer {return this._renderer;}

    constructor() {}

    ngOnInit() {}

    ngAfterViewInit(): void {
        this._renderer = new WebGLRenderer({
            canvas: this.canvas,
            preserveDrawingBuffer: true,
            antialias: true
        });
        this._renderer.shadowMap.enabled = true;
        this._renderer.shadowMap.type = PCFShadowMap;
        this.canvas.focus();
    }
}
