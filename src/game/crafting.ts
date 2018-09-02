import {CollectibleResources} from "./resourceSet";
import {CollectibleTypes} from "./collectibleTypes";
import {FactoryType} from "./factoryType";

export interface CraftGroup {
    id: string;
    name: string;
}

export class CraftGroups {
    private static _furniture: CraftGroup = {id: 'furniture', name: 'Furniture'};

    private static _metal: CraftGroup = {id: 'metal', name: 'Metal'};

    private static _plant: CraftGroup = {id: 'plant', name: 'Plant'};

    private static _stone: CraftGroup = {id: 'stone', name: 'Stone'};

    private static _tools: CraftGroup = {id: 'tools', name: 'Tools'};

    private static _wood: CraftGroup = {id: 'wood', name: 'Wood'};

    static get furniture(): CraftGroup {return CraftGroups._furniture;}

    static get metal(): CraftGroup {return CraftGroups._metal;}

    static get plant(): CraftGroup {return CraftGroups._plant;}

    static get stone(): CraftGroup {return CraftGroups._stone;}

    static get tools(): CraftGroup {return CraftGroups._tools;}

    static get wood(): CraftGroup {return CraftGroups._wood;}
}

export interface CraftRecipe {
    id: string;
    name: string;

    sources: CollectibleResources[];
    product: CollectibleResources;

    factoryType: FactoryType;
    group: CraftGroup;
    duration?: number;
}

export class CraftRecipes {

    private static _recipes: CraftRecipe[];

    static get all(): CraftRecipe[] {
        if (CraftRecipes._recipes === undefined) {
            CraftRecipes.init();
        }
        return CraftRecipes._recipes;
    }

