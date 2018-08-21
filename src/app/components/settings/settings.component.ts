import {Component, OnInit} from '@angular/core';
import {Router, Params, ActivatedRoute} from '@angular/router';

@Component({
    selector: 'app-settings',
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {

    private _returnUrl: string;

    constructor(private router: Router, activatedRoute: ActivatedRoute) {
        activatedRoute.queryParams.subscribe((p: Params) => {
            this._returnUrl = p['return'];
        });
    }

    ngOnInit() {
    }

    close(): void {
        this.router.navigateByUrl(this._returnUrl);
    }
}
