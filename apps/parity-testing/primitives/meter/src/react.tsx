import { Meter } from '@base-ui/react/meter';
import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { describeMeter, displayMeter, installFixture } from './contract';
import './fixture.css';

const fixture = installFixture();

function MeterFixture() {
    const [index, setIndex] = useState(0);
    const step = fixture.steps[index];
    return (
        <>
            <span id="external-meter">External storage</span>
            <Meter.Root
                value={step.value}
                min={step.min}
                max={step.max}
                locale={step.locale ?? 'en-US'}
                format={step.format}
                getAriaValueText={step.describeValue ? describeMeter : undefined}
                {...(step.labelledBy === undefined ? {} : { 'aria-labelledby': step.labelledBy })}
                {...(step.ariaText === undefined ? {} : { 'aria-valuetext': step.ariaText })}
                dir={step.direction ?? 'ltr'}
                data-step={index}
                data-part="root"
                aria-label="Fallback storage"
            >
                {step.showLabel !== false && (
                    <Meter.Label id={step.labelId} data-part="label">
                        Storage used
                    </Meter.Label>
                )}
                <Meter.Value data-part="value">{step.customizeValue ? displayMeter : undefined}</Meter.Value>
                {fixture.svg ? (
                    <Meter.Track data-part="track" render={<svg width="100" height="100" viewBox="0 0 100 100" />}>
                        <Meter.Indicator
                            data-part="indicator"
                            render={
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="25"
                                    pathLength="100"
                                    stroke="black"
                                    strokeWidth="4"
                                    fill="none"
                                    strokeDasharray={step.value + ' 100'}
                                />
                            }
                        />
                    </Meter.Track>
                ) : (
                    <Meter.Track className="meter-track" data-part="track">
                        <Meter.Indicator className="meter-fill" data-part="indicator" />
                    </Meter.Track>
                )}
            </Meter.Root>
            <button
                onClick={() => setIndex((current) => Math.min(current + 1, fixture.steps.length - 1))}
                type="button"
            >
                Advance
            </button>
        </>
    );
}

createRoot(document.getElementById('root')!).render(<MeterFixture />);
