import { atom } from 'jotai';
import type { AnimationParams, CameraParams } from '@mol-view-stories/state-builder/src';
import type { UINode, ConstantDefinition } from '@mol-view-stories/state-builder/src';

export const SceneKeyAtom = atom<string>('default');
export const CameraSnapshotAtom = atom<unknown>(null);
export const PluginAtom = atom<unknown>(null);

export const UIBuilderNodesAtom = atom<Record<string, UINode[]>>({});
export const UIBuilderConstantsAtom = atom<Record<string, ConstantDefinition[]>>({});
export const UIBuilderCameraAtom = atom<Record<string, CameraParams | null>>({});
export const UIBuilderAnimationAtom = atom<Record<string, AnimationParams | null>>({});
