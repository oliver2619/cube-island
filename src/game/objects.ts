import {Object3D, Mesh, PlaneBufferGeometry, Box3, Vector3} from "three";
import {Assets} from "./assets";
import {Constants} from "./constants";
import {CollectibleType, CollectibleTypeFactory} from "./collectible";
import {ObjectAnimation, SmoothAnimation} from "./objectAnimation";
import {ResourceSet, ResourceSetStoreData} from "./resourceSet";
import {StaticObject} from "./staticObject";
import {CubeType, CubeTypes} from "./cubeTypes";

export class ObjectControl {
    addAnimation: (animation: ObjectAnimation) => void;

    openChest: (chestImp: ChestImp) => void;
}

export abstract class ObjectType<T> extends CollectibleType {

    abstract diggingTime: number;

    get nutritiveValue(): number {return 0;}

    get size(): Vector3 {return new Vector3(1, 1, 1);}

    constructor(id: string) {super(id);}

    canExistOn(cubeType: CubeType): boolean {return true;}

    canWalkThrough(userData: T): boolean {
        return !this.isObstacle();
    }

    coversFloor(): boolean {return false;}

    abstract create(assets: Assets): Object3D;

    createForCursor(assets: Assets): Object3D {
        const ret = this.create(assets);
        ret.traverse(o => {
            if (o instanceof Mesh) {
                const m = <Mesh> o;
                if (m.material instanceof Array)
                    m.material = m.material.map(m => assets.materials.cursor);
                else
                    m.material = assets.materials.cursor;
            }
        });
        return ret;
    }

    createForHud(assets: Assets): Object3D {
        const ret = this.create(assets);
        ret.rotation.x = -90 * Math.PI / 180;
        return ret;
    }

    initUserData(object: StaticObject<T>): T {return null;}

    isHarvestable(userData: T): boolean {return true;}

    isObstacle(): boolean {return true;}

    isSimulation(): boolean {return false;}

    load(object: StaticObject<T>, userData: any, factory: CollectibleTypeFactory): T {return undefined;}

    needsCubeToExist(): boolean {return false;}

    save(userData: T): any {return undefined;}

    simulate(object: StaticObject<T>, timeout: number): void {}

    use(object: StaticObject<T>, control: ObjectControl): boolean {return false;}
}

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

export interface ChestImpStoreData {
    content: ResourceSetStoreData;
}

export interface ChestImp {
    moving: boolean;
    closed: boolean;
    content: ResourceSet;

    close?: () => void;
}

export class ObjectTypeChest extends ObjectType<ChestImp> {
    get diggingTime(): number {return 1;}

    constructor(id: string) {super(id);}

    create(assets: Assets): Object3D {return assets.objects.chest;}

    createForCursor(assets: Assets): Object3D {
        const ret = super.createForCursor(assets);
        const top = ret.getObjectByName('Top');
        top.rotation.x = -Math.PI / 6;
        return ret;
    }

    createForHud(assets: Assets): Object3D {
        const ret = super.createForHud(assets);
        const top = ret.getObjectByName('Top');
        top.rotation.x = -Math.PI / 6;
        return ret;
    }

    initUserData(object: StaticObject<ChestImp>): ChestImp {
        return {
            moving: false,
            closed: true,
            content: new ResourceSet(32)
        }
    }

    isHarvestable(userData: ChestImp): boolean {return userData.content.isEmpty();}

    load(object: StaticObject<ChestImp>, userData: ChestImpStoreData, factory: CollectibleTypeFactory): ChestImp {
        const r = new ResourceSet(32);
        r.load(userData.content, factory);
        return {
            moving: false,
            closed: true,
            content: r
        };
    }

    save(userData: ChestImp): ChestImpStoreData {
        return {
            content: userData.content.save()
        };
    }

    use(object: StaticObject<ChestImp>, control: ObjectControl): boolean {
        if (object.userData.moving)
            return false;
        const top = object.object3D.getObjectByName('Top');
        object.userData.moving = true;
        const anim = new ObjectAnimation(.7, (time, total) => {
            if (object.userData.closed)
                top.rotation.x = -SmoothAnimation(time / total) * Math.PI / 2;
            else
                top.rotation.x = -SmoothAnimation(1 - time / total) * Math.PI / 2;
        }, () => {
            object.userData.closed = !object.userData.closed;
            object.userData.moving = false;

            if (!object.userData.closed) {
                control.openChest(object.userData);
                object.userData.close = () => {
                    this.use(object, control);
                };
            }
        });
        control.addAnimation(anim);
        return true;
    }
}

export interface DoorImpStoreData {
    closed: boolean;
}

