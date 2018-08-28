import {CubeTypes} from "./cubeTypes";
import {ObjectTypeChest, ObjectTypeDoorWood, ObjectTypeGlas, ObjectTypeGrass, ObjectTypeFenceWood, ObjectTypeWindow, ObjectTypeStairsWood, ObjectTypeStairsStone, ObjectTypeWorkbench, ObjectTypeStonemill, ObjectTypeStickWood, ObjectTypeFurnace, ObjectTypeCompost, ObjectTypeBarSteel} from "./objects";
import {ObjectTypeFlowerWhite, ObjectTypeFlowerRed, ObjectTypeFlowerBlue, ObjectTypeFlowerYellow, ObjectTypeFlowerPink, ObjectTypeMushroom, ObjectTypeTree, ObjectTypeFlower, ObjectTypePlant} from "./plants";

export class CollectibleTypes {
    static CLAY = CubeTypes.CLAY;
    static CLAY_BRICKS = CubeTypes.CLAY_BRICKS;
    static COAL = CubeTypes.COAL;
    static GRAS = CubeTypes.GRAS;
    static GRAVEL = CubeTypes.GRAVEL;
    static ICE = CubeTypes.ICE;
    static IRON_ORE = CubeTypes.IRON_ORE;
    static LAVA = CubeTypes.LAVA;
    static MUD = CubeTypes.MUD;
    static ROCKS = CubeTypes.ROCKS;
    static SAND = CubeTypes.SAND;
    static STEEL = CubeTypes.STEEL;
    static STONE_BRICKS = CubeTypes.STONE_BRICKS;
    static WATER = CubeTypes.WATER;
    static WOOD = CubeTypes.WOOD;
    static WOOD_PLANK = CubeTypes.WOOD_PLANK;

    static BAR_STEEL = new ObjectTypeBarSteel('BAR_STEEL');
    static CHEST = new ObjectTypeChest('CHEST');
    static COMPOST = new ObjectTypeCompost('COMPOST');
    static DOOR_WOOD = new ObjectTypeDoorWood('DOOR_WOOD');
    static FENCE_WOOD = new ObjectTypeFenceWood('FENCE_WOOD');
    static FLOWER_WHITE = new ObjectTypeFlowerWhite('FLOWER_WHITE');
    static FLOWER_RED = new ObjectTypeFlowerRed('FLOWER_RED');
    static FLOWER_BLUE = new ObjectTypeFlowerBlue('FLOWER_BLUE');
    static FLOWER_YELLOW = new ObjectTypeFlowerYellow('FLOWER_YELLOW');
    static FLOWER_PINK = new ObjectTypeFlowerPink('FLOWER_PINK');
    static FURNACE = new ObjectTypeFurnace('FURNACE');
    static GLAS = new ObjectTypeGlas('GLAS');
    static GRASS = new ObjectTypeGrass('GRASS');
    static MUSHROOM = new ObjectTypeMushroom('MUSHROOM');
    static STAIRS_STONE = new ObjectTypeStairsStone('STAIRS_STONE');
    static STAIRS_WOOD = new ObjectTypeStairsWood('STAIRS_WOOD');
    static STICK_WOOD = new ObjectTypeStickWood('STICK_WOOD');
    static STONEMILL = new ObjectTypeStonemill('STONEMILL');
    static TREE = new ObjectTypeTree('TREE', CollectibleTypes.WOOD);
    static WINDOW = new ObjectTypeWindow('WINDOW');
    static WORKBENCH = new ObjectTypeWorkbench('WORKBENCH');

    private static FLOWERS = [CollectibleTypes.FLOWER_WHITE, CollectibleTypes.FLOWER_RED, CollectibleTypes.FLOWER_BLUE, CollectibleTypes.FLOWER_YELLOW, CollectibleTypes.FLOWER_PINK,
    CollectibleTypes.FLOWER_WHITE, CollectibleTypes.FLOWER_RED, CollectibleTypes.FLOWER_YELLOW,
    CollectibleTypes.FLOWER_WHITE];

    private static TREES = [CollectibleTypes.TREE];


    static randomFlower(): ObjectTypeFlower {
        return CollectibleTypes.FLOWERS[Math.floor(Math.random() * CollectibleTypes.FLOWERS.length)];
    }

    static randomTree(): ObjectTypePlant {
        return CollectibleTypes.TREES[Math.floor(Math.random() * CollectibleTypes.TREES.length)];
    }
    
    static randomPlant(): ObjectTypePlant {
        const r = Math.random();
        if (r < .35)
            return CollectibleTypes.MUSHROOM;
        else if (r < .37)
            return CollectibleTypes.randomTree();
        else
            return CollectibleTypes.randomFlower();
    }
}