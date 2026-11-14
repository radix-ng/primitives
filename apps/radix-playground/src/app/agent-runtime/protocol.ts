import { z } from 'zod';

// Shared by the browser boundary and the local executor. This is an application contract, not an npm API.
export const controlKinds = ['input', 'select', 'dialog'] as const;
export const actionNames = ['set-value', 'select-option', 'open', 'close'] as const;
const id = z.string().describe('An instance ID returned by snapshot or query; it expires on destruction.');
const value = z.string().describe('Input text or an exact Select option value, not its display label.');

export const commandEnvelopeSchema = z.strictObject({ id, action: z.string(), value: z.unknown().optional() });
export const toolInputSchemas = {
    snapshot: z.strictObject({}).describe('Read all explicitly registered controls without changing state or focus.'),
    query: z
        .strictObject({
            id: id.optional(),
            kind: z.enum(controlKinds).optional(),
            name: z.string().describe('Exact accessible name from labels or ARIA; case-sensitive.').optional()
        })
        .describe('Filter by exact fields. An empty filter lists every control; multiple matches are ambiguous.'),
    act: z
        .union([
            z.strictObject({ id, action: z.enum(['set-value', 'select-option']), value }),
            z.strictObject({ id, action: z.enum(['open', 'close']) })
        ])
        .describe('Request one declared action on a discovered instance. Restrictions are rechecked at execution.')
};

export const controlSnapshotSchema = z.strictObject({
    id,
    kind: z.enum(controlKinds),
    name: z.string(),
    available: z.boolean().describe('False outside the active modal scope or when disconnected/unavailable.'),
    disabled: z.boolean(),
    readOnly: z.boolean().optional(),
    value: z.unknown().optional(),
    open: z.boolean().optional(),
    constraints: z
        .strictObject({ required: z.boolean(), maxLength: z.number().int().nonnegative().optional() })
        .optional(),
    options: z
        .array(z.strictObject({ value: z.string(), label: z.string(), disabled: z.boolean().optional() }))
        .optional(),
    actions: z.array(z.enum(actionNames))
});
export const toolResultSchemas = {
    snapshot: z.strictObject({ controls: z.array(controlSnapshotSchema) }),
    query: z.union([
        z.strictObject({ status: z.literal('matched'), matches: z.tuple([controlSnapshotSchema]) }),
        z.strictObject({ status: z.literal('ambiguous'), matches: z.array(controlSnapshotSchema).min(2) }),
        z.strictObject({ status: z.enum(['not-found', 'invalid-query']), matches: z.tuple([]) })
    ]),
    act: z.union([
        z.strictObject({
            status: z.enum(['applied', 'unchanged', 'canceled']),
            message: z.string(),
            before: controlSnapshotSchema,
            after: controlSnapshotSchema
        }),
        z.strictObject({
            status: z.literal('refused'),
            code: z.string(),
            message: z.string(),
            before: controlSnapshotSchema.optional(),
            after: controlSnapshotSchema.optional()
        })
    ])
};
export type ToolName = keyof typeof toolInputSchemas;
