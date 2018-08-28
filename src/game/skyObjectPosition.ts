import {Vector3} from "three";

export class SkyObjectPosition {
    private static TURNING_CIRCLE = 23.4 * Math.PI / 180;

    public latitude: number;

    private _position: Vector3 = new Vector3();

    get position(): Vector3 {return this._position;}

    setTime(localTime: number, localDate: number): void {
        const orgZ = new Vector3(-Math.sin(localTime) * Math.cos(this.latitude), -Math.cos(localTime) * Math.cos(this.latitude), Math.sin(this.latitude));
        const orgX = new Vector3(0, 0, 1);
        orgX.cross(orgZ);
        orgX.normalize();
        const orgY = orgZ.clone();
        orgY.cross(orgX);
        const wiSun = -SkyObjectPosition.TURNING_CIRCLE * Math.cos(localDate);
        const sunV = new Vector3(0, Math.cos(wiSun), Math.sin(wiSun));
        this._position.set(sunV.dot(orgX), sunV.dot(orgY), sunV.dot(orgZ));
    }
}