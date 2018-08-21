import {Scene, Mesh, Geometry, Vector3, Face3, Vector2, Color, Material, Group} from "three";
import {Constants} from "./constants";
import {Assets} from "./assets";
import {CubeType} from "./cubeTypes";
import {StaticObject} from "./staticObject";
import {Collectible, CollectibleType} from "./collectible";
import {IDStoreDataMapper} from "./commonStoreData";
import {CollectibleTypes} from "./collectibleTypes";

export class Cube implements Collectible {

    constructor(private _type: CubeType) {}

    get type(): CollectibleType {return this._type;}

    get cubeType(): CubeType {return this._type;}

    canWalkThrough(): boolean {return this._type.canWalkThrough();}
    
    isHarvestable(): boolean {return this._type.isHarvestable();}
}

export class CubeFactory {
    static createCube(type: CubeType): Cube {
        return new Cube(type);
    }
}

export class CubeClusterStoreData {
    cubes: string;
    height?: number;
}

export class CubeCluster {
    static SIZE = 8;
    static HEIGHT = 100; // 256?

    private static ambOcclColor: number[] = [0xffffff, 0xcccccc, 0xa3a3a3, 0x828282];

    prevX: CubeCluster;
    nextX: CubeCluster;
    prevY: CubeCluster;
    nextY: CubeCluster;

    private cubes: Cube[][][] = [];
    private objects: StaticObject<any>[][][] = [];
    private geometries: {[key: string]: Geometry} = {};
    private meshes: {[key: string]: Mesh} = {};
    private rootObject: Group = new Group();

    constructor(private positionX: number, private positionY: number) {
        for (let ix = 0; ix < CubeCluster.SIZE; ++ix) {
            this.cubes.push([]);
            this.objects.push([]);
        }
        this.cubes.forEach(c1 => {
            for (let iy = 0; iy < CubeCluster.SIZE; ++iy) {
                c1.push([]);
            }
            c1.forEach(c2 => {
                for (let z = 0; z < CubeCluster.HEIGHT; ++z) {
                    c2.push(null);
                }
            });
        });
        this.objects.forEach(o1 => {
            for (let iy = 0; iy < CubeCluster.SIZE; ++iy) {
                o1.push([]);
            }
            o1.forEach(o2 => {
                for (let z = 0; z < CubeCluster.HEIGHT; ++z) {
                    o2.push(null);
                }
            });
        });
    }

    addCube(type: CubeType, x: number, y: number, z: number): Cube {
        if (x >= 0 && y >= 0 && z >= 0 && x < this.cubes.length) {
            const arr1 = this.cubes[x];
            if (y < arr1.length) {
                const arr2 = arr1[y];
                if (z < arr2.length) {
                    if (arr2[z] === null) {
                        const newCube = CubeFactory.createCube(type);
                        arr2[z] = newCube;
                        return newCube;
                    }
                }
            }
        }
        return null;
    }

    addStaticObject<T>(x: number, y: number, z: number, obj: StaticObject<T>): void {
        if (x >= 0 && y >= 0 && z >= 0 && x < this.objects.length) {
            const arr1 = this.objects[x];
            if (y < arr1.length) {
                const arr2 = arr1[y];
                if (z < arr2.length) {
                    arr2[z] = obj;
                }
            }
        }
    }

    deinit(scene: Scene): void {
        for (let geometry in this.geometries) {
            this.geometries[geometry].dispose();
        }
        this.geometries = {};
        for (let mesh in this.meshes) {
            this.rootObject.remove(this.meshes[mesh]);
        }
        this.meshes = {};
        scene.remove(this.rootObject);
    }

    getCollectible(x: number, y: number, z: number): Collectible {
        const cube = this.getCube(x, y, z);
        if (cube !== null)
            return cube;
        return this.getObject(x, y, z);
    }

