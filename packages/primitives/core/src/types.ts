export type DataOrientation = 'vertical' | 'horizontal';

/** Layout direction for bidirectional text. */
export type Direction = 'ltr' | 'rtl';

/**
 * Nullable from `Type` adds `null` and `undefined`
 *
 * @example ```ts
 *  // Expect: string | number | undefined | null
 *  type Value = Nulling<string | number>;
 * ```
 */
export type Nullable<Type> = null | Type | undefined;

/**
 * SafeFunction is a type for functions that accept any number of arguments of unknown types
 * and return a value of an unknown type. This is useful when you want to define a function
 * without being strict about the input or output types, maintaining flexibility.
 *
 * @example ```ts
 *  const safeFn: SafeFunction = (...args) => {
 *    return args.length > 0 ? args[0] : null;
 *  };
 *
 *  const result = safeFn(1, 'hello'); // result: 1
 * ```
 */
export type SafeFunction = (...args: unknown[]) => unknown;

export type AcceptableValue = string | number | bigint | Record<string, any> | null;

/** Type describing the allowed values for a boolean `input()` using `booleanAttribute` coercion. */
export type BooleanInput = string | boolean | null | undefined;

/** Type describing the allowed values for a number `input()` using `numberAttribute` coercion. */
export type NumberInput = string | number | null | undefined;
