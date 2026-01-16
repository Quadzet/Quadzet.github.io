import { describe, test, captureConsoleLog, assertEqual, seedRandom } from '../test-utils.js';
import {
  statRound,
  clearFutureTicks,
  generateDamageEvent,
  generateTickEvents,
  sortDescending,
  registerFutureEvents,
  getAmount
} from '../../eventHelpFuncs.js';

export const tests = describe('eventHelpFuncs.js', () => {

  test('statRound: whole number returns unchanged', () => {
    const cleanup = seedRandom(12345);
    const result = statRound(5.0);
    cleanup();
    assertEqual(result, 5, 'Whole number should return unchanged');
  });

  test('statRound: rounds up when RNG < remainder', () => {
    const cleanup = seedRandom(7);
    // With seed 7, RNG = 0.011705 < 0.5, so 5.5 rounds up
    const result = statRound(5.5);
    cleanup();
    assertEqual(result, 6, 'Should round up when RNG < remainder');
  });

  test('statRound: rounds down when RNG >= remainder', () => {
    const cleanup = seedRandom(1);
    // With seed 1, RNG = 0.627074 >= 0.5, so 5.5 rounds down
    const result = statRound(5.5);
    cleanup();
    assertEqual(result, 5, 'Should round down when RNG >= remainder');
  });

  test('statRound: zero returns zero', () => {
    const cleanup = seedRandom(12345);
    const result = statRound(0);
    cleanup();
    assertEqual(result, 0, 'Zero should return zero');
  });


  test('clearFutureTicks: removes all matching damage events', () => {
    const futureEvents = [
      { type: 'damage', name: 'Deep Wounds', timestamp: 1000 },
      { type: 'damage', name: 'Rend', timestamp: 2000 },
      { type: 'damage', name: 'Deep Wounds', timestamp: 3000 },
      { type: 'swingTimer', name: 'Deep Wounds', timestamp: 4000 }, // Not removed (wrong type)
      { type: 'damage', name: 'Deep Wounds', timestamp: 5000 }
    ];

    clearFutureTicks('Deep Wounds', futureEvents);

    assertEqual(futureEvents.length, 2, 'Should have 2 events remaining');
    assertEqual(futureEvents[0].name, 'Rend', 'Rend should remain');
    assertEqual(futureEvents[1].type, 'swingTimer', 'swingTimer should remain');
  });

  test('clearFutureTicks: handles empty array', () => {
    const futureEvents = [];
    clearFutureTicks('Deep Wounds', futureEvents);
    assertEqual(futureEvents.length, 0, 'Empty array should remain empty');
  });

  test('clearFutureTicks: no matching events leaves array unchanged', () => {
    const futureEvents = [
      { type: 'damage', name: 'Rend', timestamp: 1000 },
      { type: 'damage', name: 'Bloodthirst', timestamp: 2000 }
    ];

    clearFutureTicks('Deep Wounds', futureEvents);

    assertEqual(futureEvents.length, 2, 'Array should be unchanged');
  });


  test('generateDamageEvent: creates valid damage event', () => {
    const input = {
      name: 'Test Ability',
      timestamp: 1000,
      hit: 'crit',
      amount: 500,
      source: 'Tank',
      target: 'Boss',
      threat: 650,
      trigger: true
    };

    const result = generateDamageEvent(input);

    assertEqual(result.type, 'damage', 'Type should be damage');
    assertEqual(result.name, 'Test Ability', 'Name should match');
    assertEqual(result.timestamp, 1000, 'Timestamp should match');
    assertEqual(result.amount, 500, 'Amount should match');
  });

  test('generateDamageEvent: handles missing name', () => {
    const input = {
      timestamp: 1000,
      hit: 'hit',
      amount: 100,
      source: 'Tank',
      target: 'Boss',
      threat: 100,
      trigger: true
    };

    let logs = [];
    const result = captureConsoleLog(
      () => generateDamageEvent(input),
      logs);
    assertEqual(result.type, 'damage', 'Should create event despite missing name', logs);
  });

  test('generateDamageEvent: preserves all input properties', () => {
    const input = {
      name: 'Shield Slam',
      timestamp: 5000,
      hit: 'hit',
      amount: 1200,
      source: 'Tank',
      target: 'Boss',
      threat: 1560,
      trigger: true,
      customProp: 'test' // Extra property
    };

    const result = generateDamageEvent(input);

    assertEqual(result.customProp, 'test', 'Should preserve extra properties');
    assertEqual(result.trigger, true, 'Should preserve trigger flag');
  });


  test('generateTickEvents: creates correct number of ticks', () => {
    const input = {
      name: 'Deep Wounds',
      timestamp: 1000,
      duration: 12000,
      interval: 3000,
      amount: 100,
      source: 'Tank',
      target: 'Boss',
      threat: 100,
      trigger: false
    };

    const events = generateTickEvents(input);

    assertEqual(events.length, 3, 'Should create 3 tick events');
  });

  test('generateTickEvents: tick timestamps progress correctly', () => {
    const input = {
      name: 'Rend',
      timestamp: 0,
      duration: 15000,
      interval: 3000,
      amount: 50,
      source: 'Tank',
      target: 'Boss',
      threat: 50,
      trigger: false
    };

    const events = generateTickEvents(input);

    assertEqual(events[0].timestamp, 3000, 'First tick at interval');
    assertEqual(events[1].timestamp, 6000, 'Second tick at 2x interval');
    assertEqual(events[2].timestamp, 9000, 'Third tick at 3x interval');
    assertEqual(events[3].timestamp, 12000, 'Fourth tick at 4x interval');
  });

  test('generateTickEvents: sets hit type to hit', () => {
    const input = {
      name: 'Test DoT',
      timestamp: 1000,
      duration: 9000,
      interval: 3000,
      amount: 100,
      source: 'Tank',
      target: 'Boss',
      threat: 100,
      trigger: false
    };

    const events = generateTickEvents(input);

    events.forEach((event, i) => {
      assertEqual(event.hit, 'hit', `Event ${i} should have hit='hit'`);
    });
  });

  test('generateTickEvents: duration < interval creates no events', () => {
    const input = {
      name: 'Short DoT',
      timestamp: 1000,
      duration: 2000,
      interval: 3000,
      amount: 100,
      source: 'Tank',
      target: 'Boss',
      threat: 100,
      trigger: false
    };

    const events = generateTickEvents(input);

    assertEqual(events.length, 0, 'Should create no events when duration < interval');
  });


  test('sortDescending: sorts by timestamp descending', () => {
    const events = [
      { timestamp: 1000 },
      { timestamp: 5000 },
      { timestamp: 2000 },
      { timestamp: 8000 },
      { timestamp: 3000 }
    ];

    sortDescending(events);

    assertEqual(events[0].timestamp, 8000, 'Highest timestamp first');
    assertEqual(events[1].timestamp, 5000, 'Second highest');
    assertEqual(events[2].timestamp, 3000, 'Third');
    assertEqual(events[3].timestamp, 2000, 'Fourth');
    assertEqual(events[4].timestamp, 1000, 'Lowest timestamp last');
  });

  test('sortDescending: handles empty array', () => {
    const events = [];
    sortDescending(events);
    assertEqual(events.length, 0, 'Empty array should remain empty');
  });

  test('sortDescending: handles single element', () => {
    const events = [{ timestamp: 1000 }];
    sortDescending(events);
    assertEqual(events.length, 1, 'Single element array unchanged');
    assertEqual(events[0].timestamp, 1000, 'Element unchanged');
  });

  test('sortDescending: handles already sorted array', () => {
    const events = [
      { timestamp: 5000 },
      { timestamp: 3000 },
      { timestamp: 1000 }
    ];

    sortDescending(events);

    assertEqual(events[0].timestamp, 5000, 'Order should be maintained');
    assertEqual(events[2].timestamp, 1000, 'Order should be maintained');
  });


  test('registerFutureEvents: adds events and sorts', () => {
    const futureEvents = [
      { timestamp: 5000 },
      { timestamp: 2000 }
    ];

    const newEvents = [
      { timestamp: 8000 },
      { timestamp: 1000 }
    ];

    registerFutureEvents(newEvents, futureEvents);

    assertEqual(futureEvents.length, 4, 'Should have 4 events total');
    assertEqual(futureEvents[0].timestamp, 8000, 'Highest timestamp first');
    assertEqual(futureEvents[3].timestamp, 1000, 'Lowest timestamp last');
  });

  test('registerFutureEvents: handles empty new events', () => {
    const futureEvents = [{ timestamp: 5000 }];
    registerFutureEvents([], futureEvents);
    assertEqual(futureEvents.length, 1, 'Should still have 1 event');
  });


  test('getAmount: returns value when ability matches', () => {
    const event = {
      ability: 'Shield Slam',
      damage: 1200,
      threat: 1560
    };

    const result = getAmount(event, 'Shield Slam', 'damage');
    assertEqual(result, 1200, 'Should return damage value');
  });

  test('getAmount: returns 0 when ability does not match', () => {
    const event = {
      ability: 'Shield Slam',
      damage: 1200
    };

    const result = getAmount(event, 'Bloodthirst', 'damage');
    assertEqual(result, 0, 'Should return 0 for non-matching ability');
  });

  test('getAmount: returns 0 when type field missing', () => {
    const event = {
      ability: 'Shield Slam',
      damage: 1200
    };

    const result = getAmount(event, 'Shield Slam', 'threat');
    assertEqual(result, 0, 'Should return 0 when field missing');
  });

});
