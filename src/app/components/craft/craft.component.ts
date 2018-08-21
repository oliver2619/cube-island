import {Component, OnInit, AfterViewInit, ViewChild} from '@angular/core';
import {NavigationService} from '../../services/navigation.service';
import {CraftRecipes, CraftRecipe, CraftGroup} from '../../../game/crafting';
import {GameService} from '../../services/game.service';
import {Person} from '../../../game/person';
import {CanvasComponent} from '../canvas/canvas.component';
import {OrthographicCamera, Scene, DirectionalLight, AmbientLight, Group, PlaneBufferGeometry, MeshBasicMaterial, NormalBlending, Mesh, Object3D} from 'three';
import {InventoryItem} from '../../../game/hud';
import {AssetsService} from '../../services/assets.service';

interface CraftTabGroup {
    id: string;
    name: string;
}

@Component({
    selector: 'app-craft',
    templateUrl: './craft.component.html',
    styleUrls: ['./craft.component.css']
})
export class CraftComponent implements OnInit, AfterViewInit {

    private static backgroundGeometry: PlaneBufferGeometry = undefined;
    private static backgroundSelectedMaterial = new MeshBasicMaterial({color: 0xffffff});
    private static ITEMS_PER_PAGE = 6;

    @ViewChild(CanvasComponent)
    private canvas: CanvasComponent;

    private _selectedTab: string;
    private _selectedRecipe: number;
    private _selectObject: Mesh;
    private _canCraftSelected = false;
    private _groups: CraftTabGroup[] = [];
    private _recipeByGroup: {[key: string]: CraftRecipe[]} = {};
    private _person: Person;
    private _camera: OrthographicCamera = new OrthographicCamera(0, 1, 1, 0, -InventoryItem.size * 10, InventoryItem.size * 10);
    private _scene: Scene = new Scene();
    private _recipeObjects: Group[] = [];
    private page = 0;

    constructor(private navigationService: NavigationService, private gameService: GameService, private assetsService: AssetsService) {
        if (CraftComponent.backgroundGeometry === undefined) {
            CraftComponent.backgroundGeometry = new PlaneBufferGeometry(InventoryItem.size * 8, InventoryItem.size);
            CraftComponent.backgroundGeometry.translate(InventoryItem.size * 4, InventoryItem.size * .5, 0);
        }
        this.init();
    }

    get groups(): CraftTabGroup[] {return this._groups;}

    get gameUrl(): string {return this.navigationService.gameUrl;}

    get numberOfPages(): number {return Math.ceil(this._recipeByGroup[this.selectedTab].length / CraftComponent.ITEMS_PER_PAGE);}

    get selectedTab(): string {return this._selectedTab;}

    canCraft(): boolean {return this._canCraftSelected;}

    canNavPrevPage(): boolean {return this.page > 0;}

    canNavNextPage(): boolean {return this.page < this.numberOfPages - 1;}

    craft(times: number): void {
        for (let i = 0; i < times && this.canCraft(); ++i) {
            this._craft();
        }
    }

    craftAll(): void {
        while (this.canCraft())
            this._craft();
    }

    navPrevPage(): void {
        --this.page;
        this.updateRecipies();
        this.select(0);
        this.render();
    }

    navNextPage(): void {
        ++this.page;
        this.updateRecipies();
        this.select(0);
        this.render();
    }

    ngOnInit() {
        this._person = this.gameService.player;
        this.initScene();
        this.onSelectTab(this._groups[0].id);
    }

    ngAfterViewInit(): void {
        if (document.pointerLockElement !== null)
            document.exitPointerLock();
        this.updateRecipies();
        this.render();
    }

    onClick(ev: MouseEvent): void {
        const y = Math.floor(ev.offsetY / InventoryItem.size);
        if (y >= 0 && y < 6) {
            this.select(y);
            this.render();
        }
    }

    onClose(): void {
        this.canvas.renderer.forceContextLoss();
        this.canvas.renderer.dispose();
        this.navigationService.showGame();
    }

