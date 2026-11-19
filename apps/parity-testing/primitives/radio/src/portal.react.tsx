import { Field } from '@base-ui/react/field';
import { Form } from '@base-ui/react/form';
import { Radio } from '@base-ui/react/radio';
import { RadioGroup } from '@base-ui/react/radio-group';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { config } from './contract';

export function ReactRadioPortal() {
    const mode = config().portal;
    const full = mode === 'field';
    const keyboard = mode === 'keyboard';
    const [outside, setOutside] = useState<HTMLDivElement | null>(null);
    const [value, setValue] = useState<string | null>(null);
    const [formId, setFormId] = useState<string>();
    const [showBeta, setShowBeta] = useState(true);
    const [disabledBeta, setDisabledBeta] = useState(false);
    const [submits, setSubmits] = useState(0);
    const [submitted, setSubmitted] = useState<string | null>(null);

    const beta = (
        <Radio.Root value="b" disabled={disabledBeta} render={keyboard ? <span id="portal-beta" /> : undefined}>
            Beta
        </Radio.Root>
    );
    const field = (
        <Field.Root
            name="density"
            data-testid="field"
            validationMode={keyboard ? 'onBlur' : 'onSubmit'}
            validate={keyboard ? (choice) => (choice == null ? 'Choose a density' : null) : undefined}
        >
            <RadioGroup
                value={value}
                onValueChange={(next) => {
                    window.radioParity.changes.push({ value: next, reason: 'none' });
                    setValue(next);
                }}
                required={full}
                form={formId}
                aria-owns={keyboard ? 'portal-beta' : undefined}
                aria-label="Density"
            >
                <Radio.Root value="a">Alpha</Radio.Root>
                {showBeta && (full ? beta : outside && createPortal(beta, outside))}
            </RadioGroup>
            <Field.Error id="density-missing" match="valueMissing">
                Choose a density
            </Field.Error>
        </Field.Root>
    );
    return (
        <>
            <form id="external" />
            {keyboard && <button type="button">Before options</button>}
            <div ref={setOutside} data-testid="outside" />
            <Form
                id="owner"
                onFormSubmit={(values: { density?: string | null }) => {
                    setSubmitted(values.density ?? null);
                    setSubmits((count) => count + 1);
                }}
            >
                {full ? outside && createPortal(field, outside) : field}
                <button type="submit">Submit</button>
            </Form>
            <span data-testid="submits">{submits}</span>
            <span data-testid="submitted">{submitted ?? 'empty'}</span>
            <button onClick={() => setShowBeta(!showBeta)} type="button">
                Toggle Beta
            </button>
            <button onClick={() => setDisabledBeta(!disabledBeta)} type="button">
                Toggle disabled Beta
            </button>
            <button onClick={() => setFormId('owner')} type="button">
                Use owner form
            </button>
            <button onClick={() => setFormId('external')} type="button">
                Use external form
            </button>
            <button onClick={() => setFormId('missing')} type="button">
                Use missing form
            </button>
            <button onClick={() => setFormId(undefined)} type="button">
                Clear form owner
            </button>
        </>
    );
}
