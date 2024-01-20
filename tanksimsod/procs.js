"use strict";

class Proc {

    constructor(name) {
        this.name = name;
        // if (!input.name) this.name = "unknown"; else this.name = input.name;
        // if (!input.damage) this.damage = 0; else this.damage = input.damage;

    }

    handleEvent(source, target, event, reactiveEvents, futureEvents) {
        log_message("No event handler specified for proc " + this.name + ".");
        return;
    }
    reset() {

    }

}

let landedHits = ["hit", "crit", "block", "crit block", "glance"];

class ThunderfuryMH extends Proc {
    handleEvent(source, target, event, reactiveEvents, futureEvents) {
        if (event.type == "damage" && event.ability != "OH Swing" && landedHits.includes(event.hit)) {
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
                    "damage": damage, 
                    "threat": (252 + damage)*source.threatMod, // 252 from debuff applications, my own testing.
                }
                reactiveEvents.push(procEvent);
                // Ensure that the target the get debuff applied
                target.auras.forEach(aura => aura.handleEvent(target, procEvent, reactiveEvents, config))
            }
        }
    }
}

class ThunderfuryOH extends Proc {
    
    handleEvent(source, target, event, reactiveEvents, futureEvents) {

        if (event.type == "damage" && event.ability == "OH Swing" && landedHits.includes(event.hit)) {
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
                reactiveEvents.push(procEvent);
                // Ensure that the target the get debuff applied
                target.auras.forEach(aura => aura.handleEvent(target, procEvent, reactiveEvents, config))
            }
        }
    }
}

class PerdsMH extends Proc {
    
    handleEvent(source, target, event, reactiveEvents, futureEvents) {

        if (event.type == "damage" && event.ability != "OH Swing" && landedHits.includes(event.hit)) {
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
                reactiveEvents.push(procEvent);
            }
        }
    }
}

class PerdsOH extends Proc {
    
    handleEvent(source, target, event, reactiveEvents, futureEvents) {

        if (event.type == "damage" && event.ability == "OH Swing" && landedHits.includes(event.hit)) {
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
                reactiveEvents.push(procEvent);
            }
        }
    }
}

class DeathbringerMH extends Proc {
    
    handleEvent(source, target, event, reactiveEvents, futureEvents) {

        if (event.type == "damage" && event.ability != "OH Swing" && landedHits.includes(event.hit)) {
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
                reactiveEvents.push(procEvent);
            }
        }
    }
}

class DeathbringerOH extends Proc {
    
    handleEvent(source, target, event, reactiveEvents, futureEvents) {

        if (event.type == "damage" && event.ability == "OH Swing" && landedHits.includes(event.hit)) {
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
                reactiveEvents.push(procEvent);
            }
        }
    }
}

class MSA extends Proc {
    
    handleEvent(source, target, event, reactiveEvents, futureEvents) {

        if (event.type == "damage" && landedHits.includes(event.hit)) {
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
                reactiveEvents.push(procEvent);
            }
        }
    }
}

class GiftofArthasProc extends Proc {
    
    handleEvent(source, target, event, reactiveEvents, futureEvents) {

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
                reactiveEvents.push(procEvent);
                source.auras.forEach(aura => { if (aura.name == "Gift of Arthas") aura.handleEvent(source, procEvent, reactiveEvents, config)})

           }
        }
    }

}

class WindfuryProc extends Proc {
    constructor() {
        super("Windfury")
    }
    
    handleEvent(source, target, event, reactiveEvents, futureEvents) {

        if (event.type == "damage" && event.ability != "OH Swing" && landedHits.includes(event.hit)) {
            let rng = Math.random()
            if (rng < 0.2) {
                let procEvent = {
                    "type": "extra attack",
                    "source": event.ability,
                    "ability": this.name,
                    "timestamp": event.timestamp,
                }
                reactiveEvents.push(procEvent);

                // TODO: HANDLE THIS IN MH SWING:HANFLEVENT() !!!
                // Ensure that the Windfury buff gets applied and that it resets MH swing timer
                // source.auras.forEach(aura => aura.handleEvent(target, procEvent, reactiveEvents, config))
                // source.abilities.forEach(ability => {
                //     if (ability.name == "MH Swing") {
                //         reactiveEvents.push(ability.use(source, target))
                //     }
                // })
            }
        }
    }
}

