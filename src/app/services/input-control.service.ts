import {Injectable} from '@angular/core';
import {NavigationService} from './navigation.service';

@Injectable()
export class InputControlService {

    private _up = false;
    private _down = false;
    private _left = false;
    private _right = false;
    private _jump = false;
    private _leftButton = false;
    private _leftButtonBlock = false;
    private _rightButton = false;
    private _run = false;
    private _mouseMove: Array<(x: number, y: number) => void> = [];
    private _mouseWheel: Array<(x: number, y: number) => void> = [];
    private _sleep: Array<() => void> = [];
    private _craft: Array<() => void> = [];
    private _eat: Array<() => void> = [];
    private _rotateObject: Array<(amount: number) => void> = [];
    private _selectSlot: Array<(index: number) => void> = [];
    private _toggleCursorMode: Array<() => void> = [];
    private _use: Array<() => void> = [];
    private _canvas: HTMLElement;
    private _gamepadIndex: number;
    private _buttonLock: boolean[] = [];


    constructor(private navigationService: NavigationService) {
        window.addEventListener('gamepadconnected', (event: GamepadEvent) => {
            console.log(`Gamepad connected: ${event.gamepad.id}`);
            if (this._gamepadIndex === undefined) {
                this._gamepadIndex = event.gamepad.index;
            }
        });
        window.addEventListener('gamepaddisconnected', (event: GamepadEvent) => {
            console.log(`Gamepad disconnected: ${event.gamepad.id}`);
            if (this._gamepadIndex !== undefined && this._gamepadIndex === event.gamepad.index) {
                this._gamepadIndex = undefined;
            }
        });
    }

    get jump(): boolean {return this._jump || this.isButtonPressed(5);}

    get leftButton(): boolean {
        if (this._leftButton || this.isButtonPressed(0)) {
            if (this._leftButtonBlock) {
                return false;
            } else {
                this._leftButtonBlock = true;
                return true;
            }
        } else {
            this._leftButtonBlock = false;
            return false;
        }
    }

    get onCraft(): Array<() => void> {return this._craft;}

    get onEat(): Array<() => void> {return this._eat;}

    get onMouseMove(): Array<(x: number, y: number) => void> {return this._mouseMove;}

    get onMouseWheel(): Array<(x: number, y: number, amount: number) => void> {return this._mouseWheel;}

    get onRotateObject(): Array<(amount: number) => void> {return this._rotateObject;}

    get onSelectSlot(): Array<(index: number) => void> {return this._selectSlot;}

    get onSleep(): Array<() => void> {return this._sleep;}

    get onToggleCursorMode(): Array<() => void> {return this._toggleCursorMode;}

    get onUseObject(): Array<() => void> {return this._use;}

    get rightButton(): boolean {return this._rightButton || this.isButtonPressed(1);}

    get run(): boolean {return this._run || this.isButtonPressed(7);}

    get speedX(): number {
        let dx = this._right ? 1 : 0;
        if (this._left)
            --dx;
        dx += this.getJoyAxis(0);
        return dx;
    }

    get speedY(): number {
        let dy = this._up ? 1 : 0;
        if (this._down)
            --dy;
        dy -= this.getJoyAxis(1);
        return dy;
    }

    getJoyAxis(axis: number): number {
        if (this._gamepadIndex !== undefined) {
            const ret = navigator.getGamepads()[this._gamepadIndex].axes[axis];
            if (ret < -0.02 || ret > 0.02)
                return ret;
            else
                return 0;
        } else
            return 0;
    }

