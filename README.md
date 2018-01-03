## qrcode for angular


```html
<div *check="'admin';else elseBlock;">
    我是管理员
    <a (click)="quit()" class="weui-btn weui-btn_mini weui-btn_primary">退出登录</a>
</div>
<ng-template #elseBlock>
    我是不是管理员
    <a (click)="test()" class="weui-btn weui-btn_mini weui-btn_primary">管理员登录</a>
</ng-template>
```

```ts
import {
  Component, OnInit, ChangeDetectionStrategy,
  ViewChild, ElementRef, ChangeDetectorRef
} from '@angular/core';
import { EventService } from 'meepo-event';
import { } from '../../src/app/app';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  constructor(
    public event: EventService
  ) { }
  test() {
    this.event.publish('role.change', {
      items: ['admin']
    });
  }
  quit() {
    this.event.publish('role.change', {
      items: ['fans']
    });
  }
}

```

```html
<div *check="'admin';else elseBlock;">
    我是管理员
    <a (click)="quit()" class="weui-btn weui-btn_mini weui-btn_primary">退出登录</a>
</div>
<ng-template #elseBlock>
    我是不是管理员
    <a (click)="test()" class="weui-btn weui-btn_mini weui-btn_primary">管理员登录</a>
</ng-template>

<div *checks="let item of items">
    {{item|json}}
</div>
```