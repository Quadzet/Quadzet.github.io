"use strict";

import { handleScheduledEvent, performAction } from './rotation.js';
import { generateRageEventFromDamage } from './abilities.js';

export class Actor {
    constructor(name, stats, abilities, onUseAbilities, procs, auras) {
        this.name = name;
        this.stats = stats;
        this.abilities = abilities;
        this.onUseAbilities = onUseAbilities;
        this.rotation = stats.rotation;
        this.rageConv = 0.00911077836 * stats.level * stats.level + 3.225598133 * stats.level + 4.2562911;

        this.threatMod = stats.threatMod;
        this.damageMod = stats.damageMod;
        this.physDamageMod = stats.physDamageMod;
        this.armorMod = stats.armorMod;
        this.haste = stats.haste;
        this.armor = stats.armor;
        this.bonusArmor = stats.bonusArmor;
        this.armorMod = stats.armorMod;
        this.defense = stats.defense;
        this.crit = stats.crit;
        this.hit = stats.hit;
        this.block = stats.block;
        this.onGCD = false;
        this.inCombat = false;
        this.rage = stats.startRage;

        this.procs = procs;
        this.auras = auras;

        this.uptimes = {};

        this.rageGained = 0; // remove?
        this.rageSpent = 0;

        this.staminaMultiplier = stats.staminaMultiplier;;
        this.strengthMultiplier = stats.strengthMultiplier;;
        this.agilityMultiplier = stats.agilityMultiplier;;
        this.flatArmor = stats.flatArmor;
        this.flatDamage = stats.flatDamage;

        // Special stuff
        this.IEA = false;
        this.isHeroicStrikeQueued = false;
        this.windfury = false;
    }

    handleEvent(event, reactiveEvents, futureEvents) {
        // Scheduled events, eg prepull actions
        if (this.name == "Tank" && event.type == "scheduledEvent") {
          handleScheduledEvent(event, this, this.target, reactiveEvents, futureEvents);
          return;
        }
        // Auras
        this.auras.forEach(aura => {
          aura.handleEvent(event, this, this.target, reactiveEvents, futureEvents);
        });

        if (this.name == "Tank") {
          // Procs
          this.procs.forEach(proc => {
            proc.handleEvent(event, this, this.target, reactiveEvents, futureEvents)
          });
          // Potentially generate rage from the dmg taken/done (white swing)
          if(event.type == "damage") {
            let rageEvent = generateRageEventFromDamage(this, this.target, event, ["MH Swing", "OH Swing"].includes(event.name));
            if (rageEvent !== undefined)
              reactiveEvents.push(rageEvent);
          // An ability came off cooldown, check if we should use it
          } else if(event.type == "cooldownFinish" && !this.onGCD) {
            performAction(event.timestamp, this, this.target, reactiveEvents, futureEvents)
          } else if (event.type == "rage") {
            this.addRage(event);
            // We might have just gotten rage to perform an action
            performAction(event.timestamp, this, this.target, reactiveEvents, futureEvents)
          } else if (event.type == "extra attack") {
            let index = futureEvents.findIndex(e => {return (e.type == "swingTimer" && e.name == "MH Swing" && e.source == event.source)})
            if(index >= 0)
                futureEvents.splice(index, 1)
            this.abilities["MH Swing"].use(event.timestamp, this, this.target, reactiveEvents, futureEvents);
          } else 
          // Placeholder for if we just got rage to be able to take an action
          if(!this.onGCD) {
              performAction(event.timestamp, this, this.target, reactiveEvents, futureEvents)
          }
        }
    }

    addRage(event, add=false) {
      event.currentAmount = this.rage;
      this.rage = Math.max(0, Math.min(100, this.rage + event.amount))
    }

    getSwingTimer() {
        return this.stats.mainhand.swingtimer/(1+this.haste/100)
    }
    getOHSwingTimer() {
        return this.stats.offhand.swingtimer/(1+this.haste/100)
    }

    // *** old *** 
    getArmor() {
        return Math.max(0, this.armor * this.armorMod + this.bonusArmor);
    }

    getAP() {
        let AP = this.stats.attackpower;
        this.auras.forEach(aura => {
          if (aura.duration > 0 && aura.attackpowerMod)
            AP *= aura.attackpowerMod;
        })
        return AP;
    }

    auraActive(name) {
      let active = false;
      this.auras.forEach(aura => {
        if (aura.name == name && aura.duration > 0)
          active = true;
      })
      return active;
    }

    resetCooldown(name) {
      if (this.abilities[name] != null)
        this.abilities[name].cooldownReady = 0; // Should be timestamp realistically but should not matter
    }

    getCritMod() {
        let critMod = this.stats.critMod;
        this.auras.forEach(aura => {
          if (aura.duration > 0 && aura.critMod)
            critMod *= aura.critMod;
        })
        return critMod;
    }
    // TODO: Add Str and blockvalue buffs.
    getBlockValue() {
        return this.stats.blockvalue;
    }

    getBlock() {
        return this.block
    }

    getPhysDamageMod() {
      return this.damageMod * this.physDamageMod;
    }

    getSpellDamageMod() {
      return this.damageMod;
    }


    reset() {
        for(let ability in this.abilities) {
            this.abilities[`${ability}`].cooldownReady = -90000;
        }
        this.onUseAbilities.forEach(ability => {
            ability.cooldownReady = -90000;
        });
        this.auras.forEach(aura => {
          aura.duration = 0;
          aura.stacks = 0;
        });
        this.procs.forEach(proc => proc.reset());
        this.buffs = {};
        this.debuffs = {};
        this.rage = this.stats.startRage;
        this.damageMod = this.stats.damageMod;
        this.physDamageMod = this.stats.physDamageMod;
        this.flatArmor = this.stats.flatArmor;
        this.flatDamage = this.stats.flatDamage;
        this.haste = this.stats.haste;
        this.defense = this.stats.defense;
        this.rageGained = 0;
        this.rageSpent = 0;
        this.armor = this.stats.armor;
        this.bonusArmor = this.stats.bonusArmor;
        this.armorMod = this.stats.armorMod;
        this.uptimes = {};

        this.threatMod = this.stats.threatMod;
        this.resilience = this.stats.resilience;
        this.hit = this.stats.hit;
        this.crit = this.stats.crit;
        this.block = this.stats.block;

        this.onGCD = false;
        this.inCombat = false;

        this.IEA = false;
        this.isHeroicStrikeQueued = false;
        this.windfury = false;
    }
}
