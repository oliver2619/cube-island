import {Texture, WebGLRenderer, TextureLoader, ClampToEdgeWrapping, RepeatWrapping, CubeCamera, LinearFilter} from "three";
import {Constants} from "./constants";
import {ResourceLoadingProgress} from "./resourceLoadingProgress";

export class IconTextures {

    private _apple: Texture;
    private _clockMoonPhase: Texture;
    private _emojiDead: Texture;
    private _emojiExciting: Texture;
    private _emojiHungry: Texture;
    private _emojiInjured: Texture;
    private _emojiSad: Texture;
    private _emojiSmile: Texture;
    private _emojiSweat: Texture;
    private _emojiTired: Texture;
    private _heart: Texture;

    get apple(): Texture {return this._apple;}

    get clockMoonPhase(): Texture {return this._clockMoonPhase;}

    get emojiDead(): Texture {return this._emojiDead;}

    get emojiExciting(): Texture {return this._emojiExciting;}

    get emojiHungry(): Texture {return this._emojiHungry;}

    get emojiInjured(): Texture {return this._emojiInjured;}

    get emojiSad(): Texture {return this._emojiSad;}

    get emojiSmile(): Texture {return this._emojiSmile;}

    get emojiSweat(): Texture {return this._emojiSweat;}

    get emojiTired(): Texture {return this._emojiTired;}

    get heart(): Texture {return this._heart;}

    init(progress: ResourceLoadingProgress): void {
        this._apple = this.load('apple.png', progress);
        this._clockMoonPhase = this.load('clock_moon_phase.png', progress);
        this._emojiDead = this.load('emotion_dead.png', progress);
        this._emojiExciting = this.load('emotion_exciting.png', progress);
        this._emojiHungry = this.load('emotion_hungry.png', progress);
        this._emojiInjured = this.load('emotion_injured.png', progress);
        this._emojiSad = this.load('emotion_sad.png', progress);
        this._emojiSmile = this.load('emotion_smile.png', progress);
        this._emojiSweat = this.load('emotion_sweat.png', progress);
        this._emojiTired = this.load('emotion_tire.png', progress);
        this._heart = this.load('heart.png', progress);
    }

    private load(name: string, progress: ResourceLoadingProgress): Texture {
        let loader = new TextureLoader();
        progress.addResource();
        const ret = loader.load('assets/icons/' + name, (t) => progress.resourceLoaded());
        ret.wrapS = ClampToEdgeWrapping;
        ret.wrapT = ClampToEdgeWrapping;
        return ret;
    }
}

export class Textures {

    private _bark: Texture;
    private _bricks: Texture;
    private _clay: Texture;
    private _clouds: Texture;
    private _coal: Texture;
    private _compost: Texture;
    private _concrete: Texture;
    private _crosshair: Texture;
    private _crosshairDigging: Texture;
    private _grass: Texture;
    private _gravel: Texture;
    private _gravelBump: Texture;
    private _inventorySlot: Texture;
    private _ironOre: Texture;
    private _lava: Texture;
    private _leaves: Texture;
    private _lightfx: Texture;
    private _moon: Texture;
    private _mud: Texture;
    private _rocks: Texture;
    private _sand: Texture;
    private _snow: Texture;
    private _steel: Texture;
    private _stoneBricks: Texture;
    private _stoneBricksBump: Texture;
    private _skyCamera: CubeCamera = new CubeCamera(.01, 10, 2048);
    private _sun: Texture;
    private _water: Texture;
    private _woodPlank: Texture;
    private _woodTreeCutCube: Texture;

    get bark(): Texture {return this._bark;}

    get bricks(): Texture {return this._bricks;}

    get clay(): Texture {return this._clay;}

    get clouds(): Texture {return this._clouds;}

    get coal(): Texture {return this._coal;}

    get compost(): Texture {return this._compost;}

    get concrete(): Texture {return this._concrete;}

    get crosshair(): Texture {return this._crosshair;}

    get crosshairDigging(): Texture {return this._crosshairDigging;}

    get grass(): Texture {return this._grass;}

    get gravel(): Texture {return this._gravel;}

    get gravelBump(): Texture {return this._gravelBump;}

    get inventorySlot(): Texture {return this._inventorySlot;}

    get ironOre(): Texture {return this._ironOre;}

    get lava(): Texture {return this._lava;}

    get leaves(): Texture {return this._leaves;}

    get lightfx(): Texture {return this._lightfx;}

    get moon(): Texture {return this._moon;}

    get mud(): Texture {return this._mud;}

    get rocks(): Texture {return this._rocks;}

    get sand(): Texture {return this._sand;}

    get sky(): Texture {return this._skyCamera.renderTarget.texture;}

    get skyCamera(): CubeCamera {return this._skyCamera;}

    get snow(): Texture {return this._snow;}

    get steel(): Texture {return this._steel;}

    get stoneBricks(): Texture {return this._stoneBricks;}