    private static init(): void {
        CraftRecipes._recipes = [{
            id: 'anvil',
            name: 'Anvil',
            sources: [
                new CollectibleResources(CollectibleTypes.BAR_STEEL, 4)
            ],
            product: new CollectibleResources(CollectibleTypes.ANVIL, 1),
            factoryType: FactoryType.FURNACE_METAL,
            group: CraftGroups.tools,
            duration: 1
        }, {
            id: 'barSteel',
            name: 'Steel bar',
            sources: [
                new CollectibleResources(CollectibleTypes.STEEL, 1)
            ],
            product: new CollectibleResources(CollectibleTypes.BAR_STEEL, 16),
            factoryType: FactoryType.FURNACE_METAL,
            group: CraftGroups.metal,
            duration: 1
        }, {
            id: 'bucketMetalEmpty',
            name: 'Empty metal bucket',
            sources: [
                new CollectibleResources(CollectibleTypes.BAR_STEEL, 1)
            ],
            product: new CollectibleResources(CollectibleTypes.BUCKET_METAL_EMPTY, 1),
            factoryType: FactoryType.ANVIL,
            group: CraftGroups.tools
        }, {
            id: 'bucketWoodEmpty',
            name: 'Empty wooden bucket',
            sources: [
                new CollectibleResources(CollectibleTypes.WOOD_PLANK, 1)
            ],
            product: new CollectibleResources(CollectibleTypes.BUCKET_WOOD_EMPTY, 1),
            factoryType: FactoryType.WORK_BENCH,
            group: CraftGroups.tools
        }, {
            id: 'chest',
            name: 'Chest',
            sources: [
                new CollectibleResources(CollectibleTypes.WOOD_PLANK, 1)
            ],
            product: new CollectibleResources(CollectibleTypes.CHEST, 1),
            factoryType: FactoryType.WORK_BENCH,
            group: CraftGroups.furniture
        }, {
            id: 'clay',
            name: 'Clay',
            sources: [
                new CollectibleResources(CollectibleTypes.GRAS, 1),
                new CollectibleResources(CollectibleTypes.SAND, 1)
            ],
            product: new CollectibleResources(CollectibleTypes.CLAY, 2),
            factoryType: FactoryType.NONE,
            group: CraftGroups.stone
        }, {
            id: 'clayBricks',
            name: 'Clay bricks',
            sources: [
                new CollectibleResources(CollectibleTypes.CLAY, 1)
            ],
            product: new CollectibleResources(CollectibleTypes.CLAY_BRICKS, 1),
            factoryType: FactoryType.FURNACE_METAL,
            group: CraftGroups.stone,
            duration: 1
        }, {
            id: 'coal',
            name: 'Coal',
            sources: [
                new CollectibleResources(CollectibleTypes.WOOD_PLANK, 4)
            ],
            product: new CollectibleResources(CollectibleTypes.COAL, 1),
            factoryType: FactoryType.FURNACE_METAL,
            group: CraftGroups.stone,
            duration: 1
        }, {
            id: 'compost',
            name: 'Compost',
            sources: [
                new CollectibleResources(CollectibleTypes.GRAS, 1)
            ],
            product: new CollectibleResources(CollectibleTypes.COMPOST, 1),
            factoryType: FactoryType.NONE,
            group: CraftGroups.plant
        }, {
            id: 'fenceWood',
            name: 'FenceWood',
            sources: [
                new CollectibleResources(CollectibleTypes.STICK_WOOD, 3)
            ],
            product: new CollectibleResources(CollectibleTypes.FENCE_WOOD, 1),
            factoryType: FactoryType.WORK_BENCH,
            group: CraftGroups.furniture
        }, {
            id: 'furnace',
            name: 'Furnace',
            sources: [
                new CollectibleResources(CollectibleTypes.ROCKS, 12)
            ],
            product: new CollectibleResources(CollectibleTypes.FURNACE, 1),
            factoryType: FactoryType.STONE_MILL,
            group: CraftGroups.furniture
        }, {
            id: 'glas',
            name: 'Glas',
            sources: [
                new CollectibleResources(CollectibleTypes.SAND, 1)
            ],
            product: new CollectibleResources(CollectibleTypes.GLAS, 1),
            factoryType: FactoryType.FURNACE_METAL,
            group: CraftGroups.stone,
            duration: 1
        }, {
            id: 'gravel',
            name: 'Gravel',
            sources: [
                new CollectibleResources(CollectibleTypes.ROCKS, 3)
            ],
            product: new CollectibleResources(CollectibleTypes.GRAVEL, 4),
            factoryType: FactoryType.STONE_MILL,
            group: CraftGroups.stone
        }, {
            id: 'gravel2',
            name: 'Gravel',
            sources: [
                new CollectibleResources(CollectibleTypes.STONE_BRICKS, 3)
            ],
            product: new CollectibleResources(CollectibleTypes.GRAVEL, 4),
            factoryType: FactoryType.STONE_MILL,
            group: CraftGroups.stone
        }, {
            id: 'mud',
            name: 'Mud from wood',
            sources: [
                new CollectibleResources(CollectibleTypes.WOOD, 1)
            ],
            product: new CollectibleResources(CollectibleTypes.GRAS, 1),
            factoryType: FactoryType.COMPOST,
            group: CraftGroups.plant,
            duration: 1
        }, {
            id: 'mud2',
            name: 'Mud from flowers',
            sources: [
                new CollectibleResources(CollectibleTypes.FLOWER_WHITE, 2),
                new CollectibleResources(CollectibleTypes.FLOWER_RED, 2),
                new CollectibleResources(CollectibleTypes.FLOWER_BLUE, 2),
                new CollectibleResources(CollectibleTypes.FLOWER_YELLOW, 2),
                new CollectibleResources(CollectibleTypes.FLOWER_PINK, 2),
            ],
            product: new CollectibleResources(CollectibleTypes.GRAS, 1),
            factoryType: FactoryType.COMPOST,
            group: CraftGroups.plant,
            duration: 1
        }, {
            id: 'sand',
            name: 'Sand from gravel',
            sources: [
                new CollectibleResources(CollectibleTypes.GRAVEL, 4)
            ],
            product: new CollectibleResources(CollectibleTypes.SAND, 3),
            factoryType: FactoryType.STONE_MILL,
            group: CraftGroups.stone
        }, {
            id: 'sand2',
            name: 'Sand from glas',
            sources: [
                new CollectibleResources(CollectibleTypes.GLAS, 1)
            ],
            product: new CollectibleResources(CollectibleTypes.SAND, 1),
            factoryType: FactoryType.STONE_MILL,
            group: CraftGroups.stone
        }, {
            id: 'steel',
            name: 'Steel',
            sources: [
                new CollectibleResources(CollectibleTypes.IRON_ORE, 1),
                new CollectibleResources(CollectibleTypes.COAL, 1)
            ],
            product: new CollectibleResources(CollectibleTypes.STEEL, 1),
            factoryType: FactoryType.FURNACE_METAL,
            group: CraftGroups.metal,
            duration: 1
        }, {
            id: 'stoneBricks',
            name: 'Stone bricks',
            sources: [
                new CollectibleResources(CollectibleTypes.ROCKS, 1)
            ],
            product: new CollectibleResources(CollectibleTypes.STONE_BRICKS, 1),
            factoryType: FactoryType.STONE_MILL,
            group: CraftGroups.stone
        }, {
            id: 'stonemill',
            name: 'Stonemill',
            sources: [
                new CollectibleResources(CollectibleTypes.ROCKS, 6)
            ],
            product: new CollectibleResources(CollectibleTypes.STONEMILL, 1),
            factoryType: FactoryType.NONE,
            group: CraftGroups.stone
        }, {
            id: 'stoneStairs',
            name: 'Stone stairs',
            sources: [
                new CollectibleResources(CollectibleTypes.STONE_BRICKS, 1)
            ],
            product: new CollectibleResources(CollectibleTypes.STAIRS_STONE, 1),
            factoryType: FactoryType.STONE_MILL,
            group: CraftGroups.furniture
        }, {
            id: 'window',
            name: 'Window',
            sources: [
                new CollectibleResources(CollectibleTypes.WOOD_PLANK, 1),
                new CollectibleResources(CollectibleTypes.GLAS, 1)
            ],
            product: new CollectibleResources(CollectibleTypes.WINDOW, 20),
            factoryType: FactoryType.WORK_BENCH,
            group: CraftGroups.furniture
        }, {
            id: 'woodenDoor',
            name: 'Wooden door',
            sources: [
                new CollectibleResources(CollectibleTypes.WOOD_PLANK, 4)
            ],
            product: new CollectibleResources(CollectibleTypes.DOOR_WOOD, 1),
            factoryType: FactoryType.WORK_BENCH,
            group: CraftGroups.furniture
        }, {
            id: 'woodenStairs',
            name: 'Wooden stairs',
            sources: [
                new CollectibleResources(CollectibleTypes.WOOD_PLANK, 1)
            ],
            product: new CollectibleResources(CollectibleTypes.STAIRS_WOOD, 1),
            factoryType: FactoryType.WORK_BENCH,
            group: CraftGroups.furniture
        }, {
            id: 'woodenSticks',
            name: 'Wooden sticks',
            sources: [
                new CollectibleResources(CollectibleTypes.WOOD_PLANK, 1)
            ],
            product: new CollectibleResources(CollectibleTypes.STICK_WOOD, 30),
            factoryType: FactoryType.WORK_BENCH,
            group: CraftGroups.wood
        }, {
            id: 'woodPlank',
            name: 'Wood plank',
            sources: [
                new CollectibleResources(CollectibleTypes.WOOD, 1)
            ],
            product: new CollectibleResources(CollectibleTypes.WOOD_PLANK, 4),
            factoryType: FactoryType.NONE,
            group: CraftGroups.wood
        }, {
            id: 'workbench',
            name: 'Workbench',
            sources: [
                new CollectibleResources(CollectibleTypes.WOOD_PLANK, 2)
            ],
            product: new CollectibleResources(CollectibleTypes.WORKBENCH, 1),
            factoryType: FactoryType.NONE,
            group: CraftGroups.furniture
        }];
    }
}