import { Radio } from '@base-ui/react/radio';
import { RadioGroup } from '@base-ui/react/radio-group';
import { useState } from 'react';
import { config, installInputRefs } from './contract';

export function ReactRadioRefs() {
    const [value, setValue] = useState<string | null>(null);
    const [alternate, setAlternate] = useState(false);
    const [showBeta, setShowBeta] = useState(true);
    const [showGroup, setShowGroup] = useState(true);
    const [disableAlpha, setDisableAlpha] = useState(config().refs === 'detach');
    const [renderCount, setRenderCount] = useState(0);
    const [refs] = useState(installInputRefs);

    return (
        <>
            <form>
                {showGroup && (
                    <RadioGroup
                        value={value}
                        inputRef={alternate ? refs.alternate : refs.primary}
                        onValueChange={setValue}
                        name="density"
                        aria-label="Density"
                    >
                        <Radio.Root disabled={disableAlpha} value="a">
                            Alpha
                        </Radio.Root>
                        {showBeta && (
                            <Radio.Root inputRef={refs.item} value="b">
                                Beta
                            </Radio.Root>
                        )}
                    </RadioGroup>
                )}
            </form>
            <button onClick={() => setValue(null)} type="button">
                Clear selection
            </button>
            <button onClick={() => setAlternate(true)} type="button">
                Replace callback
            </button>
            <button onClick={() => setShowBeta(!showBeta)} type="button">
                Toggle Beta
            </button>
            <button onClick={() => setDisableAlpha(!disableAlpha)} type="button">
                Toggle Alpha disabled
            </button>
            <button onClick={() => setShowGroup(false)} type="button">
                Remove group
            </button>
            <button onClick={() => setRenderCount(renderCount + 1)} type="button">
                Rerender ({renderCount})
            </button>
        </>
    );
}