    onMouseWheel(ev: WheelEvent): void {
        const amount = -ev.wheelDeltaY / 120 - ev.wheelDeltaX / 120;
        if (amount < 0 && this.canNavPrevPage())
            this.navPrevPage();
        else if (amount > 0 && this.canNavNextPage())
            this.navNextPage();
    }

    selectTab(id: string): void {
        this.onSelectTab(id);
        this.render();
    }

    getRecipesForPage(): CraftRecipe[] {
        const ret: CraftRecipe[] = [];
        const src = this._recipeByGroup[this._selectedTab];
        const i0 = this.page * CraftComponent.ITEMS_PER_PAGE;
        const iMax = Math.min(i0 + CraftComponent.ITEMS_PER_PAGE, src.length);
        for (let i = i0; i < iMax; ++i) {
            ret.push(src[i]);
        }
        return ret;
    }

    private calculateCanCraft(): boolean {
        if (this._selectedRecipe === undefined)
            return false;
        const rec = this.getRecipesForPage()[this._selectedRecipe];
        if (rec === undefined)
            return false;
        const inv = this._person.inventory.clone();
        // TODO use find
        let ret = true;
        rec.sources.forEach((r, i) => {
            if (inv.remove(r.type, r.amount) < r.amount) {
                ret = false;
            }
        });
        if (!ret)
            return false;
        return inv.add(rec.product.type, rec.product.amount) === rec.product.amount;
    }

    private _craft(): void {
        const rec = this.getRecipesForPage()[this._selectedRecipe];
        const inv = this._person.inventory;
        rec.sources.forEach((r) => inv.remove(r.type, r.amount));
        inv.add(rec.product.type, rec.product.amount);
        this._canCraftSelected = this.calculateCanCraft();
    }

    private init(): void {
        this._recipeByGroup = {};
        let arr: CraftRecipe[];
        CraftRecipes.all.forEach(r => {
            let arr = this._recipeByGroup[r.group.id];
            if (arr === undefined) {
                this._recipeByGroup[r.group.id] = [];
                arr = this._recipeByGroup[r.group.id];
            }
            arr.push(r);
        });

        this._groups = [];
        let gr: CraftGroup;
        for (let k in this._recipeByGroup) {
            gr = this._recipeByGroup[k][0].group;
            this._groups.push({id: gr.id, name: gr.name});
        }
        this._groups.sort((a, b) => a.name.localeCompare(b.name));
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

        this._selectObject = new Mesh(CraftComponent.backgroundGeometry, CraftComponent.backgroundSelectedMaterial);
        this._selectObject.position.z = -InventoryItem.size;
        this._scene.add(this._selectObject);
    }

    private onSelectTab(id: string): void {
        this._selectedTab = id;
        this.page = 0;
        this.select(0);
        this.updateRecipies();
    }

    private render(): void {
        this.canvas.renderer.render(this._scene, this._camera);
    }

    private select(row: number): void {
        this._selectedRecipe = row;
        this._canCraftSelected = this.calculateCanCraft();
        this._selectObject.position.y = (5 - row) * InventoryItem.size;
    }

    private updateRecipies(): void {
        this._recipeObjects.forEach(g => this._scene.remove(g));
        this._recipeObjects = [];
        this.getRecipesForPage().forEach((r, i) => {
            const gr = new Group();
            let obj: Object3D;
            let xOffset = 0;
            for (let x = 0; x < Math.min(r.product.amount, 6); ++x) {
                obj = InventoryItem.createObject(r.product.type, this.assetsService.assets);
                obj.position.x = xOffset * InventoryItem.size;
                gr.add(obj);
                xOffset += .75;
            }
            xOffset += .25;
            r.sources.forEach(src => {
                for (let x = 0; x < Math.min(src.amount, 6); ++x) {
                    obj = InventoryItem.createObject(src.type, this.assetsService.assets);
                    obj.position.x = xOffset * InventoryItem.size;
                    gr.add(obj);
                    xOffset += .75;
                }
            });
            this._scene.add(gr);
            this._recipeObjects.push(gr);
            gr.position.set(InventoryItem.size * .5, (5.5 - i) * InventoryItem.size, 0);
        });
    }
}
