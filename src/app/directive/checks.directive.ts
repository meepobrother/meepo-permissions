import { ChangeDetectorRef, Directive, DoCheck, EmbeddedViewRef, Input, IterableChangeRecord, IterableChanges, IterableDiffer, IterableDiffers, NgIterable, OnChanges, SimpleChanges, TemplateRef, TrackByFunction, ViewContainerRef, forwardRef, isDevMode } from '@angular/core';
export class NgForOfContext<T> {
    constructor(
        public $implicit: T, public ngForOf: NgIterable<T>, public index: number,
        public count: number) { }

    get first(): boolean { return this.index === 0; }

    get last(): boolean { return this.index === this.count - 1; }

    get even(): boolean { return this.index % 2 === 0; }

    get odd(): boolean { return !this.even; }
}
import { RolesService } from '../roles';

@Directive({ selector: '[checks][checksOf]' })
export class ChecksDirective<T> implements DoCheck, OnChanges {
    @Input() checksOf: NgIterable<T>;
    @Input()
    set checksTrackBy(fn: TrackByFunction<T>) {
        if (isDevMode() && fn != null && typeof fn !== 'function') {
            if (<any>console && <any>console.warn) {
                console.warn(
                    `trackBy must be a function, but received ${JSON.stringify(fn)}. ` +
                    `See https://angular.io/docs/ts/latest/api/common/index/NgFor-directive.html#!#change-propagation for more information.`);
            }
        }
        this._trackByFn = fn;
    }

    get checksTrackBy(): TrackByFunction<T> { return this._trackByFn; }

    private _differ: IterableDiffer<T> | null = null;
    private _trackByFn: TrackByFunction<T>;

    constructor(
        private _viewContainer: ViewContainerRef,
        private _template: TemplateRef<NgForOfContext<T>>,
        private _differs: IterableDiffers,
        private _role: RolesService
    ) { }

    @Input()
    set checksTemplate(value: TemplateRef<NgForOfContext<T>>) {
        if (value) {
            this._template = value;
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if ('checksOf' in changes) {
            const value = changes['checksOf'].currentValue;
            if (!this._differ && value) {
                try {
                    this._differ = this._differs.find(value).create(this.checksTrackBy);
                } catch (e) {
                    throw new Error(
                        `Cannot find a differ supporting object '${value}' of type '${getTypeNameForDebugging(value)}'. NgFor only supports binding to Iterables such as Arrays.`);
                }
            }
        }
    }

    ngDoCheck(): void {
        if (this._differ) {
            const changes = this._differ.diff(this.checksOf);
            if (changes) this._applyChanges(changes);
        }
    }

    private _applyChanges(changes: IterableChanges<T>) {
        const insertTuples: RecordViewTuple<T>[] = [];
        changes.forEachOperation(
            (item: IterableChangeRecord<any>, adjustedPreviousIndex: number, currentIndex: number) => {
                if (this._role.check(item.item.role)) {
                    item.item.permission = true;
                } else {
                    item.item.permission = false;
                }
                if (item.previousIndex == null) {
                    const view = this._viewContainer.createEmbeddedView(
                        this._template, new NgForOfContext<T>(null!, this.checksOf, -1, -1), currentIndex);
                    const tuple = new RecordViewTuple<T>(item, view);
                    insertTuples.push(tuple);
                } else if (currentIndex == null) {
                    this._viewContainer.remove(adjustedPreviousIndex);
                } else {
                    const view = this._viewContainer.get(adjustedPreviousIndex)!;
                    this._viewContainer.move(view, currentIndex);
                    const tuple = new RecordViewTuple(item, <EmbeddedViewRef<NgForOfContext<T>>>view);
                    insertTuples.push(tuple);
                }
            });

        for (let i = 0; i < insertTuples.length; i++) {
            this._perViewChange(insertTuples[i].view, insertTuples[i].record);
        }

        for (let i = 0, ilen = this._viewContainer.length; i < ilen; i++) {
            const viewRef = <EmbeddedViewRef<NgForOfContext<T>>>this._viewContainer.get(i);
            viewRef.context.index = i;
            viewRef.context.count = ilen;
        }

        changes.forEachIdentityChange((record: any) => {
            const viewRef =
                <EmbeddedViewRef<NgForOfContext<T>>>this._viewContainer.get(record.currentIndex);
            viewRef.context.$implicit = record.item;
        });
    }

    private _perViewChange(
        view: EmbeddedViewRef<NgForOfContext<T>>, record: IterableChangeRecord<any>) {
        view.context.$implicit = record.item;
    }
}

class RecordViewTuple<T> {
    constructor(public record: any, public view: EmbeddedViewRef<NgForOfContext<T>>) { }
}

export function getTypeNameForDebugging(type: any): string {
    return type['name'] || typeof type;
}