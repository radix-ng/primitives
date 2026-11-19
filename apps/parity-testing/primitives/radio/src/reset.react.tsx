import { Field } from '@base-ui/react/field';
import { Form } from '@base-ui/react/form';
import { Radio } from '@base-ui/react/radio';
import { RadioGroup } from '@base-ui/react/radio-group';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { config } from './contract';

export function ReactRadioReset() {
    const parentOwned = config().reset === 'parent-owned';
    const portaled = config().reset === 'portal';
    const [outside, setOutside] = useState<HTMLDivElement | null>(null);
    const [parentValue, setParentValue] = useState('a');
    const [formId, setFormId] = useState<string>();
    const [requests, setRequests] = useState(0);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const field = (
        <Field.Root name="density" data-testid="field">
            <RadioGroup
                value={parentOwned ? parentValue : undefined}
                defaultValue={parentOwned ? undefined : 'a'}
                form={formId}
                onValueChange={(value: string) => {
                    if (parentOwned) setParentValue(value);
                    setRequests((count) => count + 1);
                }}
                aria-label="Density"
            >
                <Radio.Root data-testid="alpha" value="a">
                    Alpha
                </Radio.Root>
                <Radio.Root data-testid="beta" value="b">
                    Beta
                </Radio.Root>
            </RadioGroup>
            <Field.Error data-testid="reset-error" />
        </Field.Root>
    );

    return (
        <>
            <form id="external" />
            <div ref={setOutside} data-testid="outside" />
            <Form id="owner" errors={errors}>
                {portaled ? outside && createPortal(field, outside) : field}
            </Form>
            <span data-testid="requests">{requests}</span>
            <button onClick={() => setErrors({ density: 'Density is unavailable' })} type="button">
                Set server error
            </button>
            <button onClick={() => setFormId('external')} type="button">
                Use external form
            </button>
            <button onClick={() => setFormId('missing')} type="button">
                Use missing form
            </button>
        </>
    );
}
