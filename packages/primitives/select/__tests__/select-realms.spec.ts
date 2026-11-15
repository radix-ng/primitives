import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RdxSelectRoot } from '../index';

@Component({ imports: [RdxSelectRoot], template: '<div rdxSelectRoot></div>' })
class SelectHost {}

describe('Select focus across native realms', () => {
    it('retains the typeahead session within a foreign Trigger and resets it outside', async () => {
        TestBed.configureTestingModule({ imports: [SelectHost] });
        const fixture = TestBed.createComponent(SelectHost);
        await fixture.whenStable();
        const root = fixture.debugElement.query(By.directive(RdxSelectRoot)).injector.get(RdxSelectRoot);
        const frame = document.createElement('iframe');
        document.body.appendChild(frame);
        try {
            const doc = frame.contentDocument!;
            const trigger = doc.createElement('button');
            doc.body.appendChild(trigger);
            root.triggerElement.set(trigger);
            root.searchTypeahead('a', [{ text: 'Alpha', disabled: false }], 0);
            expect(root.isTypeaheadActive()).toBe(true);
            root.onTypeaheadFocusOut(new doc.defaultView!.FocusEvent('focusout', { relatedTarget: trigger }));
            expect(root.isTypeaheadActive()).toBe(true);
            root.onTypeaheadFocusOut(new doc.defaultView!.FocusEvent('focusout', { relatedTarget: doc.body }));
            expect(root.isTypeaheadActive()).toBe(false);
        } finally {
            fixture.destroy();
            frame.remove();
        }
    });
});
