import {Sun, SunStoreData} from "./sun";
import {Scene, CubeCamera, WebGLRenderer, Mesh, BoxBufferGeometry, Camera, ShaderLib, UniformsUtils, ShaderMaterial, SphereBufferGeometry, MeshLambertMaterial, MeshBasicMaterial, PointLight, DirectionalLight} from "three";
import {Assets} from "./assets";

export class Sky {

    private skyScene = new Scene();
    private skyboxOnlyScene = new Scene();
    private cubeCamera = new CubeCamera(.1, 10, 2048);
    private _sun: Sun;
    private _skybox = new Mesh(new BoxBufferGeometry(-1, -1, -1))
    private _moon = new Mesh(new SphereBufferGeometry(1737 / 384400 * 10, 16, 16));
    private sunLightForMoon = new DirectionalLight(0xffffff);

    constructor(private scene: Scene, assets: Assets) {
        let shader = ShaderLib.cube;
        let uniforms = UniformsUtils.clone(shader.uniforms);
        uniforms['tCube']['value'] = this.cubeCamera.renderTarget.texture;
        uniforms['tFlip']['value'] = 1;
        this._skybox.material = new ShaderMaterial({fragmentShader: shader.fragmentShader, vertexShader: shader.vertexShader, uniforms: uniforms, depthWrite: false, depthTest: false});
        this._moon.material = new MeshLambertMaterial({color: 0xffffff, map: assets.textures.moon});
        this._sun = new Sun(assets);

        this._sun.initSceneSprite(this.skyScene);
        this.skyScene.add(this._moon);
        this.skyScene.add(this.sunLightForMoon);
        this.sunLightForMoon.target.position.set(0, 0, 0);
        this.skyboxOnlyScene.add(this._skybox);
        this._skybox.castShadow = false;
    }

    animate(timeout: number): void {
        this._sun.animate(timeout);
        this._sun.setFogColor(this.scene.fog);
        const phi = (this._sun.localDate + this._sun.localTime);
        this._moon.position.set(-Math.sin(phi), 0, -Math.cos(phi));
        this.sunLightForMoon.position.copy(this._sun.sunPosition);
        this.sunLightForMoon.position.multiplyScalar(4);
    }

    deinit(): void {
        this._sun.deinitSceneLight(this.scene);
    }

    initScene(): void {
        this._sun.initSceneLight(this.scene);
    }

    load(input: SunStoreData): void {
        this._sun.load(input);
    }

    newGame(): void {
        this._sun.newGame();
    }

    renderToSkybox(renderer: WebGLRenderer): void {
        renderer.autoClear = true;
        renderer.autoClearColor = true;
        renderer.setClearColor(this._sun.skyColor);

        this.cubeCamera.update(renderer, this.skyScene);
        renderer.autoClear = false;
        renderer.autoClearColor = false;
    }

    renderSkybox(renderer: WebGLRenderer, camera: Camera): void {
        renderer.autoClear = true;
        renderer.autoClearColor = false;
        renderer.autoClearDepth = true;
        this._skybox.position.copy(camera.position);
        renderer.render(this.skyboxOnlyScene, camera);
    }

    save(): SunStoreData {
        return this._sun.save();
    }
}