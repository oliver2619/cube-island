import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router, Params} from '@angular/router';

@Component({
    selector: 'app-help',
    templateUrl: './help.component.html',
    styleUrls: ['./help.component.css']
})
export class HelpComponent implements OnInit {

    private _returnUrl: string;

    constructor(private router: Router, activatedRoute: ActivatedRoute) {
        activatedRoute.queryParams.subscribe((p: Params) => {
            this._returnUrl = p['return'];
        });
    }

    ngOnInit() {
        if (document.pointerLockElement !== null)
            document.exitPointerLock();
    }

    onClose(): void {
        this.router.navigateByUrl(this._returnUrl);
    }
}
