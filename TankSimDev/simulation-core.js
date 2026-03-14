import { handleCombatStart, handleScheduledEvent, performAction } from './rotation.js';
import { handleParryHaste } from './abilities.js';
import { sortDescending } from './eventHelpFuncs.js';

export function handleEvent(event, futureEvents, State/*Actors*/) {
  let newEvents = [];
  let reactiveEvents = [event];

  do {
    event = reactiveEvents.shift();
    if (event.type == "combatStart") {
      let source = State.Tank;
      let target = State.Boss;

      handleCombatStart(source, target, State, reactiveEvents, futureEvents);
      handleCombatStart(target, source, State, reactiveEvents, futureEvents);
      State.Tank.handleEvent(event, State, reactiveEvents, futureEvents);
      State.Boss.handleEvent(event, State, reactiveEvents, futureEvents);
    }
    else if (event.type == "scheduledEvent") {
      let source = State.Tank;
      let target = State.Boss;
      handleScheduledEvent(event, source, target, reactiveEvents, futureEvents);
    }
    else if (event.type == "swingTimer") {
      State.Tank.handleEvent(event, State, reactiveEvents, futureEvents);
      State.Boss.handleEvent(event, State, reactiveEvents, futureEvents);
    }
    else if (event.type == "GCD") {
      let source = State[event.source];
      let target = source.target;
      source.onGCD = false;
      performAction(State, source, target, reactiveEvents, futureEvents);
    }
    else if (event.type == "cooldownFinish") {
      State.Tank.handleEvent(event, State, reactiveEvents, futureEvents);
    }
    else if (event.type == "auraExpire") {
      State.Tank.handleEvent(event, State, reactiveEvents, futureEvents);
      State.Boss.handleEvent(event, State, reactiveEvents, futureEvents);
    }
    else if (event.type == "auraApply") {
      State.Tank.handleEvent(event, State, reactiveEvents, futureEvents);
      State.Boss.handleEvent(event, State, reactiveEvents, futureEvents);
    }
    else if (event.type == "rage") {
      State.Tank.handleEvent(event, State, reactiveEvents, futureEvents);
    }
    else if (event.type == "extra attack") {
      State.Tank.handleEvent(event, State, reactiveEvents, futureEvents);
    }
    else if (event.type == "damage") {
      State.Tank.handleEvent(event, State, reactiveEvents, futureEvents);
      State.Boss.handleEvent(event, State, reactiveEvents, futureEvents);
    }
    else if (event.type == "spellCast") {
      State.Tank.handleEvent(event, State, reactiveEvents, futureEvents);
      State.Boss.handleEvent(event, State, reactiveEvents, futureEvents);
    }
    if (event.type == "damage" && event.hit == "parry") {
      handleParryHaste(event, State[event.target], futureEvents);
    }

    newEvents.push(event);
  } while (reactiveEvents.length > 0);

  sortDescending(futureEvents);
  return newEvents;
}

export function generatePrePullEvents(Tank, Boss, eventList, FutureEvents) {
  // Prepull Death Wish (if APL script contains death_wish)
  if (Tank.abilities["death_wish"] && Tank.stats.aplScript && Tank.stats.aplScript.includes('death_wish'))
    FutureEvents.push({ timestamp: -1500, type: "scheduledEvent", ability: "Death Wish" });

  FutureEvents.push({ timestamp: 0, type: "combatStart" });
  sortDescending(FutureEvents);
}
