import { Radio } from '@base-ui/react/radio';
import { RadioGroup } from '@base-ui/react/radio-group';
import { useState } from 'react';
import { collectionOptions, type CollectionValue } from './contract';

export function ReactRadioCollection() {
    const [options, setOptions] = useState(collectionOptions);
    const [selected, setSelected] = useState<CollectionValue>('1');
    const [requests, setRequests] = useState(0);

    return (
        <>
            <form id="primary">
                <RadioGroup
                    value={selected}
                    onValueChange={(value) => {
                        setSelected(value);
                        setRequests((count) => count + 1);
                    }}
                    name="choice"
                    aria-label="Primary"
                >
                    {options.map((option) => (
                        <Radio.Root key={option.id} value={option.value} data-testid={option.id}>
                            {option.id}
                        </Radio.Root>
                    ))}
                </RadioGroup>
                <output data-testid="requests">{requests}</output>
            </form>
            <form id="secondary">
                <RadioGroup defaultValue="1" name="choice" aria-label="Secondary">
                    <Radio.Root value="1">Secondary item</Radio.Root>
                </RadioGroup>
            </form>
            <button type="button" onClick={() => setOptions((items) => [...items].reverse())}>
                Reverse options
            </button>
            <button
                type="button"
                onClick={() =>
                    setOptions((items) =>
                        items.map((item) =>
                            item.id === 'number' ? { ...item, value: item.value === 1 ? 2 : 1 } : item
                        )
                    )
                }
            >
                Change number value
            </button>
        </>
    );
}
