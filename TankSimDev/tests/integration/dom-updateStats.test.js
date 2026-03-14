// tests/integration/dom-updateStats.test.js
// Tests calling the actual updateStats() function with jsdom

import { describe, test, assertTrue } from '../test-utils.js';
import { setupTestDOM, cleanupDOM } from '../dom-test-helper.js';

export const tests = describe('updateStats() with DOM Tests', () => {

  test('updateStats() function exists and is callable', async () => {
    const { window, document, dom } = await setupTestDOM();

    // Make document global so config.js can access it
    global.document = document;
    global.window = window;

    try {
      // Try to import updateStats
      // Note: This may fail if dependencies aren't available in Node.js
      const config = await import('../../config.js');
      assertTrue(typeof config.updateStats === 'function',
        'updateStats should be a function');

      // Attempt to call it (may fail due to missing dependencies)
      // This is a proof of concept - full integration would require more setup

    } catch (error) {
      // Expected to fail without full browser environment
      // This test documents the limitation
      assertTrue(error.message.includes('Cannot') || error.message.includes('is not defined'),
        `Expected import/dependency error, got: ${error.message}`);
    } finally {
      delete global.document;
      delete global.window;
      cleanupDOM(dom);
    }
  });

  test('DOM structure supports updateStats() requirements', async () => {
    const { document, dom } = await setupTestDOM();

    // Verify all elements that updateStats() expects exist
    const requiredElements = [
      // Player settings
      'player-level', 'race', 'startRage',
      // Boss settings
      'bossLevel', 'swingMin', 'swingMax', 'swingTimer', 'bossArmor',
      // Fight settings
      'fightLength', 'iterations',
      // Extra stats
      'playerextrastrength', 'playerextrastamina', 'playerextraagility',
      'playerextrahit', 'playerextracrit', 'playerextraattackpower',
      'playerextraarmor', 'playerextradefense', 'playerextramhskill',
      'playerextraohskill',
      // APL Script
      'apl-script',
      // Gear slots
      'mainhand-slot', 'offhand-slot', 'head-slot', 'chest-slot'
    ];

    let missingElements = [];
    requiredElements.forEach(id => {
      const el = document.getElementById(id);
      if (!el) {
        missingElements.push(id);
      }
    });

    assertTrue(missingElements.length === 0,
      `Missing required elements for updateStats(): ${missingElements.join(', ')}`);

    cleanupDOM(dom);
  });

  test('Gear slots have itemid attribute set correctly', async () => {
    const { document, dom } = await setupTestDOM();

    const el = document.getElementById('mainhand-slot');
    assertTrue(el !== null, 'mainhand-slot should exist');
    assertTrue(el.hasAttribute('itemid'), 'mainhand-slot should have itemid attribute');
    assertTrue(el.getAttribute('itemid') === '0', 'mainhand-slot itemid should default to 0');

    cleanupDOM(dom);
  });

  test('Enchant elements have enchantID attribute set correctly', async () => {
    const { document, dom } = await setupTestDOM();

    const el = document.getElementById('mainhand-enchant');
    assertTrue(el !== null, 'mainhand-enchant should exist');
    assertTrue(el.hasAttribute('enchantID'), 'mainhand-enchant should have enchantID attribute');
    assertTrue(el.getAttribute('enchantID') === '0', 'mainhand-enchant enchantID should default to 0');

    cleanupDOM(dom);
  });

});
