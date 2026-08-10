import * as api from '../src/index';
import { greet } from '../src/index';

describe('public API', () => {
  // Pins the exported surface. Update deliberately when you add an export, so
  // nothing leaks out of the package by accident.
  test('exports exactly greet', () => {
    expect(Object.keys(api).sort()).toEqual(['greet']);
  });
});

describe('greet', () => {
  test('greets a name', () => {
    expect(greet('Ada')).toBe('Hello, Ada!');
  });

  test('rejects a blank name', () => {
    expect(() => greet('   ')).toThrow('Invalid name: must not be blank.');
  });

  test('rejects an empty string', () => {
    expect(() => greet('')).toThrow('Invalid name: must not be blank.');
  });
});
