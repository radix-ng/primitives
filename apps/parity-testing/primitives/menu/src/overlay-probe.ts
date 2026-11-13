/** Callback observations for a Menu's host popup; state is read from the native DOM. */
export interface OverlayProbe {
    changes: { open: boolean; reason: string; canceled: boolean }[];
    completions: boolean[];
    nativeEvents: { type: string; trusted: boolean }[];
}

export function createOverlayProbe(): OverlayProbe {
    return { changes: [], completions: [], nativeEvents: [] };
}
