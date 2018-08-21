import {PerspectiveCamera, Object3D, Euler, Vector3, Ray, Box3} from "three";
import {Constants} from "./constants";
import {InputControlService} from "../app/services/input-control.service";
import {World} from "./world";
import {CollisionMnemento} from "./collision";
import {ObjectControl} from "./objects";
import {HUD} from "./hud";
import {CollectibleType, CollectibleTypeFactory, Collectible} from "./collectible";
import {Vector3StoreData} from "./commonStoreData";
import {ResourceSetStoreData, ResourceSet} from "./resourceSet";
import {StaticObject} from "./staticObject";
import {Cube} from "./cubes";
import {CubeType} from "./cubeTypes";

export class PersonStoreData {
    position: Vector3StoreData;
    speed: Vector3StoreData;
    rotation: Vector3StoreData;
    health: number;
    awake: number;
    feed: number;
    resources: ResourceSetStoreData;
}

export class Person {
    private static WIDTH = .35;
    private object: Object3D = new Object3D();
    private speed: Vector3 = new Vector3();
    private height: number = 1.8;
    private euler: Euler = new Euler();
    private hasFloor = true;
    private diggingTime = 0;
    private diggingTotalTime = 0;
    private diggingPosition: Vector3 = null;
    private _health: number;
    private awake: number;
    private feed: number;
    private objectRotation = 0;
    private _inventory: ResourceSet = new ResourceSet(8);

    constructor(private hud: HUD) {
        this.euler.order = 'ZXY';
        this.updateHudAttributes();
        this._inventory.onChange.push((slot: number, type: CollectibleType, amount: number) => {
            this.hud.setResources(slot, type, amount);
        });
    }

    get diggingProgress(): number {return this.diggingPosition !== null ? this.diggingTime / this.diggingTotalTime : null;}

    get health(): number {return this._health;}

    get inventory(): ResourceSet {return this._inventory;}

    get position(): Vector3 {return this.object.position;}

    set position(p: Vector3) {this.object.position.copy(p);}

    addHealth(amount: number): void {
        this._health += amount;
        if (this._health > 1)
            this._health = 1;
        this.updateHudAttributes();
    }
    
    animate(timeout: number, worldSize: number): void {
        this.object.position.addScaledVector(this.speed, timeout);
        if (this.object.position.x < Person.WIDTH) {
            this.object.position.x = Person.WIDTH;
            this.speed.x = 0;
        } else if (this.object.position.x > worldSize * Constants.cubeSize - Person.WIDTH) {
            this.object.position.x = worldSize * Constants.cubeSize - Person.WIDTH;
            this.speed.x = 0;
        }
        if (this.object.position.y < Person.WIDTH) {
            this.object.position.y = Person.WIDTH;
            this.speed.y = 0;
        } else if (this.object.position.y > worldSize * Constants.cubeSize - Person.WIDTH) {
            this.object.position.y = worldSize * Constants.cubeSize - Person.WIDTH;
            this.speed.y = 0;
        }
        if (this.object.position.z < 0) {
            this.object.position.z = 0;
            this.speed.z = 0;
        }
        if (this._health < 1) {
            this._health += timeout * this._health * this.awake * this.feed / Constants.daysInSeconds;
            if (this._health > 1)
                this._health = 1;
        }
        this.awake -= timeout / (.7 * Constants.daysInSeconds);
        if (this.awake < 0) {
            this._health -= 3 * timeout / Constants.daysInSeconds;
            this.awake = 0;
        }

        this.feed -= timeout * 4 / (Constants.daysInSeconds);
        if (this.feed < 0) {
            this._health -= 5 * timeout / Constants.daysInSeconds;
            this.feed = 0;
        }
        if (this._health < 0)
            this._health = 0;
        this.updateHudAttributes();
    }

