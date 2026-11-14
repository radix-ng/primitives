import { inject, Injectable, signal } from '@angular/core';
import { disabled, form, maxLength, readonly, required } from '@angular/forms/signals';
import { RdxDialogOpenChange } from '@radix-ng/primitives/dialog';
import { RdxInputValueChangeEvent } from '@radix-ng/primitives/input';
import { RdxSelectOpenChangeEvent, RdxSelectValueChangeEvent } from '@radix-ng/primitives/select';
import { AgentRuntime } from './agent-runtime';
import { SelectOption } from './types';

@Injectable()
export class ProjectDemo {
    private readonly runtime = inject(AgentRuntime);
    readonly locked = signal(false);
    readonly readOnly = signal(false);
    readonly dialogDisabled = signal(false);
    readonly cancelValues = signal(false);
    readonly cancelDialog = signal(false);
    readonly cancelSelectClose = signal(false);
    readonly dialogOpen = signal(false);
    readonly visibilityOpen = signal(false);
    readonly environmentOpen = signal(false);
    readonly model = signal({ name: 'Radix project', visibility: 'private', environment: 'development', note: '' });
    readonly fields = form(this.model, (path) => {
        required(path.name);
        maxLength(path.name, 120);
        disabled(path.name, () => this.locked());
        disabled(path.visibility, () => this.locked());
        disabled(path.environment, () => this.locked());
        disabled(path.note, () => this.locked());
        readonly(path.name, () => this.readOnly());
        readonly(path.visibility, () => this.readOnly());
        readonly(path.environment, () => this.readOnly());
        readonly(path.note, () => this.readOnly());
    });
    readonly visibilityOptions: readonly SelectOption[] = [
        { value: 'private', label: 'Private' },
        { value: 'public', label: 'Public' },
        { value: 'archived', label: 'Archived', disabled: true }
    ];
    readonly environmentOptions: readonly SelectOption[] = [
        { value: 'development', label: 'Development' },
        { value: 'production', label: 'Production' }
    ];

    inputChange(name: string, change: RdxInputValueChangeEvent): void {
        if (this.cancelValues()) change.eventDetails.cancel();
        this.runtime.recordEvent({
            event: 'input.value',
            name,
            value: change.value,
            canceled: change.eventDetails.isCanceled(),
            nativeType: change.eventDetails.event.type
        });
    }
    selectChange(name: string, change: RdxSelectValueChangeEvent): void {
        if (this.cancelValues()) change.eventDetails.cancel();
        this.runtime.recordEvent({
            event: 'select.value',
            name,
            value: change.value,
            canceled: change.eventDetails.isCanceled(),
            reason: change.eventDetails.reason
        });
    }
    selectOpen(name: string, change: RdxSelectOpenChangeEvent): void {
        if (!change.open && this.cancelSelectClose()) change.eventDetails.cancel();
        this.runtime.recordEvent({
            event: 'select.open',
            name,
            open: change.open,
            canceled: change.eventDetails.isCanceled(),
            reason: change.eventDetails.reason
        });
    }
    dialogChange(change: RdxDialogOpenChange): void {
        if (this.cancelDialog()) change.eventDetails.cancel();
        this.runtime.recordEvent({
            event: 'dialog.open',
            open: change.open,
            canceled: change.eventDetails.isCanceled(),
            reason: change.reason
        });
    }
}
