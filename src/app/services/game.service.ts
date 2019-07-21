import {Injectable} from '@angular/core';
import {World, NewGameSettings, WorldStoreData} from '../../game/world';
import {RenderService} from './render.service';
import {Clock} from 'three';
import {InputControlService} from './input-control.service';
import {NavigationService} from './navigation.service';
import {Person} from '../../game/person';
import {AssetsService} from './assets.service';
import {ChestImp, ObjectControl} from '../../game/objects';
import {ObjectAnimation} from '../../game/objectAnimation';
import * as LZString from 'lz-string';
import {FactoryType} from '../../game/factoryType';

@Injectable()
export class GameService {

    private static PREFIX_SAVED_GAME = 'buddeln:game:';

    private _clock: Clock = new Clock(false);
    private _animationFrameHandle: number;
    private _world: World;
    private _chest: ChestImp;
    private _worldName: string;

    constructor(private renderService: RenderService, private inputControlService: InputControlService, private assetsService: AssetsService, private navigationService: NavigationService) {
        this.inputControlService.onMouseMove.push((x, y) => {
            const factor = this.renderService.camera.fov * Math.PI / (90 * window.innerHeight);
            this._world.turnPlayer(x * factor, y * factor);
        });
        this.inputControlService.onMouseWheel.push((x, y) => this.mouseWheel(x + y));
        this.inputControlService.onSelectSlot.push((index) => this._world.selectedInventorySlot = index - 1);
        this.inputControlService.onSleep.push(() => this._world.sleep());
        this.inputControlService.onCraft.push(() => navigationService.toggleCraftMenu(FactoryType.NONE));
        this.inputControlService.onEat.push(() => this._world.person.eat());
        this.inputControlService.onRotateObject.push(amount => this._world.person.rotateObject(amount));
        this.inputControlService.onUseObject.push(() => this.useObject());
        this.inputControlService.onToggleCursorMode.push(() => this._world.toggleCursorMode());
    }

    get player(): Person {return this._world.person;}

    get selectedChest(): ChestImp {return this._chest;}

    set selectedChest(chest: ChestImp) {this._chest = chest;}

    get worldName(): string {return this._worldName;}

    deleteSavedGame(name: string): void {window.localStorage.removeItem(GameService.PREFIX_SAVED_GAME + name);}

    exitGame(): void {
        this.stop();
        this._world.deinit();
        this._world = null;
    }

    getSavedGames(): string[] {
        const ret = [];
        for (const k in window.localStorage) {
            if (k.startsWith(GameService.PREFIX_SAVED_GAME)) {
                ret.push(k.substring(GameService.PREFIX_SAVED_GAME.length));
            }
        }
        return ret;
    }

    isGameSaved(name: string): boolean {return window.localStorage.getItem(GameService.PREFIX_SAVED_GAME + name) !== null;}

    newGame(settings: NewGameSettings): void {
        this._worldName = settings.name;
        this._world = new World(this.assetsService.assets);
        this._world.newGame(settings);
        this._chest = undefined;
        this.start();
    }

    loadGame(name: string): void {
        this._world = new World(this.assetsService.assets);
        const str = window.localStorage.getItem(GameService.PREFIX_SAVED_GAME + name);
        const input: WorldStoreData = JSON.parse(LZString.decompressFromUTF16(str));
        this._world.loadGame(input);
        this._worldName = name;
        this._chest = undefined;
        this.start();
    }

    saveGame(name: string): boolean {
        this._worldName = name;
        const data = this._world.saveGame();
        const str = JSON.stringify(data);
        console.log('Saving ' + Math.floor(str.length / 1024) + ' kb');
        try {
            window.localStorage.setItem(GameService.PREFIX_SAVED_GAME + name, LZString.compressToUTF16(str));
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    }

    start(): void {
        if (this._animationFrameHandle === undefined) {
            this._clock.start();
            this.renderLoop();
        }
    }

    stop(): void {
        if (this._animationFrameHandle !== undefined) {
            cancelAnimationFrame(this._animationFrameHandle);
            this._animationFrameHandle = undefined;
        }
        this._clock.stop();
    }

    private animate(timeout: number): void {
        if (this.navigationService.isGameVisible()) {
            this._world.controlUser(timeout, this.inputControlService);
            this.joypad(timeout);
        }
        this._world.animate(timeout, this.renderService.camera);
    }

    private joypad(timeout: number): void {
            const rs = .5 * Math.PI * timeout;
            this._world.turnPlayer(this.inputControlService.getJoyAxis(2) * rs, this.inputControlService.getJoyAxis(3) * rs);
            if (this.inputControlService.isButtonToggled(14))
                this.mouseWheel(-1);
            if (this.inputControlService.isButtonToggled(15))
                this.mouseWheel(1);
            if (this.inputControlService.isButtonToggled(12))
                this.navigationService.toggleCraftMenu(FactoryType.NONE);
            if (this.inputControlService.isButtonToggled(2))
                this.useObject();
            if (this.inputControlService.isButtonToggled(4))
                this._world.toggleCursorMode()
            if (this.inputControlService.isButtonToggled(6))
                this._world.person.rotateObject(1);
            if (this.inputControlService.isButtonToggled(3))
                this._world.person.eat();
            if (this.inputControlService.isButtonToggled(13))
                this._world.sleep();
            if (this.inputControlService.isButtonToggled(8))
                this.navigationService.showGameMenu();
    }
    
    private mouseWheel(amount: number): void {
        let s = this._world.selectedInventorySlot + amount;
        s = Math.max(0, Math.min(s, 7));
        this._world.selectedInventorySlot = s;
    }

    private renderLoop(): void {
        const timeout = this._clock.getDelta();
        if (timeout > 0) {
            this.animate(timeout);
            this._world.render(this.renderService.renderer, this.renderService.camera);
        }
        if (!this._world.person.isAlive()) {
            this._animationFrameHandle = undefined;
            this.exitGame();
            this.navigationService.showGameOver();
            return;
        }
        this._animationFrameHandle = requestAnimationFrame((time: number) => {
            this.renderLoop();
        });
    }

    private useObject(): void {
        const objectControl: ObjectControl = {
            addAnimation: (animation: ObjectAnimation) => {
                this._world.addAnimation(animation);
            },
            craft: (factoryType: FactoryType) => {
                this.navigationService.toggleCraftMenu(factoryType);
            },
            openChest: (chest: ChestImp) => {
                this._chest = chest;
                this.navigationService.toggleInventoryMenu();
            }
        };
        this._world.person.useObject(this._world, objectControl)
    }

}
