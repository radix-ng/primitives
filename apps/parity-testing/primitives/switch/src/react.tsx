import { Switch } from '@base-ui/react/switch';
import { useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { formId, initialDefault, installProbe, isControlled, record, required, scenario } from './contract';

import { ReactSwitchField } from './field.react';

installProbe();

function SwitchFixture() {
    const [defaultChecked, setDefaultChecked] = useState(initialDefault);
    const [controlled, setControlled] = useState(isControlled ? false : undefined);
    const latest = useRef<boolean>(undefined);
    const control = (
        <>
            <label htmlFor="alerts">Alerts</label>
            <Switch.Root
                id="alerts"
                nativeButton
                render={<button />}
                checked={controlled}
                defaultChecked={defaultChecked}
                disabled={scenario === 'disabled'}
                readOnly={scenario === 'readonly'}
                required={required}
                form={formId}
                name="alerts"
                value="yes"
                uncheckedValue="no"
                onCheckedChange={(value, details) => {
                    latest.current = value;
                    record(value, details);
                }}
            >
                <Switch.Thumb data-testid="thumb" />
            </Switch.Root>
        </>
    );

    return (
        <>
            <form id="preferences">
                {!formId && control}
                <button id="save" type="submit">
                    Save
                </button>
                <button id="reset" type="reset">
                    Reset
                </button>
            </form>
            {formId && control}
            <button onClick={() => setDefaultChecked((value) => !value)} type="button">
                Change default
            </button>
            <button onClick={() => setControlled(latest.current)} type="button">
                Apply request
            </button>
        </>
    );
}

createRoot(document.getElementById('root')!).render(
    scenario?.startsWith('field') ? <ReactSwitchField /> : <SwitchFixture />
);
