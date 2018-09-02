import {MeshLambertMaterial, VertexColors, DoubleSide, NormalBlending, MeshPhongMaterial, CustomBlending, OneFactor, MeshPhysicalMaterial, OneMinusSrcAlphaFactor, FileLoader, ShaderMaterial, UniformsUtils, Vector3, AdditiveBlending, MeshMaterialType} from "three";
import {Textures} from "./textures";
import {ResourceLoadingProgress} from "./resourceLoadingProgress";

export class Materials {

    private _barkCube: MeshMaterialType;
    private _barkCubeObject: MeshMaterialType;
    private _bricks: MeshMaterialType;
    private _clay: MeshMaterialType;
    private _coal: MeshMaterialType;
    private _compost: MeshMaterialType;
    private _concrete: MeshMaterialType;
    private _cursor: MeshMaterialType;
    private _glas: MeshMaterialType;
    private _gras: MeshMaterialType;
    private _gravel: MeshMaterialType;
    private _ironOre: MeshMaterialType;
    private _lava: MeshMaterialType;
    private _leaves: MeshMaterialType;
    private _mud: MeshMaterialType;
    private _rocks: MeshMaterialType;
    private _rocksObject: MeshMaterialType;
    private _sand: MeshMaterialType;
    private _sky: ShaderMaterial;
    private _snow: MeshMaterialType;
    private _steel: MeshMaterialType;
    private _steelObject: MeshMaterialType;
    private _stoneBricks: MeshMaterialType;
    private _stoneBricksObject: MeshMaterialType;
    private _water: MeshMaterialType;
    private _woodPlank: MeshMaterialType;
    private _woodPlankObject: MeshMaterialType;
    private _woodTreeCutCube: MeshMaterialType;

    get barkCube(): MeshMaterialType {return this._barkCube;}

    get barkCubeObject(): MeshMaterialType {return this._barkCubeObject;}

    get bricks(): MeshMaterialType {return this._bricks;}

    get clay(): MeshMaterialType {return this._clay;}

    get coal(): MeshMaterialType {return this._coal;}

    get compost(): MeshMaterialType {return this._compost;}

    get concrete(): MeshMaterialType {return this._concrete;}

    get cursor(): MeshMaterialType {return this._cursor;}

    get glas(): MeshMaterialType {return this._glas;}

    get gras(): MeshMaterialType {return this._gras;}

    get gravel(): MeshMaterialType {return this._gravel;}

    get ironOre(): MeshMaterialType {return this._ironOre;}

    get lava(): MeshMaterialType {return this._lava;}

    get leaves(): MeshMaterialType {return this._leaves;}

    get mud(): MeshMaterialType {return this._mud;}

    get rocks(): MeshMaterialType {return this._rocks;}

    get rocksObject(): MeshMaterialType {return this._rocksObject;}

    get sand(): MeshMaterialType {return this._sand;}

    get sky(): ShaderMaterial {return this._sky;}

    get snow(): MeshMaterialType {return this._snow;}

    get steel(): MeshMaterialType {return this._steel;}

    get steelObject(): MeshMaterialType {return this._steelObject;}

    get stoneBricks(): MeshMaterialType {return this._stoneBricks;}

    get stoneBricksObject(): MeshMaterialType {return this._stoneBricksObject;}

    get water(): MeshMaterialType {return this._water;}

    get woodPlank(): MeshMaterialType {return this._woodPlank;}

    get woodPlankObject(): MeshMaterialType {return this._woodPlankObject;}

    get woodTreeCutCube(): MeshMaterialType {return this._woodTreeCutCube;}