export interface DoorImp {
    moving: boolean;
    closed: boolean;
}

export class ObjectTypeDoorWood extends ObjectType<DoorImp> {

    constructor(id: string) {super(id);}

    get diggingTime(): number {return 1;}

    get size(): Vector3 {return new Vector3(3, 1, 5);}

    canWalkThrough(userData: DoorImp): boolean {
        return !userData.closed;
    }

    create(assets: Assets): Object3D {return assets.objects.doorWood;}

    createForCursor(assets: Assets): Object3D {
        const ret = super.createForCursor(assets);
        const door = ret.getObjectByName('door');
        door.rotation.z = Math.PI / 6;
        return ret;
    }

    createForHud(assets: Assets): Object3D {
        const ret = super.createForHud(assets);
        const door = ret.getObjectByName('door');
        door.rotation.z = Math.PI / 6;
        return ret;
    }

    initUserData(object: StaticObject<DoorImp>): DoorImp {
        return {
            moving: false,
            closed: true
        }
    }

    load(object: StaticObject<DoorImp>, userData: DoorImpStoreData, factory: CollectibleTypeFactory): DoorImp {
        const closed = userData.closed;
        const door = object.object3D.getObjectByName('door');
        if (!closed)
            door.rotation.z = Math.PI / 2;
        return {
            moving: false,
            closed: closed
        }
    }

    save(userData: DoorImp): DoorImpStoreData {
        return {
            closed: userData.closed
        };
    }

    use(object: StaticObject<DoorImp>, control: ObjectControl): boolean {
        if (object.userData.moving)
            return false;
        const door = object.object3D.getObjectByName('door');
        object.userData.moving = true;
        const anim = new ObjectAnimation(.9, (time, total) => {
            if (object.userData.closed)
                door.rotation.z = SmoothAnimation(time / total) * Math.PI / 2;
            else
                door.rotation.z = SmoothAnimation(1 - time / total) * Math.PI / 2;
        }, () => {
            object.userData.closed = !object.userData.closed;
            object.userData.moving = false;
        });
        control.addAnimation(anim);
        return true;
    }
}

export class ObjectTypeFenceWood extends ObjectType<any> {

    constructor(id: string) {super(id);}

    get diggingTime(): number {return .4;}

    coversFloor(): boolean {return false;}

    create(assets: Assets): Object3D {return assets.objects.fence;}
}

export class ObjectTypeGlas extends ObjectType<any> {

    constructor(id: string) {super(id);}

    get diggingTime(): number {return .4;}

    coversFloor(): boolean {return false;}

    create(assets: Assets): Object3D {
        const ret = assets.objects.getCube(assets.materials.glas);
        ret.castShadow = false;
        ret.receiveShadow = false;
        return ret;
    }
}

export class ObjectTypeGrass extends ObjectType<any> {

    constructor(id: string) {super(id);}

    get diggingTime(): number {return .3;}

    coversFloor(): boolean {return true;}

    create(assets: Assets): Object3D {
        const geo = new PlaneBufferGeometry(Constants.cubeSize, Constants.cubeSize);
        geo.translate(Constants.cubeSize * .5, Constants.cubeSize * .5, 0);
        return new Mesh(geo, assets.materials.gras);
    }

    isObstacle(): boolean {return false;}
}

export abstract class ObjectTypeFlower extends ObjectTypePlant {

    constructor(id: string) {super(id);}

    get diggingTime(): number {return .3;}

    get growSpeed(): number {return 1 / Constants.daysInSeconds;}

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

    get growSpeed(): number {return 2 / Constants.daysInSeconds;}

    get nutritiveValue(): number {return 0.2;}

    canBuild(): boolean {return false;}

    isObstacle(): boolean {return false;}

    protected createPlant(assets: Assets): Object3D {return assets.objects.mushroom;}
}

export class ObjectTypeStairsStone extends ObjectType<any> {

    constructor(id: string) {super(id);}

    get diggingTime(): number {return .4 * 2;}

    coversFloor(): boolean {return false;}

    create(assets: Assets): Object3D {return assets.objects.stairsStone;}
}

export class ObjectTypeStairsWood extends ObjectType<any> {

    constructor(id: string) {super(id);}

    get diggingTime(): number {return .4 * 2;}

    coversFloor(): boolean {return false;}

    create(assets: Assets): Object3D {return assets.objects.stairsWood;}
}

export class ObjectTypeWindow extends ObjectType<any> {

    constructor(id: string) {super(id);}

    get diggingTime(): number {return .4 * 2;}

    coversFloor(): boolean {return false;}

    create(assets: Assets): Object3D {return assets.objects.window;}
}

