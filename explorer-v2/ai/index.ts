import { azure } from '@ai-sdk/azure';
import { experimental_wrapLanguageModel as wrapLanguageModel } from 'ai';

import { customMiddleware } from './custom-middleware';

export const customModel = (apiIdentifier: string) => {
  return wrapLanguageModel({
    model: azure(apiIdentifier),
    middleware: customMiddleware,
  });
};
