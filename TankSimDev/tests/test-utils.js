import assert from 'node:assert';

let currentSuite = null;

export function describe(suiteName, setupFn) {
  const suite = { name: suiteName, tests: [] };
  currentSuite = suite;
  setupFn();
  currentSuite = null;
  return suite;
}

export function test(name, fn) {
  if (!currentSuite) {
    throw new Error('test() must be called inside describe()');
  }
  currentSuite.tests.push({ name, fn });
}

// Helper to capture console.log output
export function captureConsoleLog(fn, logs) {
  const originalLog = console.log;
  console.log = (...args) => logs.push(args.join(' '));

  try {
    var result = fn();
  } finally {
    console.log = originalLog;
  }

  return result;
}

export function assertEqual(actual, expected, message = '', logs = []) {
  try {
    assert.strictEqual(actual, expected);
  } catch (err) {
    const msg = message || `Assertion failed`;
    const logOutput = logs.length > 0 ? `\n  Captured logs:\n    ${logs.join('\n    ')}` : '';
    throw new Error(
      `${msg}\n  Expected: ${JSON.stringify(expected)}\n  Actual:   ${JSON.stringify(actual)}${logOutput}`
    );
  }
}

export function assertClose(actual, expected, tolerance = 0.0001, message = '', logs = []) {
  if (typeof actual !== 'number' || typeof expected !== 'number') {
    throw new Error('assertClose requires numeric values');
  }

  const diff = Math.abs(actual - expected);
  if (diff > tolerance) {
    const msg = message || `Values not close enough`;
    const logOutput = logs.length > 0 ? `\n  Captured logs:\n    ${logs.join('\n    ')}` : '';
    throw new Error(
      `${msg}\n  Expected: ${expected} ± ${tolerance}\n  Actual:   ${actual}\n  Diff:     ${diff}${logOutput}`
    );
  }
}

export function assertTrue(value, message = '', logs = []) {
  if (!value) {
    const msg = message || `Expected truthy value`;
    const logOutput = logs.length > 0 ? `\n  Captured logs:\n    ${logs.join('\n    ')}` : '';
    throw new Error(
      `${msg}\n  Got: ${JSON.stringify(value)}${logOutput}`
    );
  }
}

export function assertFalse(value, message = '', logs = []) {
  if (value) {
    const msg = message || `Expected falsy value`;
    const logOutput = logs.length > 0 ? `\n  Captured logs:\n    ${logs.join('\n    ')}` : '';
    throw new Error(
      `${msg}\n  Got: ${JSON.stringify(value)}${logOutput}`
    );
  }
}

export function assertThrows(fn, errorPattern, message = '', logs = []) {
  let threw = false;
  let caughtError = null;

  try {
    fn();
  } catch (err) {
    threw = true;
    caughtError = err;
  }

  if (!threw) {
    const msg = message || `Expected function to throw`;
    const logOutput = logs.length > 0 ? `\n  Captured logs:\n    ${logs.join('\n    ')}` : '';
    throw new Error(`${msg}\n  Function did not throw an error${logOutput}`);
  }

  if (errorPattern) {
    const pattern = errorPattern instanceof RegExp ? errorPattern : new RegExp(errorPattern);
    if (!pattern.test(caughtError.message)) {
      const msg = message || `Error message did not match pattern`;
      const logOutput = logs.length > 0 ? `\n  Captured logs:\n    ${logs.join('\n    ')}` : '';
      throw new Error(
        `${msg}\n  Expected pattern: ${pattern}\n  Actual message:   ${caughtError.message}${logOutput}`
      );
    }
  }
}

export function assertArrayEqual(actual, expected, message = '', logs = []) {
  try {
    assert.deepStrictEqual(actual, expected);
  } catch (err) {
    const msg = message || `Arrays not equal`;
    const logOutput = logs.length > 0 ? `\n  Captured logs:\n    ${logs.join('\n    ')}` : '';
    throw new Error(
      `${msg}\n  Expected: ${JSON.stringify(expected)}\n  Actual:   ${JSON.stringify(actual)}${logOutput}`
    );
  }
}

let originalRandom = Math.random;

function mulberry32(seed) {
  return function() {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

export function seedRandom(seed) {
  if (typeof seed !== 'number' || !Number.isInteger(seed)) {
    throw new Error('seedRandom requires an integer seed');
  }

  originalRandom = Math.random;
  Math.random = mulberry32(seed);

  return () => {
    Math.random = originalRandom;
  };
}

export function resetRandom() {
  Math.random = originalRandom;
}
