import {Assets} from "./assets";
import {Scene, WebGLRenderer, Camera, Geometry, BufferGeometry, Material, Group, OrthographicCamera, PlaneBufferGeometry, MeshBasicMaterial, Mesh, NormalBlending, Texture, DirectionalLight, AmbientLight, MeshLambertMaterial, Euler, CylinderBufferGeometry, Object3D, Vector2} from "three";
import {Constants} from "./constants";
import {CollectibleType} from "./collectible";

class HudIcon {
    private static _iconGeometry: PlaneBufferGeometry = undefined;
    private static ANIMATION_SPEED1 = 2 * Math.PI / 1.5;
    private static ANIMATION_SPEED2 = 2 * Math.PI / .4;

    static iconSize = 32;

    private iconMaterial = new MeshBasicMaterial({color: 0xffffff, transparent: true, opacity: 1, blending: NormalBlending});
    private iconMesh: Mesh;
    private animation = false;
    private animationTime: number;
    private animationSpeed: number;

    constructor(private scene: Scene) {
        this.iconMesh = new Mesh(HudIcon.iconGeometry, this.iconMaterial);
        scene.add(this.iconMesh);
    }

    static get iconGeometry(): PlaneBufferGeometry {
        if (HudIcon._iconGeometry === undefined) {
            HudIcon._iconGeometry = new PlaneBufferGeometry(HudIcon.iconSize, HudIcon.iconSize);
        }
        return HudIcon._iconGeometry;
    }

    set position(pos: Vector2) {
        this.iconMesh.position.x = pos.x;
        this.iconMesh.position.y = pos.y;
        this.iconMesh.position.z = 0;
    }

    set texture(texture: Texture) {this.iconMaterial.map = texture;}

    animate(timeout: number): void {
        if (this.animation) {
            this.animationTime += timeout;
            this.iconMaterial.opacity = Math.sin(this.animationSpeed * this.animationTime) * .25 + .75;
        }
    }

    startAnimation(severe: boolean): void {
        if (!this.animation) {
            this.animation = true;
            this.animationTime = 0;
        }
        this.animationSpeed = severe ? HudIcon.ANIMATION_SPEED2 : HudIcon.ANIMATION_SPEED1;
    }

    stopAnimation(): void {
        if (this.animation) {
            this.animation = false;
            this.iconMaterial.opacity = 1;
        }
    }
}

class AttributeItem {

    static iconSize = 32;

    private static ANIMATION_SPEED1 = 2 * Math.PI / 1.5;
    private static ANIMATION_SPEED2 = 2 * Math.PI / .4;
    private static progressBarSize = 120;
    private static progressGeometry: CylinderBufferGeometry = undefined;

    private iconMaterial = new MeshBasicMaterial({color: 0xffffff, transparent: true, opacity: 1, blending: NormalBlending});
    private iconMesh: Mesh;
    private progressMaterial = new MeshLambertMaterial({color: 0xffff00});
    private progressMesh: Mesh;
    private _amount: number = 1;
    private animation = false;
    private animationTime: number;
    private animationSpeed: number;

    constructor(private scene: Scene, icon: Texture) {
        this.iconMaterial.map = icon;
        this.iconMesh = new Mesh(HudIcon.iconGeometry, this.iconMaterial);
        scene.add(this.iconMesh);

        if (AttributeItem.progressGeometry === undefined) {
            AttributeItem.progressGeometry = new CylinderBufferGeometry(AttributeItem.iconSize / 4, AttributeItem.iconSize / 4, AttributeItem.progressBarSize, 8);
            AttributeItem.progressGeometry.rotateZ(Math.PI / 2);
            AttributeItem.progressGeometry.translate(AttributeItem.progressBarSize / 2, 0, 0);
        }
        this.progressMesh = new Mesh(AttributeItem.progressGeometry, this.progressMaterial);
        this.scene.add(this.progressMesh);
        this.updateProgress();
    }

    get amount(): number {return this._amount;}

    set amount(a: number) {
        this._amount = a;
        this.updateProgress();
    }

    set position(pos: Vector2) {
        this.iconMesh.position.x = pos.x;
        this.iconMesh.position.y = pos.y;
        this.iconMesh.position.z = 0;

        this.progressMesh.position.x = pos.x + AttributeItem.iconSize;
        this.progressMesh.position.y = pos.y;
        this.progressMesh.position.z = 0;
    }

    animate(timeout: number): void {
        if (this.animation) {
            this.animationTime += timeout;
            this.iconMaterial.opacity = Math.sin(this.animationSpeed * this.animationTime) * .25 + .75;
        }
    }

