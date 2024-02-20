"use strict";

class Proc {

    constructor(name) {
        this.name = name;
        // if (!input.name) this.name = "unknown"; else this.name = input.name;
        // if (!input.damage) this.damage = 0; else this.damage = input.damage;

    }

    handleEvent(source, target, event, reactiveEvents, futureEvents) {
        log_message(LOG_LEVEL.WARNING, "No event handler specified for proc " + this.name + ".");
        return;
    }
    reset() {

    }

}

let landedHits = ["hit", "crit", "block", "crit block", "glance"];

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
        if (event.type == "damage" && event.source == source.name && ["MH Swing", "Bloodthirst", "Raging Blow", "Quickstrike", "Devastate", "Sunder Armor", "Heroic Strike", "Revenge", "Mortal Strike", "Slam"].includes(event.name) && landedHits.includes(event.hit) && event.timestamp >= this.ICDTimer) {
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
            }
        }
    }
    reset() {
      this.ICDTimer = 0;
    }
}

class SwordSpecialization extends Proc {
    constructor(points) {
        super("Sword Specialization");
        this.procChance = 0.01 * points;
    }
    
    handleEvent(source, target, event, reactiveEvents, futureEvents) {
        if (event.type == "damage" && event.source == source.name && event.trigger && landedHits.includes(event.hit)) {
            let rng = Math.random()
            if (rng < this.procChance) {
                let procEvent = {
                    "type": "extra attack",
                    "source": event.source,
                    "name": this.name,
                    "timestamp": event.timestamp,
                }
                reactiveEvents.push(procEvent);
            }
        }
    }
}

class BloodFrenzyProc extends Proc {
  constructor() {
    super("Blood Frenzy");
  }
  handleEvent(source, target, event, reactiveEvents, futureEvents) {
    if (event.type == "damage" && ["Rend", "Deep Wounds"].includes(event.name) && event.amount > 0) {
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
    this.spellCoeff = proc.spellCoeff == null ? 0 : proc.spellCoeff;
    this.ICD = proc.ICD == null ? 0 : proc.ICD;
    this.offhand = proc.offhand == null ? false : proc.offhand;

    this.cooldown = 0;
    this.trigger = false; // Don't trigger additional procs
  }
  handleEvent(source, target, event, reactiveEvents, futureEvents) {
    if (event.type == "damage" && event.trigger && source.name == event.source && landedHits.includes(event.hit)) {
      if (this.offhand && event.name != "OH Swing")
        return;
      if (event.timestamp < this.cooldown)
        return;
      let rng = Math.random();
      if (rng < this.procChance) {
        this.cooldown = event.timestamp + this.ICD;
        if (this.damage > 0) {
          let damageEvent = rollSpellAttack(source, target, this.damage * source.getSpellDamageMod(), false);
          damageEvent.name = this.name;
          damageEvent.timestamp = event.timestamp;
          damageEvent.threat = damageEvent.amount * source.stats.threatMod;
          damageEvent.trigger = false;
          reactiveEvents.push(generateDamageEvent(damageEvent));
        }
        if (this.tick > 0) {
          clearFutureTicks(this.name, futureEvents);
          let damageEvent = rollSpellAttack(source, target, this.tick * source.getSpellDamageMod(), true);
          damageEvent.name = this.name;
          damageEvent.timestamp = event.timestamp;
          damageEvent.threat = damageEvent.amount * source.stats.threatMod;
          damageEvent.trigger = false;
          damageEvent.duration = this.duration;
          damageEvent.interval = this.interval;
          damageEvent.trigger = this.trigger;
          if (event.hit == 'miss')
            futureEvents.push(generateDamageEvent(damageEvent));
          else {
            let tickEvents = generateTickEvents(damageEvent);
            tickEvents.forEach(event => {
              futureEvents.push(event);
            });
          }
        }
      }
    }
  }
  reset() {
    this.cooldown = 0;
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

    if (globals.tankStats.bonuses.ohDismantle) {
      ret.push(new WeaponProc({
        name: "Dismantle",
        dmg: 75,
        procChance: 0.15,
        magic: true,
        offhand: true,
      }));
    }

    if (globals.tankStats.bonuses.mhDismantle) {
      ret.push(new WeaponProc({
        name: "Dismantle",
        dmg: 75,
        procChance: 0.15,
        magic: true,
        offhand: false,
      }));
    }

    if (globals.tankStats.bonuses.ohoil) {
      ret.push(new WeaponProc({
        name: "Shadow Oil",
        dmg: 56,
        spellCoeff: 0.56,
        procChance: 0.15,
        magic: true,
        offhand: true,
      }));
    }

    if (globals.tankStats.bonuses.mhoil) {
      ret.push(new WeaponProc({
        name: "Shadow Oil",
        dmg: 56,
        spellCoeff: 0.56,
        procChance: 0.15,
        magic: true,
        offhand: false,
      }));
    }




    if(globals.tankStats.bonuses.windfury) {
        ret.push(
            new WindfuryProc()
        )
    }

    if(globals.tankStats.talents.swordSpec > 0) {
        ret.push(
            new SwordSpecialization(
                globals.tankStats.talents.swordSpec,
            )
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


