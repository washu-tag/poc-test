import { BaseTranslator } from "langchain/retrievers/self_query";
import { VectorStore } from "@langchain/core/vectorstores";
import {
  Runnable,
  RunnableConfig,
  RunnableInterface,
  ensureConfig
} from "@langchain/core/runnables";
import {
  CallbackManager,
  CallbackManagerForChainRun,
  Callbacks,
  parseCallbackConfigArg
} from "@langchain/core/callbacks/manager";
import { BaseMessage } from "@langchain/core/messages";
import type { DocumentInterface } from "@langchain/core/documents";
import { StructuredQueryOutputParser } from "langchain/chains/query_constructor";
import { AxiosError } from "axios";

interface SelfQueryRetrieverWithRetryArgs<T extends VectorStore> {
  vectorStore: T;
  structuredQueryTranslator: BaseTranslator<T>;
  queryBuilder: RunnableInterface<
    {
      query: string;
    },
    BaseMessage
  >;
  queryBuilderFixer: RunnableInterface<
    {
      query: string;
      generatedQuery: string;
      error: string;
    },
    BaseMessage
  >;
  queryParser: StructuredQueryOutputParser;
  verbose?: boolean;
  searchParams?: {
    k?: number;
    filter?: T["FilterType"];
    mergeFiltersOperator?: "or" | "and" | "replace";
    forceDefaultFilter?: boolean;
  };
  callbacks?: Callbacks;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface RetrieverResult {
  result: DocumentInterface<Record<string, any>>[];
  dbQuery: string;
}

export class SelfQueryRetrieverWithRetry<
  T extends VectorStore
> extends Runnable<string, RetrieverResult> {
  static lc_name() {
    return "SelfQueryRetrieverWithRetry";
  }
  get lc_namespace() {
    return ["custom"];
  }
  vectorStore: T;
  structuredQueryTranslator: BaseTranslator<T>;
  queryBuilder: RunnableInterface<
    {
      query: string;
    },
    BaseMessage
  >;
  queryBuilderFixer: RunnableInterface<
    {
      query: string;
      generatedQuery: string;
      error: string;
    },
    BaseMessage
  >;
  queryParser: StructuredQueryOutputParser;
  verbose?: boolean;
  searchParams?: {
    k?: number;
    filter?: T["FilterType"];
    mergeFiltersOperator?: "or" | "and" | "replace";
    forceDefaultFilter?: boolean;
  };
  callbacks?: Callbacks;
  tags?: string[];
  metadata?: Record<string, unknown>;
  constructor(options: SelfQueryRetrieverWithRetryArgs<T>) {
    super(options);
    this.vectorStore = options.vectorStore;
    this.queryBuilder = options.queryBuilder;
    this.queryBuilderFixer = options.queryBuilderFixer;
    this.queryParser = options.queryParser;
    this.verbose = options.verbose ?? false;
    this.searchParams = options.searchParams ?? this.searchParams;
    this.structuredQueryTranslator = options.structuredQueryTranslator;
    this.callbacks = options?.callbacks;
    this.tags = options?.tags ?? [];
    this.metadata = options?.metadata ?? {};
  }

  async invoke(
    input: string,
    options?: RunnableConfig
  ): Promise<RetrieverResult> {
    const parsedConfig = ensureConfig(
      parseCallbackConfigArg(ensureConfig(options))
    );
    const callbackManager_ = await CallbackManager.configure(
      parsedConfig.callbacks,
      this.callbacks,
      parsedConfig.tags,
      this.tags,
      parsedConfig.metadata,
      this.metadata,
      { verbose: this.verbose }
    );
    const runManager = await callbackManager_?.handleChainStart(
      this.toJSON(),
      { input },
      parsedConfig.runId,
      undefined,
      undefined,
      undefined,
      parsedConfig.runName
    );
    try {
      const output = await this.retrieve(input, runManager);
      await runManager?.handleChainEnd(output);
      return output;
    } catch (error) {
      await runManager?.handleChainError(error);
      throw error;
    }
  }

  async retrieve(
    query: string,
    runManager: CallbackManagerForChainRun | undefined
  ): Promise<RetrieverResult> {
    // Retry twice to handle cases where we get a parsing error (e.g., missing a paren),
    // followed by a content error (e.g., filtering on an invalid attribute)
    const generatedQuery = await this.queryBuilder.invoke(
      { query },
      runManager?.getChild("query_builder")
    );
    try {
      return await this.parseAndExecuteQuery(query, generatedQuery, runManager);
    } catch (error: any) {
      if (error instanceof AxiosError) {
        // Don't ask the model to rewrite query for axios error
        throw error;
      }
      console.error(
        `Running ${getContentString(generatedQuery)} produced ${error}. Trying to fix the query.`
      );
      const fixedQuery = await this.buildFixedQuery(
        query,
        generatedQuery,
        error,
        runManager
      );
      try {
        return await this.parseAndExecuteQuery(query, fixedQuery, runManager);
      } catch (fixedQueryError: any) {
        console.error(
          `Running ${getContentString(fixedQuery)} produced ${fixedQueryError}. Trying to fix the query again.`
        );
        const refixedQuery = await this.buildFixedQuery(
          query,
          fixedQuery,
          fixedQueryError,
          runManager
        );
        return await this.parseAndExecuteQuery(query, refixedQuery, runManager);
      }
    }
  }

  async buildFixedQuery(
    query: string,
    generatedQueryWithError: BaseMessage,
    error: any,
    runManager: CallbackManagerForChainRun | undefined
  ): Promise<BaseMessage> {
    return await this.queryBuilderFixer.invoke(
      {
        query,
        generatedQuery: getContentString(generatedQueryWithError),
        error: error.message.replace(/nearVector:{[^}]*},/, "")
      },
      runManager?.getChild("query_builder")
    );
  }

  async parseAndExecuteQuery(
    query: string,
    generatedQuery: BaseMessage,
    runManager?: CallbackManagerForChainRun
  ): Promise<RetrieverResult> {
    const generatedStructuredQuery = await this.queryParser.invoke(
      generatedQuery,
      runManager?.getChild("query_parser")
    );
    const nextArg = this.structuredQueryTranslator.visitStructuredQuery(
      generatedStructuredQuery
    );
    const filter = this.structuredQueryTranslator.mergeFilters(
      this.searchParams?.filter,
      nextArg.filter,
      this.searchParams?.mergeFiltersOperator,
      this.searchParams?.forceDefaultFilter
    );
    const generatedTextQuery = generatedStructuredQuery.query;
    return {
      result: await this.vectorStore.similaritySearch(
        generatedTextQuery,
        this.searchParams?.k,
        filter,
        runManager?.getChild("vectorstore")
      ),
      dbQuery: getContentString(generatedQuery)
    };
  }
}

function getContentString(generatedQuery: BaseMessage): string {
  return typeof generatedQuery.content === "string"
    ? generatedQuery.content
    : "[UNKNOWN]";
}
