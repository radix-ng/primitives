import { Field } from '@base-ui/react/field';
import { Input } from '@base-ui/react/input';
import { useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { initialDefault, initialValue, installProbe, locked, record, required } from './contract';

installProbe();

function InputFixture() {
    const [value, setValue] = useState(initialValue);
    const [defaults, setDefaults] = useState(initialDefault);
    const [disabled, setDisabled] = useState(false);
    const pending = useRef<string>(undefined);

    return (
        <>
            <form id="profile">
                <button type="submit">Submit profile</button>
                <button type="reset">Reset profile</button>
            </form>
            <Field.Root disabled={disabled} name="profile-name" validationMode="onBlur">
                <Field.Label>Name</Field.Label>
                <Input
                    value={value}
                    defaultValue={defaults}
                    readOnly={locked}
                    required={required}
                    type={required ? 'email' : 'text'}
                    onValueChange={(next, details) => {
                        record(next, details);
                        pending.current = next;
                        if (window.inputParity.acceptEdit) setValue(next);
                    }}
                    data-test-input=""
                    data-parent-value={value}
                    id="profile-input"
                    name="local-name"
                    form="profile"
                    autoComplete="name"
                />
                <Field.Description id="profile-description">Used for your profile.</Field.Description>
                <Field.Error id="profile-error" match="valueMissing">
                    Enter a name.
                </Field.Error>
                <Field.Error id="profile-email-error" match="typeMismatch">
                    Enter an email address.
                </Field.Error>
            </Field.Root>
            <button onClick={() => setDefaults('late seed')} type="button">
                Change default
            </button>
            <button onClick={() => setValue(pending.current)} type="button">
                Accept request
            </button>
            <button onClick={() => setValue('parent')} type="button">
                Replace value
            </button>
            <button onClick={() => setDisabled(!disabled)} type="button">
                Toggle disabled
            </button>
        </>
    );
}

createRoot(document.getElementById('root')!).render(<InputFixture />);
