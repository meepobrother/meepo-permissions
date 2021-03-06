import {
    Directive, Input, TemplateRef,
    ViewContainerRef, OnInit, AfterViewInit
} from '@angular/core';
import { RolesService, RoleInter } from '../roles';
import { EventService } from 'meepo-event';

@Directive({ selector: '[check]' })
export class CheckDirective implements OnInit, AfterViewInit {
    _check: string | string[] = 'all';
    @Input()
    set check(val: string | string[]) {
        this._check = val;
    }
    get check() {
        return this._check;
    }

    @Input() checkOf: any = {};

    @Input() checkElse: TemplateRef<any>;

    permissions: string[] = [];
    constructor(
        public role: RolesService,
        public templateRef: TemplateRef<any>,
        public event: EventService,
        private viewContainer: ViewContainerRef
    ) {
        this.event.subscribe('role.change', (role: RoleInter) => {
            this.role.setRole(role);
            this.validateCheck();
        });
    }

    ngOnInit() {

    }

    ngAfterViewInit() {
        if (this._check) {
            this.validateCheck();
        } else {
            this.handlePermission(this.templateRef);
        }
    }

    private validateCheck() {
        if (this.role.check(this.check)) {
            this.handlePermission(this.templateRef);
        } else {
            this.handlePermission(this.checkElse);
        }
    }

    private handlePermission(template: TemplateRef<any>) {
        this.viewContainer.clear();
        if (!template) return;
        this.viewContainer.createEmbeddedView(template, { $implicit: this.checkOf });
    }

}
