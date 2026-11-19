import { Field } from '@base-ui/react/field';
import { Radio } from '@base-ui/react/radio';
import { RadioGroup } from '@base-ui/react/radio-group';
import { useState } from 'react';
import type { Settings } from './contract';

export function ReactRadioForms({ mode }: { mode: Settings['forms'] }) {
    const [disabled, setDisabled] = useState(false);
    const [disableBeta, setDisableBeta] = useState(false);
    const [showAlpha, setShowAlpha] = useState(true);

    if (mode === 'external-required') {
        return (
            <>
                <form
                    id="owner"
                    onSubmit={(event) => {
                        event.preventDefault();
                        event.currentTarget.dataset['submitted'] = 'true';
                    }}
                >
                    <button type="submit">Submit</button>
                </form>
                <RadioGroup form="owner" name="density" required aria-label="Density">
                    <Radio.Root data-testid="radio-a" value="a">
                        Alpha
                    </Radio.Root>
                    <Radio.Root data-testid="radio-b" value="b">
                        Beta
                    </Radio.Root>
                </RadioGroup>
            </>
        );
    }
    if (mode === 'eligible-items') {
        return (
            <>
                <form id="owner">
                    <RadioGroup name="density" defaultValue="a" aria-label="Density">
                        {showAlpha && (
                            <Radio.Root disabled={disabled} data-testid="radio-a" value="a">
                                Alpha
                            </Radio.Root>
                        )}
                        <Radio.Root data-testid="radio-b" value="b">
                            Beta
                        </Radio.Root>
                    </RadioGroup>
                </form>
                <button onClick={() => setDisabled(!disabled)} type="button">
                    Toggle disabled
                </button>
                <button onClick={() => setShowAlpha(!showAlpha)} type="button">
                    Toggle Alpha
                </button>
            </>
        );
    }
    return (
        <>
            <form id="owner">
                <Field.Root disabled={disabled} data-testid="field" name="density">
                    <Field.Label id="group-label" render={<span />} nativeLabel={false}>
                        Density
                    </Field.Label>
                    <Field.Description id="group-description">Pick a density</Field.Description>
                    <RadioGroup name="fallback-name">
                        <Field.Item>
                            <Radio.Root data-testid="radio-a" value="a" />
                            <Field.Label id="label-a" data-testid="label-a">
                                Alpha
                            </Field.Label>
                            <Field.Description id="description-a">Alpha description</Field.Description>
                        </Field.Item>
                        <Field.Item disabled={disableBeta}>
                            <Radio.Root data-testid="radio-b" value="b">
                                <Radio.Indicator data-testid="indicator-b" keepMounted />
                            </Radio.Root>
                            <Field.Label id="label-b" data-testid="label-b">
                                Beta
                            </Field.Label>
                            <Field.Description id="description-b">Beta description</Field.Description>
                        </Field.Item>
                    </RadioGroup>
                </Field.Root>
            </form>
            <button onClick={() => setDisableBeta(!disableBeta)} type="button">
                Toggle Beta
            </button>
            <button onClick={() => setDisabled(!disabled)} type="button">
                Toggle disabled
            </button>
        </>
    );
}
