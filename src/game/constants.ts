import {Vector3} from "three";

export class Constants {

    private static DAYS_IN_MINUTES = 37;

    private static UP: Vector3 = new Vector3(0, 0, 1);

    static get actionRange(): number {return 8;}

    static get cubeSize(): number {return .4;}

    static get daysInSeconds(): number {return Constants.DAYS_IN_MINUTES * 60;}

    static get gravity(): number {return 9.8;}

    static get maxAcceleration(): number {return 9;}

    static get maxCubesPerSlot(): number {return 64;}

    static get maxSpeed(): number {return 6;}

    static get sleepThreshold(): number {return .333;}
    
    static get up(): Vector3 {return Constants.UP;}

    static get waterHeight(): number {return 20;}
    
    static get yearInDays(): number {return 15;}
}