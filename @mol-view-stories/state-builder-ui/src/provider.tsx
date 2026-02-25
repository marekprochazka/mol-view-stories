import { createStore, Provider as JotaiProvider } from 'jotai';
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import type { PluginUIContext } from 'molstar/lib/mol-plugin-ui/context';
import type { CameraParams, AnimationParams, UINode, ConstantDefinition } from '@mol-view-stories/state-builder/src';
import {
  SceneKeyAtom, CameraSnapshotAtom, PluginAtom,
  UIBuilderNodesAtom, UIBuilderConstantsAtom, UIBuilderCameraAtom, UIBuilderAnimationAtom
} from './state/atoms';
import { NotificationContext, type NotifyFn } from './state/notifications';
import { CodeGenContext } from './state/codegen-context';

export interface UIBuilderSnapshot {
  nodes: UINode[];
  constants: ConstantDefinition[];
  camera: CameraParams | null;
  animation: AnimationParams | null;
}

export interface UIBuilderHandle {
  setCamera: (camera: CameraParams) => void;
  getState: () => UIBuilderSnapshot;
}

export interface UIBuilderProviderProps {
  children: React.ReactNode;
  sceneKey?: string;
  plugin?: PluginUIContext | null;
  cameraSnapshot?: unknown;
  onCodeGenerated?: (code: string) => void;
  onNotification?: NotifyFn;
  initialState?: Partial<UIBuilderSnapshot>;
}

export const UIBuilderProvider = forwardRef<UIBuilderHandle, UIBuilderProviderProps>(
  ({ children, sceneKey = 'default', plugin, cameraSnapshot, onCodeGenerated, onNotification, initialState }, ref) => {
    const storeRef = useRef(createStore());
    const store = storeRef.current;

    // Sync props to atoms
    useEffect(() => { store.set(SceneKeyAtom, sceneKey); }, [store, sceneKey]);
    useEffect(() => { store.set(CameraSnapshotAtom, cameraSnapshot ?? null); }, [store, cameraSnapshot]);
    useEffect(() => { store.set(PluginAtom, plugin ?? null); }, [store, plugin]);

    // Apply initialState
    useEffect(() => {
      if (!initialState) return;
      const key = sceneKey;
      if (initialState.nodes) store.set(UIBuilderNodesAtom, { [key]: initialState.nodes });
      if (initialState.constants) store.set(UIBuilderConstantsAtom, { [key]: initialState.constants });
      if (initialState.camera !== undefined) store.set(UIBuilderCameraAtom, { [key]: initialState.camera });
      if (initialState.animation !== undefined) store.set(UIBuilderAnimationAtom, { [key]: initialState.animation });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // intentionally run only once on mount

    useImperativeHandle(ref, () => ({
      setCamera: (camera: CameraParams) => {
        const key = store.get(SceneKeyAtom);
        const allCameras = store.get(UIBuilderCameraAtom);
        store.set(UIBuilderCameraAtom, { ...allCameras, [key]: camera });
      },
      getState: () => {
        const key = store.get(SceneKeyAtom);
        return {
          nodes: (store.get(UIBuilderNodesAtom)[key] || []) as UINode[],
          constants: (store.get(UIBuilderConstantsAtom)[key] || []) as ConstantDefinition[],
          camera: store.get(UIBuilderCameraAtom)[key] || null,
          animation: store.get(UIBuilderAnimationAtom)[key] || null,
        };
      },
    }));

    return (
      <JotaiProvider store={store}>
        <NotificationContext.Provider value={onNotification ?? null}>
          <CodeGenContext.Provider value={onCodeGenerated ?? null}>
            {children}
          </CodeGenContext.Provider>
        </NotificationContext.Provider>
      </JotaiProvider>
    );
  }
);
UIBuilderProvider.displayName = 'UIBuilderProvider';