class WildStrikesProc extends Proc {
    constructor() {
        super("Wild Strikes");
        this.ICDTimer = 0;
    }
    
    handleEvent(source, target, event, reactiveEvents, futureEvents) {
        // TODO: make damage event flag "direct/dot/etc" and make this only proc from direct dmg, note ranks might not work?
        if (event.type == "damage" && event.source == source.name && ["MH Swing", "Bloodthirst", "Raging Blow", "Quickstrike", "Devastate", "Sunder Armor", "Heroic Strike"].includes(event.name) && landedHits.includes(event.hit) && event.timestamp >= this.ICDTimer) {
            let rng = Math.random()
            if (rng < 0.2) {
                let procEvent = {
                    "type": "extra attack",
                    "source": event.source,
                    "name": this.name,
                    "timestamp": event.timestamp,
                }
                this.ICDTimer = event.timestamp + 1500;
                reactiveEvents.push(procEvent);
                // TODO HANDLE THIS IN MH SWING.HANDLEEVENTS() !!!!!!!
                // let index = futureEvents.findIndex(e => {return (e.type == "swingTimer" && e.name == "MH Swing" && e.source == source.name)})
                // if(index >= 0)
                //     futureEvents.splice(index, 1)
                // source.abilities["MH Swing"].use(event.timestamp, source, target, reactiveEvents, futureEvents);
            }
        }
    }
    reset() {
      this.ICDTimer = 0;
    }
}
class HoJProc extends Proc {
    
    handleEvent(source, target, event, reactiveEvents, futureEvents) {

        if (event.type == "damage" && event.ability != "Sunder Armor" && landedHits.includes(event.hit)) {
            let rng = Math.random()
            if (rng < 0.02) {
                let procEvent = {
                    "type": "extra attack",
                    "source": event.ability,
                    "ability": this.name,
                    "timestamp": event.timestamp,
                }
                reactiveEvents.push(procEvent);

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

class BloodFrenzyProc extends Proc {
  constructor() {
    super("Blood Frenzy");
  }
  handleEvent(source, target, event, reactiveEvents, futureEvents) {
    if (event.type == "damage" && ["Rend (Rank 3)", "Rend", "Deep Wounds"].includes(event.name) && event.amount > 0) {
      let procEvent = {
          type: "rage",
          name: this.name,
          source: source.name,

          timestamp: event.timestamp,

          amount: 3, 
          threat: 3 * 5,
      }
      futureEvents.push(procEvent);
    }
  }
}

class WeaponProc extends Proc {
  constructor(proc) {
    super(proc.name);
    this.duration = proc.duration;
    this.damage = proc.dmg;
    this.tick = proc.tick;
    this.interval = proc.interval;
    this.ppm = proc.ppm;
    this.procChance = proc.procChance;
    this.magic = proc.magic;
  }
  handleEvent(source, target, event, reactiveEvents, futureEvents) {
    if (event.trigger && source.name == event.source) {
      let rng = Math.random();
      if (rng < this.procChance) {
        if (this.damage > 0) {
          futureEvents.push(generateDamageEvent({
            timestamp: event.timestamp,
            name: this.name,
            hit: 'hit', //TODO !!
            amount: this.damage,
            source: source.name,
            target: target.name,
            threat: this.damage * source.stats.threatMod,
            trigger: false,
          }))
        }
        if (this.tick > 0) {
          let tickEvents = generateTickEvents({
            timestamp: event.timestamp,
            name: this.name,
            amount: this.tick,
            source: source.name,
            target: target.name,
            threat: this.tick * source.stats.threatMod,
            interval: this.interval,
            duration: this.duration,
            trigger: false,
          });
          tickEvents.forEach(event => {
            futureEvents.push(event);
          })
        }
      }
    }
  }
}

function getTankProcs(globals) {
    let ret = []

    globals.tankStats.procs.forEach(proc => {
      ret.push(new WeaponProc(proc))
    });

    if(globals.tankStats.bonuses.wildStrikes) {
        ret.push(
            new WildStrikesProc()
        )
    }

    if(globals.tankStats.bonuses.windfury) {
        ret.push(
            new WindfuryProc({
                name: "Windfury", 
            })
        )
    }

    if(globals.tankStats.runes.bloodFrenzy) {
        ret.push(
            new BloodFrenzyProc()
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