    calcForces(world: World, timeout: number): void {
        let bbx1: number, bbx2: number, bby1: number, bby2: number, bbz1: number, bbz2: number;
        bbx1 = Math.floor((this.object.position.x - Person.WIDTH) / Constants.cubeSize);
        bbx2 = Math.floor((this.object.position.x + Person.WIDTH) / Constants.cubeSize);
        bby1 = Math.floor((this.object.position.y - Person.WIDTH) / Constants.cubeSize);
        bby2 = Math.floor((this.object.position.y + Person.WIDTH) / Constants.cubeSize);
        bbz1 = Math.floor((this.object.position.z) / Constants.cubeSize);
        bbz2 = Math.floor((this.object.position.z + this.height) / Constants.cubeSize);
        let fz = Math.floor((this.object.position.z - .1) / Constants.cubeSize);
        let v: Vector3 = new Vector3();
        this.hasFloor = false;
        let col: Collectible;
        let cubeType: CubeType;
        for (let x = bbx1; x <= bbx2; ++x) {
            for (let y = bby1; y <= bby2; ++y) {
                for (let z = bbz1; z <= bbz2; ++z) {
                    col = world.getCollectible(x, y, z);
                    if (col !== null) {
                        if (!col.canWalkThrough()) {
                            v.add(new Vector3(this.position.x - (x + .5) * Constants.cubeSize, this.position.y - (y + .5) * Constants.cubeSize, this.position.z + this.height * .5 - (z + .5) * Constants.cubeSize));
                        } else if (col instanceof Cube) {
                            cubeType = (<Cube> col).cubeType;
                            if (cubeType.isLiquid()) {

                            }
                        }
                    }
                }
                if (!this.hasFloor && !world.canWalkThrough(x, y, fz))
                    this.hasFloor = true;
            }
        }
        v.normalize();
        this.speed.addScaledVector(v, Constants.gravity * timeout);
        if (!this.hasFloor)
            this.speed.z -= Constants.gravity * timeout;
    }

    canSleep(): boolean {return this.awake < Constants.sleepThreshold;}

    eat(): void {
        if (this._inventory.getAmount(this.hud.selectedInventorySlot) === 0)
            return;
        const ty = this._inventory.getType(this.hud.selectedInventorySlot);
        if (ty.canEat()) {
            const r = this._inventory.removeFromSlot(this.hud.selectedInventorySlot, 1);
            if (r > 0) {
                this.feed += ty.nutritiveValue;
                if (this.feed > 1)
                    this.feed = 1;
                this.updateHudAttributes();
            }
        }
    }

    getBoundingBox(): Box3 {
        const ret = new Box3();
        ret.min.x = Math.floor((this.object.position.x - Person.WIDTH) / Constants.cubeSize);
        ret.max.x = Math.floor((this.object.position.x + Person.WIDTH) / Constants.cubeSize);
        ret.min.y = Math.floor((this.object.position.y - Person.WIDTH) / Constants.cubeSize);
        ret.max.y = Math.floor((this.object.position.y + Person.WIDTH) / Constants.cubeSize);
        ret.min.z = Math.floor((this.object.position.z) / Constants.cubeSize);
        ret.max.z = Math.floor((this.object.position.z + this.height) / Constants.cubeSize);
        return ret;
    }

    getCollisionWithWorld(world: World, collision: CollisionMnemento): void {
        let mbx1: number, mbx2: number, mby1: number, mby2: number, mbz1: number, mbz2: number;
        const bb = this.getBoundingBox();
        if (this.speed.x >= 0) {
            mbx1 = bb.min.x;
            mbx2 = Math.floor((this.object.position.x + Person.WIDTH + this.speed.x * collision.timeout) / Constants.cubeSize);
        } else {
            mbx1 = Math.floor((this.object.position.x - Person.WIDTH + this.speed.x * collision.timeout) / Constants.cubeSize);
            mbx2 = bb.max.x;
        }
        if (this.speed.y >= 0) {
            mby1 = bb.min.y;
            mby2 = Math.floor((this.object.position.y + Person.WIDTH + this.speed.y * collision.timeout) / Constants.cubeSize);
        } else {
            mby1 = Math.floor((this.object.position.y - Person.WIDTH + this.speed.y * collision.timeout) / Constants.cubeSize);
            mby2 = bb.max.y;
        }
        if (this.speed.z >= 0) {
            mbz1 = bb.min.z;
            mbz2 = Math.floor((this.object.position.z + this.height + this.speed.z * collision.timeout) / Constants.cubeSize);
        } else {
            mbz1 = Math.floor((this.object.position.z + this.speed.z * collision.timeout) / Constants.cubeSize);
            mbz2 = bb.max.z;
        }
        let t: number;
        for (let x = mbx1; x <= mbx2; ++x) {
            for (let y = mby1; y <= mby2; ++y) {
                for (let z = mbz1; z <= mbz2; ++z) {
                    if (!world.canWalkThrough(x, y, z)) {
                        if (this.speed.x > 0 && bb.max.x < x && z > mbz1) {
                            t = (x * Constants.cubeSize - this.object.position.x - Person.WIDTH) / this.speed.x;
                            if (t < collision.timeout) {
                                collision.addCollision(() => {this.speed.x = 0;}, t);
                            }
                        }
                        if (this.speed.x < 0 && bb.min.x > x && z > mbz1) {
                            t = ((x + 1) * Constants.cubeSize - this.object.position.x + Person.WIDTH) / this.speed.x;
                            if (t < collision.timeout) {
                                collision.addCollision(() => {this.speed.x = 0;}, t);
                            }
                        }
                        if (this.speed.y > 0 && bb.max.y < y && z > mbz1) {
                            t = (y * Constants.cubeSize - this.object.position.y - Person.WIDTH) / this.speed.y;
                            if (t < collision.timeout) {
                                collision.addCollision(() => {this.speed.y = 0;}, t);
                            }
                        }
                        if (this.speed.y < 0 && bb.min.y > y && z > mbz1) {
                            t = ((y + 1) * Constants.cubeSize - this.object.position.y + Person.WIDTH) / this.speed.y;
                            if (t < collision.timeout) {
                                collision.addCollision(() => {this.speed.y = 0;}, t);
                            }
                        }
                        if (this.speed.z > 0 && bb.max.z < z) {
                            t = (z * Constants.cubeSize - this.object.position.z - this.height) / this.speed.z;
                            if (t < collision.timeout) {
                                collision.addCollision(() => {this.speed.z = 0;}, t);
                            }
                        }
                        if (this.speed.z < 0 && bb.min.z > z) {
                            t = ((z + 1) * Constants.cubeSize - this.object.position.z) / this.speed.z;
                            if (t < collision.timeout) {
                                collision.addCollision(() => {this.fallDown();}, t);
                            }
                        }
                    }
                }
            }
        }
    }

