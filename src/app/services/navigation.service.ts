import {Injectable} from '@angular/core';
import {Router} from '@angular/router';

@Injectable()
export class NavigationService {

    constructor(private router: Router) {}

    get gameUrl(): string {return '/game';}

    get mainMenuUrl(): string {return '/main';}

    isGameVisible(): boolean {return this.router.url === this.gameUrl;}

    showGame(): void {this.router.navigateByUrl(this.gameUrl);}

    showGameMenu(): void {this.router.navigateByUrl('/gameMenu');}

    showGameOver(): void {this.router.navigateByUrl('/gameOver');}

    showHelp(): void {
        const url = this.router.url;
        if (url === '/game') {
            this.router.navigate(['help'], {
                queryParams: {
                    return: url
                }
            });
        }
    }

    showMainMenu(): void {this.router.navigateByUrl(this.mainMenuUrl);}

    toggleCraftMenu(): void {
        if (this.router.url === this.gameUrl)
            this.router.navigateByUrl("craft")
        else if (this.router.url === '/craft')
            this.showGame();
    }

    toggleInventoryMenu(): void {
        if (this.router.url === this.gameUrl)
            this.router.navigateByUrl("inventory")
        else if (this.router.url === '/inventory')
            this.showGame();
    }
}
