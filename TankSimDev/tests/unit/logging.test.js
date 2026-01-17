import { describe, test, captureConsoleLog, assertEqual, assertTrue } from '../test-utils.js';
import { LOG_LEVEL, LOG_LEVEL_CUTOFF, log_message } from '../../logging.js';

export const tests = describe('logging.js', () => {

  test('LOG_LEVEL: INFO has correct properties', () => {
    assertEqual(LOG_LEVEL.INFO.level, 0, 'INFO level should be 0');
    assertEqual(LOG_LEVEL.INFO.prefix, '[i] ', 'INFO prefix should be [i] ');
  });

  test('LOG_LEVEL: WARNING has correct properties', () => {
    assertEqual(LOG_LEVEL.WARNING.level, 1, 'WARNING level should be 1');
    assertEqual(LOG_LEVEL.WARNING.prefix, '[w] ', 'WARNING prefix should be [w] ');
  });

  test('LOG_LEVEL: ERROR has correct properties', () => {
    assertEqual(LOG_LEVEL.ERROR.level, 2, 'ERROR level should be 2');
    assertEqual(LOG_LEVEL.ERROR.prefix, '[e] ', 'ERROR prefix should be [e] ');
  });

  test('LOG_LEVEL_CUTOFF: set to INFO by default', () => {
    assertEqual(LOG_LEVEL_CUTOFF, LOG_LEVEL.INFO, 'Default cutoff should be INFO to suppress noisy logs');
  });

  test('log_message: logs WARNING message', () => {
    let logs = [];
    captureConsoleLog(() => {
      log_message(LOG_LEVEL.WARNING, 'Test warning message');
    }, logs);

    assertEqual(logs.length, 1, 'Should log one message');
    assertEqual(logs[0], '[w] Test warning message', 'Should have correct prefix and message');
  });

  test('log_message: logs ERROR message', () => {
    let logs = [];
    captureConsoleLog(() => {
      log_message(LOG_LEVEL.ERROR, 'Test error message');
    }, logs);

    assertEqual(logs.length, 1, 'Should log one message');
    assertEqual(logs[0], '[e] Test error message', 'Should have correct prefix and message');
  });

  test('log_message: handles empty message', () => {
    let logs = [];
    captureConsoleLog(() => {
      log_message(LOG_LEVEL.INFO, '');
    }, logs);

    assertEqual(logs.length, 1, 'Should log one message');
    assertEqual(logs[0], '[i] ', 'Should log just the prefix');
  });

  test('log_message: handles multiline message', () => {
    let logs = [];
    captureConsoleLog(() => {
      log_message(LOG_LEVEL.INFO, 'Line 1\nLine 2');
    }, logs);

    assertEqual(logs.length, 1, 'Should log one message');
    assertTrue(logs[0].includes('Line 1\nLine 2'), 'Should preserve newlines');
  });

});
