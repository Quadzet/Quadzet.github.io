"use strict";

import { LOG_LEVEL, log_message } from './logging.js';
import { LANDED_HITS, EventType } from './constants.js';
import { rollSpellAttack } from './attacktable.js';
import { clearFutureTicks, generateDamageEvent, generateTickEvents } from './eventHelpFuncs.js';
import { checkAuraToggle, getIndex } from './config.js'
import { AURA_DATA } from './buffs.js'

/* The Proc classes are used to implement events that are carry-on effects of other events.
 * This can be things like damage procs or extra attacks, effects that occur instantly.
 * Aura procs, for example Gift of Arthas, are instead implemented as Auras, even though
 * one could intuit that they would be Procs. This is because they behave more like auras
 * in the code, no deeper reason that that.
 */

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

export class ThornsProc extends Proc {
    constructor(name, damage, isHoly = false) {
        super(name);
        this.damage = damage;
        this.isHoly = isHoly;
    }

    handleEvent(source, target, event, reactiveEvents, futureEvents) {

        if (event.type == EventType.DAMAGE && LANDED_HITS.includes(event.hit) && event.target == 'Tank') {
            let isDot = false;
            let isPhys = false;
            let procEvent = rollSpellAttack(source, target, this.damage, isDot, isPhys, this.isHoly);
            procEvent.name = this.name;
            procEvent.timestamp = event.timestamp;
            procEvent.threat = procEvent.amount * source.stats.threatMod;
            procEvent.trigger = false;

            reactiveEvents.push(procEvent);
        }
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


export function addTankProcs(stats, level) {
    let procs = []

    stats.procs.forEach(proc => {
        procs.push(new WeaponProc(proc))
    });

    if (checkAuraToggle('oh-oil')) {
        procs.push(new WeaponProc({
            name: "Shadow Oil",
            dmg: 56,
            spellCoeff: 0.56,
            procChance: 0.15,
            magic: true,
            offhand: true,
        }));
    }

    if (checkAuraToggle('oil')) {
        procs.push(new WeaponProc({
            name: "Shadow Oil",
            dmg: 56,
            spellCoeff: 0.56,
            procChance: 0.15,
            magic: true,
            offhand: false,
        }));
    }

    if (checkAuraToggle('thorns')) {
        let data = AURA_DATA['thorns'];
        let ix = getIndex(data, level);

        let factor = 1;
        if (checkAuraToggle('imp-thorns')) {
            factor *= AURA_DATA['imp-thorns']['factor'];
        }
        procs.push(new ThornsProc("Thorns", factor * data["thorns"][ix]));
    }
    if (checkAuraToggle('retri')) {
        let data = AURA_DATA['retri'];
        let ix = getIndex(data, level);

        let factor = 1;
        if (checkAuraToggle('imp-retri')) {
            factor *= AURA_DATA['imp-retri']['factor'];
        }
        procs.push(new ThornsProc("Retribution Aura", factor * data["thorns"][ix], true));
    }

    if (checkAuraToggle('windfury')) {
        procs.push(new WindfuryProc());
    }

    if (stats.talents.swordSpec > 0) {
        procs.push(new SwordSpecialization(stats.talents.swordSpec));
    }

    stats.procs = procs;
}

export function getBossProcs(globals) {
    let ret = [];
    return ret;
}

/**
 * Reconstructs Proc instances from serialized objects.
 * When globals is sent to the worker class instances
 * are serialized to plain objects and lose their prototype chain.
 * This function recreates proper Proc instances from that serialized data.
 */
export function reconstructProcs(serializedProcs) {
    if (!serializedProcs || !Array.isArray(serializedProcs)) {
        return [];
    }

    return serializedProcs.map(procData => {
        if (["Thorns", "Retribution Aura"].includes(procData.name) && procData.damage !== undefined) {
            return new ThornsProc(procData.name, procData.damage, procData.isHoly);
        }
        else if (procData.name === "Windfury") {
            return new WindfuryProc();
        }
        else if (procData.name === "Sword Specialization" && procData.procChance !== undefined) {
            const points = procData.procChance / 0.01;
            return new SwordSpecialization(points);
        }
        else if (procData.procChance !== undefined && procData.dmg !== undefined) {
            return new WeaponProc(procData);
        }
        else {
            log_message(LOG_LEVEL.WARNING, `Unknown proc type for ${procData.name}, creating generic Proc`);
            return new Proc(procData.name);
        }
    });
}


