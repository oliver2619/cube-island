import {Assets} from "./assets";
import {Object3D, Vector3, Box3} from "three";

export interface DiggingControl {

    collect(type: CollectibleType, amount: number): boolean;

    removeTarget(): void;
    
    stack(type: CollectibleType, amount: number): void;
}

export abstract class CollectibleType {
    abstract diggingTime: number;

    // can be negative, if poison
    abstract healingValue: number;
    
    abstract nutritiveValue: number;

    abstract size: Vector3;

    constructor(private _id: string) {}

    get id(): string {return this._id;}

    canBuild(): boolean {return true;}

    canEat(): boolean {return this.nutritiveValue > 0;}

    abstract createForCursor(assets: Assets): Object3D;

    abstract createForHud(assets: Assets): Object3D;

    calcBoundingBox(newPos: Vector3, rotation: number): Box3 {
        let szX, szY;
        if ((rotation & 1) === 1) {
            szX = this.size.y;
            szY = this.size.x;
        } else {
            szX = this.size.x;
            szY = this.size.y;
        }
        const ret = new Box3();
        if ((szX & 1) === 0) {
            szX = szX / 2;
            ret.min.x = newPos.x - szX + 1;
            ret.max.x = newPos.x + szX;
        } else {
            szX = (szX - 1) / 2;
            ret.min.x = newPos.x - szX;
            ret.max.x = newPos.x + szX;
        }
        if ((szY & 1) === 0) {
            szY = szY / 2;
            ret.min.y = newPos.y - szY + 1;
            ret.max.y = newPos.y + szY;
        } else {
            szY = (szY - 1) / 2;
            ret.min.y = newPos.y - szY;
            ret.max.y = newPos.y + szY;
        }
        ret.min.z = newPos.z;
        ret.max.z = newPos.z + this.size.z - 1;
        return ret;
    }

    dig(control: DiggingControl): void {
        if (control.collect(this, 1))
            control.removeTarget();
    }
}

export interface CollectibleTypeFactory {
    create(type: string): CollectibleType;
}

export interface Collectible {

    type: CollectibleType;

    canWalkThrough(): boolean;

    isHarvestable(): boolean;
}

