import { createContext, useContext } from 'react';
import type { UIBuilderSnapshot } from '../provider';

export type StateChangeFn = (snapshot: UIBuilderSnapshot) => void;
export const StateChangeContext = createContext<StateChangeFn | null>(null);
export const useStateChangeCallback = () => useContext(StateChangeContext);
