"use strict";

class Proc {

    constructor(input) {

        if (!input.name) this.name = "unknown"; else this.name = input.name;
        if (!input.damage) this.damage = 0; else this.damage = input.damage;

    }

    handleEvent(source, target, event, events) {
        return;
    }

}

class Thunderfury extends Proc {
    constructor(input) {
        super(input)
    }
    handleEvent(source, target, event, events) {
        if (event.type == "damage" && event.ability != "OH Swing" && _landedHits.includes(event.hit)) {
            let rng = Math.random()
            if (rng < 0.19*0.83) { // 0.83 derives from 17% chance to resist 
                // TODO: Spell-AttackTable ! Needed for crits mainly, potentially also for resists
                let procEvent = {
                    "type": "damage",
                    "ability": this.name,
                    "hit": "hit",
                    "timestamp": event.timestamp,
                    "damage": this.damage*source.damageMod, // don't count enrage, use default 0.9 only
                    "threat": (252 + this.damage)*source.threatMod, // 252 from debuff applications, my own testing.
                }
                events.push(procEvent);
                // Ensure that the target the get debuff applied
                target.auras.forEach(aura => aura.handleEvent(target, procEvent, events))
            }
        }
    }
}

function getTankProcs() {
    let ret = []
    if(_thunderfury) {
        ret.push(
            new Thunderfury({
                name: "Thunderfury",
                damage: 300,
            })
        )
    }
    return ret;
}