    getCube(x: number, y: number, z: number): Cube {
        if (x < 0) {
            if (this.prevX !== null)
                return this.prevX.getCube(x + CubeCluster.SIZE, y, z);
            else
                return null;
        }
        if (y < 0) {
            if (this.prevY !== null)
                return this.prevY.getCube(x, y + CubeCluster.SIZE, z);
            else
                return null;
        }
        if (z < 0)
            return null;
        if (x >= CubeCluster.SIZE) {
            if (this.nextX !== null)
                return this.nextX.getCube(x - CubeCluster.SIZE, y, z);
            else
                return null;
        }
        if (y >= CubeCluster.SIZE) {
            if (this.nextY !== null)
                return this.nextY.getCube(x, y - CubeCluster.SIZE, z);
            else
                return null;
        }
        const arr1 = this.cubes[x][y];
        if (z < arr1.length)
            return arr1[z];
        else
            return null;
    }
    
    getHeight(x: number, y: number): number {
        const arr = this.cubes[x][y];
        for (let i = arr.length - 1; i >= 0; --i) {
            if (arr[i] !== null)
                return i + 1;
        }
        return 0;
    }

    getObject<T>(x: number, y: number, z: number): StaticObject<T> {
        if (x < 0) {
            if (this.prevX !== null)
                return this.prevX.getObject(x + CubeCluster.SIZE, y, z);
            else
                return null;
        }
        if (y < 0) {
            if (this.prevY !== null)
                return this.prevY.getObject(x, y + CubeCluster.SIZE, z);
            else
                return null;
        }
        if (z < 0)
            return null;
        if (x >= CubeCluster.SIZE) {
            if (this.nextX !== null)
                return this.nextX.getObject(x - CubeCluster.SIZE, y, z);
            else
                return null;
        }
        if (y >= CubeCluster.SIZE) {
            if (this.nextY !== null)
                return this.nextY.getObject(x, y - CubeCluster.SIZE, z);
            else
                return null;
        }
        const arr1 = this.objects[x][y];
        if (z < arr1.length)
            return arr1[z];
        else
            return null;
    }

    init(scene: Scene, assets: Assets): void {
        this.deinit(scene);
        const materialsByName: {[key: string]: Material} = {};
        this.cubes.forEach((c1, x) => {
            c1.forEach((c2, y) => {
                c2.forEach((cube, z) => {
                    if (cube !== null) {
                        this.addFaces(cube, x, y, z, assets, materialsByName);
                    }
                });
            });
        });
        let mesh: Mesh;
        for (let g in this.geometries) {
            this.geometries[g].computeBoundingSphere();
            this.geometries[g].computeBoundingBox();
            mesh = new Mesh(this.geometries[g], materialsByName[g]);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            this.meshes[g] = mesh;
            this.rootObject.add(mesh);
        }
        scene.add(this.rootObject);
    }

    load(input: CubeClusterStoreData, idMapper: IDStoreDataMapper): void {
        const len = input.cubes.length / 2;
        let c: number;
        let id: string;
        let ty: CubeType;
        let x = 0, y = 0, z = 0;
        for (let i = 0; i < len; ++i) {
            c = parseInt(input.cubes.substring(i * 2, i * 2 + 2), 16);
            if (c > 0) {
                id = idMapper.getId(c);
                ty = <CubeType>(<any> CollectibleTypes)[id];
                this.addCube(ty, x, y, z);
            }
            ++z;
            if (z >= CubeCluster.HEIGHT) {
                z = 0;
                ++y;
                if (y >= CubeCluster.SIZE) {
                    y = 0;
                    ++x;
                }
            }
        }
    }

    removeCube(x: number, y: number, z: number): Cube {
        if (x >= 0 && y >= 0 && z >= 0 && x < this.cubes.length) {
            const arr1 = this.cubes[x];
            if (y < arr1.length) {
                const arr2 = arr1[y];
                if (z < arr2.length) {
                    const ret = arr2[z];
                    arr2[z] = null;
                    return ret;
                }
            }
        }
        return null;
    }

    removeStaticObject(x: number, y: number, z: number): void {
        if (x >= 0 && y >= 0 && z >= 0 && x < this.objects.length) {
            const arr1 = this.objects[x];
            if (y < arr1.length) {
                const arr2 = arr1[y];
                if (z < arr2.length) {
                    const ret = arr2[z];
                    arr2[z] = null;
                }
            }
        }
    }