    startAnimation(severe: boolean): void {
        if (!this.animation) {
            this.animation = true;
            this.animationTime = 0;
        }
        this.animationSpeed = severe ? AttributeItem.ANIMATION_SPEED2 : AttributeItem.ANIMATION_SPEED1;
    }

    stopAnimation(): void {
        if (this.animation) {
            this.animation = false;
            this.iconMaterial.opacity = 1;
        }
    }

    private updateProgress(): void {
        const p = this._amount;
        this.progressMesh.scale.x = p;
        if (p < .5) {
            this.progressMaterial.color.r = 1;
            this.progressMaterial.color.g = p * 2;
        } else {
            this.progressMaterial.color.r = 2 - p * 2;
            this.progressMaterial.color.g = 1;
        }
        this.progressMesh.visible = this._amount > 0;
    }

}

export class InventoryItem {
    private static backgroundGeometry: PlaneBufferGeometry = undefined;
    private static progressGeometry: CylinderBufferGeometry = undefined;
    private static progressPadding = 4;

    private _amount: number = 0;
    private _selected = false;
    private _type: CollectibleType;
    private backgroundMaterial = new MeshBasicMaterial({color: 0xffffff, transparent: true, opacity: .3, blending: NormalBlending});
    private backgroundMesh: Mesh;
    private progressMaterial = new MeshLambertMaterial({color: 0xffff00});
    private progressMesh: Mesh;
    private contentObject: Group;

    constructor(private scene: Scene, private assets: Assets) {
        if (InventoryItem.backgroundGeometry === undefined) {
            InventoryItem.backgroundGeometry = new PlaneBufferGeometry(InventoryItem.size, InventoryItem.size);
        }
        this.backgroundMaterial.map = assets.textures.inventorySlot;
        this.backgroundMesh = new Mesh(InventoryItem.backgroundGeometry, this.backgroundMaterial);
        this.scene.add(this.backgroundMesh);

        if (InventoryItem.progressGeometry === undefined) {
            InventoryItem.progressGeometry = new CylinderBufferGeometry(InventoryItem.progressPadding, InventoryItem.progressPadding, InventoryItem.size - InventoryItem.progressPadding * 2, 8);
            InventoryItem.progressGeometry.rotateZ(Math.PI / 2);
            InventoryItem.progressGeometry.translate((InventoryItem.size - InventoryItem.progressPadding * 2) / 2, InventoryItem.progressPadding * 2 - InventoryItem.size / 2, InventoryItem.size * 1.5);
        }
        this.progressMesh = new Mesh(InventoryItem.progressGeometry, this.progressMaterial);
        this.scene.add(this.progressMesh);
        this.updateProgress();
    }

    static get size(): number {return 100;}

    get amount(): number {return this._amount;}

    set position(pos: Vector2) {
        this.backgroundMesh.position.x = pos.x;
        this.backgroundMesh.position.y = pos.y;
        this.backgroundMesh.position.z = -InventoryItem.size;
        if (this.hasObject()) {
            this.updateContentObjectPosition();
        }
        this.progressMesh.position.x = pos.x;
        this.progressMesh.position.y = pos.y;
        this.progressMesh.position.x -= InventoryItem.size / 2 - InventoryItem.progressPadding;
        this.progressMesh.position.z = - InventoryItem.size / 2;
    }

    set selected(selected: boolean) {
        this._selected = selected;
        if (selected) {
            this.backgroundMaterial.opacity = 1;
        } else {
            this.backgroundMaterial.opacity = .3;
            if (this.contentObject !== undefined)
                this.resetContentObjectRotation();
        }
        if (this.hasObject())
            this.updateScale();
    }

    get type(): CollectibleType {return this._type;}

    animate(timeout: number): void {
        if (this.hasObject()) {
            this.contentObject.rotateY(timeout * Math.PI / 4);
        }
    }

    static createObject(type: CollectibleType, assets: Assets): Object3D {
        const obj = type.createForHud(assets);
        const sz = Math.max(type.size.x, type.size.y, type.size.z);
        obj.rotation.z = 30 * Math.PI / 180;
        obj.scale.setScalar(InventoryItem.size * .5 / (Constants.cubeSize * sz));
        obj.position.set(0, -InventoryItem.size * .25, 0);
        return obj;
    }

