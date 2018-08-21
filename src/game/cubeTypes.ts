import {Assets} from "./assets";
import {Material, Texture, Object3D, Vector3} from "three";
import {CollectibleType} from "./collectible";

export abstract class CubeType extends CollectibleType {

    abstract diggingTime: number;

    constructor(id: string) {
        super(id);
    }

    get nutritiveValue(): number {return 0;}

    get size(): Vector3 {return new Vector3(1, 1, 1);}

    canWalkThrough(): boolean {return false;}

    createForCursor(assets: Assets): Object3D {
        return assets.objects.getCube(assets.materials.cursor);
    }

    createForHud(assets: Assets): Object3D {
        const ret = assets.objects.getCube(this.getMaterial(assets), this.getMaterialTop(assets), this.getMaterialBottom(assets));
        ret.rotation.x = -75 * Math.PI / 180;
        return ret;
    }

    abstract getMaterial(assets: Assets): Material;

    getMaterialTop(assets: Assets): Material {
        return this.getMaterial(assets);
    }

    getMaterialBottom(assets: Assets): Material {
        return this.getMaterial(assets);
    }

    isArtificial(): boolean {return false;}

    isHarvestable(): boolean {return true;}

    isLiquid(): boolean {
        return false;
    }

    isTransparent(): boolean {
        return false;
    }
}

export class CubeTypeClay extends CubeType {

    constructor(id: string) {
        super(id);
    }

    get diggingTime(): number {
        return .4;
    }

    getMaterial(assets: Assets): Material {
        return assets.materials.clay;
    }
}

export class CubeTypeClayBricks extends CubeType {

    constructor(id: string) {
        super(id);
    }

    get diggingTime(): number {
        return .4;
    }

    getMaterial(assets: Assets): Material {
        return assets.materials.bricks;
    }

    getMaterialBottom(assets: Assets): Material {
        return assets.materials.concrete;
    }

    getMaterialTop(assets: Assets): Material {
        return assets.materials.concrete;
    }

    isArtificial(): boolean {return true;}
}

export class CubeTypeCoal extends CubeType {

    constructor(id: string) {
        super(id);
    }

    get diggingTime(): number {
        return .4;
    }

    getMaterial(assets: Assets): Material {
        return assets.materials.coal;
    }
}

export class CubeTypeGras extends CubeType {

    constructor(id: string) {
        super(id);
    }

    get diggingTime(): number {
        return .4;
    }

    getMaterial(assets: Assets): Material {
        return assets.materials.mud;
    }

    getMaterialTop(assets: Assets): Material {
        return assets.materials.gras;
    }

    getTexture(assets: Assets): Texture {
        return assets.textures.grass;
    }
}

export class CubeTypeGravel extends CubeType {

    constructor(id: string) {
        super(id);
    }

    get diggingTime(): number {
        return .4;
    }

    getMaterial(assets: Assets): Material {
        return assets.materials.gravel;
    }
}

export class CubeTypeIce extends CubeType {

    constructor(id: string) {
        super(id);
    }

    get diggingTime(): number {
        return .4;
    }

    getMaterial(assets: Assets): Material {
        return assets.materials.snow;
    }
}

export class CubeTypeIronOre extends CubeType {

    constructor(id: string) {
        super(id);
    }

    get diggingTime(): number {
        return .4;
    }

    getMaterial(assets: Assets): Material {
        return assets.materials.ironOre;
    }
}

export class CubeTypeLava extends CubeType {

    constructor(id: string) {
        super(id);
    }

    get diggingTime(): number {
        return 10000;
    }

    getMaterial(assets: Assets): Material {
        return assets.materials.lava;
    }

    isHarvestable(): boolean {return false;}

    isLiquid(): boolean {return true;}
}

export class CubeTypeMud extends CubeType {

    constructor(id: string) {
        super(id);
    }

    get diggingTime(): number {
        return .4;
    }

    getMaterial(assets: Assets): Material {
        return assets.materials.mud;
    }
}

export class CubeTypeRocks extends CubeType {

    constructor(id: string) {
        super(id);
    }

    get diggingTime(): number {
        return .4;
    }

    getMaterial(assets: Assets): Material {
        return assets.materials.rocks;
    }
}

export class CubeTypeSand extends CubeType {

    constructor(id: string) {
        super(id);
    }

    get diggingTime(): number {
        return .4;
    }

    getMaterial(assets: Assets): Material {
        return assets.materials.sand;
    }
}

export class CubeTypeSteel extends CubeType {

    constructor(id: string) {
        super(id);
    }

    get diggingTime(): number {
        return .4;
    }

    getMaterial(assets: Assets): Material {
        return assets.materials.steel;
    }
}

export class CubeTypeStoneBricks extends CubeType {

    constructor(id: string) {
        super(id);
    }

    get diggingTime(): number {
        return .4;
    }

    getMaterial(assets: Assets): Material {
        return assets.materials.stoneBricks;
    }

    isArtificial(): boolean {return true;}
}

export class CubeTypeWater extends CubeType {

    constructor(id: string) {
        super(id);
    }

    get diggingTime(): number {
        return 10000;
    }

    canWalkThrough(): boolean {return true;}

    getMaterial(assets: Assets): Material {
        return assets.materials.water;
    }

    isHarvestable(): boolean {return false;}

    isLiquid(): boolean {return true;}

    isTransparent(): boolean {return true;}
}

export class CubeTypeWood extends CubeType {

    constructor(id: string) {
        super(id);
    }

    get diggingTime(): number {
        return .4;
    }

    getMaterial(assets: Assets): Material {
        return assets.materials.barkCube;
    }

    getMaterialTop(assets: Assets): Material {
        return assets.materials.woodTreeCutCube;
    }

    getMaterialBottom(assets: Assets): Material {
        return assets.materials.woodTreeCutCube;
    }

    isArtificial(): boolean {return true;}
}

export class CubeTypeWoodPlank extends CubeType {

    constructor(id: string) {
        super(id);
    }

    get diggingTime(): number {
        return .4;
    }

    getMaterial(assets: Assets): Material {
        return assets.materials.woodPlank;
    }

    isArtificial(): boolean {return true;}
}


export class CubeTypes {
    static CLAY = new CubeTypeClay('CLAY');
    static CLAY_BRICKS = new CubeTypeClayBricks('CLAY_BRICKS');
    static COAL = new CubeTypeCoal('COAL');
    static GRAS = new CubeTypeGras('GRAS');
    static GRAVEL = new CubeTypeGravel('GRAVEL');
    static ICE = new CubeTypeIce('ICE');
    static IRON_ORE = new CubeTypeIronOre('IRON_ORE');
    static LAVA = new CubeTypeLava('LAVA');
    static MUD = new CubeTypeMud('MUD');
    static ROCKS = new CubeTypeRocks('ROCKS');
    static SAND = new CubeTypeSand('SAND');
    static STEEL = new CubeTypeSteel('STEEL');
    static STONE_BRICKS = new CubeTypeStoneBricks('STONE_BRICKS');
    static WATER = new CubeTypeWater('WATER');
    static WOOD = new CubeTypeWood('WOOD');
    static WOOD_PLANK = new CubeTypeWoodPlank('WOOD_PLANK');
}