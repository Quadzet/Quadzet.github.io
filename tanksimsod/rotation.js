
"use strict";

function performAction(timestamp, source, target, reactiveEvents, futureEvents) {
    if(source.name == "Tank") {
        let cbrStacks = 0;
        // TODO: use spell id, now it gets conflated with the talent Enrage
        source.auras.forEach(aura => { if (aura.name == "Enrage" && aura.duration > 0) cbrStacks = aura.stacks; });
        let holdAbilities = cbrStacks < source.rotation.cbrStacks && source.rage < 80;
        // Tank GCD action priority list, TODO: Make this smarter, don't have to check the other onGCD if we have jus tused an ability
        if (holdAbilities) {
          let x = 15;
          if (timestamp > 0) {
            let y = 15;
          }
        }
        if(!source.onGCD) {
            if(!holdAbilities && source.abilities["Shield Slam"].isUsable(timestamp, source)) {
                source.abilities["Shield Slam"].use(timestamp, source, Actors["Boss"], reactiveEvents, futureEvents);
            }
            if(!holdAbilities && source.rotation["revenge"].use && source.rage > source.rotation["revenge"].rage && source.abilities["Revenge"].isUsable(timestamp, source)) {
                source.abilities["Revenge"].use(timestamp, source, Actors["Boss"], reactiveEvents, futureEvents);
            }
            if(source.rotation["raging-blow"].use && source.abilities["Raging Blow"] && source.abilities["Raging Blow"].isUsable(timestamp, source)) {
                source.abilities["Raging Blow"].use(timestamp, source, Actors["Boss"], reactiveEvents, futureEvents);
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
        if(!holdAbilities && source.rotation["shield-block"].use && source.rage > source.rotation["shield-block"].rage && source.abilities["Shield Block"].isUsable(timestamp, source)) {
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
    if(source.name == "Tank") {
        source.abilities["MH Swing"].use(0, source, target, reactiveEvents, futureEvents)
        performAction(0, source, target, reactiveEvents, futureEvents)
    } else if (source.name == "Boss") {
        source.abilities["MH Swing"].use(0, source, target, reactiveEvents, futureEvents)
    }
    
}
