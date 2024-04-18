import { Component, ViewEncapsulation } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgIf } from '@angular/common';

@Component({
    selector: 'empty-layout',
    template: `
        <!-- *ngIf="true" hack is required here for router-outlet to work correctly.
                 Otherwise, layout changes won't be registered and the view won't be updated! -->
        <router-outlet *ngIf="true"></router-outlet>
    `,
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [RouterOutlet, NgIf]
})
export class EmptyLayoutComponent {}
