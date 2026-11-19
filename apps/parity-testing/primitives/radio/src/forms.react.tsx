import { Field } from '@base-ui/react/field';
import { Fieldset } from '@base-ui/react/fieldset';
import { Form } from '@base-ui/react/form';
import { Radio } from '@base-ui/react/radio';
import { RadioGroup } from '@base-ui/react/radio-group';
import { useState } from 'react';
import type { Settings } from './contract';

export function ReactRadioForms({ mode }: { mode: Settings['forms'] }) {
    const [disabled, setDisabled] = useState(false);
    const [disableBeta, setDisableBeta] = useState(false);
    const [showAlpha, setShowAlpha] = useState(true);
    const [showLegend, setShowLegend] = useState(true);
    const [legendId, setLegendId] = useState('default-legend');
    const [showFieldLabel, setShowFieldLabel] = useState(false);
    const [explicitLabel, setExplicitLabel] = useState(false);
    const [nestedValues, setNestedValues] = useState<{ theme?: string; density?: string }>({});

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
    if (mode === 'fieldset-legend') {
        return (
            <>
                <Fieldset.Root>
                    {showLegend && (
                        <Fieldset.Legend id={legendId} render={<legend />}>
                            Legend density
                        </Fieldset.Legend>
                    )}
                    <Field.Root>
                        {showFieldLabel && (
                            <Field.Label id="field-density" render={<span />} nativeLabel={false}>
                                Field density
                            </Field.Label>
                        )}
                        <RadioGroup {...(explicitLabel ? { 'aria-labelledby': 'explicit-density' } : {})}>
                            <Radio.Root value="a">Alpha</Radio.Root>
                            <Radio.Root value="b">Beta</Radio.Root>
                        </RadioGroup>
                    </Field.Root>
                </Fieldset.Root>
                <span id="explicit-density">Explicit density</span>
                <button onClick={() => setShowLegend(!showLegend)} type="button">
                    Toggle legend
                </button>
                <button onClick={() => setLegendId('new-legend')} type="button">
                    Change legend ID
                </button>
                <button onClick={() => setShowFieldLabel(!showFieldLabel)} type="button">
                    Toggle Field label
                </button>
                <button onClick={() => setExplicitLabel(!explicitLabel)} type="button">
                    Toggle explicit label
                </button>
            </>
        );
    }
    if (mode === 'nested-fields') {
        return (
            <Form id="owner" onFormSubmit={setNestedValues}>
                <Field.Root name="density">
                    <Field.Label render={<span />} nativeLabel={false}>
                        Density
                    </Field.Label>
                    <Field.Description id="density-description">Choose a row density</Field.Description>
                    <Field.Root name="theme">
                        <Field.Label render={<span />} nativeLabel={false}>
                            Theme
                        </Field.Label>
                        <Field.Description id="theme-description">Choose a color theme</Field.Description>
                        <RadioGroup required>
                            <Field.Item disabled>
                                <Radio.Root value="light" />
                                <Field.Label>Light</Field.Label>
                            </Field.Item>
                            <Field.Item>
                                <Radio.Root value="dark" />
                                <Field.Label data-testid="dark-label">Dark</Field.Label>
                                <Field.Description id="dark-description">Use dark colors</Field.Description>
                            </Field.Item>
                        </RadioGroup>
                        <Field.Error id="theme-missing" match="valueMissing">
                            Theme is required
                        </Field.Error>
                    </Field.Root>
                    <RadioGroup required>
                        <Field.Item>
                            <Radio.Root value="compact" />
                            <Field.Label>Compact</Field.Label>
                        </Field.Item>
                        <Field.Item>
                            <Radio.Root value="comfortable" />
                            <Field.Label>Comfortable</Field.Label>
                        </Field.Item>
                    </RadioGroup>
                    <Field.Error id="density-missing" match="valueMissing">
                        Density is required
                    </Field.Error>
                </Field.Root>
                <button type="submit">Submit</button>
                <output data-testid="submitted">
                    {nestedValues.theme} {nestedValues.density}
                </output>
            </Form>
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
