/** Find a prefix match from an inclusive index, wrapping once. Null labels represent unavailable items. */
export function findTypeaheadMatch(
    labels: readonly (string | null | undefined)[],
    search: string,
    startIndex = 0
): number | undefined {
    const query = search.toLowerCase();
    for (let offset = 0; offset < labels.length; offset++) {
        const index = (((startIndex + offset) % labels.length) + labels.length) % labels.length;
        if (labels[index]?.toLowerCase().startsWith(query)) return index;
    }
    return undefined;
}
