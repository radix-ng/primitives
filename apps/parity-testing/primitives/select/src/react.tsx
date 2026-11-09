import { Select } from '@base-ui/react/select';
import { useLayoutEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { demoSelect } from '../../../../../packages/primitives/storybook/styles';
import '../../../../radix-storybook/.storybook/tailwind.css';
import { fixtureConfig, installProbe, itemKey, itemLabel, ItemValue } from './contract';

const config = fixtureConfig();
const trace = installProbe('react', config);

function ReactSelectFixture() {
    const actions = useRef<Select.Root.Actions | null>(null);
    useLayoutEffect(() => {
        trace.probe.close = () => actions.current?.close();
        trace.probe.unmount = () => actions.current?.unmount();
    }, []);
    return (
        <form className="grid w-64 gap-3" data-testid="form" onSubmit={(event) => event.preventDefault()}>
            <button data-testid="before" type="button">
                Before
            </button>
            <Select.Root<ItemValue, boolean>
                defaultValue={config.initial}
                multiple={config.multiple}
                disabled={config.disabled}
                readOnly={config.readOnly}
                modal={false}
                name="choice"
                itemToStringLabel={(value) => itemLabel(value, config.options)}
                itemToStringValue={itemKey}
                actionsRef={actions}
                onOpenChange={(open, details) => {
                    if ((open && config.name === 'cancel-open') || (!open && config.name === 'cancel-close'))
                        details.cancel();
                    const held = !open && config.defer && !details.isCanceled;
                    if (held) details.preventUnmountOnClose();
                    trace.open(open, details.reason, details.isCanceled, details.event, held);
                }}
                onValueChange={(value, details) => {
                    if (config.name === 'cancel-value') details.cancel();
                    trace.value(value, details.reason, details.isCanceled, details.event);
                }}
                onOpenChangeComplete={trace.complete}
            >
                <Select.Label>Fruit</Select.Label>
                <Select.Trigger className={demoSelect.trigger} data-testid="trigger">
                    <Select.Value placeholder="Choose a fruit" />
                </Select.Trigger>
                <Select.Portal>
                    <Select.Positioner className={demoSelect.positioner} sideOffset={5} alignItemWithTrigger={false}>
                        <Select.Popup className={demoSelect.popup} data-testid="popup">
                            <Select.List className={demoSelect.list}>
                                {config.options.map((option) => (
                                    <Select.Item
                                        key={option.key}
                                        value={option.value}
                                        disabled={option.disabled}
                                        className={demoSelect.item}
                                        data-option-key={option.key}
                                    >
                                        <Select.ItemText>{option.label}</Select.ItemText>
                                    </Select.Item>
                                ))}
                            </Select.List>
                        </Select.Popup>
                    </Select.Positioner>
                </Select.Portal>
            </Select.Root>
            <button data-testid="after" type="button">
                After
            </button>
        </form>
    );
}

createRoot(document.getElementById('root')!).render(<ReactSelectFixture />);
