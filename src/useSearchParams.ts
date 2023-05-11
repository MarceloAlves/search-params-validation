import { useMemo, useCallback } from "react";
import qs from "query-string";
import type { StringifyOptions } from "query-string";
import { z, ZodSchema } from "zod";
// import { useHistory, useLocation } from "react-router-dom";

type Values =
  | string
  | string[]
  | number
  | number[]
  | boolean
  | null
  | undefined;

type Append = {
  (key: string, value: Values): void;
  (values: Record<string, Values>): void;
};

type Remove = (key: string | string[]) => void;

type ReplaceAll = {
  (key: string, value: Values): void;
  (values: Record<string, Values>): void;
};

type Clear = () => void;

type Stringify = (options?: {
  options?: StringifyOptions;
  extraParams?: Record<string, any>;
}) => string;

/**
 * Returns an object containing the current page's search params and a set of actions
 * to modify those params.
 *
 * @remarks If you have state that you need to pass along with a query that doesn't exist in the search params,
 * you can pass it in as the `extraParams` parameter of `stringify`
 *
 * @example ```
 * const [params, { append, remove, replaceAll, clear, stringify }] = useSearchParams()
 * const someQuery = fetch(`http://example.com/${stringify({ extraParams: { foo: "bar" } })}`)
 * ```
 */


// If schema is available return type should be a partial zod schema. if not, return regular query string result
export function useSearchParams<Schema extends z.ZodSchema>({ schema, onUpdate }: { schema?: Schema, onUpdate: (querystring: string) => void }): Schema extends true ? z.infer<Schema> : qs.ParsedQuery<string> {
  // const history = useHistory();
  // const location = useLocation();

  const currentSearch = useMemo(() => {
    const queryString = qs.parse(window.location.search);
    if (schema) {
      // return partial zod schema result
      return schema.parse(queryString);
    }

    // return regular query string result ParsedQuery<string>
    return queryString
  }, [location.search, schema]);

  const append: Append = useCallback(
    (keyOrValues: string | Record<string, Values>, value?: Values) => {
      let newSearchParams;

      if (typeof keyOrValues === "object") {
        newSearchParams = {
          ...currentSearch,
          ...keyOrValues,
        };
      } else {
        newSearchParams = {
          ...currentSearch,
          [keyOrValues]: value,
        };
      }

      onUpdate(qs.stringify(newSearchParams))
    },
    [currentSearch, history, location.hash]
  );

  /**
   * Removes a single param or multiple params
   * @param key string | string[]
   */
  const remove: Remove = useCallback(
    (key) => {
      const newSearchParams = { ...currentSearch };

      if (Array.isArray(key)) {
        key.forEach((entry) => delete newSearchParams[entry]);
      } else {
        delete newSearchParams[key];
      }

      onUpdate(qs.stringify(newSearchParams))
    },
    [currentSearch, history, location.hash]
  );

  /**
   * Replaces current search params with new params
   * @param key the key to replace or a new search param object
   * @param value the key's new value
   */
  const replaceAll: ReplaceAll = useCallback(
    (keyOrValues: string | Record<string, Values>, value?: Values) => {
      let newSearchParams;

      if (typeof keyOrValues === "object") {
        newSearchParams = keyOrValues;
      } else {
        newSearchParams = {
          [keyOrValues]: value,
        };
      }

      onUpdate(qs.stringify(newSearchParams))
    },
    [history, location.hash]
  );

  /**
   * Clears all search params
   */
  const clear: Clear = useCallback(
    () => onUpdate(''),
    []
  );

  /**
   * Converts the current search params into a string
   * Additionally, you can pass an object of extra params to add to the string that live outside of the url state
   */
  const stringify: Stringify = useCallback(
    ({ options, extraParams = {} } = {}) =>
      qs.stringify({ ...currentSearch, ...extraParams }, options),
    [currentSearch]
  );

  return [
    currentSearch,
    {
      append,
      remove,
      replaceAll,
      clear,
      stringify,
    },
  ] as const;
};