    init(textures: Textures, progress: ResourceLoadingProgress): void {
        this._barkCube = new MeshLambertMaterial({map: textures.bark, vertexColors: VertexColors});
        this._barkCube.name = textures.bark.name;
        this._barkCubeObject = new MeshLambertMaterial({map: textures.bark});
        this._barkCubeObject.name = textures.bark.name;
        this._bricks = new MeshLambertMaterial({map: textures.bricks, vertexColors: VertexColors});
        this._bricks.name = textures.bricks.name;
        this._clay = new MeshPhongMaterial({map: textures.clay, vertexColors: VertexColors, bumpMap: textures.clay, bumpScale: 0.005, shininess: 80});
        this._clay.name = textures.clay.name;
        this._coal = new MeshLambertMaterial({map: textures.coal, vertexColors: VertexColors});
        this._coal.name = textures.coal.name;
        this._compost = new MeshLambertMaterial({map: textures.compost});
        this._compost.name = textures.compost.name;
        this._concrete = new MeshLambertMaterial({map: textures.concrete, vertexColors: VertexColors});
        this._concrete.name = textures.concrete.name;
        this._cursor = new MeshLambertMaterial({transparent: true, depthWrite: false, side: DoubleSide, opacity: .25, color: 0xffffff, blending: NormalBlending, polygonOffset: true, polygonOffsetFactor: -1});
        this._cursor.name = 'cursor';
        this._glas = new MeshPhongMaterial({transparent: true, depthWrite: false, side: DoubleSide, opacity: .1, color: 0x191919, specular: 0xffffff, shininess: 2500, blending: CustomBlending, blendSrc: OneFactor, blendDst: OneMinusSrcAlphaFactor, polygonOffset: true, polygonOffsetFactor: -1, envMap: textures.sky});
        this._glas.name = 'glas';
        this._gras = new MeshLambertMaterial({map: textures.grass, vertexColors: VertexColors, });
        this._gras.name = textures.grass.name;
        this._gravel = new MeshPhongMaterial({map: textures.gravel, bumpMap: textures.gravelBump, bumpScale: .004, specularMap: textures.gravel, shininess: 40, vertexColors: VertexColors});
        this._gravel.name = textures.gravel.name;
        this._ironOre = new MeshLambertMaterial({map: textures.ironOre, vertexColors: VertexColors});
        this._ironOre.name = textures.ironOre.name;
        this._lava = new MeshLambertMaterial({emissive: 0xffffff, color: 0x000000, emissiveMap: textures.lava});
        this._lava.name = textures.lava.name;
        this._leaves = new MeshLambertMaterial({map: textures.leaves, transparent: true, side: DoubleSide, opacity: 1, blending: NormalBlending, depthWrite: false});
        this.leaves.name = textures.leaves.name;
        this._mud = new MeshPhongMaterial({map: textures.mud, vertexColors: VertexColors, bumpMap: textures.mud, bumpScale: .01, specularMap: textures.mud, shininess: 60});
        this._mud.name = textures.mud.name;
        this._rocks = new MeshPhongMaterial({map: textures.rocks, vertexColors: VertexColors, specular: 0x202020, specularMap: textures.rocks, shininess: 10});
        this._rocks.name = textures.rocks.name;
        this._rocksObject = new MeshPhongMaterial({map: textures.rocks, specular: 0x202020, specularMap: textures.rocks, shininess: 10});
        this._rocksObject.name = textures.rocks.name;
        this._sand = new MeshLambertMaterial({map: textures.sand, vertexColors: VertexColors});
        this._sand.name = textures.sand.name;
        this._snow = new MeshLambertMaterial({map: textures.snow, vertexColors: VertexColors});
        this._snow.name = textures.snow.name;
        this._steel = new MeshPhysicalMaterial({map: textures.steel, metalness: 1, roughness: .7, envMap: textures.sky, vertexColors: VertexColors});
        this._steel.name = textures.steel.name;
        this._steelObject = new MeshPhysicalMaterial({map: textures.steel, metalness: 1, roughness: .7, envMap: textures.sky});
        this._steelObject.name = textures.steel.name;
        this._stoneBricks = new MeshPhongMaterial({map: textures.stoneBricks, bumpMap: textures.stoneBricksBump, bumpScale: .1, specular: 0x202020, specularMap: textures.stoneBricks, shininess: 10, vertexColors: VertexColors});
        this._stoneBricks.name = textures.stoneBricks.name;
        this._stoneBricksObject = new MeshPhongMaterial({map: textures.stoneBricks, bumpMap: textures.stoneBricksBump, bumpScale: .1, specular: 0x202020, specularMap: textures.stoneBricks, shininess: 10});
        this._stoneBricksObject.name = textures.stoneBricks.name;
        this._water = new MeshPhongMaterial({
            color: 0xffffff, specular: 0x404040, specularMap: textures.water, shininess: 512, map: textures.water,
            blending: NormalBlending, opacity: .8, transparent: true, depthWrite: false, envMap: textures.sky, reflectivity: 2
        });
        this._water.name = textures.water.name;
        this._woodTreeCutCube = new MeshLambertMaterial({map: textures.woodTreeCutCube, vertexColors: VertexColors});
        this._woodTreeCutCube.name = textures.woodTreeCutCube.name;
        this._woodPlank = new MeshPhongMaterial({map: textures.woodPlank, vertexColors: VertexColors, specular: 0x404040, specularMap: textures.woodPlank, shininess: 250});
        this._woodPlank.name = textures.woodPlank.name;
        this._woodPlankObject = new MeshPhongMaterial({map: textures.woodPlank, specular: 0x404040, specularMap: textures.woodPlank, shininess: 250});
        this._woodPlankObject.name = textures.woodPlank.name;

        this.initSky(progress);
    }

    private initSky(progress: ResourceLoadingProgress): void {
        this._sky = new ShaderMaterial({transparent: true, opacity: 1, blending: AdditiveBlending, depthTest: false, depthWrite: false});
        let fileLoader: FileLoader = new FileLoader();
        progress.addResource();
        fileLoader.load('assets/shaders/skyFragment.txt', (data: string) => {
            this._sky.fragmentShader = data;
            progress.resourceLoaded();
        });
        fileLoader = new FileLoader();
        progress.addResource();
        fileLoader.load('assets/shaders/skyVertex.txt', (data: string) => {
            this._sky.vertexShader = data;
            progress.resourceLoaded();
        });
        this._sky.uniforms = UniformsUtils.clone({
            luminance: {value: 1},
            turbidity: {value: 2},
            rayleigh: {value: 1},
            mieCoefficient: {value: 0.005},
            mieDirectionalG: {value: 0.8},
            sunPosition: {value: new Vector3(0, 0, 1)}
        });
    }
}
