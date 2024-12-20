export function makeTriggerId(baseId: string, value: string | number) {
    return `${baseId}-trigger-${value}`;
}

export function makeContentId(baseId: string, value: string | number) {
    return `${baseId}-content-${value}`;
}
