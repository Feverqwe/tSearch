import {createContext} from 'react';

import type RootStore from './RootStore';

export const RootContext = createContext<RootStore>(null!);
