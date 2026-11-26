import { DirectionProvider } from '@base-ui/react/direction-provider';
import { Field } from '@base-ui/react/field';
import { Fieldset } from '@base-ui/react/fieldset';
import { Slider } from '@base-ui/react/slider';
import { useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '../style.css';
import {
    alignment,
    collision,
    direction,
    externalForm,
    field,
    initialControlled,
    initialDefault,
    initialMin,
    installProbe,
    max,
    orientation,
    range,
    recordChange,
    recordCommit,
    step,
    thumbNames,
    type Value
} from './contract';

installProbe();

function SliderFixture() {
    const [controlled, setControlled] = useState(initialControlled);
    const [defaults, setDefaults] = useState<Value | undefined>(initialDefault);
    const [disabled, setDisabled] = useState(false);
    const [min, setMin] = useState(initialMin);
    const latest = useRef<Value>(undefined);
    const slider = (
        <DirectionProvider direction={direction}>
            <Slider.Root
                value={controlled}
                defaultValue={defaults}
                disabled={!field && disabled}
                form={externalForm}
                min={min}
                max={max}
                step={step}
                orientation={orientation}
                minStepsBetweenValues={range ? 10 : 0}
                thumbAlignment={alignment}
                thumbCollisionBehavior={collision}
                onValueChange={(value, details) => {
                    latest.current = value;
                    recordChange(value, details);
                }}
                onValueCommitted={recordCommit}
                name="volume"
                dir={direction}
            >
                {!field && <Slider.Label>Volume</Slider.Label>}
                <Slider.Value data-testid="value" />
                <Slider.Control className="control" data-testid="control">
                    <Slider.Track className="track">
                        <Slider.Indicator className="indicator" data-testid="indicator" />
                        {thumbNames.map((name, index) => (
                            <Slider.Thumb
                                key={index}
                                index={index}
                                aria-label={name}
                                className="thumb"
                                data-testid="thumb"
                            />
                        ))}
                    </Slider.Track>
                </Slider.Control>
            </Slider.Root>
        </DirectionProvider>
    );

    return (
        <>
            <button id="before" type="button">
                Before
            </button>
            <form id="values">
                {!externalForm &&
                    (field ? (
                        <Fieldset.Root disabled={disabled}>
                            <Field.Root
                                name="level"
                                validationMode="onBlur"
                                validate={() => 'Volume is out of range.'}
                                data-testid="field"
                            >
                                <Field.Label nativeLabel={false} render={<div />}>
                                    Volume
                                </Field.Label>
                                <Field.Description>Set the playback volume.</Field.Description>
                                <Field.Error />
                                {slider}
                            </Field.Root>
                        </Fieldset.Root>
                    ) : (
                        slider
                    ))}
                <button type="reset">Reset</button>
            </form>
            {externalForm && slider}
            <button onClick={() => setDefaults(80)} type="button">
                Change default
            </button>
            <button onClick={() => setMin(10)} type="button">
                Lower minimum
            </button>
            <button onClick={() => setControlled(latest.current)} type="button">
                Apply request
            </button>
            <button onClick={() => setControlled(35)} type="button">
                Replace value
            </button>
            <button onClick={() => setDisabled(!disabled)} type="button">
                Toggle disabled
            </button>
        </>
    );
}

createRoot(document.getElementById('root')!).render(<SliderFixture />);