    isAlive(): boolean {
        return this._health > 0;
    }

    load(input: PersonStoreData, factory: CollectibleTypeFactory): void {
        Vector3StoreData.load(input.position, this.object.position);
        Vector3StoreData.load(input.speed, this.speed);
        this._health = input.health;
        this.awake = input.awake;
        this.feed = input.feed;
        this.euler.x = Math.PI / 2;
        this.euler.y = input.rotation.y;
        this.euler.z = input.rotation.z;
        this._inventory.load(input.resources, factory);
    }

    lookThrough(camera: PerspectiveCamera): void {
        camera.position.copy(this.object.position);
        camera.position.addScaledVector(Constants.up, this.height - 0.15);
        camera.setRotationFromEuler(this.euler);
    }

    moveByUser(world: World, timeout: number, inputControlService: InputControlService): void {
        const maxSpeed = (inputControlService.run ? Constants.maxSpeed : (Constants.maxSpeed * .33)) * this._health;
        const accel = new Vector3();
        if (inputControlService.speedX !== 0 || inputControlService.speedY !== 0) {
            const sn = Math.sin(this.euler.z);
            const cs = Math.cos(this.euler.z);
            const right = new Vector3(cs, sn, 0);
            const forward = new Vector3(-sn, cs, 0);
            accel.addScaledVector(right, inputControlService.speedX);
            accel.addScaledVector(forward, inputControlService.speedY);
            accel.setLength(Constants.maxAcceleration);
        } else {
            accel.copy(this.speed);
            accel.z = 0;
            const speedLength = accel.length();
            if (speedLength / timeout > Constants.maxAcceleration)
                accel.multiplyScalar(-Constants.maxAcceleration / speedLength);
            else
                accel.multiplyScalar(-1 / timeout);
        }
        this.speed.addScaledVector(accel, timeout);
        const speedLength = Math.sqrt(this.speed.x * this.speed.x + this.speed.y * this.speed.y);
        if (speedLength > maxSpeed) {
            this.speed.x *= maxSpeed / speedLength;
            this.speed.y *= maxSpeed / speedLength;
        }
        if (inputControlService.jump && this.hasFloor)
            this.speed.z = Math.sqrt(2 * Constants.gravity * Constants.cubeSize * 2.1);
        if (inputControlService.rightButton) {
            this.dig(world, timeout);
        } else {
            this.diggingPosition = null;
            this.diggingTime = 0;
            if (inputControlService.leftButton) {
                this.build(world);
            }
        }
    }

    newGame(): void {
        this.object.position.y = 0;
        this.euler.x = Math.PI / 2;
        this.euler.y = 0;
        this.euler.z = Math.PI;
        this._health = 1;
        this.awake = 1;
        this.feed = .5;
    }

    rotateObject(amount: number): void {
        this.objectRotation = (this.objectRotation + amount + 20) % 4;
    }

