import { getAngularApp } from '@/components/code-editor/templates.ts';
import type { Props } from '@/components/code-editor/types.ts';

const useCodeSandbox = (props: Props) => {
    const { files } = getAngularApp(props);

    files['sandbox.config.json'] = {
        content: {
            infiniteLoopProtection: false,
            template: 'node',
            container: {
                node: '20'
            }
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

export { useCodeSandbox };
