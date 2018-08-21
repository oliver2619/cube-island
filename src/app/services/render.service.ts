import {Injectable} from '@angular/core';
import {WebGLRenderer, PerspectiveCamera} from 'three';

@Injectable()
export class RenderService {

    renderer: WebGLRenderer;
    
    private _camera: PerspectiveCamera = new PerspectiveCamera(50, 1, .1, 2000);

    constructor() {}

    get camera(): PerspectiveCamera {return this._camera;}

    resize(width: number, height: number): void {
        this._camera.aspect = width / height;
        this._camera.updateProjectionMatrix();
    }
}
