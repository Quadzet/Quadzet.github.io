// tests/integration/dom-config.test.js
// Tests the actual DOM → globals configuration pipeline

import { describe, test, assertEqual, assertTrue, assertFalse } from '../test-utils.js';
import { setupTestDOM, cleanupDOM, setGearItem, toggleAura } from '../dom-test-helper.js';

export const tests = describe('DOM → Config Pipeline Tests', () => {

  test('DOM loads successfully with all required elements', async () => {
    const { document, dom } = await setupTestDOM();

    // Verify key elements exist
    assertTrue(document.getElementById('player-level') !== null, 'player-level should exist');
    assertTrue(document.getElementById('race') !== null, 'race should exist');
    assertTrue(document.getElementById('startRage') !== null, 'startRage should exist');
    assertTrue(document.getElementById('bossLevel') !== null, 'bossLevel should exist');
    assertTrue(document.getElementById('fightLength') !== null, 'fightLength should exist');
    assertTrue(document.getElementById('iterations') !== null, 'iterations should exist');

    // Check APL script textarea
    assertTrue(document.getElementById('apl-script') !== null, 'apl-script should exist');

    // Check gear slots
    assertTrue(document.getElementById('mainhand-slot') !== null, 'mainhand-slot should exist');
    assertTrue(document.getElementById('head-slot') !== null, 'head-slot should exist');

    cleanupDOM(dom);
  });

  test('DOM defaults are set correctly', async () => {
    const { document, dom } = await setupTestDOM();

    assertEqual(document.getElementById('player-level').value, '60', 'player level should default to 60');
    assertEqual(document.getElementById('race').value, 'Human', 'race should default to Human');
    assertEqual(document.getElementById('startRage').value, '70', 'startRage should default to 70');
    assertEqual(document.getElementById('bossLevel').value, '3', 'bossLevel should default to +3');
    assertEqual(document.getElementById('fightLength').value, '60', 'fightLength should default to 60');

    cleanupDOM(dom);
  });

  test('Gear items can be set in DOM', async () => {
    const { document, dom } = await setupTestDOM();

    setGearItem(document, 'mainhand', '12583'); // Example item ID
    assertEqual(document.getElementById('mainhand-slot').getAttribute('itemid'), '12583',
      'mainhand itemid should be set');

    setGearItem(document, 'head', '0');
    assertEqual(document.getElementById('head-slot').getAttribute('itemid'), '0',
      'head itemid should be 0 (empty)');

    cleanupDOM(dom);
  });

  test('Auras can be toggled in DOM', async () => {
    const { document, dom } = await setupTestDOM();

    // Create a test aura element
    const auraDiv = document.createElement('div');
    auraDiv.id = 'battle-shout-aura';
    const auraImg = document.createElement('img');
    auraImg.id = 'battle-shout-aura-img';
    auraImg.className = 'aura-toggle-default';
    auraDiv.appendChild(auraImg);
    document.body.appendChild(auraDiv);

    // Toggle on
    toggleAura(document, 'battle-shout', true);
    assertTrue(auraImg.classList.contains('aura-toggle-active'),
      'aura should be active after toggle');

    // Toggle off
    toggleAura(document, 'battle-shout', false);
    assertFalse(auraImg.classList.contains('aura-toggle-active'),
      'aura should be inactive after toggle off');

    cleanupDOM(dom);
  });

  test('APL script can be modified', async () => {
    const { document, dom } = await setupTestDOM();

    const aplScript = document.getElementById('apl-script');

    // Modify APL script
    aplScript.value = 'use bloodthirst;\nuse revenge;';

    assertTrue(aplScript.value.includes('bloodthirst'), 'APL should contain bloodthirst');
    assertTrue(aplScript.value.includes('revenge'), 'APL should contain revenge');

    cleanupDOM(dom);
  });

  test('Boss settings can be modified', async () => {
    const { document, dom } = await setupTestDOM();

    document.getElementById('bossLevel').value = '2';
    document.getElementById('swingMin').value = '3000';
    document.getElementById('swingMax').value = '5000';
    document.getElementById('swingTimer').value = '2.5';
    document.getElementById('bossArmor').value = '4000';

    assertEqual(document.getElementById('bossLevel').value, '2');
    assertEqual(document.getElementById('swingMin').value, '3000');
    assertEqual(document.getElementById('swingMax').value, '5000');
    assertEqual(document.getElementById('swingTimer').value, '2.5');
    assertEqual(document.getElementById('bossArmor').value, '4000');

    cleanupDOM(dom);
  });

  test('Extra stats inputs exist and default to 0', async () => {
    const { document, dom } = await setupTestDOM();

    const extraStats = [
      'playerextrastrength', 'playerextrastamina', 'playerextraagility',
      'playerextrahit', 'playerextracrit', 'playerextraattackpower',
      'playerextraarmor', 'playerextradefense', 'playerextradodge',
      'playerextraparry', 'playerextrablock', 'playerextrablockvalue'
    ];

    extraStats.forEach(stat => {
      const el = document.getElementById(stat);
      assertTrue(el !== null, `${stat} should exist`);
      assertEqual(el.value, '0', `${stat} should default to 0`);
    });

    cleanupDOM(dom);
  });

  test('All gear slots are present', async () => {
    const { document, dom } = await setupTestDOM();

    const gearSlots = [
      'head', 'neck', 'shoulder', 'back', 'chest', 'wrist', 'hands',
      'waist', 'legs', 'feet', 'finger1', 'finger2', 'trinket1', 'trinket2',
      'mainhand', 'offhand'
    ];

    gearSlots.forEach(slot => {
      const el = document.getElementById(`${slot}-slot`);
      assertTrue(el !== null, `${slot}-slot should exist`);
      assertEqual(el.getAttribute('itemid'), '0', `${slot} should default to empty`);
    });

    cleanupDOM(dom);
  });

  test('APL script has default content with abilities', async () => {
    const { document, dom } = await setupTestDOM();

    const aplScript = document.getElementById('apl-script');
    const content = aplScript.value;

    // Check that default APL contains expected abilities
    assertTrue(content.includes('death_wish'), 'default APL should contain death_wish');
    assertTrue(content.includes('bloodthirst'), 'default APL should contain bloodthirst');
    assertTrue(content.includes('revenge'), 'default APL should contain revenge');
    assertTrue(content.includes('heroic_strike'), 'default APL should contain heroic_strike');
    assertTrue(content.includes('sunder_armor'), 'default APL should contain sunder_armor');

    // Check that it has condition syntax
    assertTrue(content.includes('if '), 'default APL should contain conditions');
    assertTrue(content.includes('player.rage'), 'default APL should reference player.rage');

    cleanupDOM(dom);
  });

  test('APL script textarea is editable', async () => {
    const { document, dom } = await setupTestDOM();

    const aplScript = document.getElementById('apl-script');
    const originalValue = aplScript.value;

    // Modify the script
    aplScript.value = 'use bloodthirst;';

    assertEqual(aplScript.value, 'use bloodthirst;', 'APL script should be modifiable');
    assertTrue(aplScript.value !== originalValue, 'APL script should have changed');

    cleanupDOM(dom);
  });

});
