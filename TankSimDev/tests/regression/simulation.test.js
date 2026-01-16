import { describe, test, assertEqual, assertTrue, assertClose } from '../test-utils.js';
import { runSimulation, average } from '../sim-runner.js';
import { getBasicGlobals, REFERENCE_RESULTS } from '../sim-fixtures.js';

export const tests = describe('Simulation Regression Tests', () => {

  test('Single iteration 60s: runs without errors', () => {
    const globals = getBasicGlobals(1, 60);
    const result = runSimulation(globals, 1);

    assertTrue(result.results !== null, 'Should return results object');
    assertTrue(result.results.tps.length === 1, 'Should have 1 TPS value');
    assertTrue(result.results.dps.length === 1, 'Should have 1 DPS value');
    assertTrue(result.results.dtps.length === 1, 'Should have 1 DTPS value');
  });

  test('Single iteration 60s: TPS is reasonable', () => {
    const globals = getBasicGlobals(1, 60);
    const result = runSimulation(globals, 1);

    const tps = result.results.tps[0];
    const [minTps, maxTps] = REFERENCE_RESULTS.singleIter60s.tpsRange;

    assertTrue(tps >= minTps && tps <= maxTps,
      `TPS ${tps.toFixed(2)} should be between ${minTps} and ${maxTps}`);
  });

  test('Single iteration 60s: DPS is reasonable', () => {
    const globals = getBasicGlobals(1, 60);
    const result = runSimulation(globals, 1);

    const dps = result.results.dps[0];
    const [minDps, maxDps] = REFERENCE_RESULTS.singleIter60s.dpsRange;

    assertTrue(dps >= minDps && dps <= maxDps,
      `DPS ${dps.toFixed(2)} should be between ${minDps} and ${maxDps}`);
  });

  test('Single iteration 60s: DTPS is reasonable', () => {
    const globals = getBasicGlobals(1, 60);
    const result = runSimulation(globals, 1);

    const dtps = result.results.dtps[0];
    const [minDtps, maxDtps] = REFERENCE_RESULTS.singleIter60s.dtpsRange;

    assertTrue(dtps >= minDtps && dtps <= maxDtps,
      `DTPS ${dtps.toFixed(2)} should be between ${minDtps} and ${maxDtps}`);
  });

  test('Single iteration 60s: generates event log', () => {
    const globals = getBasicGlobals(1, 60);
    const result = runSimulation(globals, 1);

    assertTrue(result.events !== null, 'Should have events array');
    assertTrue(result.events.length > 0, 'Should have generated events');

    // Check for expected event types
    const eventTypes = new Set(result.events.map(e => e.type));
    assertTrue(eventTypes.has('combatStart'), 'Should have combatStart event');
    assertTrue(eventTypes.has('damage'), 'Should have damage events');
  });

  test('Single iteration 60s: has ability breakdown', () => {
    const globals = getBasicGlobals(1, 60);
    const result = runSimulation(globals, 1);

    const breakdown = result.results.tpsBreakdown;
    assertTrue(Object.keys(breakdown).length > 0,
      'Should have at least one ability in breakdown');

    for (const abilityName in breakdown) {
      const abilityData = breakdown[abilityName][0];
      assertTrue(abilityData.tps !== undefined, `${abilityName} should have tps`);
      assertTrue(abilityData.dps !== undefined, `${abilityName} should have dps`);
      assertTrue(abilityData.casts !== undefined, `${abilityName} should have casts`);
    }
  });

  test('Single iteration: different fight durations produce reasonable results', () => {
    const globals120 = getBasicGlobals(1, 120);
    const globals60 = getBasicGlobals(1, 60);

    const result120 = runSimulation(globals120, 1);
    const result60 = runSimulation(globals60, 1);

    // Per-second values should be similar (within 40% due to RNG and fight length variance)
    // Longer fights have more stable DPS due to cooldown/rage normalization
    const tps120 = result120.results.tps[0];
    const tps60 = result60.results.tps[0];
    const ratio = tps60 / tps120;

    assertTrue(ratio >= 0.6 && ratio <= 1.4,
      `60s TPS ${tps60.toFixed(2)} should be roughly similar to 120s TPS ${tps120.toFixed(2)} (ratio: ${ratio.toFixed(2)})`);
  });


  test('Multi-iteration 1000x60s: average TPS matches reference', () => {
    const globals = getBasicGlobals(1000, 60);
    const result = runSimulation(globals, 1000);

    const avgTps = average(result.results.tps);
    const ref = REFERENCE_RESULTS.multiIter60s;
    const tolerance = ref.tps.value * ref.tps.tolerance;

    assertClose(avgTps, ref.tps.value, tolerance,
      `Average TPS should match reference within ${(ref.tps.tolerance * 100).toFixed(0)}%`);
  });

  test('Multi-iteration 1000x60s: average DPS matches reference', () => {
    const globals = getBasicGlobals(1000, 60);
    const result = runSimulation(globals, 1000);

    const avgDps = average(result.results.dps);
    const ref = REFERENCE_RESULTS.multiIter60s;
    const tolerance = ref.dps.value * ref.dps.tolerance;

    assertClose(avgDps, ref.dps.value, tolerance,
      `Average DPS should match reference within ${(ref.dps.tolerance * 100).toFixed(0)}%`);
  });

  test('Multi-iteration 1000x60s: average DTPS matches reference', () => {
    const globals = getBasicGlobals(1000, 60);
    const result = runSimulation(globals, 1000);

    const avgDtps = average(result.results.dtps);
    const ref = REFERENCE_RESULTS.multiIter60s;
    const tolerance = ref.dtps.value * ref.dtps.tolerance;

    assertClose(avgDtps, ref.dtps.value, tolerance,
      `Average DTPS should match reference within ${(ref.dtps.tolerance * 100).toFixed(0)}%`);
  });

  test('Multi-iteration 1000x60s: standard deviation is reasonable', () => {
    const globals = getBasicGlobals(1000, 60);
    const result = runSimulation(globals, 1000);

    const avgTps = average(result.results.tps);
    const std = (arr) => {
      const mu = average(arr);
      const diffArr = arr.map(a => (a - mu) ** 2);
      return Math.sqrt(diffArr.reduce((a, b) => a + b) / (arr.length - 1));
    };
    const stdTps = std(result.results.tps);
    const coefficientOfVariation = stdTps / avgTps;

    assertTrue(coefficientOfVariation < 0.20,
      `Standard deviation (${stdTps.toFixed(2)}) should be < 20% of mean (${avgTps.toFixed(2)}), got ${(coefficientOfVariation * 100).toFixed(2)}%`);
  });

  test('Multi-iteration 1000x60s: all iterations produce valid results', () => {
    const globals = getBasicGlobals(1000, 60);
    const result = runSimulation(globals, 1000);

    // Check that all iterations produced results.
    assertEqual(result.results.tps.length, 1000, 'Should have 1000 TPS values');
    assertEqual(result.results.dps.length, 1000, 'Should have 1000 DPS values');
    assertEqual(result.results.dtps.length, 1000, 'Should have 1000 DTPS values');

    // Check that there are no NaN or Infinity values.
    result.results.tps.forEach((tps, i) => {
      assertTrue(isFinite(tps), `TPS iteration ${i} should be finite, got ${tps}`);
      assertTrue(tps >= 0, `TPS iteration ${i} should be non-negative, got ${tps}`);
    });

    result.results.dps.forEach((dps, i) => {
      assertTrue(isFinite(dps), `DPS iteration ${i} should be finite, got ${dps}`);
      assertTrue(dps >= 0, `DPS iteration ${i} should be non-negative, got ${dps}`);
    });
  });

});
