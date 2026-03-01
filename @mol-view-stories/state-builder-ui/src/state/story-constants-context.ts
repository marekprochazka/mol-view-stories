import { createContext, useContext } from 'react';
import type { ConstantDefinition } from '@mol-view-stories/state-builder/src';

interface StoryConstantsContextValue {
  storyConstants: ConstantDefinition[];
  onStoryConstantsChange: ((c: ConstantDefinition[]) => void) | null;
}

export const StoryConstantsContext = createContext<StoryConstantsContextValue>({
  storyConstants: [],
  onStoryConstantsChange: null,
});

export const useStoryConstants = () => useContext(StoryConstantsContext);
