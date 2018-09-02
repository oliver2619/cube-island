import {Scene, PerspectiveCamera, FogExp2, Geometry, Vector3, Vector2, Face3, Mesh, Object3D, WebGLRenderer, Camera, PCFShadowMap, LOD, Group} from "three";
import {SunStoreData} from "./sun";
import {Person, PersonStoreData} from "./person";
import {InputControlService} from "../app/services/input-control.service";
import {Assets} from "./assets";
import {CubeCluster, Cube, CubeClusterStoreData} from "./cubes";
import {WorldInitializer} from "./worldInitializer";
import {CubeType} from "./cubeTypes";
import {ObjectType} from "./objects";
import {CollisionMnemento} from "./collision";
import {HUD} from "./hud";
import {Collectible, CollectibleType, CollectibleTypeFactory} from "./collectible";
import {Constants} from "./constants";
import {ObjectAnimation} from "./objectAnimation";
import {IDStoreDataMapper, Vector3StoreData} from "./commonStoreData";
import {StaticObject, StaticObjectStoreData} from "./staticObject";
import {CollectibleTypes} from "./collectibleTypes";
import {SimulationSlots} from "./simulation";
import {Sky} from "./sky";

export interface NewGameSettings {
    numberOfClusters: number;
    monsters: boolean;
    infiniteLife: boolean;
    latitude: number;
    name: string;
}

export class GameSettingsStoreData {
    monsters: boolean;
    infiniteLife: boolean;
}

export class GameSettings {
    monsters: boolean;
    infiniteLife: boolean;

    load(input: GameSettingsStoreData): void {
        if (input !== undefined) {
            this.monsters = input.monsters;
            this.infiniteLife = input.infiniteLife;
        } else {
            this.monsters = false;
            this.infiniteLife = true;
        }
    }

    save(): GameSettingsStoreData {
        const ret = new GameSettingsStoreData();
        ret.monsters = this.monsters;
        ret.infiniteLife = this.infiniteLife;
        return ret;
    }
}

export class WorldStoreData {
    person: PersonStoreData;
    sun: SunStoreData;
    size: number;
    cubes: CubeClusterStoreData[][];
    cubeIdMapping: string[];
    staticObjects: StaticObjectStoreData<any>[];
    gameSettings?: GameSettingsStoreData;
}

export class World {
    private scene = new Scene();
    private sky: Sky;
    private _person: Person;
    private cubeClusters: CubeCluster[][];
    private hud: HUD;
    // in cubes
    private _size: number;
    private waterGeometry: Geometry;
    private waterMesh: Mesh = new Mesh();
    private animations: ObjectAnimation[] = [];
    private cursorMode = false;
    private cursorObject: Object3D;
    private cursorType: CollectibleType;
    private staticObjects: StaticObject<any>[] = [];
    private simulationSlots: SimulationSlots = new SimulationSlots(32);
    private _gameSettings = new GameSettings();

    constructor(private assets: Assets) {
        this.hud = new HUD(assets);
        this.sky = new Sky(this.scene, assets);
        this.waterMesh.material = assets.materials.water;
        this.waterMesh.castShadow = false;
        this.waterMesh.receiveShadow = false;
    }

    get person(): Person {return this._person;}

    get selectedInventorySlot(): number {return this.hud.selectedInventorySlot;}

    set selectedInventorySlot(index: number) {
        this.hud.selectInventorySlot(index);
        this.updateCursor();
    }

    get size(): number {return this._size;}

    addAnimation(animation: ObjectAnimation): void {
        this.animations.push(animation);
    }

    addCollectible(type: CollectibleType, pos: Vector3, rotation: number, update?: boolean): Collectible {
        if (type instanceof CubeType) {
            return this.addCube(<CubeType> type, pos, update);
        } else {
            return this.addStaticObject(pos, rotation, <ObjectType<any>> type, update);
        }
    }

