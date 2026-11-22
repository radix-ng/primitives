import { Field } from '@base-ui/react/field';
import { Form } from '@base-ui/react/form';
import { Switch } from '@base-ui/react/switch';
import { useRef, useState } from 'react';
import { record, scenario } from './contract';

const required = scenario === 'field-required';
const errors = scenario === 'field-errors' ? { alerts: ['Use a verified email.'] } : undefined;

export function ReactSwitchField() {
    const [disabled, setDisabled] = useState(false);
    const [visible, setVisible] = useState(true);
    const [checked, setChecked] = useState(errors ? false : undefined);
    const [ariaLabel, setAriaLabel] = useState<string>();
    const [ariaLabelledBy, setAriaLabelledBy] = useState<string>();
    const [controlId, setControlId] = useState('alerts');
    const [submissions, setSubmissions] = useState(0);
    const latest = useRef<boolean>(undefined);

    return (
        <>
            <Form
                id="preferences"
                errors={errors}
                onFormSubmit={() => setSubmissions((value) => value + 1)}
                onKeyDown={(event) => {
                    if (event.key === 'F2') setDisabled(true);
                    if (event.key === 'F3') setVisible(false);
                }}
            >
                <Field.Root
                    name="alerts"
                    disabled={disabled}
                    validationMode={required ? 'onSubmit' : 'onBlur'}
                    data-testid="field"
                >
                    <Field.Label id="field-label">Alerts</Field.Label>
                    <Field.Description id="field-description">Sends email updates.</Field.Description>
                    <p id="additional-description">Account settings.</p>
                    <span id="external-label">Notification preference</span>
                    {visible && (
                        <Switch.Root
                            id={controlId}
                            name="fallback"
                            value="yes"
                            required={required}
                            checked={checked}
                            nativeButton
                            render={<button />}
                            aria-label={ariaLabel}
                            aria-labelledby={ariaLabelledBy}
                            aria-describedby="additional-description field-description"
                            onCheckedChange={(value, details) => {
                                record(value, details);
                                latest.current = value;
                            }}
                        >
                            <Switch.Thumb data-testid="thumb" />
                        </Switch.Root>
                    )}
                    {required ? (
                        <Field.Error id="field-error" match="valueMissing">
                            Enable alerts.
                        </Field.Error>
                    ) : (
                        errors && <Field.Error id="field-error" />
                    )}
                </Field.Root>
                <button type="submit">Save</button>
                <output data-testid="submissions">{submissions}</output>
            </Form>
            <button type="button">Outside</button>
            <button onClick={() => setDisabled(!disabled)} type="button">
                Toggle Field disabled
            </button>
            <button
                onClick={() => {
                    setControlId('alerts-renamed');
                    setAriaLabel('Email notifications');
                }}
                type="button"
            >
                Set explicit name
            </button>
            <button onClick={() => setAriaLabelledBy('external-label')} type="button">
                Set label reference
            </button>
            <button onClick={() => setChecked(latest.current)} type="button">
                Apply request
            </button>
        </>
    );
}
