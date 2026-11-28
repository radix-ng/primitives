import { Toast } from '@base-ui/react/toast';
import { useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { installFixture, notification, providerTimeout, resetTimeout, saveNotification } from './contract';
import './styles.css';

installFixture();

function ToastFixture({ setLimit }: { setLimit: (limit: number) => void }) {
    const manager = Toast.useToastManager();
    const count = useRef(0);
    const resolveSave = useRef<(() => void) | undefined>(undefined);

    function addNotice() {
        const index = ++count.current;
        manager.add(notification(`notice-${index}`, `Notification ${index}`, 0));
    }

    function startSave(persistent: boolean) {
        const save = new Promise<void>((resolve) => (resolveSave.current = resolve));
        void manager.promise(save, saveNotification(persistent));
    }

    function finishSave() {
        resolveSave.current?.();
        resolveSave.current = undefined;
    }

    return (
        <>
            <input data-testid="origin" aria-label="Focus origin" />
            <button onClick={addNotice} type="button">
                Add notification
            </button>
            <button onClick={() => setLimit(1)} type="button">
                Limit to one
            </button>
            <button onClick={() => setLimit(3)} type="button">
                Limit to three
            </button>
            <button onClick={() => manager.add(notification('timed', 'Timed'))} type="button">
                Add timed notification
            </button>
            <button onClick={() => manager.update('timed', { title: 'Updated' })} type="button">
                Update copy
            </button>
            <button onClick={() => manager.update('timed', { timeout: resetTimeout })} type="button">
                Reset timer
            </button>
            <button onClick={() => startSave(false)} type="button">
                Start save
            </button>
            <button onClick={() => startSave(true)} type="button">
                Start persistent save
            </button>
            <button onClick={finishSave} type="button">
                Finish save
            </button>

            <Toast.Portal>
                <Toast.Viewport data-testid="viewport">
                    {manager.toasts.map((toast) => (
                        <Toast.Root key={toast.id} toast={toast} data-testid={toast.id} data-toast>
                            <Toast.Title data-title />
                            <Toast.Description>Notification details</Toast.Description>
                            <Toast.Close data-testid={`dismiss-${toast.id}`}>Dismiss</Toast.Close>
                        </Toast.Root>
                    ))}
                </Toast.Viewport>
            </Toast.Portal>
        </>
    );
}

function App() {
    const [limit, setLimit] = useState(3);
    return (
        <div data-testid="fixture">
            <Toast.Provider limit={limit} timeout={providerTimeout}>
                <ToastFixture setLimit={setLimit} />
            </Toast.Provider>
        </div>
    );
}

createRoot(document.getElementById('root')!).render(<App />);
