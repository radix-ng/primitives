import { COLLECTION_TYPES } from '../config/site-config';
import type { CollectionType } from './index.ts';

export function getCollections(): string[] {
    return COLLECTION_TYPES;
}

export function isValidCollectionType(type: unknown): type is CollectionType {
    return typeof type === 'string' && COLLECTION_TYPES.includes(type);
}
