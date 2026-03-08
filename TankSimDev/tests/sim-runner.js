import { getTankProcs, getBossProcs } from '../procs.js';
import { TankAbilities, getOnUseAbilities, BossAbilities } from '../abilities.js';
import { Actor } from '../actor.js';
import { TankAuras, BossAuras } from '../auras.js';
import { handleEvent, generatePrePullEvents } from '../simulation-core.js';

const range = (length) => Array.from({ length }, (_, i) => i);

export function runSimulation(globals, iterations) {
  let TankProcs = getTankProcs(globals);
  let BossProcs = getBossProcs(globals);

  let Actors = {
    "Tank": new Actor("Tank", globals.tankStats, TankAbilities(globals.tankStats), getOnUseAbilities(globals.tankStats.gear), TankProcs, TankAuras(globals)),
    "Boss": new Actor("Boss", globals.bossStats, BossAbilities, [], BossProcs, BossAuras(globals)),
  };
  Actors["Tank"].target = Actors["Boss"];
  Actors["Boss"].target = Actors["Tank"];

  let exampleList = [];
  let results = {
    tps: [],
    dps: [],
    dtps: [],
    tpsBreakdown: {},
    casts: {},
    auras: {},
  };

  for (let i in range(iterations)) {
    let eventList = [];
    let FutureEvents = [];
    Actors.Tank.init();
    Actors.Boss.init();
    generatePrePullEvents(Actors.Tank, Actors.Boss, eventList, FutureEvents);

    while (true) {
      let event = FutureEvents.pop();
      if (!event || event.timestamp > globals.config.simDuration * 1000)
        break;
      let newEvents = handleEvent(event, FutureEvents, Actors);
      newEvents.forEach(event => {
        eventList.push(event);
      });
    }

    let threat = 0;
    let damage = 0;
    let damageTaken = 0;

    eventList.forEach(event => {
      if (event) {
        if (event.source == "Boss") {
          if (event.amount && event.type == "damage") damageTaken += event.amount;
        } else if ("threat" in event) {
          threat += event.threat;
          if (event.type == "damage") {
            if (event.amount) damage += event.amount;
          }
          if (event.threat != 0 || event.type == "damage") {
            if (event.name) {
              if (!results.tpsBreakdown[`${event.name}`]) results.tpsBreakdown[`${event.name}`] = [];
              if (!results.tpsBreakdown[`${event.name}`][i]) results.tpsBreakdown[`${event.name}`][i] = { tps: 0, dps: 0, casts: 0, hits: 0, crits: 0, glances: 0, misses: 0, dodges: 0, parries: 0, blocks: 0 };

              results.tpsBreakdown[`${event.name}`][i].tps += event.threat / globals.config.simDuration;
              if (event.amount && event.type == "damage")
                results.tpsBreakdown[`${event.name}`][i].dps += event.amount / globals.config.simDuration;
              results.tpsBreakdown[`${event.name}`][i].casts += 1;
              if (event.hit) {
                results.tpsBreakdown[`${event.name}`][i].hits += event.hit == "hit" || event.hit == 'tick' ? 1 : 0;
                results.tpsBreakdown[`${event.name}`][i].crits += event.hit == "crit" || event.hit == "crit block" ? 1 : 0;
                results.tpsBreakdown[`${event.name}`][i].misses += event.hit == "miss" ? 1 : 0;
                results.tpsBreakdown[`${event.name}`][i].dodges += event.hit == "dodge" ? 1 : 0;
                results.tpsBreakdown[`${event.name}`][i].parries += event.hit == "parry" ? 1 : 0;
                results.tpsBreakdown[`${event.name}`][i].blocks += event.hit == "block" ? 1 : 0;
                results.tpsBreakdown[`${event.name}`][i].glances += event.hit == "glance" ? 1 : 0;
              }
            }
          }
        }
        if (event.type == "auraApply") {
          let obj = results.auras[`${event.name}`];
          if (obj == null) obj = { uptime: Array(iterations).fill(0), active: Array(iterations).fill(false), };
          if (!obj.active[i]) {
            obj.uptime[i] += 1 - Math.max(event.timestamp, 0) / (globals.config.simDuration * 1000);
            obj.active[i] = true;
            results.auras[`${event.name}`] = obj;
          }
        }
        if (event.type == "auraExpire") {
          let obj = results.auras[`${event.name}`];
          if (obj.active[i]) {
            obj.uptime[i] -= 1 - Math.max(event.timestamp, 0) / (globals.config.simDuration * 1000);
            obj.active[i] = false;
            results.auras[`${event.name}`] = obj;
          }
        }
      }
    });

    results.tps.push(threat / globals.config.simDuration);
    results.dps.push(damage / globals.config.simDuration);
    results.dtps.push(damageTaken / globals.config.simDuration);

    if (i == iterations - 1)
      exampleList = eventList;
  }

  return {
    events: exampleList,
    results: results,
  };
}

// Helper to calculate average
export function average(array) {
  if (!array || array.length === 0) return 0;
  return array.reduce((a, b) => a + b) / array.length;
}
