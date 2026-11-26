import { Separator } from '@base-ui/react/separator';
import { Toolbar } from '@base-ui/react/toolbar';
import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { installFixture, opposite, type Orientation } from './contract';

installFixture();

function SeparatorFixture() {
    const [orientation, setOrientation] = useState<Orientation>();
    const [toolbarOrientation, setToolbarOrientation] = useState<Orientation>('horizontal');
    const [toolbarOverride, setToolbarOverride] = useState<Orientation | undefined>('horizontal');

    return (
        <>
            <input aria-label="Before separator" />
            <Separator data-part="default" />
            <input aria-label="After separator" />

            <Separator orientation={orientation} data-part="reactive" />
            <button type="button" onClick={() => setOrientation('vertical')}>
                Set vertical
            </button>
            <button type="button" onClick={() => setOrientation('horizontal')}>
                Set horizontal
            </button>
            <button type="button" onClick={() => setOrientation(undefined)}>
                Clear orientation
            </button>

            <Separator render={<hr />} orientation="vertical" data-part="native" />

            <Toolbar.Root
                orientation={toolbarOrientation}
                data-override={toolbarOverride ?? 'unset'}
                aria-label="Editing"
            >
                <Toolbar.Button>Copy</Toolbar.Button>
                <Toolbar.Separator data-part="toolbar-derived" />
                <Toolbar.Separator orientation={undefined} data-part="toolbar-initial-undefined" />
                <Toolbar.Separator orientation={toolbarOverride} data-part="toolbar-override" />
                <Toolbar.Button>Paste</Toolbar.Button>
            </Toolbar.Root>
            <button type="button" onClick={() => setToolbarOrientation(opposite)}>
                Rotate toolbar
            </button>
            <button type="button" onClick={() => setToolbarOverride(undefined)}>
                Clear toolbar override
            </button>
        </>
    );
}

createRoot(document.getElementById('root')!).render(<SeparatorFixture />);
