import 'server-only';

import axios from 'axios';
import { parse } from 'json2csv';
import { ImageRow } from '@/lib/types';
import { EmbeddingsInterface } from '@langchain/core/embeddings';
import { RunnableSequence } from '@langchain/core/runnables';
import { DocumentInterface } from '@langchain/core/documents';
import { WeaviateFilter, WeaviateStore } from '@langchain/weaviate';
import {
  AttributeInfo,
  DEFAULT_PREFIX,
  DEFAULT_SUFFIX,
  EXAMPLE_PROMPT,
  StructuredQueryOutputParser,
  formatAttributeInfo,
} from 'langchain/chains/query_constructor';
import { interpolateFString, FewShotPromptTemplate, Example } from '@langchain/core/prompts';
import { CustomWeaviateTranslator } from './weaviate-translator';
import { CustomWeaviateStore } from './weaviate-vectorstore';
import { supportedModels } from './models';
import { RetrieverResult, SelfQueryRetrieverWithRetry } from './self-query-retriever-with-retry';
import { QueryParser } from './query-parser';
import {
  ATTRIBUTES,
  COLLECTION_NAME,
  DOC_CONTENTS,
  ERROR_TEMPLATE,
  REQUEST_SCHEMA,
  WEAVIATE_CLIENT,
  weaviateManager,
  doubleBrackets,
  jsonMarkdown,
  stringifyWithFormatting,
} from './weaviate';

type Embeddings = {
  vector: number[];
};

const getEmbedding = async (images: string[], texts: string[]): Promise<Embeddings> => {
  const url = `${process.env.VECTORIZER_URL}/latents`;
  const data = {
    text: texts[0],
  };
  const headers = {
    'Content-Type': 'application/json',
  };

  const result = await axios.post(url, data, { headers });
  return result.data;
};


const executeVectorSearchDirectly = async (
  vectorStore: CustomWeaviateStore,
  maxDistance: number,
  resultLimit: number,
): Promise<RetrieverResult> => {
  // images array is baked-in to the embeddingsInterface within vectorStore, so we just need to pass an empty query
  return {
    result: await vectorStore.similaritySearch('', resultLimit, {
      distance: maxDistance,
    } as WeaviateFilter),
    dbQuery: `${jsonMarkdown(
      stringifyWithFormatting({
        query: '[Image similarity search]',
        filter: 'NO_FILTER',
      }),
    )}`,
  };
};

const extractAndExecuteQuery = async (
  model: string,
  vectorStore: CustomWeaviateStore,
  userQuery: string | undefined,
  maxDistance: number,
  resultLimit: number,
  modelInstructions: string | undefined,
  signal: AbortSignal,
): Promise<RetrieverResult> => {
  if (!userQuery) {
    // If we don't have any user text, then there aren't any filters we need to parse out
    return executeVectorSearchDirectly(vectorStore, maxDistance, resultLimit);
  }

  const schema = weaviateManager.getSchema();
  const structuredQueryTranslator = new CustomWeaviateTranslator();
  const examples = weaviateManager.getExamples();
  const llm = supportedModels[model]
    .langchainLlm({
      temperature: 0,
    })
    .bind({ signal });

  const queryBuilder = RunnableSequence.from([
    makePrompt(schema, structuredQueryTranslator, examples, modelInstructions),
    llm,
  ]);

  const queryBuilderFixer = RunnableSequence.from([
    makePrompt(schema, structuredQueryTranslator, examples, modelInstructions, true),
    llm,
  ]);

  const selfQueryRetriever = new SelfQueryRetrieverWithRetry({
    vectorStore,
    queryBuilder,
    queryParser: new QueryParser(),
    queryBuilderFixer,
    structuredQueryTranslator,
    searchParams: {
      k: resultLimit,
      filter: {
        distance: maxDistance,
      } as WeaviateFilter,
    },
  });

  return await selfQueryRetriever.invoke(userQuery, {
    signal,
  });
};

