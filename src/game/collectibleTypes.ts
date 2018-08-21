import {CubeTypes} from "./cubeTypes";
import {ObjectTypeChest, ObjectTypeDoorWood, ObjectTypeFlowerWhite, ObjectTypeFlowerRed, ObjectTypeFlowerBlue, ObjectTypeFlowerYellow, ObjectTypeFlowerPink, ObjectTypeGlas, ObjectTypeGrass, ObjectTypeFlower, ObjectTypeMushroom, ObjectType, PlantImp, ObjectTypePlant, ObjectTypeFenceWood, ObjectTypeWindow, ObjectTypeStairsWood, ObjectTypeStairsStone} from "./objects";

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

    static CHEST = new ObjectTypeChest('CHEST');
    static DOOR_WOOD = new ObjectTypeDoorWood('DOOR_WOOD');
    static FENCE_WOOD = new ObjectTypeFenceWood('FENCE_WOOD');
    static FLOWER_WHITE = new ObjectTypeFlowerWhite('FLOWER_WHITE');
    static FLOWER_RED = new ObjectTypeFlowerRed('FLOWER_RED');
    static FLOWER_BLUE = new ObjectTypeFlowerBlue('FLOWER_BLUE');
    static FLOWER_YELLOW = new ObjectTypeFlowerYellow('FLOWER_YELLOW');
    static FLOWER_PINK = new ObjectTypeFlowerPink('FLOWER_PINK');
    static GLAS = new ObjectTypeGlas('GLAS');
    static GRASS = new ObjectTypeGrass('GRASS');
    static MUSHROOM = new ObjectTypeMushroom('MUSHROOM');
    static STAIRS_STONE = new ObjectTypeStairsStone('STAIRS_STONE');
    static STAIRS_WOOD = new ObjectTypeStairsWood('STAIRS_WOOD');
    static WINDOW = new ObjectTypeWindow('WINDOW');

    private static FLOWERS = [CollectibleTypes.FLOWER_WHITE, CollectibleTypes.FLOWER_RED, CollectibleTypes.FLOWER_BLUE, CollectibleTypes.FLOWER_YELLOW, CollectibleTypes.FLOWER_PINK,
    CollectibleTypes.FLOWER_WHITE, CollectibleTypes.FLOWER_RED, CollectibleTypes.FLOWER_YELLOW,
    CollectibleTypes.FLOWER_WHITE];


    static randomFlower(): ObjectTypeFlower {
        return CollectibleTypes.FLOWERS[Math.floor(Math.random() * CollectibleTypes.FLOWERS.length)];
    }

    static randomPlant(): ObjectTypePlant {
        const r = Math.random();
        if (r < .4)
            return CollectibleTypes.MUSHROOM;
        else
            return CollectibleTypes.randomFlower();
    }
}