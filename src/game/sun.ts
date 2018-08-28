import {Scene, DirectionalLight, AmbientLight, Vector3, Color, SpriteMaterial, Sprite, AdditiveBlending, IFog, PointLight, LinearFilter, CameraHelper, Texture} from "three";
import {Constants} from "./constants";
import {NaturalColors, Colors} from "./naturalColors";
import {Assets} from "./assets";
import {SkyObjectPosition} from "./skyObjectPosition";
import {NewGameSettings} from "./world";

export class SunStoreData {
    localDate: number;
    localTime: number;
    latitude: number;
}

export class Sun {
    private static MAX_TIME = Math.PI * 2;
    private static twilightThreshold = Math.cos((90. - 16.5) * Math.PI / 180);
    private static SHADOW_DISTANCE_TO_WORLD = 50;

    private _sunPosition = new SkyObjectPosition();
    private directionalLight = new DirectionalLight(0xffffff);
    private ambientLight = new AmbientLight(0x000000);
    private _localDate: number;
    private dateSpeed: number;
    private _localTime: number;
    private timeSpeed: number;
    private _skyColor: Color;
    private fogColor: Color;
    private sunMaterial: SpriteMaterial;
    private sunSprite: Sprite;
    private _worldCenter = new Vector3();
    private _worldRadius: number = 1;

    constructor(assets: Assets) {
        this.timeSpeed = Sun.MAX_TIME / Constants.daysInSeconds;
        this.dateSpeed = Sun.MAX_TIME / (Constants.yearInDays * Constants.daysInSeconds);

        this.sunMaterial = new SpriteMaterial({color: 0xffffff, map: assets.textures.sun, transparent: true, blending: AdditiveBlending});
        this.sunSprite = new Sprite(this.sunMaterial);
        this.sunSprite.scale.setScalar(1);
        this.directionalLight.castShadow = true;
        this.directionalLight.shadow.mapSize.x = 2048;
        this.directionalLight.shadow.mapSize.y = 2048;
        this.directionalLight.shadow.bias = -.005;
        this.directionalLight.shadow.radius = 4;
    }

    get ambientColor(): Color {return this.ambientLight.color;}
    
    get localDate(): number {return this._localDate;}

    get localTime(): number {return this._localTime;}

    get skyColor(): Color {return this._skyColor;}

    get sunColor(): Color {return this.directionalLight.color;}
    
    get sunPosition(): Vector3 {
        return this._sunPosition.position.clone();
    }

    animate(timeout: number): void {
        this._localDate += timeout * this.dateSpeed;
        if (this._localDate >= Sun.MAX_TIME)
            this._localDate -= Sun.MAX_TIME;
        this._localTime += timeout * this.timeSpeed;
        if (this._localTime >= Sun.MAX_TIME)
            this._localTime -= Sun.MAX_TIME;
        this._sunPosition.setTime(this._localTime, this._localDate);
        this.setLight();
    }

    deinitSceneLight(scene: Scene): void {
        scene.remove(this.directionalLight);
        scene.remove(this.directionalLight.target);
        scene.remove(this.ambientLight);
    }

    initSceneLight(scene: Scene): void {
        scene.add(this.directionalLight);
        scene.add(this.directionalLight.target);
        scene.add(this.ambientLight);
    }

    initSceneSprite(scene: Scene): void {
        //scene.add(this.sunSprite);
    }

    load(input: SunStoreData): void {
        this._localDate = input.localDate;
        this._localTime = input.localTime;
        this._sunPosition.latitude = input.latitude;

        this.setLight();
    }

    newGame(settings: NewGameSettings): void {
        this._localDate = Sun.MAX_TIME * .25;
        this._localTime = Sun.MAX_TIME * .3;
        this._sunPosition.latitude = settings.latitude;

        this.setLight();
    }

    save(): SunStoreData {
        const ret = new SunStoreData();
        ret.localDate = this._localDate;
        ret.localTime = this._localTime;
        ret.latitude = this._sunPosition.latitude;
        return ret;
    }

    setFogColor(fog: IFog): void {
        fog.color.set(this.ambientLight.color);
    }

    setWorldDimensions(center: Vector3, radius: number) {
        this._worldCenter = center.clone();
        this._worldRadius = radius;
        this.directionalLight.target.position.copy(this._worldCenter);
        this.directionalLight.shadow.camera.near = Sun.SHADOW_DISTANCE_TO_WORLD;
        this.directionalLight.shadow.camera.far = this._worldRadius * 2 + Sun.SHADOW_DISTANCE_TO_WORLD;
        this.directionalLight.shadow.camera.left = -this._worldRadius;
        this.directionalLight.shadow.camera.right = this._worldRadius;
        this.directionalLight.shadow.camera.top = -this._worldRadius;
        this.directionalLight.shadow.camera.bottom = this._worldRadius;
        this.directionalLight.shadow.camera.updateProjectionMatrix();
    }

    private setLight(): void {
        this.directionalLight.position.copy(this._sunPosition.position);
        this.sunSprite.position.copy(this.directionalLight.position);
        //this.sunSprite.position.multiplyScalar(2);

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

        this.directionalLight.position.multiplyScalar(this._worldRadius + Sun.SHADOW_DISTANCE_TO_WORLD);
        this.directionalLight.position.add(this.directionalLight.target.position);

    }
}