    save(idMapper: IDStoreDataMapper): CubeClusterStoreData {
        const ret = new CubeClusterStoreData();
        ret.cubes = '';
        this.cubes.forEach(c1 => {
            c1.forEach(c2 => {
                c2.forEach(c => {
                    if (c !== null) {
                        ret.cubes += idMapper.getIndexAsHexString(c.type.id);
                    } else {
                        ret.cubes += idMapper.getIndexAsHexString(null);
                    }
                });
            });
        });
        return ret;
    }

    private addFace(geometry: Geometry, pos: Vector3, right: Vector3, up: Vector3, artificial: boolean): void {
        const sz = Constants.cubeSize;
        const hsz = sz * .5;
        const offX = (this.positionX * CubeCluster.SIZE + pos.x + .5) * sz;
        const offY = (this.positionY * CubeCluster.SIZE + pos.y + .5) * sz;
        const offZ = (pos.z + .5) * sz;
        const vertex0: number = geometry.vertices.length;
        const normal = right.clone();
        normal.cross(up);
        const shadowIndex = [0, 0, 0, 0];
        const v0 = new Vector3(offX, offY, offZ);
        v0.addScaledVector(normal, hsz);
        v0.addScaledVector(right, -hsz);
        v0.addScaledVector(up, -hsz);
        geometry.vertices.push(new Vector3(v0.x, v0.y, v0.z));
        geometry.vertices.push(new Vector3(v0.x + right.x * sz, v0.y + right.y * sz, v0.z + right.z * sz));
        geometry.vertices.push(new Vector3(v0.x + right.x * sz + up.x * sz, v0.y + right.y * sz + up.y * sz, v0.z + right.z * sz + up.z * sz));
        geometry.vertices.push(new Vector3(v0.x + up.x * sz, v0.y + up.y * sz, v0.z + up.z * sz));
        const bias = artificial ? 0 : 20 * Math.sin(40 * v0.dot(normal));
        const uv0 = new Vector2(v0.dot(right) + bias, v0.dot(up) + bias);
        geometry.faceVertexUvs[0].push([new Vector2(uv0.x, uv0.y), new Vector2(uv0.x + sz, uv0.y), new Vector2(uv0.x, uv0.y + sz)]);
        geometry.faceVertexUvs[0].push([new Vector2(uv0.x + sz, uv0.y), new Vector2(uv0.x + sz, uv0.y + sz), new Vector2(uv0.x, uv0.y + sz)]);
        const p0 = new Vector3(pos.x, pos.y, pos.z);
        p0.add(normal);
        if (this.getCube(p0.x - right.x - up.x, p0.y - right.y - up.y, p0.z - right.z - up.z) !== null) {
            ++shadowIndex[0];
        }
        if (this.getCube(p0.x - up.x, p0.y - up.y, p0.z - up.z) !== null) {
            ++shadowIndex[0];
            ++shadowIndex[1];
        }
        if (this.getCube(p0.x + right.x - up.x, p0.y + right.y - up.y, p0.z + right.z - up.z) !== null) {
            ++shadowIndex[1];
        }
        if (this.getCube(p0.x - right.x, p0.y - right.y, p0.z - right.z) !== null) {
            ++shadowIndex[0];
            ++shadowIndex[3];
        }
        if (this.getCube(p0.x + right.x, p0.y + right.y, p0.z + right.z) !== null) {
            ++shadowIndex[1];
            ++shadowIndex[2];
        }
        if (this.getCube(p0.x - right.x + up.x, p0.y - right.y + up.y, p0.z - right.z + up.z) !== null) {
            ++shadowIndex[3];
        }
        if (this.getCube(p0.x + up.x, p0.y + up.y, p0.z + up.z) !== null) {
            ++shadowIndex[2];
            ++shadowIndex[3];
        }
        if (this.getCube(p0.x + right.x + up.x, p0.y + right.y + up.y, p0.z + right.z + up.z) !== null) {
            ++shadowIndex[2];
        }
        geometry.faces.push(new Face3(vertex0, vertex0 + 1, vertex0 + 3, normal, [
            new Color(CubeCluster.ambOcclColor[shadowIndex[0]]),
            new Color(CubeCluster.ambOcclColor[shadowIndex[1]]),
            new Color(CubeCluster.ambOcclColor[shadowIndex[3]])
        ]));
        geometry.faces.push(new Face3(vertex0 + 1, vertex0 + 2, vertex0 + 3, normal, [
            new Color(CubeCluster.ambOcclColor[shadowIndex[1]]),
            new Color(CubeCluster.ambOcclColor[shadowIndex[2]]),
            new Color(CubeCluster.ambOcclColor[shadowIndex[3]])
        ]));
    }

