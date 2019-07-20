import {MeshLambertMaterial, VertexColors, DoubleSide, NormalBlending, MeshPhongMaterial, CustomBlending, OneFactor, MeshPhysicalMaterial, OneMinusSrcAlphaFactor, FileLoader, ShaderMaterial, UniformsUtils, Vector3, AdditiveBlending, Material} from "three";
import {Textures} from "./textures";
import {ResourceLoadingProgress} from "./resourceLoadingProgress";

export class Materials {

    private _barkCube: Material;
    private _barkCubeObject: Material;
    private _bricks: Material;
    private _clay: Material;
    private _coal: Material;
    private _compost: Material;
    private _concrete: Material;
    private _cursor: Material;
    private _glas: Material;
    private _gras: Material;
    private _gravel: Material;
    private _ironOre: Material;
    private _lava: Material;
    private _leaves: Material;
    private _mud: Material;
    private _rocks: Material;
    private _rocksObject: Material;
    private _sand: Material;
    private _sky: ShaderMaterial;
    private _snow: Material;
    private _steel: Material;
    private _steelObject: Material;
    private _stoneBricks: Material;
    private _stoneBricksObject: Material;
    private _water: Material;
    private _woodPlank: Material;
    private _woodPlankObject: Material;
    private _woodTreeCutCube: Material;

    get barkCube(): Material {return this._barkCube;}

    get barkCubeObject(): Material {return this._barkCubeObject;}

    get bricks(): Material {return this._bricks;}

    get clay(): Material {return this._clay;}

    get coal(): Material {return this._coal;}

    get compost(): Material {return this._compost;}

    get concrete(): Material {return this._concrete;}

    get cursor(): Material {return this._cursor;}

    get glas(): Material {return this._glas;}

    get gras(): Material {return this._gras;}

    get gravel(): Material {return this._gravel;}

    get ironOre(): Material {return this._ironOre;}

    get lava(): Material {return this._lava;}

    get leaves(): Material {return this._leaves;}

    get mud(): Material {return this._mud;}

    get rocks(): Material {return this._rocks;}

    get rocksObject(): Material {return this._rocksObject;}

    get sand(): Material {return this._sand;}

    get sky(): ShaderMaterial {return this._sky;}

    get snow(): Material {return this._snow;}

    get steel(): Material {return this._steel;}

    get steelObject(): Material {return this._steelObject;}

    get stoneBricks(): Material {return this._stoneBricks;}

    get stoneBricksObject(): Material {return this._stoneBricksObject;}

    get water(): Material {return this._water;}

    get woodPlank(): Material {return this._woodPlank;}

    get woodPlankObject(): Material {return this._woodPlankObject;}

    get woodTreeCutCube(): Material {return this._woodTreeCutCube;}

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
