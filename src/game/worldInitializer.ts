import {CubeCluster} from "./cubes";
import {World} from "./world";
import {Constants} from "./constants";
import {Vector3} from "three";
import {CollectibleTypes} from "./collectibleTypes";
import {CubeType} from "./cubeTypes";

class Hill {
    private static FACTOR: number = 3 * Math.sqrt(3) / 8;

    weight: number;

    constructor(public x: number, public y: number, public height: number) {
        const w = height * Hill.FACTOR * (Math.random() * 2 + 1);
        this.weight = w * w;
    }

    getHeight(x: number, y: number): number {
        const dx = x - this.x;
        const dy = y - this.y;
        return this.height * this.weight / (this.weight + dx * dx + dy * dy);
    }
}

class Ruin {

    public z: number;

    public x1: number;
    public y1: number;
    public x2: number;
    public y2: number;

    constructor(x: number, y: number) {
        this.x1 = x - 5;
        this.x2 = x + 5;
        this.y1 = y - 3;
        this.y2 = y + 3;
    }

    build(world: World): void {
        const doorX = Math.floor((this.x1 + this.x2) / 2);
        for (let x = this.x1; x <= this.x2; ++x) {
            for (let y = this.y1; y <= this.y2; ++y) {
                if (this.isWall(x, y) && ((x !== doorX && x !== doorX + 1) || y !== this.y1)) {
                    for (let z = this.z; z < this.z + Math.random() * 3 + 2; ++z)
                        world.addCube(CollectibleTypes.STONE_BRICKS, new Vector3(x, y, z));
                }
            }
        }
    }

    isInside(x: number, y: number): boolean {
        return x >= this.x1 && x <= this.x2 && y >= this.y1 && y <= this.y2;
    }

    isWall(x: number, y: number): boolean {
        return x === this.x1 || x === this.x2 || y === this.y1 || y === this.y2;
    }
}

class ResourceOszillator {
    private dx: number;
    private dy: number;
    private amp: number;
    private off: number;

    constructor(length: number, amp?: number) {
        const angle = Math.random() * 2 * Math.PI;
        const freq = Math.PI * 2 / (length * (Math.random() * .4 + .8));
        this.off = Math.random() * Math.PI * 2;
        this.dx = freq * Math.sin(angle);
        this.dy = freq * Math.cos(angle);
        this.amp = amp !== undefined ? amp : 1;
    }

    get(x: number, y: number): number {
        return this.amp * Math.sin(x * this.dx + y * this.dy + this.off);
    }
}

class ResourceLayer {
    private widthOszi1: ResourceOszillator = new ResourceOszillator(10 + Math.random() * 4);
    private widthOszi2: ResourceOszillator = new ResourceOszillator(15 + Math.random() * 4);
    private widthOszi3: ResourceOszillator = new ResourceOszillator(20 + Math.random() * 4);

    private heightOszi1: ResourceOszillator = new ResourceOszillator(20 + Math.random() * 4, 2 + Math.random());
    private heightOszi2: ResourceOszillator = new ResourceOszillator(30 + Math.random() * 4, 4 + Math.random());

    constructor(private depth: number, private _type: CubeType) {}

    get type(): CubeType {return this._type;}

    hasResource(x: number, y: number, z: number, height: number): boolean {
        const w = this.getWidth(x, y);
        const h = this.getHeight(x, y);
        return height - this.depth - w < z && height - this.depth + w > z;
    }

    private getHeight(x: number, y: number): number {
        return this.heightOszi1.get(x, y) + this.heightOszi2.get(x, y);
    }

    private getWidth(x: number, y: number): number {
        return 2.5 * Math.max(this.widthOszi1.get(x, y), 0) * Math.max(this.widthOszi2.get(x, y), 0) * Math.max(this.widthOszi3.get(x, y), 0);
    }
}

export class WorldInitializer {

    // maximum 50
    numberOfCluster: number = 15;

    private hills: Hill[] = [];

    private ruins: Ruin[] = [];