    private addFaces(cube: Cube, x: number, y: number, z: number, assets: Assets, materialsByName: {[key: string]: Material}): void {
        let geometry: Geometry;
        let nc: Cube;
        let no: StaticObject<any>;
        const artificial = cube.cubeType.isArtificial();

        nc = this.getCube(x - 1, y, z);
        if (nc === null || (nc.cubeType !== cube.cubeType && nc.cubeType.isTransparent())) {
            geometry = this.getOrCreateGeometry(cube.cubeType.getMaterial(assets), materialsByName);
            this.addFace(geometry, new Vector3(x, y, z), new Vector3(0, -1, 0), new Vector3(0, 0, 1), artificial);
        }
        nc = this.getCube(x + 1, y, z);
        if (nc === null || (nc.cubeType !== cube.cubeType && nc.cubeType.isTransparent())) {
            geometry = this.getOrCreateGeometry(cube.cubeType.getMaterial(assets), materialsByName);
            this.addFace(geometry, new Vector3(x, y, z), new Vector3(0, 1, 0), new Vector3(0, 0, 1), artificial);
        }
        nc = this.getCube(x, y - 1, z);
        if (nc === null || (nc.cubeType !== cube.cubeType && nc.cubeType.isTransparent())) {
            geometry = this.getOrCreateGeometry(cube.cubeType.getMaterial(assets), materialsByName);
            this.addFace(geometry, new Vector3(x, y, z), new Vector3(1, 0, 0), new Vector3(0, 0, 1), artificial);
        }
        nc = this.getCube(x, y + 1, z);
        if (nc === null || (nc.cubeType !== cube.cubeType && nc.cubeType.isTransparent())) {
            geometry = this.getOrCreateGeometry(cube.cubeType.getMaterial(assets), materialsByName);
            this.addFace(geometry, new Vector3(x, y, z), new Vector3(-1, 0, 0), new Vector3(0, 0, 1), artificial);
        }
        nc = this.getCube(x, y, z - 1);
        if (nc === null || (nc.cubeType !== cube.cubeType && nc.cubeType.isTransparent())) {
            geometry = this.getOrCreateGeometry(cube.cubeType.getMaterialBottom(assets), materialsByName);
            this.addFace(geometry, new Vector3(x, y, z), new Vector3(1, 0, 0), new Vector3(0, -1, 0), artificial);
        }
        nc = this.getCube(x, y, z + 1);
        no = this.getObject(x, y, z + 1);
        if ((nc === null || (nc.cubeType !== cube.cubeType && nc.cubeType.isTransparent())) && (no === null || !no.objectType.coversFloor())) {
            geometry = this.getOrCreateGeometry(cube.cubeType.getMaterialTop(assets), materialsByName);
            this.addFace(geometry, new Vector3(x, y, z), new Vector3(1, 0, 0), new Vector3(0, 1, 0), artificial);
        }
    }

    private getOrCreateGeometry(material: Material, materialsByName: {[key: string]: Material}): Geometry {
        const name = material.name;
        let geometry: Geometry = this.geometries[name];
        if (geometry === undefined) {
            geometry = new Geometry();
            this.geometries[name] = geometry;
            materialsByName[name] = material;
        }
        return geometry;
    }
}