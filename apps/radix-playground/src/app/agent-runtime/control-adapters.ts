import { DestroyRef } from '@angular/core';
import { RdxDialogHandle, RdxDialogOpenChange, RdxDialogRoot } from '@radix-ng/primitives/dialog';
import { RdxInputDirective, RdxInputValueChangeEvent } from '@radix-ng/primitives/input';
import { RdxSelectRoot } from '@radix-ng/primitives/select';
import { accessibleName } from './accessible-name';
import { AgentRuntime } from './agent-runtime';
import { SelectOption } from './types';

// Reuse the primitive's native modal isolation; connected background nodes are still unavailable.
const inActiveScope = (element: HTMLElement | undefined): boolean =>
    !!element?.isConnected && !element.closest('[inert]');

export function registerInput(
    runtime: AgentRuntime,
    owner: DestroyRef,
    input: RdxInputDirective,
    element: HTMLInputElement,
    available = () => true
): string {
    let change: RdxInputValueChangeEvent | undefined;
    const subscription = input.onValueChange.subscribe((event) => (change = event));
    owner.onDestroy(() => subscription.unsubscribe());
    const canceled = () => change?.eventDetails.isCanceled() ?? false;
    return runtime.register(
        {
            read: () => ({
                kind: 'input',
                name: accessibleName(element),
                value: input.value() ?? element.value,
                available: inActiveScope(element) && available(),
                disabled: element.disabled,
                readOnly: element.readOnly,
                constraints: {
                    required: element.required,
                    ...(element.maxLength >= 0 ? { maxLength: element.maxLength } : {})
                }
            }),
            actions: {
                'set-value': {
                    argument: 'value',
                    requiresEditable: true,
                    validate: (value) =>
                        element.maxLength >= 0 && value.length > element.maxLength
                            ? `Value exceeds this input's maximum length (${element.maxLength}).`
                            : undefined,
                    run: (value) => {
                        if (element.value === value) return 'unchanged';
                        change = undefined;
                        element.value = value!;
                        // Input has no imperative value-change API. Use its native event path, including cancellation.
                        element.dispatchEvent(
                            new InputEvent('input', { bubbles: true, inputType: 'insertReplacementText', data: value })
                        );
                        return canceled() ? 'canceled' : 'executed';
                    }
                }
            }
        },
        owner
    );
}

export function registerSelect(
    runtime: AgentRuntime,
    owner: DestroyRef,
    root: RdxSelectRoot,
    trigger: HTMLElement,
    options: () => readonly SelectOption[],
    available: () => boolean
): string {
    return runtime.register(
        {
            read: () => ({
                kind: 'select',
                name: accessibleName(trigger),
                value: root.value(),
                open: root.open(),
                available: inActiveScope(trigger) && available(),
                disabled: root.disabledState(),
                readOnly: root.readOnly(),
                options: options().map((option) => ({ ...option }))
            }),
            actions: {
                'select-option': {
                    argument: 'value',
                    requiresEditable: true,
                    validate: (value) => {
                        const option = options().find((entry) => entry.value === value);
                        return !option
                            ? 'The value is not an available option.'
                            : option.disabled
                              ? 'This option is disabled.'
                              : undefined;
                    },
                    run: (value) => {
                        if (root.value() === value)
                            return !root.open() ? 'unchanged' : root.close() ? 'executed' : 'canceled';
                        if (!root.setValue(value, 'imperative-action', new Event('agent.select-value')))
                            return 'canceled';
                        if (root.open()) root.setOpen(false, 'imperative-action', new Event('agent.select-close'));
                        return 'executed';
                    }
                },
                open: {
                    argument: 'none',
                    run: () =>
                        root.open()
                            ? 'unchanged'
                            : root.setOpen(true, 'imperative-action', new Event('agent.select-open'))
                              ? 'executed'
                              : 'canceled'
                },
                close: {
                    argument: 'none',
                    allowDisabled: true,
                    run: () => (!root.open() ? 'unchanged' : root.close() ? 'executed' : 'canceled')
                }
            }
        },
        owner
    );
}

export function registerDialog(
    runtime: AgentRuntime,
    owner: DestroyRef,
    root: RdxDialogRoot,
    handle: RdxDialogHandle,
    trigger: HTMLButtonElement,
    popup: () => HTMLElement | undefined
): string {
    let change: RdxDialogOpenChange | undefined;
    const subscription = root.onOpenChange.subscribe((event) => (change = event));
    owner.onDestroy(() => subscription.unsubscribe());
    const canceled = () => change?.eventDetails.isCanceled() ?? false;
    return runtime.register(
        {
            read: () => ({
                kind: 'dialog',
                name: accessibleName(popup() ?? trigger),
                open: root.open(),
                // The trigger can be inert while its modal is open; commands then target the popup.
                available: inActiveScope(root.open() ? popup() : trigger),
                disabled: trigger.disabled
            }),
            actions: {
                open: {
                    argument: 'none',
                    run: () => {
                        if (root.open()) return 'unchanged';
                        change = undefined;
                        handle.open(trigger.id);
                        return canceled() ? 'canceled' : 'executed';
                    }
                },
                close: {
                    argument: 'none',
                    allowDisabled: true,
                    run: () => {
                        if (!root.open()) return 'unchanged';
                        change = undefined;
                        handle.close();
                        return canceled() ? 'canceled' : 'executed';
                    }
                }
            }
        },
        owner
    );
}
