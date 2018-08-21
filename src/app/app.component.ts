import {Component, ViewChild, AfterViewInit} from '@angular/core';
import {InputControlService} from './services/input-control.service';
import {CanvasComponent} from './components/canvas/canvas.component';
import {AssetsService} from './services/assets.service';
import {NavigationService} from './services/navigation.service';
import {RenderService} from './services/render.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {

    @ViewChild(CanvasComponent)
    private canvas: CanvasComponent;

    constructor(private inputControlService: InputControlService, private assetsService: AssetsService, private navigationService: NavigationService, private renderService: RenderService) {}

    ngAfterViewInit(): void {
        this.inputControlService.init(this.canvas.canvas);
        this.assetsService.init(this.canvas.renderer, () => {
            this.navigationService.showMainMenu();
        });
        this.renderService.renderer = this.canvas.renderer;
        window.addEventListener('resize', (e: UIEvent) => this.setAspect());
        this.setAspect();
    }

    private setAspect(): void {
        this.renderService.resize(window.innerWidth, window.innerHeight);
        this.canvas.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}
