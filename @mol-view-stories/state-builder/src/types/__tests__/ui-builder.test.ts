import { describe, test, expect } from 'vitest';
import {
  createConstantRef,
  createEmptyConstant,
  createEmptyNode,
  isConstantRef,
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
});
