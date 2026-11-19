import { Field } from '@base-ui/react/field';
import { Form } from '@base-ui/react/form';
import { Radio } from '@base-ui/react/radio';
import { RadioGroup } from '@base-ui/react/radio-group';
import { useState } from 'react';
import { config } from './contract';

export function ReactRadioConstraints() {
    const disabledAlpha = config().constraints === 'disabled-selection';
    const [value, setValue] = useState<string | null>(disabledAlpha ? 'a' : null);
    const [submits, setSubmits] = useState(0);
    const [mounted, setMounted] = useState(true);
    const [fieldsetDisabled, setFieldsetDisabled] = useState(false);
    const [external, setExternal] = useState(false);

    return (
        <>
            <form id="external" />
            <Form data-testid="owner" onFormSubmit={() => setSubmits((count) => count + 1)}>
                <fieldset disabled={fieldsetDisabled}>
                    <Field.Root data-testid="field" name="density" validationMode="onSubmit">
                        <RadioGroup
                            required
                            value={value}
                            onValueChange={setValue}
                            form={external ? 'external' : undefined}
                            aria-label="Density"
                        >
                            {mounted && (
                                <>
                                    <Radio.Root value="a" disabled={disabledAlpha}>
                                        Alpha
                                    </Radio.Root>
                                    <Radio.Root value="b">
                                        Beta
                                        <Radio.Indicator data-testid="indicator" keepMounted />
                                    </Radio.Root>
                                </>
                            )}
                        </RadioGroup>
                        <Field.Error data-testid="missing" id="density-missing" match="valueMissing">
                            Choose a density
                        </Field.Error>
                    </Field.Root>
                </fieldset>
                <button type="submit">Submit</button>
                <output data-testid="submits">{submits}</output>
            </Form>
            <button type="button" onClick={() => setMounted(!mounted)}>
                Toggle items
            </button>
            <button type="button" onClick={() => setFieldsetDisabled(!fieldsetDisabled)}>
                Toggle fieldset
            </button>
            <button type="button" onClick={() => setExternal(!external)}>
                Toggle form owner
            </button>
        </>
    );
}
