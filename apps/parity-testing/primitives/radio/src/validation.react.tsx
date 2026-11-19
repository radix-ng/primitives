import { Field } from '@base-ui/react/field';
import { Form } from '@base-ui/react/form';
import { Radio } from '@base-ui/react/radio';
import { RadioGroup } from '@base-ui/react/radio-group';
import { useState } from 'react';
import { config, radioValidationMessage } from './contract';

export function ReactRadioValidation() {
    const [choice, setChoice] = useState('a');
    const [submits, setSubmits] = useState(0);
    return (
        <>
            <Form onFormSubmit={() => setSubmits((count) => count + 1)}>
                <Field.Root
                    data-testid="field"
                    name="density"
                    validationMode={config().validation}
                    validate={radioValidationMessage}
                >
                    <RadioGroup value={choice} onValueChange={setChoice} aria-label="Density">
                        <Radio.Root value="a">Alpha</Radio.Root>
                        <Radio.Root value="b">
                            Beta
                            <Radio.Indicator data-testid="indicator" keepMounted />
                        </Radio.Root>
                        <Radio.Root value="c">Gamma</Radio.Root>
                    </RadioGroup>
                    <Field.Error data-testid="error" id="density-error" />
                </Field.Root>
                <button type="submit">Submit</button>
                <output data-testid="submits">{submits}</output>
            </Form>
            <button type="button">Outside</button>
            <button onClick={() => setChoice('c')} type="button">
                Write Gamma
            </button>
            <button onClick={() => setChoice('a')} type="button">
                Write Alpha
            </button>
        </>
    );
}
