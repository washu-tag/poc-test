import { StructuredQueryOutputParser } from 'langchain/chains/query_constructor';
import { StructuredQuery } from '@langchain/core/structured_query';

export class QueryParser extends StructuredQueryOutputParser {
  constructor() {
    super({ allowedComparators: [], allowedOperators: [] });
  }

  /**
   * Processes the output of a structured query.
   * @param query The query string.
   * @param filter The filter condition.
   * @returns A Promise that resolves to a StructuredQuery instance.
   */
  async outputProcessor({ query, filter }: { query: string; filter: string }) {
    let myQuery = query;
    if (myQuery.length === 0 || myQuery === 'NO_QUERY') {
      myQuery = '';
    }
    if (filter === 'NO_FILTER' || filter === undefined) {
      return new StructuredQuery(myQuery);
    } else {
      const parsedFilter = await this.queryTransformer.parse(filter);
      return new StructuredQuery(myQuery, parsedFilter);
    }
  }
}
