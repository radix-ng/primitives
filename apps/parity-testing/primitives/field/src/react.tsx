import { Field } from '@base-ui/react/field';
import { Fieldset } from '@base-ui/react/fieldset';
import { Form } from '@base-ui/react/form';
import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { installFixture, serverErrors } from './contract';

installFixture();

function FieldFixture() {
    const [submits, setSubmits] = useState(0);
    const [disabled, setDisabled] = useState(true);
    const [suffix, setSuffix] = useState('');
    const [showParts, setShowParts] = useState(true);

    return (
        <>
            <Form onFormSubmit={() => setSubmits((count) => count + 1)} validationMode="onSubmit">
                <Field.Root data-testid="email-field" name="email">
                    <Field.Label>Email</Field.Label>
                    <Field.Control id="email" type="email" required />
                    <Field.Error id="missing-email" match="valueMissing">
                        Enter an email.
                    </Field.Error>
                    <Field.Error id="malformed-email" match="typeMismatch">
                        Use a valid email.
                    </Field.Error>
                </Field.Root>
                <Field.Root data-testid="display-name-field" name="display-name">
                    <Field.Label>Display name</Field.Label>
                    <Field.Control id="display-name" required />
                </Field.Root>
                <button type="submit">Submit profile</button>
                <output data-testid="submits">{submits}</output>
            </Form>
            <Fieldset.Root disabled={disabled}>
                <Fieldset.Root>
                    <Field.Root data-testid="inherited-field">
                        <Field.Label>Nested fieldset input</Field.Label>
                        <Field.Control />
                    </Field.Root>
                </Fieldset.Root>
            </Fieldset.Root>
            <button onClick={() => setDisabled(!disabled)} type="button">
                Toggle fieldset
            </button>
            <Form errors={serverErrors}>
                <Field.Root data-testid="outer-field" name="outer">
                    <Field.Label>Outer</Field.Label>
                    <Field.Control id="outer" />
                    <Field.Error id="outer-error">Outer field error</Field.Error>
                    <Field.Root data-testid="inner-field" name="inner">
                        <Field.Label>Inner</Field.Label>
                        <Field.Control id="inner" />
                        <Field.Error id="inner-error">Inner field error</Field.Error>
                    </Field.Root>
                </Field.Root>
            </Form>
            <span id="authored-name">Account reference</span>
            <p id="authored-help">Used for billing.</p>
            <Field.Root data-testid="relationships" validationMode="onBlur">
                {showParts && <Field.Label>Field reference</Field.Label>}
                <Field.Control
                    id={'reference' + suffix}
                    aria-labelledby="authored-name"
                    aria-describedby="authored-help"
                    required
                />
                {showParts && (
                    <>
                        <Field.Description id={'reference-help' + suffix}>Check your statement.</Field.Description>
                        <Field.Error id={'reference-error' + suffix} match="valueMissing">
                            Enter a reference.
                        </Field.Error>
                    </>
                )}
                <Field.Validity>
                    {({ validity }) => (
                        <output data-testid="validity" data-missing={String(validity.valueMissing)}>
                            {String(validity.valid ?? 'neutral')}
                        </output>
                    )}
                </Field.Validity>
            </Field.Root>
            <button onClick={() => setSuffix('-next')} type="button">
                Change field IDs
            </button>
            <button onClick={() => setShowParts(!showParts)} type="button">
                Toggle field parts
            </button>
            <Form>
                <Field.Root>
                    <Field.Label>Default mode email</Field.Label>
                    <Field.Control name="default-email" required />
                    <Field.Error match="valueMissing">Enter a default mode email.</Field.Error>
                </Field.Root>
                <button type="submit">Submit default mode</button>
            </Form>
        </>
    );
}

createRoot(document.getElementById('root')!).render(<FieldFixture />);
