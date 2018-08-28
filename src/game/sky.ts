import {Sun, SunStoreData} from "./sun";
import {Scene, CubeCamera, WebGLRenderer, Mesh, BoxBufferGeometry, Camera, ShaderLib, UniformsUtils, ShaderMaterial, SphereBufferGeometry, MeshLambertMaterial, DirectionalLight, Vector3} from "three";
import {Assets} from "./assets";
import {NewGameSettings} from "./world";
import {SkyObjectPosition} from "./skyObjectPosition";

export class Sky {

    private static MOON_DISTANCE = 4;
    private static MOON_SCALE_FACTOR = 10;

    private skyScene = new Scene();
    private skyboxOnlyScene = new Scene();
    private cubeCamera: CubeCamera;
    private _sun: Sun;
    private _skybox = new Mesh(new BoxBufferGeometry(-1, -1, -1))
    private _moon = new Mesh(new SphereBufferGeometry(1737 / 384400 * Sky.MOON_SCALE_FACTOR * Sky.MOON_DISTANCE, 32, 32));
    private sunLightForMoon = new DirectionalLight(0x808080);
    private _moonPosition = new SkyObjectPosition();
    private _realSkyMaterial: ShaderMaterial;

    constructor(private scene: Scene, assets: Assets) {
        this.cubeCamera = assets.textures.skyCamera;
        let shader = ShaderLib.cube;
        let uniforms = UniformsUtils.clone(shader.uniforms);
        uniforms['tCube']['value'] = assets.textures.sky;
        uniforms['tFlip']['value'] = 1;
        this._skybox.material = new ShaderMaterial({fragmentShader: shader.fragmentShader, vertexShader: shader.vertexShader, uniforms: uniforms, depthWrite: false, depthTest: false});
        this._sun = new Sun(assets);

        this.skyboxOnlyScene.add(this._skybox);
        this._skybox.castShadow = false;

        this.initSkyScene(assets);
    }

    private initSkyScene(assets: Assets): void {
        this._realSkyMaterial = assets.materials.sky;
        this._moon.rotation.x = Math.PI / 2;
        this._moon.material = new MeshLambertMaterial({color: 0xffffff, map: assets.textures.moon});
        this.sunLightForMoon.target.position.set(0, 0, 0);
        this.skyScene.add(this._moon);
        this.skyScene.add(this.sunLightForMoon);
        this._sun.initSceneSprite(this.skyScene);
        const mesh = new Mesh(new BoxBufferGeometry(-2, -2, -2), this._realSkyMaterial);
        this.skyScene.add(mesh);
    }

    animate(timeout: number): void {
        //timeout *= 50;
        this._sun.animate(timeout);
        this._sun.setFogColor(this.scene.fog);
        this._moonPosition.setTime(this._sun.localTime + this._sun.localDate, this._sun.localDate);
        this._moon.position.copy(this._moonPosition.position);
        this._moon.position.multiplyScalar(Sky.MOON_DISTANCE);
        this.sunLightForMoon.position.copy(this._sun.sunPosition);
        this.sunLightForMoon.position.multiplyScalar(4);
        const pos = <Vector3> this._realSkyMaterial.uniforms['sunPosition'].value;
        pos.copy(this._sun.sunPosition);
        this.scene.fog.color.copy(this._sun.ambientColor);
    }

    deinit(): void {
        this._sun.deinitSceneLight(this.scene);
    }

    initScene(): void {
        this._sun.initSceneLight(this.scene);
    }

    load(input: SunStoreData): void {
        this._moonPosition.latitude = input.latitude;
        this._sun.load(input);
    }

    newGame(settings: NewGameSettings): void {
        this._moonPosition.latitude = settings.latitude;
        this._sun.newGame(settings);
    }

    renderToSkybox(renderer: WebGLRenderer): void {
        renderer.autoClear = true;
        renderer.autoClearColor = true;
        renderer.autoClearDepth = true;
        renderer.setClearColor(0x000000);
        renderer.shadowMap.enabled = false;

        this.cubeCamera.update(renderer, this.skyScene);
    }

    renderSkybox(renderer: WebGLRenderer, camera: Camera): void {
        renderer.autoClear = true;
        renderer.autoClearColor = false;
        renderer.autoClearDepth = true;
        renderer.shadowMap.enabled = false;
        this._skybox.position.copy(camera.position);

        renderer.render(this.skyboxOnlyScene, camera);
    }

    save(): SunStoreData {
        return this._sun.save();
    }

    setWorldDimensions(center: Vector3, radius: number): void {this._sun.setWorldDimensions(center, radius);}
}