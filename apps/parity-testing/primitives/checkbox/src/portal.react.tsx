import { Checkbox } from '@base-ui/react/checkbox';
import { CheckboxGroup } from '@base-ui/react/checkbox-group';
import { Field } from '@base-ui/react/field';
import { Form } from '@base-ui/react/form';
import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { standalonePortal } from './contract';

const all = ['a', 'b'];
const initial = ['a'];

export function ReactCheckboxPortal() {
    const [destination, setDestination] = useState<HTMLDivElement | null>(null);
    const [formId, setFormId] = useState<string>();
    const [disabled, setDisabled] = useState(false);
    const [submissions, setSubmissions] = useState(0);
    const [submitted, setSubmitted] = useState<string[]>([]);
    const cancelNext = useRef(false);

    return (
        <>
            <form id="external" />
            <div ref={setDestination} data-testid="destination" />
            <Form
                id="owner"
                onFormSubmit={({ features, terms }) => {
                    const values = standalonePortal ? terms : features;
                    setSubmitted((Array.isArray(values) ? values : values === undefined ? [] : [values]).map(String));
                    setSubmissions((value) => value + 1);
                }}
                onReset={(event) => {
                    if (!cancelNext.current) return;
                    cancelNext.current = false;
                    event.preventDefault();
                }}
            >
                {destination &&
                    createPortal(
                        standalonePortal ? (
                            <Field.Root name="terms">
                                <Field.Label id="portal-terms-label">Terms</Field.Label>
                                <Checkbox.Root
                                    id="portal-terms"
                                    nativeButton
                                    render={<button />}
                                    disabled={disabled}
                                    form={formId}
                                    value="yes"
                                    uncheckedValue="no"
                                >
                                    Terms
                                </Checkbox.Root>
                            </Field.Root>
                        ) : (
                            <Field.Root name="features" validationMode="onSubmit">
                                <Field.Label id="feature-label">Features</Field.Label>
                                <Field.Description id="feature-description">Choose your features.</Field.Description>
                                <CheckboxGroup allValues={all} defaultValue={initial}>
                                    <Checkbox.Root
                                        nativeButton
                                        render={<button />}
                                        parent
                                        form={formId}
                                        aria-label="All"
                                    >
                                        All
                                    </Checkbox.Root>
                                    <Field.Item>
                                        <Field.Label>Alpha</Field.Label>
                                        <Checkbox.Root
                                            nativeButton
                                            render={<button />}
                                            id="feature-a"
                                            value="a"
                                            required
                                            form={formId}
                                        >
                                            a
                                        </Checkbox.Root>
                                    </Field.Item>
                                    <Field.Item disabled={disabled}>
                                        <Field.Label>Beta</Field.Label>
                                        <Checkbox.Root
                                            nativeButton
                                            render={<button />}
                                            id="feature-b"
                                            value="b"
                                            form={formId}
                                        >
                                            b
                                        </Checkbox.Root>
                                    </Field.Item>
                                </CheckboxGroup>
                                <Field.Error id="feature-required" match="valueMissing">
                                    Choose Alpha.
                                </Field.Error>
                            </Field.Root>
                        ),
                        destination
                    )}
                <button type="submit">Submit</button>
                <button type="reset">Reset</button>
            </Form>
            <output data-testid="submissions">{submissions}</output>
            <output data-testid="submitted">{submitted.join(',')}</output>
            <button onClick={() => setDisabled(!disabled)} type="button">
                Toggle disabled {standalonePortal ? 'Terms' : 'Beta'}
            </button>
            <button onClick={() => setFormId('owner')} type="button">
                Use owner form
            </button>
            <button onClick={() => setFormId('external')} type="button">
                Use external form
            </button>
            <button onClick={() => setFormId(undefined)} type="button">
                Clear form association
            </button>
            <button
                onClick={() => {
                    cancelNext.current = true;
                }}
                type="button"
            >
                Cancel next reset
            </button>
        </>
    );
}
