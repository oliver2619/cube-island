import {Scene, DirectionalLight, AmbientLight, Vector3, Color, SpriteMaterial, Sprite, AdditiveBlending, IFog, PointLight} from "three";
import {Constants} from "./constants";
import {NaturalColors, Colors} from "./naturalColors";
import {Assets} from "./assets";

export class SunStoreData {
    localDate: number;
    localTime: number;
    latitude: number;
}

export class Sun {
    private static MAX_TIME = Math.PI * 2;
    private static SUN_ELEVATION = 23.5 * Math.PI / 180;
    private static twilightThreshold = Math.cos((90. - 16.5) * Math.PI / 180);

    private directionalLight = new DirectionalLight(0xffffff);
    private ambientLight = new AmbientLight(0x000000);
    private _localDate: number;
    private dateSpeed: number;
    private _localTime: number;
    private timeSpeed: number;
    private latitude: number;
    private _skyColor: Color;
    private fogColor: Color;
    private sunMaterial: SpriteMaterial;
    private sunSprite: Sprite;

    constructor(assets: Assets) {
        this.timeSpeed = Sun.MAX_TIME / Constants.daysInSeconds;
        this.dateSpeed = Sun.MAX_TIME / (Constants.yearInDays * Constants.daysInSeconds);

        this.sunMaterial = new SpriteMaterial({color: 0xffffff, map: assets.textures.sun, transparent: true, blending: AdditiveBlending});
        this.sunSprite = new Sprite(this.sunMaterial);
        this.sunSprite.scale.setScalar(1);
        this.directionalLight.castShadow = true;
        this.directionalLight.shadow.mapSize.x = 4096;
        this.directionalLight.shadow.mapSize.y = 4096;
        this.directionalLight.shadow.camera.near = 50;
        this.directionalLight.shadow.camera.far = 200;
        this.directionalLight.shadow.camera.left = -100;
        this.directionalLight.shadow.camera.right = 100;
        this.directionalLight.shadow.camera.top = -100;
        this.directionalLight.shadow.camera.bottom = 100;
        this.directionalLight.shadow.bias = -.002;
        //this.directionalLight.shadow.radius = 4;
    }

    get localDate(): number {return this._localDate;}

    get localTime(): number {return this._localTime;}

    get skyColor(): Color {return this._skyColor;}

    get sunPosition(): Vector3 {return this.directionalLight.position.clone();}

    animate(timeout: number): void {
        this._localDate += timeout * this.dateSpeed;
        if (this._localDate >= Sun.MAX_TIME)
            this._localDate -= Sun.MAX_TIME;
        this._localTime += timeout * this.timeSpeed;
        if (this._localTime >= Sun.MAX_TIME)
            this._localTime -= Sun.MAX_TIME;
        this.setLight();
    }

    deinitSceneLight(scene: Scene): void {
        scene.remove(this.directionalLight);
        scene.remove(this.ambientLight);
    }

    initSceneLight(scene: Scene): void {
        scene.add(this.directionalLight);
        scene.add(this.ambientLight);
    }

    initSceneSprite(scene: Scene): void {
        scene.add(this.sunSprite);
    }

    load(input: SunStoreData): void {
        this._localDate = input.localDate;
        this._localTime = input.localTime;
        this.latitude = input.latitude;

        this.setLight();
    }

    newGame(): void {
        this._localDate = Sun.MAX_TIME * .25;
        this._localTime = Sun.MAX_TIME * .3;
        this.latitude = 50 * Math.PI / 180;

        this.setLight();
    }

    save(): SunStoreData {
        const ret = new SunStoreData();
        ret.localDate = this._localDate;
        ret.localTime = this._localTime;
        ret.latitude = this.latitude;
        return ret;
    }

    setFogColor(fog: IFog): void {
        fog.color.set(this.ambientLight.color);
    }

    private setLight(): void {
        const orgZ = new Vector3(-Math.sin(this._localTime) * Math.cos(this.latitude), -Math.cos(this._localTime) * Math.cos(this.latitude), Math.sin(this.latitude));
        const orgX = new Vector3(0, 0, 1);
        orgX.cross(orgZ);
        orgX.normalize();
        const orgY = orgZ.clone();
        orgY.cross(orgX);
        const wiSun = -Sun.SUN_ELEVATION * Math.cos(this._localDate);
        const sunV = new Vector3(0, Math.cos(wiSun), Math.sin(wiSun));
        this.directionalLight.position.set(sunV.dot(orgX), sunV.dot(orgY), sunV.dot(orgZ));
        this.directionalLight.target.position.set(0, 0, 0);
        this.sunSprite.position.copy(this.directionalLight.position);
        this.sunSprite.position.multiplyScalar(2);

        const dawn = 1 - Math.max(0, Math.min(1, this.directionalLight.position.z / Sun.twilightThreshold));
        const ambBrightness = Math.max(0, Math.min(1, (Sun.twilightThreshold + this.directionalLight.position.z) / (Sun.twilightThreshold * 2)));
        const dirBrightness = Math.max(0, Math.min(1, this.directionalLight.position.z / Sun.twilightThreshold));
        this._skyColor = NaturalColors.sky;
        const ambLight = this._skyColor.clone();
        const dirLight = NaturalColors.getSun(dawn);
        const diffuceRefl = dirLight.clone();
        diffuceRefl.multiplyScalar(dirBrightness);
        Colors.normalize(ambLight);
        ambLight.add(diffuceRefl);
        Colors.normalize(ambLight);
        this.sunMaterial.color.copy(dirLight);
        dirLight.multiplyScalar(.9 * dirBrightness);
        ambLight.multiplyScalar(.2 * ambBrightness + .1);
        this._skyColor.multiplyScalar(ambBrightness);
        this.directionalLight.color.set(dirLight);
        this.ambientLight.color.set(ambLight);
        this.fogColor = ambLight.clone();
        Colors.normalize(this.fogColor);
        this.fogColor.multiplyScalar(dirBrightness);

        this.directionalLight.position.multiplyScalar(100);

    }
}