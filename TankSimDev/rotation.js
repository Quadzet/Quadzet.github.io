"use strict";

import { getTalentValue } from './talents.js';
import { Wield } from './constants.js'

export let ACTIONS = [];
export let EXECUTE_ACTIONS = [];
export let PREPULL_ACTIONS = [];

export class ActionRequirement {
  constructor(input) {
    this.rage = input.rage;
    this.rageOperator = input.rageOperator;

    this.timestamp = input.timestamp;
    this.timestampOperator = input.timestampOperator;

    this.auraNames = input.auraNames;
    this.auraOwners = input.auraOwners;
    this.auraDurations = input.auraDurations;
    this.auraOperators = input.auraOperators;

    this.abilityNames = input.abilityNames;
    this.abilityCDs = input.abilityCDs;
    this.abilityOperators = input.abilityOperators;

    this.talentsActive = input.talentsActive;
    this.talentsInactive = input.talentsInactive;
  }
  checkRequirement(timestamp, source, target) {
    return true; // :)
  }
  checkValid(source, target) {
    return null; // or string with error
  }
}
export class Action {
  constructor(input) {
    this.name = input.name;

    this.requirements = input.requirements;
    this.rage = input.rage;



  }
}

export function updateRotation(globals) {
  let element = document.getElementById('rotation-death-wish');
  if (getTalentValue('death-wish') > 0)
    element.style.display = 'flex';
  else
    element.style.display = 'none';

  element = document.getElementById('rotation-mortal-strike');
  if (getTalentValue('mortal-strike') > 0)
    element.style.display = 'flex';
  else
    element.style.display = 'none';

  element = document.getElementById('rotation-shield-slam');
  if (getTalentValue('shield-slam') > 0)
    element.style.display = 'flex';
  else
    element.style.display = 'none';

  element = document.getElementById('rotation-shield-block');
  if (globals.tankStats.wield == Wield.DUALWIELD)
    element.style.display = 'flex';
  else
    element.style.display = 'none';

  element = document.getElementById('rotation-bloodthirst');
  if (getTalentValue('bloodthirst') > 0)
    element.style.display = 'flex';
  else
    element.style.display = 'none';
}

export function handleScheduledEvent(event, source, target, reactiveEvents, futureEvents) {
  // if (event.ability)...
  if (source.abilities[`${event.ability}`] != null && source.abilities[`${event.ability}`].isUsable(event.timestamp, source)) {
    source.abilities[`${event.ability}`].use(event.timestamp, source, target, reactiveEvents, futureEvents);
  }
}

export function performAction(timestamp, source, target, reactiveEvents, futureEvents) {
  if (!source.inCombat) return; // Don't take non-scheduled actions out of combat
  if (source.name == "Tank") {
    // Tank GCD action priority list, TODO: Make this smarter, don't have to check the other onGCD if we have jus tused an ability
    source.onUseAbilities.forEach(onUse => {
      if (onUse.isUsable(timestamp, source)) {
        onUse.use(timestamp, source, source, reactiveEvents, futureEvents);
      }
    });
    if (!source.onGCD) {
      if (source.rotation["death-wish"].use && source.abilities["Death Wish"] != null && source.abilities["Death Wish"].isUsable(timestamp, source)) {
        source.abilities["Death Wish"].use(timestamp, source, target, reactiveEvents, futureEvents);
      }
      if (source.rotation["shield-slam"].use && source.abilities["Shield Slam"] != null && source.abilities["Shield Slam"].isUsable(timestamp, source)) {
        source.abilities["Shield Slam"].use(timestamp, source, target, reactiveEvents, futureEvents);
      }
      if (source.abilities["Bloodthirst"] != null && source.rotation["bloodthirst"].use && source.rage > source.rotation["bloodthirst"].rage && source.abilities["Bloodthirst"].isUsable(timestamp, source)) {
        source.abilities["Bloodthirst"].use(timestamp, source, target, reactiveEvents, futureEvents);
      }
      if (source.abilities["Mortal Strike"] != null && source.rotation["mortal-strike"].use && source.rage > source.rotation["mortal-strike"].rage && source.abilities["Mortal Strike"].isUsable(timestamp, source)) {
        source.abilities["Mortal Strike"].use(timestamp, source, target, reactiveEvents, futureEvents);
      }
      if (source.rotation["revenge"].use && source.rage > source.rotation["revenge"].rage && source.abilities["Revenge"].isUsable(timestamp, source)) {
        source.abilities["Revenge"].use(timestamp, source, target, reactiveEvents, futureEvents);
      }
      if (source.rotation["rend"].use && source.rage > source.rotation["rend"].rage && source.abilities["Rend"] && source.abilities["Rend"].isUsable(timestamp, source)) {
        let rendActive = false;
        // TODO: Ineffective
        target.auras.forEach(aura => {
          if (aura.name == "Rend" && aura.duration > 0)
            rendActive = true;
        })
        if (!rendActive)
          source.abilities["Rend"].use(timestamp, source, target, reactiveEvents, futureEvents);
      }
      if (source.rotation["sunder-armor"].use && source.rage > source.rotation["sunder-armor"].rage && source.abilities["Sunder Armor"] && source.abilities["Sunder Armor"].isUsable(timestamp, source)) {
        source.abilities["Sunder Armor"].use(timestamp, source, target, reactiveEvents, futureEvents);
      }
    }

    // Tank off-GCD action priority list
    if (source.abilities["Bloodrage"].isUsable(timestamp, source)) {
      if (source.rage < 75)
        source.abilities["Bloodrage"].use(timestamp, source, target, reactiveEvents, futureEvents);
    }
    if (source.rotation["shield-block"].use && source.rage > source.rotation["shield-block"].rage && source.abilities["Shield Block"] && source.abilities["Shield Block"].isUsable(timestamp, source)) {
      source.abilities["Shield Block"].use(timestamp, source, target, reactiveEvents, futureEvents);
    }
    if (source.rotation["heroic-strike"].use && source.rage > source.rotation["heroic-strike"].rage && source.abilities["Heroic Strike"].isUsable(timestamp, source)) {
      source.abilities["Heroic Strike"].use(timestamp, source, target, reactiveEvents, futureEvents);
    }


  } else if (source.name == "Boss") {
    return
  }
}

// TODO: Prepull stuff like potions and trinkets etc.. or put it all in FutureEvents?
export function handleCombatStart(source, target, reactiveEvents, futureEvents) {
  source.inCombat = true;
  if (source.name == "Tank") {
    performAction(0, source, target, reactiveEvents, futureEvents)
    futureEvents.push({
      type: "swingTimer",
      source: source.name,
      target: target.name,
      name: "MH Swing",
      timestamp: 0,
      swingStart: 0,
    });
    if (source.stats.wield == Wield.DUALWIELD)
      futureEvents.push({
        type: "swingTimer",
        source: source.name,
        target: target.name,
        name: "OH Swing",
        timestamp: 0,
        swingStart: 0,
      });
  } else if (source.name == "Boss") {
    futureEvents.push({
      type: "swingTimer",
      source: source.name,
      target: target.name,
      name: "MH Swing",
      timestamp: 0,
      swingStart: 0,
    });
  }

}
