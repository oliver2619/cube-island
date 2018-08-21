import {Injectable} from '@angular/core';
import {Assets} from '../../game/assets';
import {WebGLRenderer} from 'three';

@Injectable()
export class AssetsService {

    private _assets: Assets = new Assets();

    get assets(): Assets {return this._assets;}

    constructor() {}

    init(renderer: WebGLRenderer, onComplete: () => void): void {
        this._assets.init(renderer, (cur, total) => {if (cur === total) onComplete();});
    }

}
