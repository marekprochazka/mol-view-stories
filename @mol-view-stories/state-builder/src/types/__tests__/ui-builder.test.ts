import { describe, test, expect } from 'vitest';
import {
  createConstantRef,
  createEmptyConstant,
  createEmptyNode,
  isConstantRef,
  mvsNodeToUINode,
  mvsTreeToUINodes,
  uiNodeToMVSNode,
  uiNodesToMVSTree,
  type RawMVSNode,
  type RawMVSTree,
  type UINode,
} from '../ui-builder';

describe('UI Builder Types', () => {
  describe('isConstantRef', () => {
    test('returns true for valid ConstantRef object', () => {
      const ref = {
        __constantRef: true as const,
        constantName: 'Colors',
        entryKey: 'primary',
      };
      expect(isConstantRef(ref)).toBe(true);
    });

    test('returns false for null and undefined', () => {
      expect(isConstantRef(null)).toBe(false);
      expect(isConstantRef(undefined)).toBe(false);
    });

    test('returns false for primitive values', () => {
      expect(isConstantRef('string')).toBe(false);
      expect(isConstantRef(123)).toBe(false);
      expect(isConstantRef(true)).toBe(false);
    });

    test('returns false for objects without __constantRef marker', () => {
      expect(isConstantRef({})).toBe(false);
      expect(isConstantRef({ foo: 'bar' })).toBe(false);
      expect(isConstantRef({ constantName: 'Colors', entryKey: 'primary' })).toBe(false);
    });

    test('returns false when __constantRef is false', () => {
      expect(
        isConstantRef({
          __constantRef: false,
          constantName: 'Colors',
          entryKey: 'primary',
        })
      ).toBe(false);
    });

    test('returns false for arrays', () => {
      expect(isConstantRef([])).toBe(false);
      expect(isConstantRef([1, 2, 3])).toBe(false);
    });
  });

  describe('createConstantRef', () => {
    test('creates object that passes isConstantRef', () => {
      const ref = createConstantRef('Colors', 'primary');
      expect(isConstantRef(ref)).toBe(true);
    });

    test('stores constantName and entryKey correctly', () => {
      const ref = createConstantRef('MyConstants', 'value');
      expect(ref.constantName).toBe('MyConstants');
      expect(ref.entryKey).toBe('value');
    });

    test('handles empty strings', () => {
      const ref = createConstantRef('', '');
      expect(isConstantRef(ref)).toBe(true);
      expect(ref.constantName).toBe('');
      expect(ref.entryKey).toBe('');
    });
  });

  describe('createEmptyConstant', () => {
    test('creates constant with specified type', () => {
      expect(createEmptyConstant('colors').type).toBe('colors');
      expect(createEmptyConstant('urls').type).toBe('urls');
      expect(createEmptyConstant('generic').type).toBe('generic');
    });

    test('defaults to generic type', () => {
      expect(createEmptyConstant().type).toBe('generic');
    });

    test('initializes with empty name and entries', () => {
      const constant = createEmptyConstant('colors');
      expect(constant.name).toBe('');
      expect(constant.entries).toEqual([]);
    });

    test('generates unique IDs', () => {
      const ids = new Set([
        createEmptyConstant().id,
        createEmptyConstant().id,
        createEmptyConstant().id,
      ]);
      expect(ids.size).toBe(3);
    });
  });

  describe('createEmptyNode', () => {
    test('creates node with specified kind or empty default', () => {
      expect(createEmptyNode().kind).toBe('');
      expect(createEmptyNode('download').kind).toBe('download');
    });

    test('initializes with empty params and children', () => {
      const node = createEmptyNode();
      expect(node.params).toEqual({});
      expect(node.children).toEqual([]);
    });

    test('generates unique IDs', () => {
      const ids = new Set([
        createEmptyNode().id,
        createEmptyNode().id,
        createEmptyNode().id,
      ]);
      expect(ids.size).toBe(3);
    });

    test('does not set optional properties', () => {
      const node = createEmptyNode();
      expect(node.ref).toBeUndefined();
      expect(node.custom).toBeUndefined();
    });
  });

  describe('mvsNodeToUINode', () => {
    test('converts simple node with ID', () => {
      const mvsNode: RawMVSNode = {
        kind: 'download',
        params: { url: 'https://example.com/file.cif' },
      };
      const uiNode = mvsNodeToUINode(mvsNode);

      expect(uiNode.id).toBeTruthy();
      expect(uiNode.kind).toBe('download');
      expect(uiNode.params).toEqual({ url: 'https://example.com/file.cif' });
    });

    test('preserves ref and custom properties', () => {
      const mvsNode: RawMVSNode = {
        kind: 'color',
        params: { color: '#FF0000' },
        ref: 'myColor',
        custom: { colorTheme: 'chain-id' },
      };
      const uiNode = mvsNodeToUINode(mvsNode);

      expect(uiNode.ref).toBe('myColor');
      expect(uiNode.custom).toEqual({ colorTheme: 'chain-id' });
    });

    test('converts children recursively', () => {
      const mvsNode: RawMVSNode = {
        kind: 'download',
        params: { url: '' },
        children: [
          {
            kind: 'parse',
            params: { format: 'bcif' },
            children: [
              { kind: 'structure', params: { type: 'model' } },
            ],
          },
        ],
      };
      const uiNode = mvsNodeToUINode(mvsNode);

      expect(uiNode.children).toHaveLength(1);
      expect(uiNode.children![0].kind).toBe('parse');
      expect(uiNode.children![0].children).toHaveLength(1);
      expect(uiNode.children![0].children![0].kind).toBe('structure');
    });

    test('generates unique IDs for all nodes', () => {
      const mvsNode: RawMVSNode = {
        kind: 'download',
        children: [{ kind: 'parse', children: [{ kind: 'structure' }] }],
      };
      const uiNode = mvsNodeToUINode(mvsNode);

      const ids = new Set<string>();
      function collectIds(node: UINode) {
        ids.add(node.id);
        node.children?.forEach(collectIds);
      }
      collectIds(uiNode);

      expect(ids.size).toBe(3);
    });

    test('handles missing params', () => {
      const mvsNode: RawMVSNode = { kind: 'download' };
      const uiNode = mvsNodeToUINode(mvsNode);

      expect(uiNode.params).toEqual({});
    });
  });

  describe('mvsTreeToUINodes', () => {
    test('converts tree children to UINodes', () => {
      const tree: RawMVSTree = {
        kind: 'root',
        children: [
          { kind: 'download', params: { url: 'a' } },
          { kind: 'download', params: { url: 'b' } },
        ],
      };
      const nodes = mvsTreeToUINodes(tree);

      expect(nodes).toHaveLength(2);
      expect(nodes[0].kind).toBe('download');
      expect(nodes[0].params).toEqual({ url: 'a' });
      expect(nodes[1].params).toEqual({ url: 'b' });
    });

    test('returns empty array for tree without children', () => {
      const tree: RawMVSTree = { kind: 'root' };
      expect(mvsTreeToUINodes(tree)).toEqual([]);
    });

    test('each node gets unique ID', () => {
      const tree: RawMVSTree = {
        kind: 'root',
        children: [
          { kind: 'download' },
          { kind: 'download' },
        ],
      };
      const nodes = mvsTreeToUINodes(tree);

      expect(nodes[0].id).not.toBe(nodes[1].id);
    });
  });

  describe('uiNodeToMVSNode', () => {
    test('strips ID from node', () => {
      const uiNode: UINode = {
        id: 'test-id-123',
        kind: 'download',
        params: { url: 'https://example.com' },
      };
      const mvsNode = uiNodeToMVSNode(uiNode);

      expect(mvsNode).not.toHaveProperty('id');
      expect(mvsNode.kind).toBe('download');
      expect(mvsNode.params).toEqual({ url: 'https://example.com' });
    });

    test('preserves ref and custom when present', () => {
      const uiNode: UINode = {
        id: 'test',
        kind: 'color',
        params: {},
        ref: 'myRef',
        custom: { theme: 'custom' },
      };
      const mvsNode = uiNodeToMVSNode(uiNode);

      expect(mvsNode.ref).toBe('myRef');
      expect(mvsNode.custom).toEqual({ theme: 'custom' });
    });

    test('omits ref and custom when undefined', () => {
      const uiNode: UINode = {
        id: 'test',
        kind: 'download',
        params: {},
      };
      const mvsNode = uiNodeToMVSNode(uiNode);

      expect(mvsNode).not.toHaveProperty('ref');
      expect(mvsNode).not.toHaveProperty('custom');
    });

    test('converts children recursively', () => {
      const uiNode: UINode = {
        id: 'root',
        kind: 'download',
        params: {},
        children: [
          {
            id: 'child1',
            kind: 'parse',
            params: { format: 'bcif' },
            children: [
              { id: 'grandchild', kind: 'structure', params: {} },
            ],
          },
        ],
      };
      const mvsNode = uiNodeToMVSNode(uiNode);

      expect(mvsNode.children).toHaveLength(1);
      expect(mvsNode.children![0]).not.toHaveProperty('id');
      expect(mvsNode.children![0].kind).toBe('parse');
      expect(mvsNode.children![0].children![0]).not.toHaveProperty('id');
    });

    test('omits children when empty', () => {
      const uiNode: UINode = {
        id: 'test',
        kind: 'color',
        params: {},
        children: [],
      };
      const mvsNode = uiNodeToMVSNode(uiNode);

      expect(mvsNode).not.toHaveProperty('children');
    });
  });

  describe('uiNodesToMVSTree', () => {
    test('wraps nodes in root', () => {
      const nodes: UINode[] = [
        { id: '1', kind: 'download', params: { url: 'a' } },
        { id: '2', kind: 'download', params: { url: 'b' } },
      ];
      const tree = uiNodesToMVSTree(nodes);

      expect(tree.kind).toBe('root');
      expect(tree.params).toEqual({});
      expect(tree.children).toHaveLength(2);
      expect(tree.children![0]).not.toHaveProperty('id');
    });

    test('handles empty node array', () => {
      const tree = uiNodesToMVSTree([]);

      expect(tree.kind).toBe('root');
      expect(tree.children).toEqual([]);
    });
  });

  describe('roundtrip conversion', () => {
    test('MVS → UI → MVS preserves structure', () => {
      const originalTree: RawMVSTree = {
        kind: 'root',
        children: [
          {
            kind: 'download',
            params: { url: 'https://example.com/file.cif' },
            ref: 'myDownload',
            children: [
              {
                kind: 'parse',
                params: { format: 'mmcif' },
                children: [
                  { kind: 'structure', params: { type: 'model' } },
                ],
              },
            ],
          },
        ],
      };

      const uiNodes = mvsTreeToUINodes(originalTree);
      const resultTree = uiNodesToMVSTree(uiNodes);

      // Root params might differ but children should match
      expect(resultTree.kind).toBe('root');
      expect(resultTree.children).toEqual(originalTree.children);
    });
  });
});
