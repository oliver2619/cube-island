import {Assets} from "./assets";
import {Object3D, Vector3} from "three";
import {CollectibleType, DiggingControl, CollectibleTypeFactory} from "./collectible";
import {Constants} from "./constants";
import {ObjectType} from "./objects";
import {CubeType, CubeTypes} from "./cubeTypes";
import {StaticObject} from "./staticObject";

export interface PlantImpStoreData {
    grown: number;
}

export interface PlantImp {
    grown: number;
}

export abstract class ObjectTypePlant extends ObjectType<PlantImp>{

    protected abstract growSpeed: number;

    constructor(id: string) {super(id);}

    canExistOn(cubeType: CubeType): boolean {return cubeType === CubeTypes.GRAS || cubeType === CubeTypes.MUD;}

    create(assets: Assets): Object3D {
        const ret = this.createPlant(assets);
        ret.rotation.z = Math.random() * 2 * Math.PI;
        return ret;
    }

    initUserData(object: StaticObject<PlantImp>): PlantImp {
        this.scalePlant(object.object3D, 0);
        return {
            grown: 0
        };
    }

    isHarvestable(userData: PlantImp): boolean {return userData.grown >= 1;}

    isSimulation(): boolean {return true;}

    load(object: StaticObject<PlantImp>, userData: PlantImpStoreData, factory: CollectibleTypeFactory): PlantImp {
        const ret: PlantImp = {
            grown: userData.grown
        };
        this.scalePlant(object.object3D, ret.grown);
        return ret;
    }

    needsCubeToExist(): boolean {return true;}

    save(userData: PlantImp): PlantImpStoreData {
        return {
            grown: userData.grown
        };
    }

    simulate(object: StaticObject<PlantImp>, timeout: number): void {
        object.userData.grown += timeout * this.growSpeed;
        if (object.userData.grown > 1) {
            object.userData.grown = 1;
        }
        this.scalePlant(object.object3D, object.userData.grown);
    }

    protected abstract createPlant(assets: Assets): Object3D;

    protected scalePlant(object: Object3D, grown: number): void {
        object.scale.setScalar(.1 + .9 * grown);
    }
}

export abstract class ObjectTypeFlower extends ObjectTypePlant {

    constructor(id: string) {super(id);}

    get diggingTime(): number {return .3;}

    get growSpeed(): number {return 1 / Constants.daysInSeconds;}

    dig(control: DiggingControl): boolean {
        control.removeTarget();
        return control.collect(this, 2);
    }

    isObstacle(): boolean {return false;}
}

export class ObjectTypeFlowerWhite extends ObjectTypeFlower {

    constructor(id: string) {super(id);}

    protected createPlant(assets: Assets): Object3D {return assets.objects.flowerWhite;}
}

export class ObjectTypeFlowerRed extends ObjectTypeFlower {

    constructor(id: string) {super(id);}

    protected createPlant(assets: Assets): Object3D {return assets.objects.flowerRed;}
}

export class ObjectTypeFlowerBlue extends ObjectTypeFlower {

    constructor(id: string) {super(id);}

    protected createPlant(assets: Assets): Object3D {return assets.objects.flowerBlue;}
}

export class ObjectTypeFlowerYellow extends ObjectTypeFlower {

    constructor(id: string) {super(id);}

    protected createPlant(assets: Assets): Object3D {return assets.objects.flowerYellow;}
}

export class ObjectTypeFlowerPink extends ObjectTypeFlower {

    constructor(id: string) {super(id);}

    protected createPlant(assets: Assets): Object3D {return assets.objects.flowerPink;}
}

export class ObjectTypeMushroom extends ObjectTypePlant {

    constructor(id: string) {super(id);}

    get diggingTime(): number {return .3;}

    get healingValue(): number {return 0;}
    
    get growSpeed(): number {return 2 / Constants.daysInSeconds;}

    get nutritiveValue(): number {return 0.2;}

    canBuild(): boolean {return false;}

    isObstacle(): boolean {return false;}

    protected createPlant(assets: Assets): Object3D {return assets.objects.mushroom;}
}

export class ObjectTypeTree extends ObjectTypePlant {

    constructor(id: string, private woodType: CollectibleType) {super(id);}

    get diggingTime(): number {return .3;}

    get growSpeed(): number {return .5 / Constants.daysInSeconds;}

    get size(): Vector3 {return new Vector3(1, 1, 15);}

    protected createPlant(assets: Assets): Object3D {return assets.objects.tree;}

    dig(control: DiggingControl): void {
        control.collect(this, 2);
        control.removeTarget();
        control.stack(this.woodType, 10);
    }

}