    init(world: World): void {
        const size = this.numberOfCluster * CubeCluster.SIZE;
        const waterHeight = Constants.waterHeight;
        const hillsCount = size * size / (CubeCluster.SIZE * CubeCluster.SIZE * 10);
        const border = 30;
        world.setWorldSize(size);

        for (let i = 0; i < hillsCount; ++i) {
            this.hills.push(new Hill(Math.random() * (size - border * 2) + border, Math.random() * (size - border * 2) + border, Math.random() * 15));
        }
        this.addRuin(Math.floor(Math.random() * (size - border * 2) + border), Math.floor(Math.random() * (size - border * 2) + border));

        let height: number, incl: number;
        let f: boolean;
        let resLayers: ResourceLayer[] = [];
        resLayers.push(new ResourceLayer(3 + Math.random() * 4, CollectibleTypes.COAL));
        resLayers.push(new ResourceLayer(7 + Math.random() * 4, CollectibleTypes.IRON_ORE));
        resLayers.push(new ResourceLayer(11 + Math.random() * 4, CollectibleTypes.COAL));
        resLayers.push(new ResourceLayer(15 + Math.random() * 4, CollectibleTypes.IRON_ORE));
        resLayers.push(new ResourceLayer(19 + Math.random() * 4, CollectibleTypes.IRON_ORE));
        resLayers.push(new ResourceLayer(23 + Math.random() * 4, CollectibleTypes.IRON_ORE));
        let resLayer: ResourceLayer;
        let ruin: Ruin;
        let ruinWall = false;

        for (let x = 0; x < size; ++x) {
            for (let y = 0; y < size; ++y) {
                height = Math.round(this.getHeight(x, y));
                incl = this.getInclination(x, y);
                if (height < 2)
                    height = 2;
                ruin = this.getRuin(x, y);
                if (ruin !== undefined) {
                    ruinWall = ruin.isWall(x, y);
                    if (height > ruin.z)
                        height = ruin.z;
                }
                for (let z = 0; z < height; ++z) {
                    if (z === 0)
                        world.addCube(CollectibleTypes.LAVA, new Vector3(x, y, z));
                    else {
                        resLayer = resLayers.find(l => l.hasResource(x, y, z, height));
                        if (resLayer !== undefined) {
                            world.addCube(resLayer.type, new Vector3(x, y, z));
                        } else if (z < height - 3 + incl * 2) {
                            f = incl < .4 && z > height - 5 + incl * 2;
                            if (Math.random() < .05)
                                f = !f;
                            if (f) {
                                world.addCube(CollectibleTypes.GRAVEL, new Vector3(x, y, z));
                            } else {
                                world.addCube(CollectibleTypes.ROCKS, new Vector3(x, y, z));
                            }
                        } else if (z < waterHeight + 3) {
                            world.addCube(CollectibleTypes.SAND, new Vector3(x, y, z));
                        } else if (ruin !== undefined && ruinWall) {
                            world.addCube(CollectibleTypes.STONE_BRICKS, new Vector3(x, y, z));
                        } else {
                            world.addCube(CollectibleTypes.GRAS, new Vector3(x, y, z));
                            if (z + 1 >= height) {
                                if (Math.random() < .01) {
                                    for (let th = 1; th < 10; ++th)
                                        world.addCube(CollectibleTypes.WOOD, new Vector3(x, y, z + th));
                                } else if (Math.random() < .1) {
                                    const pl = world.addStaticObject(new Vector3(x, y, z + 1), 0, CollectibleTypes.randomPlant());
                                    pl.userData.grown = 1;
                                }
                            }

                        }
                    }
                }
                if (ruin != undefined && height < ruin.z && ruinWall) {
                    for (let z = height; z < ruin.z; ++z) {
                        world.addCube(CollectibleTypes.STONE_BRICKS, new Vector3(x, y, z));
                    }
                }
                for (let z = height; z < waterHeight; ++z) {
                    world.addCube(CollectibleTypes.WATER, new Vector3(x, y, z));
                }
            }
        }
        this.ruins.forEach(r => r.build(world));
        this.initPerson(world);
    }

    private addRuin(x: number, y: number): void {
        const r: Ruin = new Ruin(x, y);
        let z1 = this.getHeight(x, y), z2 = z1;
        for (let ix = r.x1; ix <= r.x2; ++ix) {
            for (let iy = r.y1; iy <= r.y2; ++iy) {
                z1 = Math.min(z1, this.getHeight(ix, iy));
                z2 = Math.max(z2, this.getHeight(ix, iy));
            }
        }
        r.z = Math.floor((z1 + z2) / 2);
        this.ruins.push(r);
    }

    private initPerson(world: World): void {
        const size = world.size;
        let x = Math.floor(size * .5);
        let y = size - 1;
        while (y > 0 && world.getHeight(x, y) <= Constants.waterHeight) {
            --y;
        }

        let h = 0;
        for (let ix = x - 1; ix <= x + 1; ++ix) {
            for (let iy = y - 1; iy <= y + 1; ++iy) {
                h = Math.max(h, world.getHeight(ix, iy));
            }
        }
        world.person.position.set((x + .5) * Constants.cubeSize, (y + .5) * Constants.cubeSize, h * Constants.cubeSize);
    }

    private getHeight(x: number, y: number): number {
        let ret = 0;
        this.hills.forEach(h => {
            ret += h.getHeight(x, y);
        });
        return ret;
    }

    private getInclination(x: number, y: number): number {
        const hx = this.getHeight(x + .5, y) - this.getHeight(x - .5, y);
        const hy = this.getHeight(x, y + .5) - this.getHeight(x, y - .5);
        return Math.sqrt(hx * hx + hy * hy);
    }

    private getRuin(x: number, y: number): Ruin {
        return this.ruins.find(r => r.isInside(x, y));
    }

}