    addCube(type: CubeType, pos: Vector3, update?: boolean): Cube {
        this.removeNonObstacles(pos);
        const cluster = this.getCluster(pos.x, pos.y);
        if (cluster !== null) {
            const cx = pos.x % CubeCluster.SIZE;
            const cy = pos.y % CubeCluster.SIZE;
            const ret = cluster.addCube(type, cx, cy, pos.z);
            if (ret !== null && update === true) {
                this.getClusters(pos.x - 1, pos.y - 1, pos.x + 1, pos.y + 1).forEach(c => c.init(this.scene, this.assets));
            }
            this.updateCursor();
            return ret;
        } else
            return null;
    }

    addStaticObject<T>(newPos: Vector3, rotation: number, type: ObjectType<T>, update?: boolean): StaticObject<T> {
        const obj = new StaticObject(newPos, rotation, type, this.assets);
        for (let ix = obj.x1; ix <= obj.x2; ++ix) {
            for (let iy = obj.y1; iy <= obj.y2; ++iy) {
                const cluster = this.getCluster(ix, iy);
                if (cluster !== null) {
                    for (let iz = obj.z1; iz <= obj.z2; ++iz) {
                        this.removeNonObstacles(new Vector3(ix, iy, iz));
                        cluster.addStaticObject(ix % CubeCluster.SIZE, iy % CubeCluster.SIZE, iz, obj);
                    }
                }
            }
        }
        if (type.coversFloor() && update) {
            this.getClusters(obj.x1, obj.y1, obj.x2, obj.y2).forEach(c => c.init(this.scene, this.assets));
        }
        this.scene.add(obj.object3D);
        this.staticObjects.push(obj);
        this.updateCursor();
        if (type.isSimulation())
            this.simulationSlots.add(obj);
        return obj;
    }

    animate(timeout: number, camera: PerspectiveCamera): void {
        this.sky.animate(timeout);
        this.hud.animate(timeout);
        this.animateObjects(timeout);
        this._person.calcForces(this, timeout);
        let collision: CollisionMnemento;
        while (timeout > 0) {
            collision = new CollisionMnemento(timeout);
            this._person.getCollisionWithWorld(this, collision);
            this._person.animate(collision.timeout, this._size);
            if (!collision.hasCollision())
                break;
            timeout -= collision.timeout;
            collision.applyCollision();
        }
        this._person.lookThrough(camera);
        this.updateCursor();
        // all 3.5 years per cube
        const to = 3.5 * Constants.daysInSeconds * Constants.yearInDays / (this._size * this._size);
        if (Math.random() < 2 * timeout / to) {
            this.renewRandomPlant();
        }
        if (this._person.health < 1 && this._gameSettings.infiniteLife)
            this._person.addHealth(1 - this._person.health);
    }

    canAddCollectible(type: CollectibleType, newPos: Vector3, rotation: number): boolean {
        let bb = this._person.getBoundingBox();
        if (bb.containsPoint(newPos)) {
            return false;
        }
        const below = this.getCollectible(newPos.x, newPos.y, newPos.z - 1);
        if (below !== null && !below.type.canStack())
            return false;
        let objType: ObjectType<any> = null;
        if (type instanceof ObjectType) {
            objType = <ObjectType<any>> type;
        }
        let cube: Cube;
        bb = type.calcBoundingBox(newPos, rotation);
        for (let x = bb.min.x; x <= bb.max.x; ++x) {
            for (let y = bb.min.y; y <= bb.max.y; ++y) {
                if (objType !== null && objType.needsCubeToExist()) {
                    cube = this.getCube(x, y, bb.min.z - 1);
                    if (cube === null)
                        return false;
                    if (!objType.canExistOn(cube.cubeType))
                        return false;
                }
                for (let z = bb.min.z; z <= bb.max.z; ++z) {
                    if (this.isObstacle(x, y, z))
                        return false;
                }
            }
        }

        return true;
    }

    canWalkThrough(x: number, y: number, z: number): boolean {
        const col = this.getCollectible(x, y, z);
        return col === null || col.canWalkThrough();
    }

