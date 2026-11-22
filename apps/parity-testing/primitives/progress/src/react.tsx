import { Progress } from '@base-ui/react/progress';
import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { describeProgress, installFixture } from './contract';
import './fixture.css';

const fixture = installFixture();

function ProgressFixture() {
    const [index, setIndex] = useState(0);
    const step = fixture.steps[index];
    return (
        <>
            <span id="external-progress">External progress</span>
            <Progress.Root
                value={step.value}
                min={step.min}
                max={step.max}
                locale={step.locale ?? 'en-US'}
                format={step.format}
                getAriaValueText={step.describeValue ? describeProgress : undefined}
                {...(step.labelledBy === undefined ? {} : { 'aria-labelledby': step.labelledBy })}
                {...(step.ariaText === undefined ? {} : { 'aria-valuetext': step.ariaText })}
                dir={step.direction ?? 'ltr'}
                data-step={index}
                data-part="root"
                aria-label="Fallback progress"
            >
                {step.showLabel !== false && (
                    <Progress.Label id={step.labelId} data-part="label">
                        Transfer progress
                    </Progress.Label>
                )}
                <Progress.Value data-part="value" />
                {fixture.svg ? (
                    <Progress.Track data-part="track" render={<svg width="100" height="100" viewBox="0 0 100 100" />}>
                        <Progress.Indicator
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
                                    strokeDasharray={step.value === null ? undefined : step.value + ' 100'}
                                />
                            }
                        />
                    </Progress.Track>
                ) : (
                    <Progress.Track className="progress-track" data-part="track">
                        <Progress.Indicator className="progress-fill" data-part="indicator" />
                    </Progress.Track>
                )}
            </Progress.Root>
            <button
                onClick={() => setIndex((current) => Math.min(current + 1, fixture.steps.length - 1))}
                type="button"
            >
                Advance
            </button>
        </>
    );
}

createRoot(document.getElementById('root')!).render(<ProgressFixture />);