    set(type: CollectibleType, amount: number) {
        if (this.contentObject !== undefined && (this._type !== type || amount === 0)) {
            this.scene.remove(this.contentObject);
            this.contentObject = undefined;
        }
        if (this.contentObject === undefined && amount > 0) {
            const obj = InventoryItem.createObject(type, this.assets);
            this.contentObject = new Group();
            this.contentObject.add(obj);
            this.updateContentObjectPosition();
            this.resetContentObjectRotation();
            this.updateScale();
            this.scene.add(this.contentObject);
        }
        this._amount = amount;
        this._type = type;
        this.updateProgress();
    }

    private hasObject(): boolean {
        return this.contentObject !== undefined;
    }

    private resetContentObjectRotation(): void {
        this.contentObject.setRotationFromEuler(new Euler(0, 0, 0));
    }

    private updateContentObjectPosition(): void {
        this.contentObject.position.x = this.backgroundMesh.position.x;
        this.contentObject.position.y = this.backgroundMesh.position.y;
        this.contentObject.position.z = 0;
    }

    private updateScale(): void {
        if (this._selected) {
            this.contentObject.scale.set(1.5, 1.5, 1.5);
        } else {
            this.contentObject.scale.set(1., 1., 1.);
        }
    }

    private updateProgress(): void {
        const p = this._amount / Constants.maxCubesPerSlot;
        this.progressMesh.scale.x = p;
        if (p < .5) {
            this.progressMaterial.color.r = 1;
            this.progressMaterial.color.g = p * 2;
        } else {
            this.progressMaterial.color.r = 2 - p * 2;
            this.progressMaterial.color.g = 1;
        }
        this.progressMesh.visible = this._amount > 0;
    }
}

export class HUD {
    private scene: Scene = new Scene();
    private camera: OrthographicCamera = new OrthographicCamera(0, 1, 1, 0, -InventoryItem.size * 2, InventoryItem.size * 2);
    private crosshairTextureDefault: Texture;
    private crosshairTextureDigging: Texture;
    private crosshairMesh: Mesh;
    private crosshairMaterial = new MeshBasicMaterial({color: 0x00ff00, transparent: true, blending: NormalBlending});
    private inventoryItems: InventoryItem[] = [];
    private _health: AttributeItem;
    private _awake: AttributeItem;
    private _feed: AttributeItem;
    private _emoji: HudIcon;
    private _selectedInventorySlot = -1;
    private _isDigging = false;

    constructor(private assets: Assets) {
        this.crosshairTextureDefault = assets.textures.crosshair;
        this.crosshairTextureDigging = assets.textures.crosshairDigging;
        this.crosshairMaterial.map = this.crosshairTextureDefault;

        this.crosshairMesh = new Mesh(new PlaneBufferGeometry(64, 64), this.crosshairMaterial);
        this.scene.add(this.crosshairMesh);

        const light = new DirectionalLight(0xc0c0c0);
        light.target.position.set(0, 0, 0);
        light.position.set(-2, 3, 3);
        this.scene.add(light);
        this.scene.add(new AmbientLight(0x404040));
        for (let i = 0; i < 8; ++i) {
            this.inventoryItems.push(new InventoryItem(this.scene, assets));
        }

        this._health = new AttributeItem(this.scene, assets.iconTextures.heart);
        this._awake = new AttributeItem(this.scene, assets.iconTextures.clockMoonPhase);
        this._feed = new AttributeItem(this.scene, assets.iconTextures.apple);
        this._emoji = new HudIcon(this.scene);

        this.selectInventorySlot(0);

        window.addEventListener('resize', (e: UIEvent) => this.onResize());
        this.onResize();
    }

    set awake(a: number) {
        this._awake.amount = a;
        if (this._awake.amount <= 0)
            this._awake.startAnimation(true);
        else if (this._awake.amount < Constants.sleepThreshold)
            this._awake.startAnimation(false);
        else
            this._awake.stopAnimation();
        this.updateEmoji();
    }

    set feed(f: number) {
        this._feed.amount = f;
        if (this._feed.amount <= 0)
            this._feed.startAnimation(true);
        else if (this._feed.amount < .25)
            this._feed.startAnimation(false);
        else
            this._feed.stopAnimation();
        this.updateEmoji();
    }

    set health(h: number) {
        this._health.amount = h;
        if (this._health.amount < .33)
            this._health.startAnimation(true);
        else if (this._health.amount < .67)
            this._health.startAnimation(false);
        else
            this._health.stopAnimation();
        this.updateEmoji();
    }

    get selectedInventorySlot(): number {
        return this._selectedInventorySlot;
    }