    controlUser(timeout: number, inputControlService: InputControlService): void {
        this._person.moveByUser(this, timeout, inputControlService);
        this.hud.setDigging(this._person.diggingProgress);
    }

    deinit(): void {
        this.scene.remove(this.waterMesh);
        this.sky.deinit();
        if (this.cursorObject !== undefined) {
            this.scene.remove(this.cursorObject);
            this.cursorObject = undefined;
            this.cursorType = undefined;
        }
        this.cubeClusters.forEach(c1 => {
            c1.forEach(c2 => c2.deinit(this.scene));
        });
        this.staticObjects.forEach(o => this.scene.remove(o.object3D));
        this.cubeClusters = undefined;
        this.scene = undefined;
        this.waterGeometry.dispose();
        this.waterGeometry = undefined;
    }

    getCollectible(x: number, y: number, z: number): Collectible {
        const cluster = this.getCluster(x, y);
        return cluster !== null ? cluster.getCollectible(x % CubeCluster.SIZE, y % CubeCluster.SIZE, z) : null;
    }

    getCube(x: number, y: number, z: number): Cube {
        const cluster = this.getCluster(x, y);
        return cluster !== null ? cluster.getCube(x % CubeCluster.SIZE, y % CubeCluster.SIZE, z) : null;
    }

    getHeight(x: number, y: number): number {
        const cluster = this.getCluster(x, y);
        return cluster !== null ? cluster.getHeight(x % CubeCluster.SIZE, y % CubeCluster.SIZE) : 0;
    }

    getStaticObject<T>(x: number, y: number, z: number): StaticObject<T> {
        const cluster = this.getCluster(x, y);
        return cluster !== null ? cluster.getObject(x % CubeCluster.SIZE, y % CubeCluster.SIZE, z) : null;
    }

    isObstacle(x: number, y: number, z: number): boolean {
        if (this.getCube(x, y, z) !== null)
            return true;
        const obj = this.getStaticObject(x, y, z);
        return obj !== null && obj.objectType.isObstacle();
    }

    loadGame(input: WorldStoreData): void {
        this._gameSettings.load(input.gameSettings);
        this.sky.load(input.sun);

        this._person = new Person(this.hud);
        const factory: CollectibleTypeFactory = {
            create: (type: string) => {
                return <CollectibleType>(<any> CollectibleTypes)[type];
            }
        };
        this._person.load(input.person, factory);

        this.setWorldSize(input.size);
        const cubeIdMapper = new IDStoreDataMapper();
        cubeIdMapper.load(input.cubeIdMapping);
        input.cubes.forEach((cx, ix) => {
            cx.forEach((c, iy) => {
                this.cubeClusters[ix][iy].load(c, cubeIdMapper);
            });
        });

        input.staticObjects.forEach(o => {
            const obj = this.addStaticObject(Vector3StoreData.load(o.position), o.rotation, <ObjectType<any>> factory.create(o.type));
            obj.loadUserData(o.userData, factory);
        });

        this.initScene();
    }

    newGame(settings: NewGameSettings): void {
        this._gameSettings.monsters = settings.monsters;
        this._gameSettings.infiniteLife = settings.infiniteLife;

        this.sky.newGame(settings);

        this._person = new Person(this.hud);
        this._person.newGame();

        const init = new WorldInitializer();
        init.numberOfCluster = settings.numberOfClusters;
        init.init(this);

        this.initScene();
    }

    render(renderer: WebGLRenderer, camera: Camera): void {
        this.sky.renderToSkybox(renderer);
        this.sky.renderSkybox(renderer, camera);

        renderer.autoClear = false;
        renderer.autoClearColor = false;
        renderer.autoClearDepth = false;
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = PCFShadowMap;
        this.scene.traverseVisible((obj) => {
            if (obj instanceof LOD)
                (<LOD> obj).update(camera);
        });
        renderer.render(this.scene, camera);

        this.hud.render(renderer);
    }

