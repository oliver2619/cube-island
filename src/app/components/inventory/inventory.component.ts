import {Component, OnInit, AfterViewInit, ViewChild} from '@angular/core';
import {NavigationService} from '../../services/navigation.service';
import {CanvasComponent} from '../canvas/canvas.component';
import {OrthographicCamera, Scene, Vector2, DirectionalLight, AmbientLight} from 'three';
import {InventoryItem} from '../../../game/hud';
import {AssetsService} from '../../services/assets.service';
import {GameService} from '../../services/game.service';
import {Constants} from '../../../game/constants';
import {ResourceSet} from '../../../game/resourceSet';

@Component({
    selector: 'app-inventory',
    templateUrl: './inventory.component.html',
    styleUrls: ['./inventory.component.css']
})
export class InventoryComponent implements OnInit, AfterViewInit {

    @ViewChild(CanvasComponent)
    private canvas: CanvasComponent;

    private _camera: OrthographicCamera = new OrthographicCamera(0, 1, 1, 0, -InventoryItem.size * 10, InventoryItem.size * 10);
    private _scene: Scene = new Scene();
    private inventoryItems: InventoryItem[] = [];
    private chestItems: InventoryItem[] = [];
    private selectedInventorySlot = -1;
    private selectedChestSlot = -1;

    constructor(private navigationService: NavigationService, private assetsService: AssetsService, private gameService: GameService) {
    }

    ngOnInit() {
        let it: InventoryItem;
        let amount: number;
        for (let i = 0; i < 8; ++i) {
            it = new InventoryItem(this._scene, this.assetsService.assets);
            this.inventoryItems.push(it);
            it.position = new Vector2((i + .5) * InventoryItem.size, .5 * InventoryItem.size);
            amount = this.gameService.player.inventory.getAmount(i);
            if (amount > 0)
                it.set(this.gameService.player.inventory.getType(i), amount);
        }
        const chest = this.gameService.selectedChest;
        for (let i = 0; i < 32; ++i) {
            it = new InventoryItem(this._scene, this.assetsService.assets);
            this.chestItems.push(it);
            it.position = new Vector2(((i % 8) + .5) * InventoryItem.size, (5 - Math.floor(i / 8) + .5) * InventoryItem.size);
            if (chest !== undefined) {
                amount = chest.content.getAmount(i);
                if (amount > 0)
                    it.set(chest.content.getType(i), amount);
            }
        }
    }

    ngAfterViewInit(): void {
        if (document.pointerLockElement !== null)
            document.exitPointerLock();
        this.initScene();
        this.render();

        this.canvas.canvas.addEventListener('contextmenu', (ev: PointerEvent) => {
            const x = Math.floor(ev.offsetX / InventoryItem.size);
            const y = Math.floor(ev.offsetY / InventoryItem.size);
            if (x >= 0 && x < 8 && y >= 0 && y < 6 && y !== 4)
                this.select(x, y);
        });
        this.canvas.canvas.addEventListener('click', (ev: MouseEvent) => {
            const x = Math.floor(ev.offsetX / InventoryItem.size);
            const y = Math.floor(ev.offsetY / InventoryItem.size);
            if (x >= 0 && x < 8 && y >= 0 && y < 6 && y !== 4)
                this.transfer(x, y);
        });
    }

    onClose(): void {
        this.canvas.renderer.forceContextLoss();
        this.canvas.renderer.dispose();
        this.gameService.selectedChest.close();
        this.navigationService.showGame();
    }
    
    private deselect(): void {
        if (this.selectedInventorySlot !== -1) {
            this.inventoryItems[this.selectedInventorySlot].selected = false;
            this.selectedInventorySlot = -1;
        }
        if (this.selectedChestSlot !== -1) {
            this.chestItems[this.selectedChestSlot].selected = false;
            this.selectedChestSlot = -1;
        }
    }

    private initScene(): void {
        const light = new DirectionalLight(0xc0c0c0);
        light.target.position.set(0, 0, 0);
        light.position.set(-2, 3, 3);
        this._scene.add(light);
        this._scene.add(new AmbientLight(0x404040));

        const w = this.canvas.canvas.width;
        const h = this.canvas.canvas.height;
        this._camera.right = w;
        this._camera.top = h;
        this._camera.updateProjectionMatrix();
    }

    private render(): void {
        this.canvas.renderer.render(this._scene, this._camera);
    }

    private select(x: number, y: number): void {
        this.deselect();
        if (y < 4) {
            this.selectedChestSlot = x + y * 8;
            if (this.chestItems[this.selectedChestSlot].amount > 0)
                this.chestItems[this.selectedChestSlot].selected = true;
            else
                this.selectedChestSlot = -1;
        }
        else if (y === 5) {
            this.selectedInventorySlot = x;
            if (this.inventoryItems[this.selectedInventorySlot].amount > 0)
                this.inventoryItems[this.selectedInventorySlot].selected = true;
            else
                this.selectedInventorySlot = -1;
        }
        this.render();
    }

    private transfer(x: number, y: number): void {
        let dest: InventoryItem;
        let src: InventoryItem;
        let resDest: ResourceSet;
        let resSrc: ResourceSet;
        let srcSlot: number;
        let destSlot: number;

        if (y < 4) {
            destSlot = x + y * 8;
            dest = this.chestItems[destSlot];
            resDest = this.gameService.selectedChest.content;
        } else if (y === 5) {
            destSlot = x;
            dest = this.inventoryItems[destSlot];
            resDest = this.gameService.player.inventory;
        }
        if (this.selectedInventorySlot !== -1) {
            srcSlot = this.selectedInventorySlot;
            src = this.inventoryItems[this.selectedInventorySlot];
            resSrc = this.gameService.player.inventory;
        } else if (this.selectedChestSlot !== -1) {
            srcSlot = this.selectedChestSlot;
            src = this.chestItems[this.selectedChestSlot];
            resSrc = this.gameService.selectedChest.content;
        }
        if (dest !== undefined && src !== undefined && (dest.amount === 0 || (dest.type === src.type && dest.amount < Constants.maxCubesPerSlot))) {
            let amount = src.amount;
            if (dest.amount + amount > Constants.maxCubesPerSlot)
                amount = Constants.maxCubesPerSlot - dest.amount;
            dest.set(src.type, dest.amount + amount);
            src.set(src.type, src.amount - amount);
            resSrc.removeFromSlot(srcSlot, amount);
            resDest.addToSlot(destSlot, src.type, amount);
            if (src.amount === 0) {
                this.deselect();
            }
        }
        this.render();
    }
}