    animate(timeout: number): void {
        this.inventoryItems[this._selectedInventorySlot].animate(timeout);
        this._health.animate(timeout);
        this._awake.animate(timeout);
        this._feed.animate(timeout);
        this._emoji.animate(timeout);
    }

    render(renderer: WebGLRenderer): void {
        renderer.autoClear = true;
        renderer.autoClearColor = false;
        renderer.autoClearDepth = true;
        renderer.shadowMap.enabled = false;

        renderer.render(this.scene, this.camera);
    }

    selectInventorySlot(index: number): void {
        if (index >= 0 && index < this.inventoryItems.length && this._selectedInventorySlot !== index) {
            if (this._selectedInventorySlot >= 0 && this._selectedInventorySlot < this.inventoryItems.length)
                this.inventoryItems[this._selectedInventorySlot].selected = false;
            this._selectedInventorySlot = index;
            this.inventoryItems[this._selectedInventorySlot].selected = true;
        }
        this.updateEmoji();
    }

    setDigging(progress: number): void {
        if (progress !== null) {
            if (progress < .5) {
                this.crosshairMaterial.color.r = 1;
                this.crosshairMaterial.color.g = progress * 2;
                this.crosshairMaterial.color.b = 0;
            } else {
                this.crosshairMaterial.color.r = 2 - progress * 2;
                this.crosshairMaterial.color.g = 1;
                this.crosshairMaterial.color.b = 0;
            }
            this.crosshairMaterial.map = this.crosshairTextureDigging;
            this.crosshairMesh.rotation.z = -progress * Math.PI * 2;
            this._isDigging = true;
        } else {
            this.crosshairMaterial.color.set(0x80c0ff);
            this.crosshairMaterial.map = this.crosshairTextureDefault;
            this.crosshairMesh.rotation.z = 0;
            this._isDigging = false;
        }
        this.updateEmoji();
    }

    setResources(slot: number, type: CollectibleType, amount: number): void {
        this.inventoryItems[slot].set(type, amount);
        this.updateEmoji();
    }

    private onResize(): void {
        this.crosshairMesh.position.set(window.innerWidth / 2, window.innerHeight / 2, 0);
        this.camera.right = window.innerWidth;
        this.camera.top = window.innerHeight;
        this.camera.updateProjectionMatrix();
        const sz = this.inventoryItems.length;
        const offx = (window.innerWidth - InventoryItem.size * sz) / 2;
        this.inventoryItems.forEach((m, i) => {
            m.position = new Vector2(offx + (i + .5) * InventoryItem.size, .5 * InventoryItem.size);
        });

        this._health.position = new Vector2(AttributeItem.iconSize, window.innerHeight - AttributeItem.iconSize);
        this._feed.position = new Vector2(AttributeItem.iconSize, window.innerHeight - AttributeItem.iconSize * 2.5);
        this._awake.position = new Vector2(AttributeItem.iconSize, window.innerHeight - AttributeItem.iconSize * 4);
        this._emoji.position = new Vector2(window.innerWidth / 2, window.innerHeight - HudIcon.iconSize);
    }

    private updateEmoji(): void {
        if (this._health.amount <= 0) {
            this._emoji.texture = this.assets.iconTextures.emojiDead;
            this._emoji.stopAnimation();
            return;
        }
        if (this._feed.amount <= 0) {
            this._emoji.texture = this.assets.iconTextures.emojiHungry;
            this._emoji.startAnimation(true);
            return;
        }
        if (this._awake.amount <= 0) {
            this._emoji.texture = this.assets.iconTextures.emojiTired;
            this._emoji.startAnimation(true);
            return;
        }
        if (this._health.amount < .33) {
            this._emoji.texture = this.assets.iconTextures.emojiInjured;
            this._emoji.startAnimation(true);
            return;
        }
        if (this._health.amount < .67 || this._awake.amount < Constants.sleepThreshold * .5 || this._feed.amount < .25) {
            this._emoji.texture = this.assets.iconTextures.emojiSad;
            this._emoji.startAnimation(false);
            return;
        }
        if (this._isDigging) {
            this._emoji.texture = this.assets.iconTextures.emojiSweat;
            this._emoji.stopAnimation();
            return;
        }
        const selected = this.inventoryItems[this._selectedInventorySlot];
        if (selected !== undefined && selected.amount > 0 && selected.type.canEat()) {
            this._emoji.texture = this.assets.iconTextures.emojiExciting;
            this._emoji.stopAnimation();
            return;
        }
        this._emoji.texture = this.assets.iconTextures.emojiSmile;
        this._emoji.stopAnimation();
    }
}