    removeCollectible(x: number, y: number, z: number, update?: boolean): Collectible {
        const cube = this.removeCube(x, y, z, update);
        if (cube !== null)
            return cube;
        return this.removeStaticObject(x, y, z, update);
    }

    removeCube(x: number, y: number, z: number, update?: boolean): Cube {
        const cluster = this.getCluster(x, y);
        if (cluster !== null) {
            const cx = x % CubeCluster.SIZE;
            const cy = y % CubeCluster.SIZE;
            const ret = cluster.removeCube(cx, cy, z);
            if (ret !== null && update === true) {
                this.getClusters(x - 1, y - 1, x + 1, y + 1).forEach(c => c.init(this.scene, this.assets));
            }
            if (ret !== null) {
                const obj = this.getStaticObject(x, y, z + 1);
                if (obj !== null && obj.needsCubeToExist()) {
                    this.removeStaticObject(x, y, z + 1);
                }
            }
            this.updateCursor();
            return ret;
        } else
            return null;
    }

    removeStaticObject<T>(x: number, y: number, z: number, update?: boolean): StaticObject<T> {
        const obj = this.getStaticObject(x, y, z);
        if (obj === null)
            return null;
        for (let ix = obj.x1; ix <= obj.x2; ++ix) {
            for (let iy = obj.y1; iy <= obj.y2; ++iy) {
                const cluster = this.getCluster(ix, iy);
                if (cluster !== null) {
                    for (let iz = obj.z1; iz <= obj.z2; ++iz) {
                        cluster.removeStaticObject(ix % CubeCluster.SIZE, iy % CubeCluster.SIZE, iz);
                    }
                }
            }
        }
        if (obj.objectType.coversFloor() && update) {
            this.getClusters(obj.x1, obj.y1, obj.x2, obj.y2).forEach(c => c.init(this.scene, this.assets));
        }
        this.scene.remove(obj.object3D);
        this.staticObjects = this.staticObjects.filter(o => o !== obj);
        this.updateCursor();
        if (obj.objectType.isSimulation())
            this.simulationSlots.remove(obj);
        return <StaticObject<T>> obj;
    }

    saveGame(): WorldStoreData {
        const ret = new WorldStoreData();
        ret.gameSettings = this._gameSettings.save();
        ret.sun = this.sky.save();
        ret.person = this._person.save();
        ret.size = this._size;
        ret.cubes = [];
        const cubeIdMapper = new IDStoreDataMapper();
        this.cubeClusters.forEach((cx, ix) => {
            ret.cubes.push([]);
            cx.forEach(c => {
                ret.cubes[ix].push(c.save(cubeIdMapper));
            });
        });
        ret.cubeIdMapping = cubeIdMapper.save();
        ret.staticObjects = [];
        this.staticObjects.forEach(o => ret.staticObjects.push(o.save()));

        return ret;
    }

    setWorldSize(width: number): void {
        this.cubeClusters = [];
        const clusterCount = Math.floor(width / CubeCluster.SIZE);
        this._size = clusterCount * CubeCluster.SIZE;
        for (let x = 0; x < clusterCount; ++x) {
            this.cubeClusters.push([]);
        }
        this.cubeClusters.forEach((c, x) => {
            for (let y = 0; y < clusterCount; ++y) {
                c.push(new CubeCluster(x, y));
            }
        });
        let clu: CubeCluster;
        for (let x = 0; x < clusterCount; ++x) {
            for (let y = 0; y < clusterCount; ++y) {
                clu = this.cubeClusters[x][y];
                if (x > 0)
                    clu.prevX = this.cubeClusters[x - 1][y];
                else
                    clu.prevX = null;
                if (x < clusterCount - 1)
                    clu.nextX = this.cubeClusters[x + 1][y];
                else
                    clu.nextX = null;
                if (y > 0)
                    clu.prevY = this.cubeClusters[x][y - 1];
                else
                    clu.prevY = null;
                if (y < clusterCount - 1)
                    clu.nextY = this.cubeClusters[x][y + 1];
                else
                    clu.nextY = null;
            }
        }
        this.updateWater();
        const length = this._size * Constants.cubeSize;
        const height = CubeCluster.HEIGHT * Constants.cubeSize;
        this.sky.setWorldDimensions(new Vector3(length / 2, length / 2, height / 2), Math.sqrt(length * length / 2 + height * height / 4));
    }