    init(element: HTMLElement): void {
        this._canvas = element;
        window.addEventListener('contextmenu', (e: PointerEvent) => {e.preventDefault(); return false;});
        document.addEventListener('pointerlockchange', (e: Event) => {
            if (document.pointerLockElement === this._canvas) {
                this._canvas.focus();
            } else if (document.pointerLockElement === null) {
                if (this.navigationService.isGameVisible())
                    this.navigationService.showGameMenu();
            }
        });
        document.addEventListener('pointerlockerror', (e: Event) => {
            console.error('Request pointer lock failed');
        });
        document.addEventListener('keydown', (e: KeyboardEvent) => {
            switch (e.keyCode) {
                case 13: // enter
                    this._use.forEach(cb => cb());
                    break;
                case 32: // space
                    this._craft.forEach(cb => cb());
                    break;
                case 33: // page up
                    this._rotateObject.forEach(cb => cb(1));
                    break;
                case 34: // page down
                    this._rotateObject.forEach(cb => cb(-1));
                    break;
                case 37: // left
                    this._left = true;
                    break;
                case 38: // up
                    this._up = true;
                    break;
                case 39: // right
                    this._right = true;
                    break;
                case 40: // down
                    this._down = true;
                    break;
                case 45: // insert
                    this._toggleCursorMode.forEach(cb => cb());
                    break;
                case 67: // C
                    this._craft.forEach(cb => cb());
                    break;
                case 69: // E
                    this._eat.forEach(cb => cb());
                    break;
                case 72: // H
                    this.navigationService.showHelp();
                    break;
                case 83: // S
                    this._sleep.forEach(cb => cb());
                    break;
                case 97: // Num 1
                    this._jump = true;
                    break;
                case 112: // F1
                    this.navigationService.showHelp();
                    break;
                case 114: // F3
                    break;
                case 116: // F5
                    if (e.ctrlKey)
                        return true;
                    break;
                case 117: // F6
                    break;
                case 119: // F8
                    break;
                default:
                    if (e.keyCode >= 48 && e.keyCode <= 57) {
                        const index = e.keyCode - 48;
                        this._selectSlot.forEach(cb => cb(index));
                    } else {
                        // console.log(e.keyCode);
                        return;
                    }
            }
            e.preventDefault();
            return false;
        });
        document.addEventListener('keyup', (e: KeyboardEvent) => {
            switch (e.keyCode) {
                case 37: // left
                    this._left = false;
                    break;
                case 38: // up
                    this._up = false;
                    break;
                case 39: // right
                    this._right = false;
                    break;
                case 40: // down
                    this._down = false;
                    break;
                case 96: // Num 0
                    this._run = !this._run;
                    break;
                case 97: // Num 1
                    this._jump = false;
                    break;
                default:
                    //console.log(e.keyCode);
                    return;
            }
            e.preventDefault();
            return false;
        });
        element.addEventListener('mousemove', (e: MouseEvent) => {
            if (document.pointerLockElement === this._canvas) {
                this._mouseMove.forEach(cb => cb(e.movementX, e.movementY));
            }
        });
        window.addEventListener('mousewheel', (e: WheelEvent) => {
            if (e.ctrlKey) {
                e.preventDefault();
                return false;
            }
        });
        element.addEventListener('mousewheel', (e: WheelEvent) => {
            if (document.pointerLockElement === this._canvas) {
                const dx = -e.wheelDeltaX / 120;
                const dy = -e.wheelDeltaY / 120;
                if (e.ctrlKey || e.shiftKey)
                    this._rotateObject.forEach(cb => cb(dx + dy));
                else
                    this._mouseWheel.forEach(cb => cb(dx, dy));
            }
        });
        element.addEventListener('mousedown', (e: MouseEvent) => {
            if (this.navigationService.isGameVisible()) {
                this.startPointerLock();
            }
            if (document.pointerLockElement === this._canvas) {
                this._leftButton = (e.buttons & 1) === 1;
                this._rightButton = (e.buttons & 2) === 2;
            }
        });
        element.addEventListener('mouseup', (e: MouseEvent) => {
            if (document.pointerLockElement === this._canvas) {
                this._leftButton = (e.buttons & 1) === 1;
                this._rightButton = (e.buttons & 2) === 2;
            }
        });
    }

    isButtonToggled(button: number): boolean {
        if (this._gamepadIndex === undefined) {
            return false;
        }
        if (navigator.getGamepads()[this._gamepadIndex].buttons[button].pressed) {
            if (this._buttonLock[button]) {
                return false;
            } else {
                this._buttonLock[button] = true;
                return true;
            }
        } else {
            this._buttonLock[button] = false;
            return false;
        }
    }

    startPointerLock(): void {
        if (document.pointerLockElement !== this._canvas) {
            if (document.pointerLockElement !== null)
                document.exitPointerLock();
            this._canvas.focus();
            this._canvas.requestPointerLock();
        }
    }

    private isButtonPressed(button: number): boolean {
        return this._gamepadIndex !== undefined ? navigator.getGamepads()[this._gamepadIndex].buttons[button].pressed : false;
    }
}
