// tests/unit/attacktable.test.js
// Unit tests for attack table calculations

import { describe, test, assertEqual, assertClose, seedRandom } from '../test-utils.js';
import {
  armorReduction,
  getPlayerMissChance,
  getParryHastedSwingEnd,
  getGlanceMod,
  spellMiss,
  rollAttack
} from '../../attacktable.js';

export const tests = describe('attacktable.js', () => {

  test('armorReduction: level 60 with 5000 armor', () => {
    const result = armorReduction(60, 5000);
    assertClose(result, 0.47619, 0.0001, 'Armor reduction calculation incorrect');
  });

  test('armorReduction: caps at 0.75', () => {
    const result = armorReduction(60, 999999);
    assertEqual(result, 0.75, 'Armor reduction should cap at 0.75');
  });

  test('armorReduction: zero armor', () => {
    const result = armorReduction(60, 0);
    assertEqual(result, 0, 'Zero armor should give zero reduction');
  });

  test('armorReduction: level 63 boss with 3731 armor', () => {
    const result = armorReduction(63, 3731);
    assertClose(result, 0.3933, 0.0001, 'Boss armor reduction incorrect');
  });


  test('getPlayerMissChance: equal skills, no hit bonus', () => {
    const result = getPlayerMissChance(300, 300, 0, false);
    assertClose(result, 5.0, 0.01, 'Base miss chance should be 5%');
  });

  test('getPlayerMissChance: 5 defense difference, no hit', () => {
    const result = getPlayerMissChance(300, 305, 0, false);
    assertClose(result, 5.5, 0.01, 'Miss chance with defense diff incorrect');
  });

  test('getPlayerMissChance: defense diff > 10', () => {
    const result = getPlayerMissChance(300, 315, 0, false);
    assertClose(result, 8.0, 0.01, 'Miss chance with large defense diff incorrect');
  });

  test('getPlayerMissChance: dual wield adds 19%', () => {
    const result = getPlayerMissChance(300, 300, 0, true);
    assertClose(result, 24.0, 0.01, 'Dual wield penalty not applied');
  });

  test('getPlayerMissChance: hit rating reduces miss chance', () => {
    const result = getPlayerMissChance(300, 305, 4, false);
    assertClose(result, 1.5, 0.01, 'Hit rating should reduce miss chance');
  });

  test('getPlayerMissChance: negative miss floored at 0', () => {
    const result = getPlayerMissChance(315, 300, 10, false);
    assertEqual(result, 0, 'Miss chance cannot be negative');
  });


  test('getParryHastedSwingEnd: >60% remaining', () => {
    const result = getParryHastedSwingEnd(0, 2000, 100);
    assertClose(result, 1428.57, 1, 'Parry haste >60% formula incorrect');
  });

  test('getParryHastedSwingEnd: 20-60% remaining', () => {
    const result = getParryHastedSwingEnd(0, 2000, 1000);
    assertClose(result, 1538.46, 1, 'Parry haste 20-60% formula incorrect');
  });

  test('getParryHastedSwingEnd: <20% remaining', () => {
    const result = getParryHastedSwingEnd(0, 2000, 1700);
    assertEqual(result, 2000, 'Parry haste <20% should return end unchanged');
  });

  test('getParryHastedSwingEnd: edge case at exactly 60%', () => {
    const result = getParryHastedSwingEnd(0, 2000, 800);
    assertClose(result, 1428.57, 1, 'Parry haste at 60% threshold');
  });


  test('getGlanceMod: weapon skill >= defense', () => {
    const result = getGlanceMod(315, 315);
    assertClose(result, 0.95, 0.01, 'Glance mod at equal skill');
  });

  test('getGlanceMod: weapon skill < defense', () => {
    const cleanup = seedRandom(12345);
    const seededResult = getGlanceMod(300, 315);
    cleanup();
    assertClose(seededResult, 0.75, 0.15, 'Glance mod with skill deficit');
  });


  test('spellMiss: level difference 0', () => {
    const result = spellMiss(0);
    assertEqual(result, 0.04, 'Same level spell miss should be 4%');
  });

  test('spellMiss: level difference 3 (boss)', () => {
    const result = spellMiss(3);
    assertEqual(result, 0.17, 'Level 63 boss spell miss should be 17%');
  });

  test('spellMiss: level difference -2', () => {
    const result = spellMiss(-2);
    assertEqual(result, 0.02, 'Lower level target spell miss');
  });

  test('spellMiss: level difference 1', () => {
    const result = spellMiss(1);
    assertEqual(result, 0.05, 'Level +1 spell miss should be 5%');
  });

});
