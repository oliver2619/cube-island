import {BoxBufferGeometry, WebGLRenderer, MeshLambertMaterial, Object3D, Mesh, Geometry, BufferGeometry, Vector3, Face3, Vector2, LOD, Material} from "three";
import {Constants} from "./constants";
import {CustomColladaLoader} from "./customColladaLoader";
import {Textures, IconTextures} from "./textures";
import {ResourceLoadingProgress} from "./resourceLoadingProgress";
import {Materials} from "./materials";

export class Objects {
    private _anvil: Object3D;

    private _barSteel: Object3D;

    private _bucketMetalEmpty: Object3D;

    private _bucketWoodEmpty: Object3D;

    private _chest: Object3D;

    private _compost: Object3D;

    private _cube: Mesh;

    private _doorWood: Object3D;

    private _fence: Object3D;

    private _flowerWhite = new LOD();

    private _flowerRed = new LOD();

    private _flowerBlue = new LOD();

    private _flowerYellow = new LOD();

    private _flowerPink = new LOD();

    private _furnace: Object3D;

    private _mushroom = new LOD();

    private _stairsStone: Object3D;

    private _stairsWood: Object3D;

    private _stickWood: Object3D;

    private _stonemill: Object3D;

    private _tree: Object3D;

    private _window: Object3D;

    private _workbench: Object3D;

    get anvil(): Object3D {return this._anvil.clone(false);}

    get barSteel(): Object3D {return this._barSteel.clone(false);}

    get bucketMetalEmpty(): Object3D {return this._bucketMetalEmpty.clone(false);}

    get bucketWoodEmpty(): Object3D {return this._bucketWoodEmpty.clone(false);}

    get chest(): Object3D {return this._chest.clone(true);}

    get compost(): Object3D {return this._compost.clone(false);}

    get doorWood(): Object3D {return this._doorWood.clone(true);}

    get fence(): Object3D {return this._fence.clone(false);}

    get flowerWhite(): Object3D {return this._flowerWhite.clone(false);}

    get flowerRed(): Object3D {return this._flowerRed.clone(false);}

    get flowerBlue(): Object3D {return this._flowerBlue.clone(false);}

    get flowerYellow(): Object3D {return this._flowerYellow.clone(false);}

    get flowerPink(): Object3D {return this._flowerPink.clone(false);}

    get furnace(): Object3D {return this._furnace.clone(false);}

    get mushroom(): Object3D {return this._mushroom.clone(false);}

    get stairsStone(): Object3D {return this._stairsStone.clone(false);}

    get stairsWood(): Object3D {return this._stairsWood.clone(false);}

    get stickWood(): Object3D {return this._stickWood.clone(false);}

    get stonemill(): Object3D {return this._stonemill.clone(false);}

    get tree(): Object3D {return this._tree.clone(true);}

    get window(): Object3D {return this._window.clone(false);}

    get workbench(): Object3D {return this._workbench.clone(false);}

    getCube(material: Material, materialTop?: Material, materialBottom?: Material): Object3D {
        const ret = this._cube.clone(true);
        const mt = materialTop !== undefined ? materialTop : material;
        const mb = materialBottom !== undefined ? materialBottom : material;
        ret.material = [material, mb, mt];
        return ret;
    }

