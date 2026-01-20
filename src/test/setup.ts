import '@testing-library/jest-dom';
import { afterEach } from 'vitest';

// Mock random for deterministic tests
export function mockRandom(seed: number) {
  let s = seed;
  return () => {
    s = Math.sin(s) * 10000;
    return s - Math.floor(s);
  };
}

// Reset random after each test
afterEach(() => {
  // Restore Math.random if it was mocked
  if ((Math.random as any).__mocked) {
    Math.random = (Math.random as any).__original;
  }
});
