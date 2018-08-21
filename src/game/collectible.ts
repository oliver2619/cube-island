import {Assets} from "./assets";
import {Object3D, Vector3, Box3} from "three";

export abstract class CollectibleType {
    abstract diggingTime: number;

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
        szX = (szX - 1) / 2;
        szY = (szY - 1) / 2;
        const ret = new Box3();
        ret.min.x = newPos.x - szX;
        ret.min.y = newPos.y - szY;
        ret.min.z = newPos.z;
        ret.max.x = newPos.x + szX;
        ret.max.y = newPos.y + szY;
        ret.max.z = newPos.z + this.size.z - 1;
        return ret;
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