    init(textures: Textures, materials: Materials, progress: ResourceLoadingProgress): void {
        let l: CustomColladaLoader;

        // flowers
        l = new CustomColladaLoader();
        l.scale = Constants.cubeSize;
        l.shadow = false;
        progress.addResource();
        let obj2: Object3D;
        l.load('assets/objects/flower.dae', (obj) => {
            this._flowerWhite.addLevel(obj, 0);
            this._flowerRed.addLevel(this.replaceFlowerMaterial(obj, 0xAF0000), 0);
            this._flowerBlue.addLevel(this.replaceFlowerMaterial(obj, 0x3502EC), 0);
            this._flowerYellow.addLevel(this.replaceFlowerMaterial(obj, 0xEFD300), 0);
            this._flowerPink.addLevel(this.replaceFlowerMaterial(obj, 0xCE0A93), 0);
            progress.resourceLoaded();
        });
        progress.addResource();
        l.load('assets/objects/flower_lod_2.dae', (obj) => {
            this._flowerWhite.addLevel(obj, 2);
            this._flowerRed.addLevel(this.replaceFlowerMaterial(obj, 0xAF0000), 2);
            this._flowerBlue.addLevel(this.replaceFlowerMaterial(obj, 0x3502EC), 2);
            this._flowerYellow.addLevel(this.replaceFlowerMaterial(obj, 0xEFD300), 2);
            this._flowerPink.addLevel(this.replaceFlowerMaterial(obj, 0xCE0A93), 2);
            progress.resourceLoaded();
        });
        progress.addResource();
        l.load('assets/objects/flower_lod_3.dae', (obj) => {
            this._flowerWhite.addLevel(obj, 10);
            this._flowerRed.addLevel(this.replaceFlowerMaterial(obj, 0xAF0000), 10);
            this._flowerBlue.addLevel(this.replaceFlowerMaterial(obj, 0x3502EC), 10);
            this._flowerYellow.addLevel(this.replaceFlowerMaterial(obj, 0xEFD300), 10);
            this._flowerPink.addLevel(this.replaceFlowerMaterial(obj, 0xCE0A93), 10);
            this._flowerWhite.addLevel(new Object3D(), 20);
            this._flowerRed.addLevel(new Object3D(), 20);
            this._flowerBlue.addLevel(new Object3D(), 20);
            this._flowerYellow.addLevel(new Object3D(), 20);
            this._flowerPink.addLevel(new Object3D(), 20);
            progress.resourceLoaded();
        });

        // anvil
        l = new CustomColladaLoader();
        l.scale = Constants.cubeSize;
        l.materialMapper = material => materials.steelObject;
        l.shadow = false;
        progress.addResource();
        l.load('assets/objects/anvil.dae', (obj) => {
            this._anvil = obj;
            progress.resourceLoaded();
        });

        // bar
        l = new CustomColladaLoader();
        l.scale = Constants.cubeSize;
        l.materialMapper = material => materials.steelObject;
        progress.addResource();
        l.load('assets/objects/bar.dae', (obj) => {
            this._barSteel = obj;
            progress.resourceLoaded();
        });

        // bucketEmpty
        l = new CustomColladaLoader();
        l.scale = Constants.cubeSize;
        l.materialMapper = material => materials.steelObject;
        progress.addResource();
        l.load('assets/objects/bucket.dae', (obj) => {
            this._bucketMetalEmpty = obj;
            this._bucketWoodEmpty = obj.clone(true);
            this.processMaterial(this._bucketWoodEmpty, m => materials.woodPlankObject);
            progress.resourceLoaded();
        });

        // chest
        l = new CustomColladaLoader();
        l.scale = Constants.cubeSize;
        l.materialMapper = material => materials.woodPlankObject;
        progress.addResource();
        l.load('assets/objects/chest.dae', (obj) => {
            this._chest = obj;
            progress.resourceLoaded();
        });

        // compost
        l = new CustomColladaLoader();
        l.scale = Constants.cubeSize;
        l.shadow = false;
        l.materialMapper = material => materials.compost;
        progress.addResource();
        l.load('assets/objects/compost.dae', (obj) => {
            this._compost = obj;
            progress.resourceLoaded();
        });

        // fence
        l = new CustomColladaLoader();
        l.scale = Constants.cubeSize;
        l.materialMapper = material => materials.woodPlankObject;
        progress.addResource();
        l.load('assets/objects/fence.dae', (obj) => {
            this._fence = obj;
            progress.resourceLoaded();
        });

        // furnace
        l = new CustomColladaLoader();
        l.scale = Constants.cubeSize;
        l.materialMapper = material => materials.stoneBricksObject;
        progress.addResource();
        l.load('assets/objects/furnace.dae', (obj) => {
            this._furnace = obj;
            progress.resourceLoaded();
        });

        // mushroom
        l = new CustomColladaLoader();
        l.scale = Constants.cubeSize;
        l.shadow = false;
        progress.addResource();
        l.load('assets/objects/mushroom.dae', (obj) => {
            this._mushroom.addLevel(obj, 0);
            progress.resourceLoaded();
        });
        l = new CustomColladaLoader();
        l.scale = Constants.cubeSize;
        l.shadow = false;
        progress.addResource();
        l.load('assets/objects/mushroom_lod_2.dae', (obj) => {
            this._mushroom.addLevel(obj, 1);
            progress.resourceLoaded();
        });
        l = new CustomColladaLoader();
        l.scale = Constants.cubeSize;
        l.shadow = false;
        progress.addResource();
        l.load('assets/objects/mushroom_lod_3.dae', (obj) => {
            this._mushroom.addLevel(obj, 5);
            this._mushroom.addLevel(new Object3D(), 20);
            progress.resourceLoaded();
        });

        // stairs stone
        l = new CustomColladaLoader();
        l.scale = Constants.cubeSize;
        l.materialMapper = material => materials.stoneBricksObject;
        progress.addResource();
        l.load('assets/objects/stairsStone.dae', (obj) => {
            this._stairsStone = obj;
            progress.resourceLoaded();
        });

        // stairs wood
        l = new CustomColladaLoader();
        l.scale = Constants.cubeSize;
        l.materialMapper = material => materials.woodPlankObject;
        progress.addResource();
        l.load('assets/objects/stairsWood.dae', (obj) => {
            this._stairsWood = obj;
            progress.resourceLoaded();
        });

        // stonemill
        l = new CustomColladaLoader();
        l.scale = Constants.cubeSize;
        l.materialMapper = material => materials.rocksObject;
        progress.addResource();
        l.load('assets/objects/stonemill.dae', (obj) => {
            this._stonemill = obj;
            progress.resourceLoaded();
        });

        // tree
        l = new CustomColladaLoader();
        l.scale = Constants.cubeSize;
        l.materialMapper = (material) => {
            switch (material.name) {
                case 'wood':
                    return materials.barkCubeObject;
                case 'leaves':
                    return materials.leaves;
                default: return material;
            }

        };
        progress.addResource();
        l.load('assets/objects/tree.dae', (obj) => {
            this._tree = obj;
            progress.resourceLoaded();

        });

        // window
        l = new CustomColladaLoader();
        l.scale = Constants.cubeSize;
        l.shadow = false;
        l.materialMapper = material => {
            switch (material.name) {
                case 'wood':
                    return materials.woodPlankObject;
                case 'glas':
                    return materials.glas;
                default:
                    return material;
            }
        };
        progress.addResource();
        l.load('assets/objects/window.dae', (obj) => {
            this._window = obj;
            progress.resourceLoaded();

        });

        // wooden door
        l = new CustomColladaLoader();
        l.scale = Constants.cubeSize;
        l.materialMapper = (material) => materials.woodPlankObject;
        progress.addResource();
        l.load('assets/objects/door.dae', (obj) => {
            this._doorWood = obj;
            progress.resourceLoaded();
        });

        // wooden stick
        l = new CustomColladaLoader();
        l.scale = Constants.cubeSize;
        l.materialMapper = (material) => materials.woodPlankObject;
        progress.addResource();
        l.load('assets/objects/woodenStick.dae', (obj) => {
            this._stickWood = obj;
            progress.resourceLoaded();

        });

        // workbench
        l = new CustomColladaLoader();
        l.scale = Constants.cubeSize;
        l.materialMapper = (material) => materials.woodPlankObject;
        progress.addResource();
        l.load('assets/objects/workbench.dae', (obj) => {
            this._workbench = obj;
            progress.resourceLoaded();

        });

        // cube
        this.initCube();
    }

