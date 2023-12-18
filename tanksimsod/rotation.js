
"use strict";

function performAction(timestamp, source, target, eventList, futureEvents) {
    if(source.name == "Tank") {
        // Tank GCD action priority list, TODO: Make this smarter, don't have to check the other onGCD if we have jus tused an ability
        if(!source.onGCD) {
            if(source.abilities["Shield Slam"].isUsable(timestamp, source)) {
                source.abilities["Shield Slam"].use(timestamp, source, Actors["Boss"], eventList, futureEvents);
            }
            if(source.abilities["Revenge"].isUsable(timestamp, source)) {
                source.abilities["Revenge"].use(timestamp, source, Actors["Boss"], eventList, futureEvents);
            }
            if(source.abilities["Raging Blow"] && source.abilities["Raging Blow"].isUsable(timestamp, source)) {
                source.abilities["Raging Blow"].use(timestamp, source, Actors["Boss"], eventList, futureEvents);
            }
            if(source.stats.runes.bloodFrenzy && source.abilities["Rend"] && source.abilities["Rend"].isUsable(timestamp, source)) {
              let rendActive = false;
              // TODO: Ineffective
              target.auras.forEach(aura => {
                if (aura.name == "Rend" && aura.duration > 0)
                  rendActive = true;
              })
              if(source.rage > 75 && !rendActive)
                source.abilities["Rend"].use(timestamp, source, Actors["Boss"], eventList, futureEvents);
            }
            if(source.abilities["Devastate"] && source.abilities["Devastate"].isUsable(timestamp, source)) {
              if(source.rage > 85)
                source.abilities["Devastate"].use(timestamp, source, Actors["Boss"], eventList, futureEvents);
            }
            if(source.abilities["Sunder Armor"] && source.abilities["Sunder Armor"].isUsable(timestamp, source)) {
              if(source.rage > 85)
                source.abilities["Sunder Armor"].use(timestamp, source, Actors["Boss"], eventList, futureEvents);
            }
        }

        // Tank off-GCD action priority list
        if(source.abilities["Bloodrage"].isUsable(timestamp, source)) {
            if(source.rage < 75)
                source.abilities["Bloodrage"].use(timestamp, source, Actors["Boss"], eventList, futureEvents);
        }
        if(source.abilities["Shield Block"].isUsable(timestamp, source)) {
            if(source.rage > 95)
                source.abilities["Shield Block"].use(timestamp, source, Actors["Boss"], eventList, futureEvents);
        }
        if(source.abilities["Heroic Strike"].isUsable(timestamp, source)) {
            if(source.rage > 95)
                source.abilities["Heroic Strike"].use(timestamp, source, Actors["Boss"], eventList, futureEvents);
        }


    } else if(source.name == "Boss") {
        return
    }
}

// TODO: Prepull stuff like potions and trinkets etc.. or put it all in FutureEvents?
function handleCombatStart(source, target, eventList, futureEvents) {
    // log_message(source.abilities)
    if(source.name == "Tank") {
        source.abilities["MH Swing"].use(0, source, target, eventList, futureEvents)
        performAction(0, source, target, eventList, futureEvents)
    } else if (source.name == "Boss") {
        source.abilities["MH Swing"].use(0, source, target, eventList, futureEvents)
    }
    
}