    get stoneBricksBump(): Texture {return this._stoneBricksBump;}

    get sun(): Texture {return this._sun;}

    get water(): Texture {return this._water;}

    get woodPlank(): Texture {return this._woodPlank;}

    get woodTreeCutCube(): Texture {return this._woodTreeCutCube;}

    init(renderer: WebGLRenderer, progress: ResourceLoadingProgress): void {
        let loader: TextureLoader;
        // bark
        loader = new TextureLoader();
        progress.addResource();
        this._bark = loader.load('assets/textures/bark.png', (t) => progress.resourceLoaded());
        this._bark.name = 'bark';
        this._bark.wrapS = RepeatWrapping;
        this._bark.wrapT = RepeatWrapping;
        this._bark.repeat.set(1 / 0.35, 1 / 0.97);
        this._bark.anisotropy = renderer.capabilities.getMaxAnisotropy();

        this._bricks = this.load('bricks', 'bricks.png', Constants.cubeSize * 3, renderer, progress);
        this._clay = this.load('clay', 'clay.png', 1.11, renderer, progress);
        this._clouds = this.load('clouds', 'clouds.png', 0.1, renderer, progress);
        this._coal = this.load('coal', 'coal.jpg', 0.86, renderer, progress);
        this._compost = this.load('compost', 'compost.png', 0.42, renderer, progress);
        this._concrete = this.load('concrete', 'concrete.png', 0.72, renderer, progress);
        this._crosshair = this.loadClamped('crosshair.png', renderer, progress);
        this._crosshairDigging = this.loadClamped('crosshairDigging.png', renderer, progress);
        this._grass = this.load('grass', 'grass.png', 0.76, renderer, progress);
        this._gravel = this.load('gravel', 'gravel2.png', 1.11, renderer, progress); // 2.48
        this._gravelBump = this.load('gravelBump', 'gravel2_bump.png', 1.11, renderer, progress); // 2.48
        this._inventorySlot = this.loadClamped('inventorySlot.png', renderer, progress);
        this._ironOre = this.load('ironOre', 'ironOre.jpg', 1.44, renderer, progress);
        this._lava = this.load('lava', 'lava.png', 1.23, renderer, progress);
        this._leaves = this.load('leaves', 'leaves.png', 1, renderer, progress);
        this._lightfx = this.loadClamped('lightfx.png', renderer, progress);
        
        loader = new TextureLoader();
        progress.addResource();
        this._moon = loader.load('assets/textures/moon.jpg', (t) => progress.resourceLoaded());
        this._moon.name = 'moon';
        this._moon.wrapS = RepeatWrapping;
        this._moon.wrapT = ClampToEdgeWrapping;
        this._moon.anisotropy = renderer.capabilities.getMaxAnisotropy();
        
        this._mud = this.load('mud', 'mud.png', 0.43, renderer, progress);
        this._rocks = this.load('rocks', 'rocks.png', 1.33, renderer, progress);
        this._sand = this.load('sand', 'sand.png', 1.13, renderer, progress);
        this._snow = this.load('snow', 'snow.png', 2.64, renderer, progress);
        this._steel = this.load('steel', 'steel.jpg', 1.39, renderer, progress);
        this._stoneBricks = this.load('stoneBricks', 'stoneBricks.png', Constants.cubeSize * 2, renderer, progress);
        this._stoneBricksBump = this.load('stoneBricksBump', 'stoneBricks_bump.png', Constants.cubeSize * 2, renderer, progress);
        this._sun = this.loadClamped('sun.png', renderer, progress);
        this._water = this.load('water', 'water.jpg', 45, renderer, progress);
        this._woodPlank = this.load('woodPlank', 'woodPlank.png', 0.37, renderer, progress);
        this._woodTreeCutCube = this.load('woodTreeCutCube', 'woodTreeCutCube.png', Constants.cubeSize, renderer, progress);
    }

    private load(name: string, filename: string, physicalSize: number, renderer: WebGLRenderer, progress: ResourceLoadingProgress): Texture {
        let loader = new TextureLoader();
        progress.addResource();
        const ret = loader.load('assets/textures/' + filename, (t) => progress.resourceLoaded());
        ret.name = name;
        ret.wrapS = RepeatWrapping;
        ret.wrapT = RepeatWrapping;
        ret.repeat.set(1 / physicalSize, 1 / physicalSize);
        ret.anisotropy = renderer.capabilities.getMaxAnisotropy();
        ret.magFilter = LinearFilter;
        return ret;
    }

    private loadClamped(filename: string, renderer: WebGLRenderer, progress: ResourceLoadingProgress): Texture {
        let loader = new TextureLoader();
        progress.addResource();
        const ret = loader.load('assets/textures/' + filename, (t) => progress.resourceLoaded());
        ret.wrapS = ClampToEdgeWrapping;
        ret.wrapT = ClampToEdgeWrapping;
        return ret;
    }
}

