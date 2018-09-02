import {Collectible, CollectibleType, CollectibleTypeFactory} from "./collectible";
import {Object3D, Box3, Vector3} from "three";
import {ObjectType, ObjectControl} from "./objects";
import {Assets} from "./assets";
import {Constants} from "./constants";
import {Vector3StoreData} from "./commonStoreData";
import {Simulation} from "./simulation";

export class StaticObjectStoreData<U>{
    userData: U;
    rotation: number;
    position: Vector3StoreData;
    type: string;
}

export class StaticObject<T> implements Collectible, Simulation {
    userData: T;
    private _object3d: Object3D;
    private _box: Box3 = new Box3();

    constructor(private position: Vector3, private rotation: number, private _type: ObjectType<T>, assets: Assets) {
        this._box = _type.calcBoundingBox(position, rotation);
        this._object3d = this._type.create(assets);
        this._object3d.position.set(
            (this._box.min.x + this._box.max.x + 1) * Constants.cubeSize / 2,
            (this._box.min.y + this._box.max.y + 1) * Constants.cubeSize / 2,
            this._box.min.z * Constants.cubeSize);
        this.object3D.rotateZ(rotation * Math.PI / 2);
        this.userData = _type.initUserData(this);
        _type.postCreate(this);
    }

    get type(): CollectibleType {return this._type;}

    get object3D(): Object3D {return this._object3d;}

    get objectType(): ObjectType<T> {return this._type;}

    get x1(): number {return this._box.min.x;}

    get y1(): number {return this._box.min.y;}

    get z1(): number {return this._box.min.z;}

    get x2(): number {return this._box.max.x;}

    get y2(): number {return this._box.max.y;}

    get z2(): number {return this._box.max.z;}

    static applyToObject(pos: Vector3, rotation: number, type: ObjectType<any>, target: Object3D): void {
        const box = type.calcBoundingBox(pos, rotation);
        target.position.set((box.min.x + box.max.x + 1) * Constants.cubeSize / 2,
            (box.min.y + box.max.y + 1) * Constants.cubeSize / 2,
            box.min.z * Constants.cubeSize);
        target.rotation.z = rotation * Math.PI / 2;
    }

    canWalkThrough(): boolean {return this._type.canWalkThrough(this.userData);}

    isHarvestable(): boolean {return this._type.isHarvestable(this.userData);}

    loadUserData(input: any, factory: CollectibleTypeFactory): void {
        this.userData = this._type.load(this, input, factory);
    }

    save(): StaticObjectStoreData<any> {
        const ret = new StaticObjectStoreData<any>();
        ret.rotation = this.rotation;
        ret.position = Vector3StoreData.save(this.position);
        ret.type = this._type.id;
        ret.userData = this._type.save(this.userData);
        return ret;
    }

    simulate(timeout: number): void {
        this._type.simulate(this, timeout);
    }

    needsCubeToExist(): boolean{
        return this._type.needsCubeToExist();
    }
    
    use(control: ObjectControl): boolean {return this._type.use(this, control);}
}
