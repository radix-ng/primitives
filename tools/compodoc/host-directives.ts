interface CompodocMember {
    name?: string;
    defaultValue?: string;
    bindingAlias?: string;
}

interface CompodocEntry {
    name?: string;
    inputsClass?: CompodocMember[];
    outputsClass?: CompodocMember[];
    hostDirectives?: { name: string; inputs?: string[]; outputs?: string[] }[];
}

const splitBinding = (mapping: string): [string, string] => {
    const [original, alias = original] = mapping.split(':').map((part) => part.trim());
    return [original, alias];
};

/** Template binding name, including signal-input and composed host-directive aliases. */
export function compodocBindingName(member: CompodocMember): string | undefined {
    return member.bindingAlias ?? /alias:\s*['"]([^'"]+)['"]/.exec(member.defaultValue ?? '')?.[1] ?? member.name;
}

/**
 * Compodoc records hostDirectives separately without adding their exposed members to ArgTypes.
 * Expand only the explicitly exposed bindings, recursively, for both Storybook and consumer exports.
 * Clone metadata so normalization on one wrapper cannot change the source directive or another alias.
 */
export function composeHostDirectives<T extends CompodocEntry>(entries: readonly T[]): T[] {
    const byName = new Map(entries.map((entry) => [entry.name, entry]));
    const resolved = new Map<T, T>();
    const visiting = new Set<T>();

    function resolve(entry: T): T {
        const cached = resolved.get(entry);
        if (cached) return cached;
        if (visiting.has(entry)) return entry;
        visiting.add(entry);

        const result = { ...entry };
        for (const kind of ['inputsClass', 'outputsClass'] as const) {
            const members = new Map((entry[kind] ?? []).map((member) => [compodocBindingName(member), { ...member }]));
            for (const host of entry.hostDirectives ?? []) {
                const source = byName.get(host.name);
                if (!source) continue;
                const sourceDoc = resolve(source);
                const sourceMembers = sourceDoc[kind] ?? [];
                for (const mapping of host[kind === 'inputsClass' ? 'inputs' : 'outputs'] ?? []) {
                    const [original, alias] = splitBinding(mapping);
                    let name = alias;
                    let member = sourceMembers.find((candidate) => compodocBindingName(candidate) === original);
                    // Compodoc represents model() outputs by the input name, while hostDirectives
                    // exposes their real Angular binding (<input>Change). Keep that convention only
                    // when this wrapper also exposes the matching input under the matching alias.
                    if (!member && kind === 'outputsClass' && original.endsWith('Change')) {
                        const inputName = original.slice(0, -6);
                        if (sourceDoc.inputsClass?.some((candidate) => compodocBindingName(candidate) === inputName)) {
                            member = sourceMembers.find((candidate) => compodocBindingName(candidate) === inputName);
                            const inputAlias = host.inputs?.map(splitBinding).find(([from]) => from === inputName)?.[1];
                            if (inputAlias && alias === `${inputAlias}Change`) name = inputAlias;
                        }
                    }
                    if (member && !members.has(name)) members.set(name, { ...member, name, bindingAlias: name });
                }
            }
            result[kind] = [...members.values()];
        }

        visiting.delete(entry);
        resolved.set(entry, result);
        return result;
    }

    return entries.map(resolve);
}
