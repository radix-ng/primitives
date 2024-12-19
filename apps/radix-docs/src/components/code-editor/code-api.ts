import { getAngularApp } from '@/components/code-editor/templates.ts';
import type { Props } from '@/components/code-editor/types.ts';
import sdk from '@stackblitz/sdk';

const useCodeSandbox = (props: Props) => {
    const { files } = getAngularApp(props);

    files['sandbox.config.json'] = {
        content: {
            // infiniteLoopProtection: false,
            template: 'node'
        }
    };

    // eslint-disable-next-line promise/catch-or-return
    fetch('https://codesandbox.io/api/v1/sandboxes/define?json=1', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
        },
        body: JSON.stringify({ files: files, sourceFileName: 'components/layout/app.component.ts' })
    })
        .then((response) => response.json())
        .then(
            (data) =>
                typeof window !== 'undefined' && window.open(`https://codesandbox.io/s/${data.sandbox_id}`, '_blank')
        );
};

const useStackBlitz = (props: Props) => {
    const { files, title } = getAngularApp(props);

    const _files = {};

    Object.entries(files).forEach(
        ([k, v]) => (_files[`${k}`] = typeof v.content === 'object' ? JSON.stringify(v.content, null, 2) : v.content)
    );

    const project = {
        title: title,
        template: 'node',
        description: 'RadixNG',
        files: _files
    };

    const options = {
        newWindow: true,
        openFile: 'components/layout/app.component.html'
    };

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    sdk.openProject(project, options);
};

export { useCodeSandbox, useStackBlitz };
