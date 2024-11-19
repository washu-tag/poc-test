import { UseChatParameters } from '@/lib/types';
import { createContext } from 'react';

export const UseChatContext = createContext<UseChatParameters>({} as UseChatParameters);