    save(): PersonStoreData {
        const ret = new PersonStoreData();
        ret.position = Vector3StoreData.save(this.object.position);
        ret.speed = Vector3StoreData.save(this.speed);
        ret.rotation = new Vector3StoreData();
        ret.rotation.x = this.euler.x;
        ret.rotation.y = this.euler.y;
        ret.rotation.z = this.euler.z;
        ret.health = this._health;
        ret.awake = this.awake;
        ret.feed = this.feed;
        ret.resources = this._inventory.save();
        return ret;
    }

    sleep(): void {
        this.awake = 1;
        this.updateHudAttributes();
    }

    turn(x: number, y: number): void {
        this.euler.z -= x;
        this.euler.x -= y;
        if (this.euler.x < 0)
            this.euler.x = 0;
        else if (this.euler.x > Math.PI)
            this.euler.x = Math.PI;
    }

    updateCursor(world: World): void {
        if (this._inventory.getAmount(this.hud.selectedInventorySlot) > 0) {
            const ty = this._inventory.getType(this.hud.selectedInventorySlot);
            if (ty.canBuild()) {
                const newPos = this.getBuildCursor(world);
                if (newPos !== undefined) {
                    if (world.canAddCollectible(ty, newPos, this.objectRotation)) {
                        world.setCursor(ty, newPos, this.objectRotation);
                        return;
                    }
                }
            }
        }
        world.setCursor();
    }

    useObject(world: World, control: ObjectControl): boolean {
        const selectedPos = this.getDiggingCursor(world);
        if (selectedPos === undefined) {
            return false;
        }
        const col = world.getCollectible(selectedPos.x, selectedPos.y, selectedPos.z);
        if (col !== null && col instanceof StaticObject) {
            const obj = <StaticObject<any>> col;
            return obj.use(control);
        } else
            return false;
    }

    private build(world: World): void {
        if (this._inventory.getAmount(this.hud.selectedInventorySlot) === 0)
            return;
        const newPos = this.getBuildCursor(world);
        if (newPos === undefined)
            return;
        const ty = this._inventory.getType(this.hud.selectedInventorySlot);
        if (!ty.canBuild())
            return;
        if (world.canAddCollectible(ty, newPos, this.objectRotation)) {
            const r = this._inventory.removeFromSlot(this.hud.selectedInventorySlot, 1);
            if (r > 0)
                world.addCollectible(ty, newPos, this.objectRotation, true);
        }
    }

    private calculateRay(): Ray {
        const ray: Ray = new Ray(this.object.position.clone());
        ray.origin.addScaledVector(Constants.up, this.height - 0.15);
        ray.direction.set(0, 0, -1);
        ray.direction.applyEuler(this.euler);
        return ray;
    }

    private dig(world: World, timeout: number): void {
        const selectedPos = this.getDiggingCursor(world);
        if (selectedPos === undefined) {
            this.diggingPosition = null;
            this.diggingTime = 0;
            return;
        }
        const col = world.getCollectible(selectedPos.x, selectedPos.y, selectedPos.z);
        if (col !== null && col.isHarvestable()) {
            if (this.diggingPosition !== null && selectedPos.equals(this.diggingPosition)) {
                this.diggingTime += timeout * this._health;
                if (this.diggingTime >= this.diggingTotalTime) {
                    if (this._inventory.add(col.type, 1) === 1) {
                        world.removeCollectible(this.diggingPosition.x, this.diggingPosition.y, this.diggingPosition.z, true);
                        this.diggingPosition = null;
                        this.diggingTime = 0;
                    }
                }
            } else {
                if (this._inventory.canAdd(col.type, 1)) {
                    this.diggingPosition = selectedPos;
                    this.diggingTotalTime = col.type.diggingTime;
                } else {
                    this.diggingPosition = null;
                }
                this.diggingTime = 0;
            }
        } else {
            this.diggingPosition = null;
            this.diggingTime = 0;
        }
    }

    private fallDown(): void {
        if (this.speed.z < -9) {
            this._health += (this.speed.z + 9) / (14 - 9);
            if (this._health < 0)
                this._health = 0;
            this.updateHudAttributes();
        }
        this.speed.z = 0;
    }

