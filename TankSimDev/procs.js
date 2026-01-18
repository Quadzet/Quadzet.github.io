"use strict";
/* The Proc classes are used to implement events that are carry-on effects of other events.
 * This can be things like damage procs or extra attacks, effects that occur instantly.
 * Aura procs, for example Gift of Arthas, are instead implemented as Auras, even though
 * one could intuit that they would be Procs. This is because they behave more like auras
 * in the code, no deeper reason that that.
 */

import { LOG_LEVEL, log_message } from './logging.js';
import { LANDED_HITS } from './constants.js';
import { rollSpellAttack } from './attacktable.js';
import { clearFutureTicks, generateDamageEvent, generateTickEvents } from './eventHelpFuncs.js';

export class Proc {

    constructor(name) {
        this.name = name;
    }

    handleEvent(source, target, event, reactiveEvents, futureEvents) {
        log_message(LOG_LEVEL.WARNING, "No event handler specified for proc " + this.name + ".");
        return;
    }
    reset() {
    }

}


export class WindfuryProc extends Proc {
    constructor() {
        super("Windfury")
    }

    handleEvent(source, target, event, reactiveEvents, futureEvents) {

        if (event.type == "damage" && event.ability != "OH Swing" && LANDED_HITS.includes(event.hit)) {
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

export class SwordSpecialization extends Proc {
    constructor(points) {
        super("Sword Specialization");
        this.procChance = 0.01 * points;
    }

    handleEvent(source, target, event, reactiveEvents, futureEvents) {
        if (event.type == "damage" && event.source == source.name && event.trigger && LANDED_HITS.includes(event.hit)) {
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

export class WeaponProc extends Proc {
  constructor(proc) {
    super(proc.name);
    Object.assign(this, {
        spellCoeff: 0,
        ICD: 0,
        offhand: false,
        cooldown: 0,
        trigger: false, // Don't trigger additional procs.
        ...proc
    });
  }
  handleEvent(source, target, event, reactiveEvents, futureEvents) {
    if (event.type == "damage" && event.trigger && source.name == event.source && LANDED_HITS.includes(event.hit)) {
      if (this.offhand && event.name != "OH Swing")
        return;
      if (event.timestamp < this.cooldown)
        return;
      let rng = Math.random();
      let procChance = this.procChance != null ? this.procChance : this.ppm * (this.offhand ? source.stats.offhand.swingtimer : source.stats.mainhand.swingtimer) / 60000;
      if (rng < procChance) {
        this.cooldown = event.timestamp + this.ICD;
        if (this.damage > 0) {
          let damageEvent = rollSpellAttack(source, target, this.damage * source.getSpellDamageMod(), false, !this.magic);
          damageEvent.name = this.name;
          damageEvent.timestamp = event.timestamp;
          damageEvent.threat = damageEvent.amount * source.stats.threatMod;
          damageEvent.trigger = false;
          reactiveEvents.push(generateDamageEvent(damageEvent));
        }
        if (this.tick > 0) {
          clearFutureTicks(this.name, futureEvents);
          let damageEvent = rollSpellAttack(source, target, this.tick * source.getSpellDamageMod(), true, !this.magic);
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

export function getTankProcs(globals) {
    let ret = []

    globals.tankStats.procs.forEach(proc => {
      ret.push(new WeaponProc(proc))
    });

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
        ret.push(new WindfuryProc());
    }

    if(globals.tankStats.talents.swordSpec > 0) {
        ret.push(new SwordSpecialization(globals.tankStats.talents.swordSpec));
    }

    return ret;
}

export function getBossProcs(globals) {
    let ret = [];
    return ret;
}


