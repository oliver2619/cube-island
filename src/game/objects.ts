import {Object3D, Mesh, PlaneBufferGeometry, Vector3} from "three";
import {Assets} from "./assets";
import {Constants} from "./constants";
import {CollectibleType, CollectibleTypeFactory} from "./collectible";
import {ObjectAnimation, SmoothAnimation} from "./objectAnimation";
import {ResourceSet, ResourceSetStoreData} from "./resourceSet";
import {StaticObject} from "./staticObject";
import {CubeType} from "./cubeTypes";
import {FactoryType} from "./factoryType";

export interface ObjectControl {
    addAnimation: (animation: ObjectAnimation) => void;

    craft: (factoryType: FactoryType) => void;

    openChest: (chestImp: ChestImp) => void;
}

export abstract class ObjectType<T> extends CollectibleType {

    abstract diggingTime: number;

    get healingValue(): number {return 0;}
    
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

    postCreate(object: StaticObject<T>): void {}
    
    save(userData: T): any {return undefined;}

    simulate(object: StaticObject<T>, timeout: number): void {}

    use(object: StaticObject<T>, control: ObjectControl): boolean {return false;}
}

// special object types

export class ObjectTypeAnvil extends ObjectType<any> {

    constructor(id: string) {super(id);}

    get diggingTime(): number {return .4 * 2;}

    canStack(): boolean {return false;}

    create(assets: Assets): Object3D {return assets.objects.anvil;}

    use(object: StaticObject<any>, control: ObjectControl): boolean {
        control.craft(FactoryType.ANVIL);
        return true;
    }
}

export class ObjectTypeBarSteel extends ObjectType<any> {

    constructor(id: string) {super(id);}

    get diggingTime(): number {return .4 * 2;}

    canStack(): boolean {return false;}

    create(assets: Assets): Object3D {return assets.objects.barSteel;}
}

export class ObjectTypeBucketMetalEmpty extends ObjectType<any> {

    constructor(id: string) {super(id);}

    get diggingTime(): number {return .4 * 2;}

    canStack(): boolean {return true;}

    create(assets: Assets): Object3D {return assets.objects.bucketMetalEmpty;}
}

export class ObjectTypeBucketWoodEmpty extends ObjectType<any> {

    constructor(id: string) {super(id);}

    get diggingTime(): number {return .4 * 2;}

    canStack(): boolean {return true;}

    create(assets: Assets): Object3D {return assets.objects.bucketWoodEmpty;}
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

    canStack(): boolean {return false;}

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

export class ObjectTypeCompost extends ObjectType<any> {

    constructor(id: string) {super(id);}

    get diggingTime(): number {return .4 * 2;}

    get size(): Vector3 {return new Vector3(2, 2, 1);}

    canStack(): boolean {return false;}

    coversFloor(): boolean {return true;}

    create(assets: Assets): Object3D {return assets.objects.compost;}

    use(object: StaticObject<any>, control: ObjectControl): boolean {
        control.craft(FactoryType.COMPOST);
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

    coversFloor(): boolean {return true;}

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

    create(assets: Assets): Object3D {return assets.objects.fence;}
}

export class ObjectTypeFurnace extends ObjectType<any> {

    constructor(id: string) {super(id);}

    get diggingTime(): number {return .4 * 2;}

    get size(): Vector3 {return new Vector3(3, 3, 2);}

    create(assets: Assets): Object3D {return assets.objects.furnace;}

    use(object: StaticObject<any>, control: ObjectControl): boolean {
        control.craft(FactoryType.FURNACE_METAL);
        return true;
    }
}

export class ObjectTypeGlas extends ObjectType<any> {

    constructor(id: string) {super(id);}

    get diggingTime(): number {return .4;}

    create(assets: Assets): Object3D {
        const ret = assets.objects.getCube(assets.materials.glas);
        ret.castShadow = false;
        return ret;
    }
}

export class ObjectTypeGrass extends ObjectType<any> {

    constructor(id: string) {super(id);}

    get diggingTime(): number {return .3;}

    canStack(): boolean {return false;}

    coversFloor(): boolean {return true;}

    create(assets: Assets): Object3D {
        const geo = new PlaneBufferGeometry(Constants.cubeSize, Constants.cubeSize);
        geo.translate(Constants.cubeSize * .5, Constants.cubeSize * .5, 0);
        return new Mesh(geo, assets.materials.gras);
    }

    isObstacle(): boolean {return false;}
}

export class ObjectTypeStairsStone extends ObjectType<any> {

    constructor(id: string) {super(id);}

    get diggingTime(): number {return .4 * 2;}

    create(assets: Assets): Object3D {return assets.objects.stairsStone;}
}

export class ObjectTypeStairsWood extends ObjectType<any> {

    constructor(id: string) {super(id);}

    get diggingTime(): number {return .4 * 2;}

    create(assets: Assets): Object3D {return assets.objects.stairsWood;}
}

export class ObjectTypeStickWood extends ObjectType<any> {

    constructor(id: string) {super(id);}

    get diggingTime(): number {return .4 * 2;}

    create(assets: Assets): Object3D {return assets.objects.stickWood;}
}

export class ObjectTypeStonemill extends ObjectType<any> {

    constructor(id: string) {super(id);}

    get diggingTime(): number {return .4 * 2;}

    get size(): Vector3 {return new Vector3(3, 2, 1);}

    create(assets: Assets): Object3D {return assets.objects.stonemill;}

    use(object: StaticObject<any>, control: ObjectControl): boolean {
        control.craft(FactoryType.STONE_MILL);
        return true;
    }
}

export class ObjectTypeWindow extends ObjectType<any> {

    constructor(id: string) {super(id);}

    get diggingTime(): number {return .4 * 2;}

    create(assets: Assets): Object3D {return assets.objects.window;}
}

export class ObjectTypeWorkbench extends ObjectType<any> {

    constructor(id: string) {super(id);}

    get diggingTime(): number {return .4 * 2;}

    get size(): Vector3 {return new Vector3(3, 2, 2);}

    create(assets: Assets): Object3D {return assets.objects.workbench;}

    use(object: StaticObject<any>, control: ObjectControl): boolean {
        control.craft(FactoryType.WORK_BENCH);
        return true;
    }
}