    private initCube(): void {
        const geo = new Geometry();
        const d = Constants.cubeSize * .5;
        const h = Constants.cubeSize;
        geo.vertices.push(new Vector3(-d, -d, 0));
        geo.vertices.push(new Vector3(d, -d, 0));
        geo.vertices.push(new Vector3(d, d, 0));
        geo.vertices.push(new Vector3(-d, d, 0));
        geo.vertices.push(new Vector3(-d, -d, h));
        geo.vertices.push(new Vector3(d, -d, h));
        geo.vertices.push(new Vector3(d, d, h));
        geo.vertices.push(new Vector3(-d, d, h));
        geo.faces.push(new Face3(0, 1, 4, new Vector3(0, -1, 0), undefined, 0));
        geo.faceVertexUvs[0].push([new Vector2(0, 0), new Vector2(h, 0), new Vector2(0, h)]);
        geo.faces.push(new Face3(1, 5, 4, new Vector3(0, -1, 0), undefined, 0));
        geo.faceVertexUvs[0].push([new Vector2(h, 0), new Vector2(h, h), new Vector2(0, h)]);
        geo.faces.push(new Face3(1, 2, 5, new Vector3(1, 0, 0), undefined, 0));
        geo.faceVertexUvs[0].push([new Vector2(0, 0), new Vector2(h, 0), new Vector2(0, h)]);
        geo.faces.push(new Face3(2, 6, 5, new Vector3(1, 0, 0), undefined, 0));
        geo.faceVertexUvs[0].push([new Vector2(h, 0), new Vector2(h, h), new Vector2(0, h)]);
        geo.faces.push(new Face3(2, 3, 6, new Vector3(0, 1, 0), undefined, 0));
        geo.faceVertexUvs[0].push([new Vector2(h, 0), new Vector2(0, 0), new Vector2(h, h)]);
        geo.faces.push(new Face3(3, 7, 6, new Vector3(0, 1, 0), undefined, 0));
        geo.faceVertexUvs[0].push([new Vector2(0, 0), new Vector2(0, h), new Vector2(h, h)]);
        geo.faces.push(new Face3(3, 0, 7, new Vector3(-1, 0, 0), undefined, 0));
        geo.faceVertexUvs[0].push([new Vector2(h, 0), new Vector2(0, 0), new Vector2(h, h)]);
        geo.faces.push(new Face3(0, 4, 7, new Vector3(-1, 0, 0), undefined, 0));
        geo.faceVertexUvs[0].push([new Vector2(0, 0), new Vector2(0, h), new Vector2(h, h)]);
        geo.faces.push(new Face3(1, 0, 2, new Vector3(0, 0, -1), undefined, 1));
        geo.faceVertexUvs[0].push([new Vector2(h, 0), new Vector2(0, 0), new Vector2(h, h)]);
        geo.faces.push(new Face3(0, 3, 2, new Vector3(0, 0, -1), undefined, 1));
        geo.faceVertexUvs[0].push([new Vector2(0, 0), new Vector2(0, h), new Vector2(h, h)]);
        geo.faces.push(new Face3(4, 5, 6, new Vector3(0, 0, 1), undefined, 2));
        geo.faceVertexUvs[0].push([new Vector2(0, 0), new Vector2(h, 0), new Vector2(h, h)]);
        geo.faces.push(new Face3(4, 6, 7, new Vector3(0, 0, 1), undefined, 2));
        geo.faceVertexUvs[0].push([new Vector2(0, 0), new Vector2(h, h), new Vector2(0, h)]);
        this._cube = new Mesh(geo);
        this._cube.castShadow = true;
        this._cube.receiveShadow = true;
    }

