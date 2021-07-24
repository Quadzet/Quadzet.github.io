"use strict";

class Proc {

    constructor(input) {

        if (!input.name) this.name = "unknown"; else this.name = input.name;
        if (!input.damage) this.damage = 0; else this.damage = input.damage;

    }

    handleEvent(source, target, event, events, futureEvents) {
        return;
    }

}

class ThunderfuryMH extends Proc {
    handleEvent(source, target, event, eventList, futureEvents) {
        if (event.type == "damage" && !["OH Swing", "Shield Slam"].includes(event.name) && Globals.config.landedHits.includes(event.hit)) {
            let owner = Actors[source]
            let rng = Math.random()
            if (rng < 0.19*0.83) { // 0.83 derives from 17% chance to resist 
                rng = Math.random(); // Two-roll
                let critMod = rng < owner.stats.spellcrit/100 ? 1.5 : 1;
                let damage = this.damage*owner.damageMod*critMod; // don't count enrage, use default 0.9 only
                let procEvent = {
                    type: "damage",
                    name: this.name,
                    source: source,
                    target: target,
                    hit: "hit",
                    timestamp: event.timestamp,
                    amount: damage, 
                    threat: (63 + damage*0.5)*owner.threatMod,
                }
                eventList.push(procEvent);
                // Ensure that the target the get debuff applied
                // target.auras.forEach(aura => aura.handleEvent(target, procEvent, events, config))
            }
        }
    }
}

class ThunderfuryOH extends Proc {
    handleEvent(source, target, event, events, config,futureEvents) {
        if (event.type == "damage" && event.ability == "OH Swing" && config.landedHits.includes(event.hit)) {
            let rng = Math.random()
            if (rng < 0.19*0.83) { // 0.83 derives from 17% chance to resist 
                rng = Math.random(); // Two-roll
                let critMod = rng < source.stats.spellcrit/100 ? 1.5 : 1;
                let damage = this.damage*source.damageMod*critMod; // don't count enrage, use default 0.9 only
                let procEvent = {
                    "type": "damage",
                    "ability": this.name,
                    "hit": "hit",
                    "timestamp": event.timestamp,
                    "damage": damage, // don't count enrage, use default 0.9 only
                    "threat": (252 + damage)*source.threatMod, // 252 from debuff applications, my own testing.
                }
                events.push(procEvent);
                // Ensure that the target the get debuff applied
                target.auras.forEach(aura => aura.handleEvent(target, procEvent, events, config))
            }
        }
    }
}

class PerdsMH extends Proc {
    handleEvent(source, target, event, events, config, futureEvents) {
        if (event.type == "damage" && event.ability != "OH Swing" && config.landedHits.includes(event.hit)) {
            let rng = Math.random()
            if (rng < 0.039*0.83) { // 0.83 derives from 17% chance to resist [CITATION NEEDED] for the proc rate
                rng = Math.random(); // Two-roll
                let critMod = rng < source.stats.spellcrit/100 ? 1.5 : 1;
                let damage = this.damage*source.damageMod*critMod; // don't count enrage, use default 0.9 only
                let procEvent = {
                    "type": "damage",
                    "ability": this.name,
                    "hit": "hit",
                    "timestamp": event.timestamp,
                    "damage": damage, 
                    "threat": damage*source.threatMod,
                }
                events.push(procEvent);
            }
        }
    }
}

class PerdsOH extends Proc {
    handleEvent(source, target, event, events, config, futureEvents) {
        if (event.type == "damage" && event.ability == "OH Swing" && config.landedHits.includes(event.hit)) {
            let rng = Math.random()
            if (rng < 0.039*0.83) { // 0.83 derives from 17% chance to resist 
                rng = Math.random(); // Two-roll
                let critMod = rng < source.stats.spellcrit/100 ? 1.5 : 1;
                let damage = this.damage*source.damageMod*critMod; // don't count enrage, use default 0.9 only
                let procEvent = {
                    "type": "damage",
                    "ability": this.name,
                    "hit": "hit",
                    "timestamp": event.timestamp,
                    "damage": damage, // don't count enrage, use default 0.9 only
                    "threat": damage*source.threatMod,
                }
                events.push(procEvent);
            }
        }
    }
}

class DeathbringerMH extends Proc {
    handleEvent(source, target, event, events, config, futureEvents) {
        if (event.type == "damage" && event.ability != "OH Swing" && config.landedHits.includes(event.hit)) {
            let rng = Math.random()
            if (rng < 0.04*0.83) { // 0.83 derives from 17% chance to resist
                rng = Math.random(); // Two-roll
                let critMod = rng < source.stats.spellcrit/100 ? 1.5 : 1;
                let damage = this.damage*source.damageMod*critMod; // don't count enrage, use default 0.9 only
                let procEvent = {
                    "type": "damage",
                    "ability": this.name,
                    "hit": "hit",
                    "timestamp": event.timestamp,
                    "damage": damage, 
                    "threat": damage*source.threatMod,
                }
                events.push(procEvent);
            }
        }
    }
}

class DeathbringerOH extends Proc {
    handleEvent(source, target, event, events, config, futureEvents) {
        if (event.type == "damage" && event.ability == "OH Swing" && config.landedHits.includes(event.hit)) {
            let rng = Math.random()
            if (rng < 0.04*0.83) { // 0.83 derives from 17% chance to resist 
                rng = Math.random(); // Two-roll
                let critMod = rng < source.stats.spellcrit/100 ? 1.5 : 1;
                let damage = this.damage*source.damageMod*critMod; // don't count enrage, use default 0.9 only
                let procEvent = {
                    "type": "damage",
                    "ability": this.name,
                    "hit": "hit",
                    "timestamp": event.timestamp,
                    "damage": damage, // don't count enrage, use default 0.9 only
                    "threat": damage*source.threatMod,
                }
                events.push(procEvent);
            }
        }
    }
}

