import { Checkbox } from '@base-ui/react/checkbox';
import { CheckboxGroup } from '@base-ui/react/checkbox-group';
import { Field } from '@base-ui/react/field';
import { Form } from '@base-ui/react/form';
import { useState } from 'react';
import { scenario } from './contract';

const values = ['a', 'b'];
const required = scenario.endsWith('-required');
const requiredValues = ['a'];

export function ReactCheckboxField() {
    const [disableFirst, setDisableFirst] = useState(false);
    const [submissions, setSubmissions] = useState(0);

    return (
        <Form onFormSubmit={() => setSubmissions((value) => value + 1)}>
            {scenario.startsWith('field-group') ? (
                <Field.Root
                    name="features"
                    validationMode="onBlur"
                    data-testid="field"
                    onKeyDown={(event) => {
                        if (event.key === 'F2') setDisableFirst(true);
                    }}
                >
                    <Field.Label id="group-label">Features</Field.Label>
                    <Field.Description id="group-description">Choose your features.</Field.Description>
                    {required && <Field.Error id="features-error">Select option a.</Field.Error>}
                    <CheckboxGroup allValues={values} defaultValue={required ? requiredValues : undefined}>
                        <Checkbox.Root id="all" parent nativeButton render={<button />} aria-label="All">
                            All
                        </Checkbox.Root>
                        {values.map((value) => (
                            <Field.Item disabled={value === 'a' && disableFirst} key={value}>
                                <Field.Label id={'label-' + value}>Option {value}</Field.Label>
                                <Field.Description id={'description-' + value}>About {value}</Field.Description>
                                <Checkbox.Root
                                    id={'item-' + value}
                                    name="ignored"
                                    value={value}
                                    required={required && value === 'a'}
                                    nativeButton
                                    render={<button />}
                                />
                            </Field.Item>
                        ))}
                    </CheckboxGroup>
                </Field.Root>
            ) : (
                <Field.Root validationMode="onBlur" name="terms" data-testid="field">
                    <Field.Label id="terms-label">Terms</Field.Label>
                    <Field.Description id="terms-description">Terms and conditions.</Field.Description>
                    {required && <Field.Error id="terms-error">Accept the terms.</Field.Error>}
                    <span id="extra-description">Additional details.</span>
                    <Checkbox.Root
                        id="terms"
                        name="ignored"
                        value="yes"
                        required={required}
                        defaultChecked={required}
                        nativeButton
                        render={<button />}
                        aria-describedby="extra-description"
                    >
                        <Checkbox.Indicator keepMounted aria-hidden="true" data-testid="indicator">
                            ✓
                        </Checkbox.Indicator>
                    </Checkbox.Root>
                </Field.Root>
            )}
            <button type="button">Outside</button>
            {required && (
                <>
                    <button type="submit">Submit</button>
                    <output data-testid="submissions">{submissions}</output>
                </>
            )}
        </Form>
    );
}