    sleep(): void {
        if (this._person.canSleep()) {
            this._person.sleep();
            this.sky.animate(Constants.daysInSeconds / 3);
        }
    }

    toggleCursorMode(): void {
        this.cursorMode = !this.cursorMode;
        this.updateCursor();
    }

    turnPlayer(x: number, y: number): void {
        this._person.turn(x, y);
    }

    setCursor(type?: CollectibleType, newPos?: Vector3, rotation?: number): void {
        if (!this.cursorMode || type === undefined) {
            if (this.cursorObject !== undefined)
                this.cursorObject.visible = false;
            return;
        }
        if (this.cursorType !== type) {
            if (this.cursorObject !== undefined) {
                this.scene.remove(this.cursorObject);
                this.cursorObject = undefined;
            }
            this.cursorType = type;
            this.cursorObject = type.createForCursor(this.assets);
            this.cursorObject.traverse(obj => {
                obj.castShadow = false;
                obj.receiveShadow = false;
            });
            this.scene.add(this.cursorObject);
        }
        if (this.cursorObject !== undefined) {
            this.cursorObject.visible = true;
            if (type instanceof ObjectType) {
                StaticObject.applyToObject(newPos, rotation, <ObjectType<any>> type, this.cursorObject);
            } else {
                const cs = Constants.cubeSize;
                this.cursorObject.position.set((newPos.x + .5) * cs, (newPos.y + .5) * cs, newPos.z * cs);
            }
        }
    }

    private animateObjects(timeout: number): void {
        let i: number;
        let a: ObjectAnimation;
        for (i = 0; i < this.animations.length; ++i) {
            a = this.animations[i];
            if (!a.animate(timeout)) {
                this.animations.splice(i, 1);
                --i;
            }
        }
        this.simulationSlots.simulate(timeout);
    }

    private getCluster(x: number, y: number): CubeCluster {
        const cx = Math.floor(x / CubeCluster.SIZE);
        if (x >= 0 && y >= 0 && cx < this.cubeClusters.length) {
            const arr1 = this.cubeClusters[cx];
            const cy = Math.floor(y / CubeCluster.SIZE);
            if (cy < arr1.length) {
                return arr1[cy];
            }
        }
        return null;
    }

    private getClusters(x1: number, y1: number, x2: number, y2: number): CubeCluster[] {
        const ret: CubeCluster[] = [];
        let cluster: CubeCluster;
        for (let x = x1; x <= x2; ++x) {
            for (let y = y1; y <= y2; ++y) {
                cluster = this.getCluster(x, y);
                if (ret.find(c => c === cluster) === undefined)
                    ret.push(cluster);
            }
        }
        return ret;
    }

    private initScene(): void {
        this.cubeClusters.forEach(c1 => {
            c1.forEach(c2 => c2.init(this.scene, this.assets));
        });
        const dist = 500;
        this.scene.fog = new FogExp2(0xffffff, Math.sqrt(Math.log(256)) / (dist));
        this.sky.initScene();
        this.scene.add(this.waterMesh);
    }

    private removeNonObstacles(pos: Vector3): void {
        const oldObj = this.getStaticObject(pos.x, pos.y, pos.z);
        if (oldObj !== undefined && oldObj !== null && !oldObj.objectType.isObstacle()) {
            this.removeStaticObject(pos.x, pos.y, pos.z);
        }
        // TODO liquids also
    }

    private renewRandomPlant(): void {
        const x = Math.floor(this._size * Math.random());
        const y = Math.floor(this._size * Math.random());
        const h = this.getHeight(x, y);
        const cube = this.getCube(x, y, h - 1);
        if (cube.cubeType === CollectibleTypes.GRAS && this.getCollectible(x, y, h) === null) {
            this.addStaticObject(new Vector3(x, y, h), 0, CollectibleTypes.randomPlant(), true);
        }
    }

