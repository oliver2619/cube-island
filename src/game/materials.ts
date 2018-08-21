import {Material, MeshLambertMaterial, VertexColors, DoubleSide, NormalBlending, MeshPhongMaterial, CustomBlending, OneFactor, SrcAlphaFactor, MeshPhysicalMaterial, OneMinusSrcAlphaFactor} from "three";
import {Textures} from "./textures";

export class Materials {

    private _barkCube: Material;
    private _bricks: Material;
    private _clay: Material;
    private _coal: Material;
    private _concrete: Material;
    private _cursor: Material;
    private _glas: Material;
    private _gras: Material;
    private _gravel: Material;
    private _ironOre: Material;
    private _lava: Material;
    private _mud: Material;
    private _rocks: Material;
    private _sand: Material;
    private _snow: Material;
    private _steel: Material;
    private _stoneBricks: Material;
    private _stoneBricksObject: Material;
    private _water: Material;
    private _woodPlank: Material;
    private _woodPlankObject: Material;
    private _woodTreeCutCube: Material;

    get barkCube(): Material {return this._barkCube;}

    get bricks(): Material {return this._bricks;}

    get clay(): Material {return this._clay;}

    get coal(): Material {return this._coal;}

    get concrete(): Material {return this._concrete;}

    get cursor(): Material {return this._cursor;}

    get glas(): Material {return this._glas;}

    get gras(): Material {return this._gras;}

    get gravel(): Material {return this._gravel;}

    get ironOre(): Material {return this._ironOre;}

    get lava(): Material {return this._lava;}

    get mud(): Material {return this._mud;}

    get rocks(): Material {return this._rocks;}

    get sand(): Material {return this._sand;}

    get snow(): Material {return this._snow;}

    get steel(): Material {return this._steel;}

    get stoneBricks(): Material {return this._stoneBricks;}

    get stoneBricksObject(): Material {return this._stoneBricksObject;}

    get water(): Material {return this._water;}

    get woodPlank(): Material {return this._woodPlank;}

    get woodPlankObject(): Material {return this._woodPlankObject;}

    get woodTreeCutCube(): Material {return this._woodTreeCutCube;}

    init(textures: Textures): void {
        this._barkCube = new MeshLambertMaterial({map: textures.bark, vertexColors: VertexColors});
        this._barkCube.name = textures.bark.name;
        this._bricks = new MeshLambertMaterial({map: textures.bricks, vertexColors: VertexColors});
        this._bricks.name = textures.bricks.name;
        this._clay = new MeshLambertMaterial({map: textures.clay, vertexColors: VertexColors});
        this._clay.name = textures.clay.name;
        this._coal = new MeshLambertMaterial({map: textures.coal, vertexColors: VertexColors});
        this._coal.name = textures.coal.name;
        this._concrete = new MeshLambertMaterial({map: textures.concrete, vertexColors: VertexColors});
        this._concrete.name = textures.concrete.name;
        this._cursor = new MeshLambertMaterial({transparent: true, depthWrite: false, side: DoubleSide, opacity: .25, color: 0xffffff, blending: NormalBlending, polygonOffset: true, polygonOffsetFactor: -1});
        this._cursor.name = 'cursor';
        this._glas = new MeshPhongMaterial({transparent: true, depthWrite: false, side: DoubleSide, opacity: .1, color: 0x000000, specular: 0xffffff, shininess: 250, blending: CustomBlending, blendSrc: OneFactor, blendDst: OneMinusSrcAlphaFactor, polygonOffset: true, polygonOffsetFactor: -1});
        this._glas.name = 'glas';
        this._gras = new MeshLambertMaterial({map: textures.grass, vertexColors: VertexColors});
        this._gras.name = textures.grass.name;
        this._gravel = new MeshPhongMaterial({map: textures.gravel, bumpMap: textures.gravelBump, bumpScale: .004, specular: 0x202020, specularMap: textures.gravel, shininess: 40, vertexColors: VertexColors});
        this._gravel.name = textures.gravel.name;
        this._ironOre = new MeshLambertMaterial({map: textures.ironOre, vertexColors: VertexColors});
        this._ironOre.name = textures.ironOre.name;
        this._lava = new MeshLambertMaterial({emissive: 0xffffff, color: 0x000000, emissiveMap: textures.lava});
        this._lava.name = textures.lava.name;
        this._mud = new MeshLambertMaterial({map: textures.mud, vertexColors: VertexColors});
        this._mud.name = textures.mud.name;
        this._rocks = new MeshPhongMaterial({map: textures.rocks, vertexColors: VertexColors, specular: 0x202020, specularMap: textures.rocks, shininess: 40});
        this._rocks.name = textures.rocks.name;
        this._sand = new MeshLambertMaterial({map: textures.sand, vertexColors: VertexColors});
        this._sand.name = textures.sand.name;
        this._snow = new MeshLambertMaterial({map: textures.snow, vertexColors: VertexColors});
        this._snow.name = textures.snow.name;
        this._steel = new MeshPhysicalMaterial({map: textures.steel, metalness: 1, roughness: .7, vertexColors: VertexColors});
        this._steel.name = textures.steel.name;
        this._stoneBricks = new MeshLambertMaterial({map: textures.stoneBricks, vertexColors: VertexColors});
        this._stoneBricks.name = textures.stoneBricks.name;
        this._stoneBricksObject = new MeshLambertMaterial({map: textures.stoneBricks});
        this._stoneBricksObject.name = textures.stoneBricks.name;
        this._water = new MeshPhongMaterial({color: 0xffffff, specular: 0x404040, specularMap: textures.water, shininess: 512, map: textures.water, blending: NormalBlending, opacity: .8, transparent: true, depthWrite: false});
        this._water.name = textures.water.name;
        this._woodTreeCutCube = new MeshLambertMaterial({map: textures.woodTreeCutCube, vertexColors: VertexColors});
        this._woodTreeCutCube.name = textures.woodTreeCutCube.name;
        this._woodPlank = new MeshPhongMaterial({map: textures.woodPlank, vertexColors: VertexColors, specular: 0x404040, specularMap: textures.woodPlank, shininess: 250});
        this._woodPlank.name = textures.woodPlank.name;
        this._woodPlankObject = new MeshPhongMaterial({map: textures.woodPlank, specular: 0x404040, specularMap: textures.woodPlank, shininess: 250});
        this._woodPlankObject.name = textures.woodPlank.name;
    }
}
