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
