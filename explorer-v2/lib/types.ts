/* eslint-disable @typescript-eslint/no-unused-vars */
import { Dispatch, SetStateAction } from 'react';

export const DEFAULT_MAX_DISTANCE = 1;
export const DEFAULT_RESULT_LIMIT = 10_000;
export const MAX_RESULT_LIMIT = 100_000;

export enum Step {
  BuildQuery = 'BuildQuery',
  ParseQuery = 'ParseQuery',
  ExecuteQuery = 'ExecuteQuery',
  Summarize = 'Summarize',
  Chart = 'Chart',
}

// TODO figure out how to use Partial but indicate that some properties are required
// export type UseChatParamters = Partial<UseChatHelpers> & {
//   submitForm: (step: Step, datasetId?: string) => void;
//   maxDistance: number;
//   setMaxDistance: (maxDistance: number) => void;
//   resultLimit: number;
//   setResultLimit: (resultLimit: number) => void;
// };

export type UseChatParameters = {
  submitForm: (step: Step, datasetId?: string) => void;
  maxDistance: number;
  setMaxDistance: Dispatch<SetStateAction<number>>;
  resultLimit: number;
  setResultLimit: Dispatch<SetStateAction<number>>;
  isLoading: boolean;
  input: string;
  setInput: Dispatch<SetStateAction<string>>;
  stop: () => void;
};