export const findRelevantContent = async (
  userQuery: string | undefined,
  images: string[],
  maxDistance: number,
  resultLimit: number,
  modelInstructions: string | undefined,
  model: string,
  signal: AbortSignal,
): Promise<{
  data: ImageRow[];
  file: File | undefined;
  dbQuery: string | undefined;
}> => {
  console.log(
    `User query: ${userQuery}, with ${images.length} images at max distance ${maxDistance} and max results ${resultLimit}`,
  );

  const embeddingsInterface: EmbeddingsInterface = {
    embedDocuments: async (documents) => {
      const embeddings: Embeddings = await getEmbedding([], documents);
      return [embeddings.vector];
    },
    embedQuery: async (document) => {
      // Note: nearImage cannot take base64 string due to bug that attempts to "stat" it
      // and then errors with "file name too long", so we just compute our own
      const documents = document === '' ? [] : [document];
      const embeddings: Embeddings = await getEmbedding(images, documents);
      return embeddings.vector;
    },
  };

  const vectorStore = new CustomWeaviateStore(embeddingsInterface, {
    client: WEAVIATE_CLIENT,
    indexName: COLLECTION_NAME,
    textKey: 'subject',
    metadataKeys: ATTRIBUTES,
  });

  const { result, dbQuery } = await extractAndExecuteQuery(
    model,
    vectorStore,
    userQuery,
    maxDistance,
    resultLimit,
    modelInstructions,
    signal,
  );
  console.log(`Query is ${dbQuery}`);

  if (result.length == 0) {
    return {
      data: [],
      file: undefined,
      dbQuery,
    };
  }

  const data = result.map((item: DocumentInterface) => {
    const object = {};
    Object.assign(object, item.metadata);
    return object as ImageRow;
  });
  console.log(`Identified cohort of ${data.length}`);

  // Create file
  const csv = parse(data); // Convert JSON data to CSV format
  const csvBlob = new Blob([csv], { type: 'text/csv' });
  const file = new File([csvBlob], `w_${Date.now()}.csv`, { type: 'text/csv' });

  return {
    data,
    file,
    dbQuery,
  };
};

// Copied from lanchain/dist/chains/query_constructor/index.js :(
const makePrompt = (
  attributeInfo: AttributeInfo[],
  structuredQueryTranslator: CustomWeaviateTranslator<WeaviateStore>,
  examples: Example[],
  modelInstructions: string | undefined,
  includeErrorTemplate: boolean = false,
) => {
  const allowedComparators = structuredQueryTranslator.allowedComparators;
  const allowedOperators = structuredQueryTranslator.allowedOperators;
  const attributeJSON = formatAttributeInfo(attributeInfo);
  //const examples = [...DEFAULT_EXAMPLES.map((EXAMPLE) => EXAMPLE), ...customExamples];
  const schema = interpolateFString(REQUEST_SCHEMA, {
    allowed_comparators: allowedComparators.join(' | '),
    allowed_operators: allowedOperators.join(' | '),
  });
  const prefix = interpolateFString(DEFAULT_PREFIX, {
    schema,
  });
  const suffix = interpolateFString(DEFAULT_SUFFIX, {
    i: examples.length + 1,
    content: DOC_CONTENTS,
    attributes: attributeJSON,
  });
  const errorMessage = includeErrorTemplate ? ERROR_TEMPLATE : '';
  const outputParser = StructuredQueryOutputParser.fromComponents(
    allowedComparators,
    allowedOperators,
  );
  return new FewShotPromptTemplate({
    examples,
    examplePrompt: EXAMPLE_PROMPT,
    inputVariables: includeErrorTemplate ? ['query', 'generatedQuery', 'error'] : ['query'],
    suffix: suffix + modelInstructions + errorMessage,
    prefix,
    outputParser,
  });
};

export const buildModelInstructions = (
  instructions?: string,
  lastQuery?: string,
): string | undefined => {
  if (!lastQuery) {
    return instructions;
  }
  return doubleBrackets(
    lastQuery +
    '\n\nFeedback:\n\n' +
    instructions +
    '\n\nPlease improve the stuctured requested based on the feedback above.\
    Make minimal changes to your original query, just enough to address the feedback.\n\n\
    Fixed Structured Request:\n',
  );
};
