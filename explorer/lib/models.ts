import { LanguageModelV1 } from '@ai-sdk/provider';
import { createAzure } from '@ai-sdk/azure';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { AzureChatOpenAI } from '@langchain/openai';

const SEED = 544;
export const DEFAULT_MODEL = 'gpt-4o';
export const AZURE_API_VERSION = '2024-08-01-preview';

const fetchWithLog = async (input: RequestInfo | URL, options?: RequestInit) => {
  console.log(`Fetching ${input}`);
  const result = await fetch(input, options);
  console.log(`Fetched ${input}\n`);
  return result;
};

const azureLangchainLLM = (modelId: string, options: {}) => {
  return new AzureChatOpenAI({
    ...options,
    azureOpenAIApiKey: process.env.AZURE_API_KEY,
    azureOpenAIApiInstanceName: process.env.AZURE_RESOURCE_NAME,
    azureOpenAIApiVersion: AZURE_API_VERSION,
    azureOpenAIApiDeploymentName: modelId,
    modelKwargs: { seed: SEED },
  });
};

const azure = createAzure({
  fetch: fetchWithLog,
});

type ModelType = {
  provider: LanguageModelV1;
  modelName: string;
  langchainLlm: (options: {}) => BaseChatModel;
  assistantId: string;
};

export const supportedModels: Record<string, ModelType> = {
  'gpt-4o': {
    provider: azure('gpt-4o'),
    modelName: 'Azure GPT-4o',
    langchainLlm: (options: {}) => {
      return azureLangchainLLM('gpt-4o', options);
    },
    assistantId: process.env.AZURE_ASSISTANT_ID || '',
  },
  'gpt-4o-mini': {
    provider: azure('gpt-4o-mini'),
    modelName: 'Azure GPT-4o-mini',
    langchainLlm: (options: {}) => {
      return azureLangchainLLM('gpt-4o-mini', options);
    },
    assistantId: process.env.AZURE_ASSISTANT_ID_MINI || '',
  },
  'gemini-1.5-flash': {
    provider: azure('gpt-4o-mini'),
    //provider: google('models/gemini-1.5-flash'), // can't handle parameter defaults for tools
    modelName: 'Gemini',
    langchainLlm: (options: {}) => {
      return new ChatGoogleGenerativeAI({
        ...options,
        model: 'models/gemini-1.5-flash',
      });
    },
    assistantId: process.env.AZURE_ASSISTANT_ID_MINI || '',
  },
};