class MSA extends Proc {
    handleEvent(source, target, event, events, config, futureEvents) {
        if (event.type == "damage" && config.landedHits.includes(event.hit)) {
            let rng = Math.random()
            if (rng < 0.0933*0.83) { // 0.83 derives from 17% chance to resist
                rng = Math.random(); // Two-roll
                let critMod = 1; // MSA doesn't scale with spellcrit
                let damage = this.damage*source.damageMod*critMod; // don't count enrage, use default 0.9 only
                let procEvent = {
                    "type": "damage",
                    "ability": this.name,
                    "hit": "hit",
                    "timestamp": event.timestamp,
                    "damage": damage, 
                    "threat": damage*source.threatMod,
                }
                events.push(procEvent);
            }
        }
    }
}

class GiftofArthasProc extends Proc {
    handleEvent(source, target, event, events, config, futureEvents) {
        let rng = Math.random();
        if (event.type == "damage" && event.source == "Boss") {
            if (rng < 0.3*0.83) { // 17% chance to resist
                let procEvent = {
                    type: "proc",
                    threat: 90*target.threatMod, // Target of the melee is the tank
                    source: event.ability,
                    ability: this.name,
                    timestamp: event.timestamp,
                }
                events.push(procEvent);
                source.auras.forEach(aura => { if (aura.name == "Gift of Arthas") aura.handleEvent(source, procEvent, events, config)})

           }
        }
    }

}

class WindfuryProc extends Proc {
    constructor(input) {
        super(input)
    }
    handleEvent(source, target, event, eventList, futureEvents) {
        if (event.type == "damage" && ["MH Swing", "Heroic Strike", "Cleave"].includes(event.name) && Globals.config.landedHits.includes(event.hit)) {
            let rng = Math.random()
            // Don't proc off of itself
            if (Actors[source].windfury == true) {
                Actors[source].windfury = false   
                return
            }
            if (rng < 0.2) {
                let procEvent = {
                    "type": "extra attack",
                    "source": source,
                    "name": this.name,
                    "timestamp": event.timestamp,
                }
                eventList.push(procEvent);

                // Ensure that the Windfury buff gets applied and that it resets MH swing timer
                Actors[source].windfury = true
                futureEvents.forEach(e => {
                    if(e.type == "swingTimer" && e.source == source)
                        e.timestamp = event.timestamp
                })
                sortDescending(futureEvents)
            }
        }
    }
}

class HoJProc extends Proc {
    handleEvent(source, target, event, events, config, futureEvents) {
        if (event.type == "damage" && event.ability != "Sunder Armor" && config.landedHits.includes(event.hit)) {
            let rng = Math.random()
            if (rng < 0.02) {
                let procEvent = {
                    "type": "extra attack",
                    "source": event.ability,
                    "name": this.name,
                    "timestamp": event.timestamp,
                }
                events.push(procEvent);

                // Remove 600ms from the MH swing timer if it procs itself, due to an avg of 1.5 batch delay
                // If it's procced by another ability/OH swing, it's also 1.5 batched, but staatistically that does not matter.
                if(event.ability == "MH Swing") {
                    source.abilities.forEach(ability => {
                        if (ability.name == "MH Swing") {
                            ability.currentCooldown -= 600;
                        }
                    })
                } else {
                    source.abilities.forEach(ability => {
                        if (ability.name == "MH Swing") {
                            ability.currentCooldown = 0;
                        }
                    })
                }

            }
        }
    }
}


function getTankProcs(globals) {
    let ret = []
    if(globals.tankStats.weapons.thunderfuryMH) {
        ret.push(
            new ThunderfuryMH({
                name: "Thunderfury",
                damage: 300,
            })
        )
    }

    if(globals.tankStats.weapons.thunderfuryOH) {
        ret.push(
            new ThunderfuryOH({
                name: "Thunderfury",
                damage: 300,
            })
        )
    }

    if(globals.tankStats.bonuses.windfury) {
        ret.push(
            new WindfuryProc({
                name: "Windfury", 
            })
        )
    }

    if(globals.tankStats.trinkets.hoj) {
        ret.push(
            new HoJProc({
                name: "Hand of Justice", 
            })
        )
    }

    if(globals.tankStats.weapons.perdsMH) {
        ret.push(
            new PerdsMH({
                name: "Perdition's Blade MH",
                damage: 48,

            })
        )
    }

    if(globals.tankStats.weapons.perdsOH) {
        ret.push(
            new PerdsOH({
                name: "Perdition's Blade OH",
                damage: 48,
            })
        )
    }

    if(globals.tankStats.weapons.dbMH) {
        ret.push(
            new DeathbringerMH({
                name: "Deathbringer MH",
                damage: 125,
            })
        )
    }

    if(globals.tankStats.weapons.dbOH) {
        ret.push(
            new DeathbringerOH({
                name: "Deathbringer OH",
                damage: 125,
            })
        )
    }

    if(globals.tankStats.weapons.msaMH) {
        ret.push(
            new MSA({
                name: "Misplaced Servo Arm MH",
                damage: 125,
            })
        )
    }

    if(globals.tankStats.weapons.msaOH) {
        ret.push(
            new MSA({
                name: "Misplaced Servo Arm OH",
                damage: 125,
            })
        )
    }
    return ret;
}

function getBossProcs(globals) {
    let ret = [];
    if(globals.tankStats.bonuses.goa) {
        ret.push(
            new GiftofArthasProc({
                name: "Gift of Arthas"
            })
        )
    }
    return ret;
}