    private processMaterial(rootObject: Object3D, visitor: (m: Material) => Material): void {
        rootObject.traverse((obj) => {
            if (obj.type === 'Mesh') {
                const mesh = <Mesh> obj;
                if (mesh.material instanceof Array) {
                    mesh.material = mesh.material.map(mat => visitor(mat));
                } else {
                    mesh.material = visitor(mesh.material);
                }
            }
        });
    }

    private processGeometry(rootObject: Object3D, visitor: (g: Geometry | BufferGeometry) => void): void {
        rootObject.traverse((obj) => {
            if (obj.type === 'Mesh') {
                const mesh = <Mesh> obj;
                visitor(mesh.geometry);
            }
        });
    }

    private replaceFlowerMaterial(obj: Object3D, color: number): Object3D {
        const ret = obj.clone(true);
        this.processMaterial(ret, mat => {
            if (mat.name === 'White') {
                const ma = <MeshLambertMaterial> mat.clone();
                ma.color.set(color);
                return ma;
            } else
                return mat;
        });
        return ret;
    }

}

export class Assets {

    private _cube: BoxBufferGeometry;
    private _iconTextures: IconTextures = new IconTextures();
    private _textures: Textures = new Textures();
    private _materials: Materials = new Materials();
    private _objects: Objects = new Objects();

    get iconTextures(): IconTextures {return this._iconTextures;}

    get materials(): Materials {return this._materials;}

    get objects(): Objects {return this._objects;}

    get textures(): Textures {return this._textures;}

    getCube(): BoxBufferGeometry {
        return this._cube;
    }

    init(renderer: WebGLRenderer, complete: (progress: number, total: number) => void): void {
        const progress: ResourceLoadingProgress = new ResourceLoadingProgress(complete);
        this._iconTextures.init(progress);
        this._textures.init(renderer, progress);
        this._materials.init(this._textures, progress);
        this._cube = new BoxBufferGeometry(Constants.cubeSize, Constants.cubeSize, Constants.cubeSize, 1, 1, 1);
        this._objects.init(this._textures, this._materials, progress);
    }
}
