import { describe, test, assertTrue, assertEqual } from '../test-utils.js';
import { setupFullTestEnv, cleanupFullTestEnv, setTalent } from '../test-env-setup.js';

export const tests = describe('Full updateStats() Integration Tests', () => {

  test('Environment loads successfully with all data', async () => {
    const { document } = await setupFullTestEnv();

    assertTrue(document !== null, 'document should exist');

    const { ITEMS } = await import('../../constants.js');
    const itemCount = Object.keys(ITEMS).length;
    assertTrue(itemCount > 0, `ITEMS should be populated, got ${itemCount} items`);

  });

  test('updateStats() can be imported and called', async () => {
    await setupFullTestEnv();

    const config = await import('../../config.js');
    assertTrue(typeof config.updateStats === 'function',
      'updateStats should be a function');

    let globals = config.updateStats();

    assertTrue(globals !== null, 'globals should not be null');
    assertTrue(globals.tankStats !== undefined, 'tankStats should exist');
    assertTrue(globals.bossStats !== undefined, 'bossStats should exist');
    assertTrue(globals.config !== undefined, 'config should exist');
  });

  test('updateStats() produces valid tankStats', async () => {
    await setupFullTestEnv();
    const config = await import('../../config.js');

    const globals = config.updateStats();
    const stats = globals.tankStats;

    assertTrue(stats.level !== undefined, 'level should exist');
    assertTrue(stats.strength !== undefined, 'strength should exist');
    assertTrue(stats.agility !== undefined, 'agility should exist');
    assertTrue(stats.stamina !== undefined, 'stamina should exist');
    assertTrue(stats.attackpower !== undefined, 'attackpower should exist');
    assertTrue(stats.crit !== undefined, 'crit should exist');
    assertTrue(stats.hit !== undefined, 'hit should exist');

    assertTrue(isFinite(stats.level), `level should be finite, got ${stats.level}`);
    assertTrue(isFinite(stats.strength), `strength should be finite, got ${stats.strength}`);
    assertTrue(isFinite(stats.agility), `agility should be finite, got ${stats.agility}`);
    assertTrue(isFinite(stats.stamina), `stamina should be finite, got ${stats.stamina}`);
    assertTrue(isFinite(stats.attackpower), `attackpower should be finite, got ${stats.attackpower}`);
    assertTrue(isFinite(stats.crit), `crit should be finite, got ${stats.crit}`);
    assertTrue(isFinite(stats.hit), `hit should be finite, got ${stats.hit}`);

    assertTrue(stats.staminaMod > 0, `staminaMod should be positive, got ${stats.staminaMod}`);
    assertTrue(stats.strengthMod > 0, `strengthMod should be positive, got ${stats.strengthMod}`);
    assertTrue(stats.agilityMod > 0, `agilityMod should be positive, got ${stats.agilityMod}`);
    assertTrue(stats.armorMod > 0, `armorMod should be positive, got ${stats.armorMod}`);
  });

  test('updateStats() produces valid bossStats', async () => {
    await setupFullTestEnv();
    const config = await import('../../config.js');

    const globals = config.updateStats();
    const boss = globals.bossStats;

    assertTrue(boss.level !== undefined, 'boss level should exist');
    assertTrue(boss.armor !== undefined, 'boss armor should exist');
    assertTrue(boss.defense !== undefined, 'boss defense should exist');
    assertTrue(boss.mainhand !== undefined, 'boss mainhand should exist');

    assertTrue(boss.mainhand.mindmg !== undefined, 'boss mindmg should exist');
    assertTrue(boss.mainhand.maxdmg !== undefined, 'boss maxdmg should exist');
    assertTrue(boss.mainhand.swingtimer !== undefined, 'boss swingtimer should exist');

    assertTrue(isFinite(boss.level), `boss level should be finite, got ${boss.level}`);
    assertTrue(isFinite(boss.armor), `boss armor should be finite, got ${boss.armor}`);
    assertTrue(isFinite(boss.mainhand.mindmg), `boss mindmg should be finite, got ${boss.mainhand.mindmg}`);
  });

  test('updateStats() produces valid config', async () => {
    await setupFullTestEnv();
    const config = await import('../../config.js');

    const globals = config.updateStats();
    const cfg = globals.config;

    assertTrue(cfg.simDuration !== undefined, 'simDuration should exist');
    assertTrue(cfg.iterations !== undefined, 'iterations should exist');

    assertTrue(typeof cfg.simDuration === 'number', 'simDuration should be number');
    assertTrue(typeof cfg.iterations === 'number', 'iterations should be number');

    assertTrue(cfg.simDuration > 0, `simDuration should be positive, got ${cfg.simDuration}`);
    assertTrue(cfg.iterations > 0, `iterations should be positive, got ${cfg.iterations}`);
  });

  test('Changing DOM values affects updateStats() output', async () => {
    await setupFullTestEnv();
    const config = await import('../../config.js');

    const baseline = config.updateStats();
    const baseStrength = baseline.tankStats.strength;

    global.document.getElementById('player-level').value = '40';

    const updated = config.updateStats();
    const newStrength = updated.tankStats.strength;

    assertEqual(Number(updated.tankStats.level), 40, `level should be 40, got ${updated.tankStats.level}`);
    assertTrue(newStrength !== baseStrength, `strength should change when level changes: ${newStrength} vs ${baseStrength}`);

    global.document.getElementById('player-level').value = '60';
  });

  test('Setting APL script updates globals.tankStats.aplScript', async () => {
    await setupFullTestEnv();
    const config = await import('../../config.js');

    const aplScript = global.document.getElementById('apl-script');
    aplScript.value = 'use bloodthirst;\nuse revenge;';

    const globals = config.updateStats();

    assertTrue(globals.tankStats.aplScript !== undefined,
      'aplScript should exist');
    assertTrue(globals.tankStats.aplScript.includes('bloodthirst'),
      'aplScript should contain bloodthirst');
    assertTrue(globals.tankStats.aplScript.includes('revenge'),
      'aplScript should contain revenge');
  });

  test('Setting talents updates globals.tankStats.talents', async () => {
    await setupFullTestEnv();
    const config = await import('../../config.js');

    setTalent('cruelty', 5);
    setTalent('defiance', 5);

    const globals = config.updateStats();

    assertTrue(globals.tankStats.talents.cruelty !== undefined,
      'cruelty talent should exist');
    assertTrue(globals.tankStats.crit > 0,
      'crit should be > 0 with cruelty talent');
  });

  test('Cleanup works after all tests', async () => {
    cleanupFullTestEnv();

    assertTrue(global.document === undefined, 'document should be cleaned up');
    assertTrue(global.window === undefined, 'window should be cleaned up');
  });

});