    private updateCursor(): void {
        if (this.cursorMode)
            this._person.updateCursor(this);
        else {
            this.setCursor();
        }
    }

    private updateWater(): void {
        if (this.waterGeometry !== undefined)
            this.waterGeometry.dispose();
        this.waterGeometry = new Geometry();
        this.waterMesh.geometry = this.waterGeometry;

        const normal = new Vector3(0, 0, 1);
        const waterSize = 1000;
        const s1 = -waterSize, s2 = 0, s3 = this._size * Constants.cubeSize, s4 = this._size * Constants.cubeSize + waterSize;
        const h = Constants.waterHeight * Constants.cubeSize;
        // vertices
        this.waterGeometry.vertices.push(new Vector3(s1, s1, h));
        this.waterGeometry.vertices.push(new Vector3(s2, s1, h));
        this.waterGeometry.vertices.push(new Vector3(s2, s4, h));
        this.waterGeometry.vertices.push(new Vector3(s1, s4, h));
        this.waterGeometry.vertices.push(new Vector3(s3, s1, h));
        this.waterGeometry.vertices.push(new Vector3(s4, s1, h));
        this.waterGeometry.vertices.push(new Vector3(s4, s4, h));
        this.waterGeometry.vertices.push(new Vector3(s3, s4, h));
        this.waterGeometry.vertices.push(new Vector3(s2, s1, h));
        this.waterGeometry.vertices.push(new Vector3(s3, s1, h));
        this.waterGeometry.vertices.push(new Vector3(s3, s2, h));
        this.waterGeometry.vertices.push(new Vector3(s2, s2, h));
        this.waterGeometry.vertices.push(new Vector3(s2, s3, h));
        this.waterGeometry.vertices.push(new Vector3(s3, s3, h));
        this.waterGeometry.vertices.push(new Vector3(s3, s4, h));
        this.waterGeometry.vertices.push(new Vector3(s2, s4, h));
        // uvs
        this.waterGeometry.faceVertexUvs[0].push([new Vector2(s1, s1), new Vector2(s2, s1), new Vector2(s1, s4)]);
        this.waterGeometry.faceVertexUvs[0].push([new Vector2(s2, s1), new Vector2(s2, s4), new Vector2(s1, s4)]);
        this.waterGeometry.faceVertexUvs[0].push([new Vector2(s3, s1), new Vector2(s4, s1), new Vector2(s3, s4)]);
        this.waterGeometry.faceVertexUvs[0].push([new Vector2(s4, s1), new Vector2(s4, s4), new Vector2(s3, s4)]);
        this.waterGeometry.faceVertexUvs[0].push([new Vector2(s2, s1), new Vector2(s3, s1), new Vector2(s2, s2)]);
        this.waterGeometry.faceVertexUvs[0].push([new Vector2(s3, s1), new Vector2(s3, s2), new Vector2(s2, s2)]);
        this.waterGeometry.faceVertexUvs[0].push([new Vector2(s2, s3), new Vector2(s3, s3), new Vector2(s2, s4)]);
        this.waterGeometry.faceVertexUvs[0].push([new Vector2(s3, s3), new Vector2(s3, s4), new Vector2(s2, s4)]);
        // faces
        this.waterGeometry.faces.push(new Face3(0, 1, 3, normal));
        this.waterGeometry.faces.push(new Face3(1, 2, 3, normal));
        this.waterGeometry.faces.push(new Face3(4, 5, 7, normal));
        this.waterGeometry.faces.push(new Face3(5, 6, 7, normal));
        this.waterGeometry.faces.push(new Face3(8, 9, 11, normal));
        this.waterGeometry.faces.push(new Face3(9, 10, 11, normal));
        this.waterGeometry.faces.push(new Face3(12, 13, 15, normal));
        this.waterGeometry.faces.push(new Face3(13, 14, 15, normal));
    }
}
