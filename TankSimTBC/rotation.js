"use strict";

function performAction(timestamp, source, eventList, futureEvents) {
    if(source.name == "Tank") {

        // Tank GCD action priority list
        if(!source.onGCD) {

            if(source.abilities["Shield Slam"].isUsable(timestamp, source)) {
                source.abilities["Shield Slam"].use(timestamp, source, Actors["Boss"], eventList, futureEvents);
                return
            }
            else if(source.abilities["Revenge"].isUsable(timestamp, source)) {
                source.abilities["Revenge"].use(timestamp, source, Actors["Boss"], eventList, futureEvents);
                return
            }
            else if(source.abilities["Devastate"].isUsable(timestamp, source)) {
                source.abilities["Devastate"].use(timestamp, source, Actors["Boss"], eventList, futureEvents);
                return
            }
        }

        // Tank off-GCD action priority list
        if(source.abilities["Shield Block"].isUsable(timestamp, source)) {
            if(source.rage > 35)
                source.abilities["Shield Block"].use(timestamp, source, Actors["Boss"], eventList, futureEvents);
        }
        if(source.abilities["Heroic Strike"].isUsable(timestamp, source)) {
            if(source.rage > 65)
                source.abilities["Heroic Strike"].use(timestamp, source, Actors["Boss"], eventList, futureEvents);
        }


    } else if(source.name == "Boss") {
        return
    }
}

// TODO: Prepull stuff like potions and trinkets etc.. or put it all in FutureEvents?
function handleCombatStart(source, target, eventList, futureEvents) {
    if(source.name == "Tank") {
        source.abilities["MH Swing"].use(0, source, target, eventList, futureEvents)
        performAction(0, source, eventList, futureEvents)
    } else if (source.name == "Boss") {
        source.abilities["MH Swing"].use(0, source, target, eventList, futureEvents)
    }
    
}
