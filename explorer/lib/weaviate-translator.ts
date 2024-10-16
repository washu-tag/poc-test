import {
  Comparison,
  isString,
  isInt,
  isFloat
} from "@langchain/core/structured_query";
import {
  WeaviateStore,
  WeaviateTranslator,
  WeaviateFilter
} from "@langchain/weaviate";

/**
 * A class that translates or converts data into a format that can be used
 * with Weaviate, a vector search engine. It extends the `BaseTranslator`
 * class and provides specific implementation for Weaviate.
 * @example
 * ```typescript
 * const selfQueryRetriever = new SelfQueryRetriever({
 *   llm: new ChatOpenAI(),
 *   vectorStore: new WeaviateStore(),
 *   documentContents: "Brief summary of a movie",
 *   attributeInfo: [],
 *   structuredQueryTranslator: new WeaviateTranslator(),
 * });
 *
 * const relevantDocuments = await selfQueryRetriever.getRelevantDocuments(
 *   "Which movies are rated higher than 8.5?",
 * );
 * ```
 */
export class CustomWeaviateTranslator<
  T extends WeaviateStore
> extends WeaviateTranslator<T> {
  /**
   * Visits a comparison and returns a WeaviateComparisonResult. The
   * comparison's value is checked for type and the comparator is formatted.
   * Throws an error if the value type is not supported.
   * @param comparison The comparison to visit.
   * @returns A WeaviateComparisonResult.
   */
  visitComparison(comparison: Comparison): any {
    if (isInt(comparison.value)) {
      return {
        path: [comparison.attribute],
        operator: super.formatFunction(comparison.comparator),
        valueInt: parseInt(comparison.value as string, 10)
      };
    }
    if (isFloat(comparison.value)) {
      return {
        path: [comparison.attribute],
        operator: super.formatFunction(comparison.comparator),
        valueNumber: parseFloat(comparison.value as string)
      };
    }
    if (isBoolean(comparison.value)) {
      return {
        path: [comparison.attribute],
        operator: super.formatFunction(comparison.comparator),
        valueBoolean: comparison.value
      };
    }
    if (
      typeof comparison.value === "object" &&
      comparison.value["type"] === "date" &&
      comparison.value["date"]
    ) {
      // ISO 8601 timestamp, formatted as RFC3339
      const date = new Date(comparison.value["date"] + " UTC");
      return {
        path: [comparison.attribute],
        operator: super.formatFunction(comparison.comparator),
        valueDate: date.toISOString()
      };
    }
    if (isString(comparison.value)) {
      return {
        path: [comparison.attribute],
        operator: super.formatFunction(comparison.comparator),
        valueText: comparison.value
      };
    }
    throw new Error(
      `Value type of ${comparison.attribute} = ${comparison.value} is not supported`
    );
  }
  /**
   * Merges two filters into one. If both filters are empty, returns
   * undefined. If one filter is empty or the merge type is 'replace',
   * returns the other filter. If the merge type is 'and' or 'or', returns a
   * new filter with the merged results. Throws an error for unknown merge
   * types.
   * @param defaultFilter The default filter to merge.
   * @param generatedFilter The generated filter to merge.
   * @param mergeType The type of merge to perform. Can be 'and', 'or', or 'replace'. Defaults to 'and'.
   * @returns A merged WeaviateFilter, or undefined if both filters are empty.
   */
  mergeFilters(
    defaultFilter: WeaviateFilter,
    generatedFilter: WeaviateFilter,
    mergeType = "and"
  ) {
    // the super function just merges the "where" clauses
    let mergedFilter = super.mergeFilters(
      defaultFilter,
      generatedFilter,
      mergeType
    );
    if (defaultFilter?.distance) {
      if (typeof mergedFilter === "undefined") {
        mergedFilter = {
          distance: defaultFilter?.distance
        } as WeaviateFilter;
      } else {
        mergedFilter.distance = defaultFilter?.distance;
      }
    }
    return mergedFilter;
  }
}

/**
 * Checks if the provided value is a floating-point number.
 */
export function isBoolean(value: any) {
  if (typeof value === "boolean") {
    return true;
  } else if (typeof value === "string") {
    return value === "true" || value === "false";
  }
  return false;
}
