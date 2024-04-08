"use strict";

let ACTIONS = [];
let EXECUTE_ACTIONS = [];
let PREPULL_ACTIONS = [];

class ActionRequirement {
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

    this.runesActive = input.runesActive;
    this.runesInactive = input.runesInactive;

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
class Action {
  constructor(input) {
    this.name = input.name;

    this.requirements = input.requirements;
    this.rage = input.rage;



  }
}








function handleScheduledEvent(event, source, target, reactiveEvents, futureEvents) {
  // if (event.ability)...
  if (source.abilities[`${event.ability}`] != null && source.abilities[`${event.ability}`].isUsable(event.timestamp, source)) {
    source.abilities[`${event.ability}`].use(event.timestamp, source, target, reactiveEvents, futureEvents);
  }
}

function performAction(timestamp, source, target, reactiveEvents, futureEvents) {
    if (!source.inCombat) return; // Don't take non-scheduled actions out of combat
    if(source.name == "Tank") {
        let cbrStacks = 0;
        // TODO: use spell id, now it gets conflated with the talent Enrage
        source.auras.forEach(aura => { if (aura.name == "Enrage" && aura.duration > 0) cbrStacks = aura.stacks; });
        let holdAbilities = cbrStacks < source.rotation.cbrStacks && source.rage < 80;
        
        // Tank GCD action priority list, TODO: Make this smarter, don't have to check the other onGCD if we have jus tused an ability
        source.onUseAbilities.forEach(onUse => {
          if (onUse.isUsable(timestamp, source)) {
            onUse.use(timestamp, source, Actors["Tank"], reactiveEvents, futureEvents);
          }
        });
        if(!source.onGCD) {
            if(!holdAbilities && source.rotation["death-wish"].use && source.abilities["Death Wish"] != null && source.abilities["Death Wish"].isUsable(timestamp, source)) {
                source.abilities["Death Wish"].use(timestamp, source, Actors["Boss"], reactiveEvents, futureEvents);
            }
            if(!holdAbilities && source.rotation["shield-slam"].use && source.abilities["Shield Slam"] != null && source.abilities["Shield Slam"].isUsable(timestamp, source)) {
                source.abilities["Shield Slam"].use(timestamp, source, Actors["Boss"], reactiveEvents, futureEvents);
            }
            if(!holdAbilities && source.abilities["Bloodthirst"] != null && source.rotation["bloodthirst"].use && source.rage > source.rotation["bloodthirst"].rage && source.abilities["Bloodthirst"].isUsable(timestamp, source)) {
                source.abilities["Bloodthirst"].use(timestamp, source, Actors["Boss"], reactiveEvents, futureEvents);
            }
            if(!holdAbilities && source.abilities["Mortal Strike"] != null && source.rotation["mortal-strike"].use && source.rage > source.rotation["mortal-strike"].rage && source.abilities["Mortal Strike"].isUsable(timestamp, source)) {
                source.abilities["Mortal Strike"].use(timestamp, source, Actors["Boss"], reactiveEvents, futureEvents);
            }
            if(!holdAbilities && source.rotation["revenge"].use && source.rage > source.rotation["revenge"].rage && source.abilities["Revenge"].isUsable(timestamp, source)) {
                source.abilities["Revenge"].use(timestamp, source, Actors["Boss"], reactiveEvents, futureEvents);
            }
            if(source.rotation["raging-blow"].use && source.abilities["Raging Blow"] && source.abilities["Raging Blow"].isUsable(timestamp, source)) {
                source.abilities["Raging Blow"].use(timestamp, source, Actors["Boss"], reactiveEvents, futureEvents);
            }
            if(!holdAbilities && source.rotation["slam"].use && source.rage > source.rotation["slam"].rage && source.abilities["Slam"] && source.abilities["Slam"].isUsable(timestamp, source)) {
              source.abilities["Slam"].use(timestamp, source, Actors["Boss"], reactiveEvents, futureEvents);
            }
            if(!holdAbilities && source.rotation["quick-strike"].use && source.rage > source.rotation["quick-strike"].rage && source.abilities["Quick Strike"] && source.abilities["Quick Strike"].isUsable(timestamp, source)) {
              source.abilities["Quick Strike"].use(timestamp, source, Actors["Boss"], reactiveEvents, futureEvents);
            }
            if(!holdAbilities && source.rotation["thunder-clap"].use && source.rage > source.rotation["thunder-clap"].rage && source.abilities["Thunder Clap"] && source.abilities["Thunder Clap"].isUsable(timestamp, source)) {
              source.abilities["Thunder Clap"].use(timestamp, source, Actors["Boss"], reactiveEvents, futureEvents);
            }
            if(!holdAbilities && source.rotation["rend"].use && source.rage > source.rotation["rend"].rage && source.abilities["Rend"] && source.abilities["Rend"].isUsable(timestamp, source)) {
              let rendActive = false;
              // TODO: Ineffective
              target.auras.forEach(aura => {
                if (aura.name == "Rend" && aura.duration > 0)
                  rendActive = true;
              })
              if(!rendActive)
                source.abilities["Rend"].use(timestamp, source, Actors["Boss"], reactiveEvents, futureEvents);
            }
            if(!holdAbilities && source.rotation["devastate"].use && source.rage > source.rotation["devastate"].rage && source.abilities["Devastate"] && source.abilities["Devastate"].isUsable(timestamp, source)) {
              source.abilities["Devastate"].use(timestamp, source, Actors["Boss"], reactiveEvents, futureEvents);
            }
            if(!holdAbilities && source.rotation["devastate"].use && source.rage > source.rotation["devastate"].rage && source.abilities["Sunder Armor"] && source.abilities["Sunder Armor"].isUsable(timestamp, source)) {
              source.abilities["Sunder Armor"].use(timestamp, source, Actors["Boss"], reactiveEvents, futureEvents);
            }
        }

        // Tank off-GCD action priority list
        if(source.abilities["Bloodrage"].isUsable(timestamp, source)) {
          if(source.rage < 75)
            source.abilities["Bloodrage"].use(timestamp, source, Actors["Boss"], reactiveEvents, futureEvents);
        }
        if(!holdAbilities && source.rotation["shield-block"].use && source.rage > source.rotation["shield-block"].rage && source.abilities["Shield Block"] && source.abilities["Shield Block"].isUsable(timestamp, source)) {
          source.abilities["Shield Block"].use(timestamp, source, Actors["Boss"], reactiveEvents, futureEvents);
        }
        if(!holdAbilities && source.rotation["heroic-strike"].use && source.rage > source.rotation["heroic-strike"].rage && source.abilities["Heroic Strike"].isUsable(timestamp, source)) {
          source.abilities["Heroic Strike"].use(timestamp, source, Actors["Boss"], reactiveEvents, futureEvents);
        }


    } else if(source.name == "Boss") {
        return
    }
}

// TODO: Prepull stuff like potions and trinkets etc.. or put it all in FutureEvents?
function handleCombatStart(source, target, reactiveEvents, futureEvents) {
    source.inCombat = true;
    if(source.name == "Tank") {
        performAction(0, source, target, reactiveEvents, futureEvents)
        futureEvents.push({
            type: "swingTimer",
            source: source.name,
            target: target.name,
            name: "MH Swing",
            timestamp: 0,
            swingStart: 0,
        });
        if (source.stats.dualWield)
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
