import { handleCombatStart, handleScheduledEvent, performAction } from './rotation.js';
import { handleParryHaste } from './abilities.js';
import { sortDescending } from './eventHelpFuncs.js';

export function handleEvent(event, futureEvents, Actors) {
  let newEvents = [];
  let reactiveEvents = [event];

  do {
    event = reactiveEvents.shift();
    if (event.type == "combatStart") {
      let source = Actors["Tank"];
      let target = Actors["Boss"];

      handleCombatStart(source, target, reactiveEvents, futureEvents);
      handleCombatStart(target, source, reactiveEvents, futureEvents);
      Actors["Tank"].handleEvent(event, reactiveEvents, futureEvents);
      Actors["Boss"].handleEvent(event, reactiveEvents, futureEvents);
    }
    else if (event.type == "scheduledEvent") {
      let source = Actors["Tank"];
      let target = Actors["Boss"];
      handleScheduledEvent(event, source, target, reactiveEvents, futureEvents);
    }
    else if (event.type == "swingTimer") {
      let source = Actors[event.source];
      let target = Actors[event.target];
      source.abilities[event.name].use(event.timestamp, source, target, reactiveEvents, futureEvents);
    }
    else if (event.type == "GCD") {
      let source = Actors[event.source];
      let target = source.target;
      source.onGCD = false;
      performAction(event.timestamp, source, target, reactiveEvents, futureEvents);
    }
    else if (event.type == "cooldownFinish") {
      Actors["Tank"].handleEvent(event, reactiveEvents, futureEvents);
    }
    else if (event.type == "auraExpire") {
      Actors["Tank"].handleEvent(event, reactiveEvents, futureEvents);
      Actors["Boss"].handleEvent(event, reactiveEvents, futureEvents);
    }
    else if (event.type == "auraApply") {
      Actors["Tank"].handleEvent(event, reactiveEvents, futureEvents);
      Actors["Boss"].handleEvent(event, reactiveEvents, futureEvents);
    }
    else if (event.type == "rage") {
      Actors["Tank"].handleEvent(event, reactiveEvents, futureEvents);
    }
    else if (event.type == "extra attack") {
      Actors["Tank"].handleEvent(event, reactiveEvents, futureEvents);
    }
    else if (event.type == "damage") {
      Actors["Tank"].handleEvent(event, reactiveEvents, futureEvents);
      Actors["Boss"].handleEvent(event, reactiveEvents, futureEvents);
    }
    else if (event.type == "spellCast") {
      Actors["Tank"].handleEvent(event, reactiveEvents, futureEvents);
      Actors["Boss"].handleEvent(event, reactiveEvents, futureEvents);
    }
    if (event.type == "damage" && event.hit == "parry") {
      handleParryHaste(event, Actors[event.target], futureEvents);
    }

    newEvents.push(event);
  } while (reactiveEvents.length > 0);

  sortDescending(futureEvents);
  return newEvents;
}

export function generatePrePullEvents(Tank, Boss, eventList, FutureEvents) {
  // Prepull Death Wish
  if (Tank.abilities["Death Wish"] && Tank.stats.rotation['death-wish'].use)
    FutureEvents.push({ timestamp: -1500, type: "scheduledEvent", ability: "Death Wish" });

  FutureEvents.push({ timestamp: 0, type: "combatStart" });
  sortDescending(FutureEvents);
}