    private getBuildCursor(world: World): Vector3 {
        const ray = this.calculateRay();
        const x1 = Math.floor(ray.origin.x / Constants.cubeSize);
        const y1 = Math.floor(ray.origin.y / Constants.cubeSize);
        const z1 = Math.floor(ray.origin.z / Constants.cubeSize);
        const x2 = Math.floor(ray.origin.x / Constants.cubeSize + ray.direction.x * Constants.actionRange);
        const y2 = Math.floor(ray.origin.y / Constants.cubeSize + ray.direction.y * Constants.actionRange);
        const z2 = Math.floor(ray.origin.z / Constants.cubeSize + ray.direction.z * Constants.actionRange);
        const xmax = Math.max(x1, x2), ymax = Math.max(y1, y2), zmax = Math.max(z1, z2);
        const box = new Box3();
        const target = new Vector3();
        let distance: number, selectedDistance;
        let selectedPos: Vector3, selectedTarget;
        for (let x = Math.min(x1, x2); x <= xmax; ++x) {
            for (let y = Math.min(y1, y2); y <= ymax; ++y) {
                for (let z = Math.min(z1, z2); z <= zmax; ++z) {
                    if (world.isObstacle(x, y, z)) {
                        box.min.set(x * Constants.cubeSize, y * Constants.cubeSize, z * Constants.cubeSize);
                        box.max.set((x + 1) * Constants.cubeSize, (y + 1) * Constants.cubeSize, (z + 1) * Constants.cubeSize);
                        if (ray.intersectBox(box, target) !== null) {
                            distance = target.distanceTo(ray.origin);
                            if (selectedDistance === undefined || selectedDistance > distance) {
                                selectedDistance = distance;
                                selectedPos = new Vector3(x, y, z);
                                selectedTarget = target.clone();
                            }
                        }
                    }
                }
            }
        }
        if (selectedTarget === undefined)
            return undefined;
        let selectedNormal = selectedTarget.clone();
        selectedNormal.sub(new Vector3((selectedPos.x + .5) * Constants.cubeSize, (selectedPos.y + .5) * Constants.cubeSize, (selectedPos.z + .5) * Constants.cubeSize));
        if (Math.abs(selectedNormal.x) > Math.abs(selectedNormal.y))
            selectedNormal.y = 0;
        else
            selectedNormal.x = 0;
        if (Math.abs(selectedNormal.x) > Math.abs(selectedNormal.z))
            selectedNormal.z = 0;
        else
            selectedNormal.x = 0;
        if (Math.abs(selectedNormal.y) > Math.abs(selectedNormal.z))
            selectedNormal.z = 0;
        else
            selectedNormal.y = 0;
        selectedNormal.normalize();
        return new Vector3(selectedPos.x + selectedNormal.x, selectedPos.y + selectedNormal.y, selectedPos.z + selectedNormal.z);
    }

    private getDiggingCursor(world: World): Vector3 {
        const ray = this.calculateRay();
        const x1 = Math.floor(ray.origin.x / Constants.cubeSize);
        const y1 = Math.floor(ray.origin.y / Constants.cubeSize);
        const z1 = Math.floor(ray.origin.z / Constants.cubeSize);
        const x2 = Math.floor(ray.origin.x / Constants.cubeSize + ray.direction.x * Constants.actionRange);
        const y2 = Math.floor(ray.origin.y / Constants.cubeSize + ray.direction.y * Constants.actionRange);
        const z2 = Math.floor(ray.origin.z / Constants.cubeSize + ray.direction.z * Constants.actionRange);
        const xmax = Math.max(x1, x2), ymax = Math.max(y1, y2), zmax = Math.max(z1, z2);
        const box = new Box3();
        const target = new Vector3();
        let distance: number, selectedDistance;
        let selectedPos: Vector3;
        for (let x = Math.min(x1, x2); x <= xmax; ++x) {
            for (let y = Math.min(y1, y2); y <= ymax; ++y) {
                for (let z = Math.min(z1, z2); z <= zmax; ++z) {
                    if (world.getCollectible(x, y, z) !== null) {
                        box.min.set(x * Constants.cubeSize, y * Constants.cubeSize, z * Constants.cubeSize);
                        box.max.set((x + 1) * Constants.cubeSize, (y + 1) * Constants.cubeSize, (z + 1) * Constants.cubeSize);
                        if (ray.intersectBox(box, target) !== null) {
                            distance = target.distanceTo(ray.origin);
                            if (selectedDistance === undefined || selectedDistance > distance) {
                                selectedDistance = distance;
                                selectedPos = new Vector3(x, y, z);
                            }
                        }
                    }
                }
            }
        }
        return selectedPos;
    }

    private updateHudAttributes(): void {
        this.hud.awake = this.awake;
        this.hud.health = this._health;
        this.hud.feed = this.feed;
    }
}