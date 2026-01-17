import { describe, test, assertEqual, assertTrue, assertFalse } from '../test-utils.js';
import { getBasicGlobals, getBasicTankStats, getBasicBossStats, getBasicConfig } from '../sim-fixtures.js';

export const tests = describe('Config Validation Tests', () => {

  function validateTankStats(stats, context = '') {
    const required = [
      'type', 'level', 'agility', 'strength', 'stamina', 'crit', 'hit', 'attackpower',
      'haste', 'defense', 'armor', 'parry', 'dodge', 'block', 'blockvalue', 'health',
      'staminaMod', 'strengthMod', 'agilityMod', 'armorMod', 'damageMod', 'threatMod',
      'mainhand', 'offhand', 'mhskill', 'ohskill', 'wield', 'gear', 'rotation', 'talents',
      'bonuses', 'procs'
    ];

    const errors = [];

    for (const field of required) {
      if (!(field in stats)) {
        errors.push(`Missing field: ${field}`);
      } else if (stats[field] === undefined) {
        errors.push(`Undefined field: ${field}`);
      } else if (stats[field] === null && !['offhand'].includes(field)) {
        errors.push(`Null field: ${field}`);
      } else if (typeof stats[field] === 'number' && !isFinite(stats[field])) {
        errors.push(`Invalid number in field: ${field} = ${stats[field]}`);
      }
    }

    // Validate nested objects
    if (stats.mainhand) {
      if (!stats.mainhand.mindmg || !stats.mainhand.maxdmg || !stats.mainhand.swingtimer) {
        errors.push('mainhand missing required fields (mindmg, maxdmg, swingtimer)');
      }
    }

    if (stats.gear && typeof stats.gear === 'object') {
      const gearSlots = ['head', 'neck', 'shoulder', 'back', 'chest', 'wrist', 'hands',
                        'waist', 'legs', 'feet', 'finger1', 'finger2', 'mainhand', 'offhand'];
      for (const slot of gearSlots) {
        if (!(slot in stats.gear)) {
          errors.push(`gear missing slot: ${slot}`);
        }
      }
    }

    if (stats.rotation && typeof stats.rotation === 'object') {
      const abilities = ['bloodthirst', 'heroic-strike', 'death-wish', 'revenge', 'sunder-armor'];
      for (const ability of abilities) {
        if (stats.rotation[ability]) {
          if (!('use' in stats.rotation[ability])) {
            errors.push(`rotation[${ability}] missing 'use' field`);
          }
          if (!('rage' in stats.rotation[ability])) {
            errors.push(`rotation[${ability}] missing 'rage' field`);
          }
        }
      }
    }

    if (stats.talents && typeof stats.talents === 'object') {
      const talents = ['bloodthirst', 'defiance', 'flurry', 'enrage', 'cruelty'];
      for (const talent of talents) {
        if (!(talent in stats.talents)) {
          errors.push(`talents missing: ${talent}`);
        }
      }
    }

    if (errors.length > 0) {
      throw new Error(`Tank stats validation failed ${context}:\n  ${errors.join('\n  ')}`);
    }
  }

  function validateBossStats(stats, context = '') {
    const required = [
      'type', 'level', 'health', 'armor', 'defense', 'dodge', 'parry', 'attackpower',
      'crit', 'mainhand', 'mhskill', 'wield'
    ];

    const errors = [];

    for (const field of required) {
      if (!(field in stats)) {
        errors.push(`Missing field: ${field}`);
      } else if (stats[field] === undefined) {
        errors.push(`Undefined field: ${field}`);
      } else if (typeof stats[field] === 'number' && !isFinite(stats[field])) {
        errors.push(`Invalid number in field: ${field} = ${stats[field]}`);
      }
    }

    if (stats.mainhand) {
      if (!stats.mainhand.mindmg || !stats.mainhand.maxdmg || !stats.mainhand.swingtimer) {
        errors.push('mainhand missing required fields (mindmg, maxdmg, swingtimer)');
      }
    }

    if (errors.length > 0) {
      throw new Error(`Boss stats validation failed ${context}:\n  ${errors.join('\n  ')}`);
    }
  }

  function validateConfig(config, context = '') {
    const required = ['simDuration', 'iterations'];
    const errors = [];

    for (const field of required) {
      if (!(field in config)) {
        errors.push(`Missing field: ${field}`);
      } else if (typeof config[field] !== 'number') {
        errors.push(`${field} must be a number, got ${typeof config[field]}`);
      } else if (config[field] <= 0) {
        errors.push(`${field} must be positive, got ${config[field]}`);
      }
    }

    if (errors.length > 0) {
      throw new Error(`Config validation failed ${context}:\n  ${errors.join('\n  ')}`);
    }
  }

  function validateGlobals(globals, context = '') {
    assertTrue('tankStats' in globals, `${context}: globals missing tankStats`);
    assertTrue('bossStats' in globals, `${context}: globals missing bossStats`);
    assertTrue('config' in globals, `${context}: globals missing config`);

    validateTankStats(globals.tankStats, `${context} (tankStats)`);
    validateBossStats(globals.bossStats, `${context} (bossStats)`);
    validateConfig(globals.config, `${context} (config)`);
  }


  test('Fixture globals have valid structure', () => {
    const globals = getBasicGlobals(1, 60);
    validateGlobals(globals, 'fixture');
  });

  test('Tank stats: numeric fields are finite', () => {
    const stats = getBasicTankStats();

    const numericFields = ['agility', 'strength', 'stamina', 'crit', 'hit', 'attackpower',
                          'defense', 'armor', 'parry', 'dodge', 'block', 'blockvalue'];

    for (const field of numericFields) {
      assertTrue(isFinite(stats[field]),
        `${field} should be finite, got ${stats[field]}`);
      assertFalse(isNaN(stats[field]),
        `${field} should not be NaN`);
    }
  });

  test('Tank stats: mainhand weapon has valid stats', () => {
    const stats = getBasicTankStats();

    assertTrue(stats.mainhand !== null, 'mainhand should not be null');
    assertTrue(stats.mainhand.mindmg > 0, 'mainhand.mindmg should be positive');
    assertTrue(stats.mainhand.maxdmg > stats.mainhand.mindmg,
      'mainhand.maxdmg should be greater than mindmg');
    assertTrue(stats.mainhand.swingtimer > 0, 'mainhand.swingtimer should be positive');
  });

  test('Tank stats: all rotation abilities have required fields', () => {
    const stats = getBasicTankStats();

    for (const [ability, config] of Object.entries(stats.rotation)) {
      assertTrue('use' in config,
        `rotation[${ability}] missing 'use' field`);
      assertTrue('rage' in config,
        `rotation[${ability}] missing 'rage' field`);
      assertTrue(typeof config.use === 'boolean',
        `rotation[${ability}].use should be boolean`);
      assertTrue(typeof config.rage === 'number',
        `rotation[${ability}].rage should be number`);
    }
  });

  test('Tank stats: mods are valid multipliers', () => {
    const stats = getBasicTankStats();

    const mods = ['staminaMod', 'strengthMod', 'agilityMod', 'armorMod',
                  'damageMod', 'threatMod'];

    for (const mod of mods) {
      assertTrue(stats[mod] > 0, `${mod} should be positive`);
      assertTrue(stats[mod] < 10, `${mod} should be reasonable (< 10)`);
      assertTrue(isFinite(stats[mod]), `${mod} should be finite`);
    }
  });

  test('Boss stats: armor and defense are valid', () => {
    const stats = getBasicBossStats();

    assertTrue(stats.armor >= 0, 'armor should be non-negative');
    assertTrue(stats.defense > 0, 'defense should be positive');
    assertTrue(stats.level >= 60, 'level should be reasonable');
    assertTrue(stats.level <= 63, 'level should not exceed boss cap');
  });

  test('Config: simDuration and iterations are valid', () => {
    const config = getBasicConfig(100, 30);

    assertEqual(config.iterations, 100, 'iterations should match input');
    assertEqual(config.simDuration, 30, 'simDuration should match input');
    assertTrue(config.iterations > 0, 'iterations should be positive');
    assertTrue(config.simDuration > 0, 'simDuration should be positive');
  });

  test('Globals: complete structure validation', () => {
    const globals = getBasicGlobals(1000, 60);
    // This will throw if validation fails
    validateGlobals(globals, 'complete validation');
  });

  test('Detection: catches missing rotation fields', () => {
    const badRotation = {
      'bloodthirst': { use: true } // Missing 'rage' field
    };

    const stats = { ...getBasicTankStats(), rotation: badRotation };

    try {
      validateTankStats(stats);
      assertTrue(false, 'Should have thrown validation error');
    } catch (e) {
      assertTrue(e.message.includes('rage'),
        'Error should mention missing rage field');
    }
  });

  test('Detection: catches NaN in numeric fields', () => {
    const stats = getBasicTankStats();
    stats.attackpower = NaN;

    try {
      validateTankStats(stats);
      assertTrue(false, 'Should have thrown validation error');
    } catch (e) {
      assertTrue(e.message.includes('attackpower'),
        'Error should mention attackpower field');
    }
  });

  test('Detection: catches undefined in required fields', () => {
    const stats = getBasicTankStats();
    stats.threatMod = undefined;

    try {
      validateTankStats(stats);
      assertTrue(false, 'Should have thrown validation error');
    } catch (e) {
      assertTrue(e.message.includes('threatMod'),
        'Error should mention threatMod field');
    }
  });

});
