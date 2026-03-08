"use strict";

import { handleScheduledEvent, performAction } from './rotation.js';
import { generateRageEventFromDamage } from './abilities.js';
import { log_message, LOG_LEVEL } from './logging.js';

export class Actor {
  constructor(name, stats, APL, abilities, onUseAbilities, procs, auras) {
    this.name = name;
    this.stats = stats;
    this.APL = APL;
    this.rageConv = 0.00911077836 * stats.level * stats.level + 3.225598133 * stats.level + 4.2562911;
    this.rageGained = 0; // remove?
    this.rageSpent = 0;

    this.rotation = stats.rotation;
    this.abilities = abilities;
    this.onUseAbilities = onUseAbilities;
    this.procs = procs;
    this.auras = auras;

    this.init();
  }

  getAttribute(attr) {
    switch (attr) {
    case 'armor':
        return this.getArmor();
    case 'attackpower':
        return this.getAP();
    case 'blockvalue':
        return this.getBlockValue();
    case 'dodge':
        return this.getDodge();
    case 'swingtimer':
        return this.getSwingTimer();
    case 'ohswingtimer':
        return this.getOHSwingTimer();
    case 'stamina':
        return this.getStamina();
    case 'strength':
        return this.getStrength();
    case 'agility':
        return this.getAgility();
    case 'crit':
        return this.getCrit();
    case 'health':
        return this.getHealth();
    case 'on_gcd':
        return this.onGCD;
    case 'heroic_strike_queued':
        return this.isHeroicStrikeQueued;
    case 'rage':
    case 'parry':
    case 'defense':
    case 'haste':
    case 'hit':
        return this[attr];
    default:
        throw new Error(`Invalid ability attribute: '${attr}'.`);
    }
  }

  decideAction(State) {
    return this.APL.evaluate(State, this);
  }

  // TODO: Expand this function with non-abilities, eg onUse etc.
  actionUsable(State, abilityName) {
    if (!(abilityName in this.abilities)) {
      log_message(LOG_LEVEL.WARNING, `actionUsable(): Ability ${abilityName} ` +
        `is not included in ${this.name}'s ability list.`);
      return false;
    }
    return this.abilities[abilityName].isUsable(State.time, this);
  }

  performAction(action, target, State, reactiveEvents, futureEvents) {
    if (action === null) {
      log_message(LOG_LEVEL.DEBUG, `performAction(): Skipping null action.`)
      return false;
    }
    if (action.type === 'wait') {
      log_message(LOG_LEVEL.DEBUG, "Actor is waiting...");
      return false; // No need to do anything, just wait until next action worth event.
    } else if (action.type === 'use') {
      if (!(action.ability in this.abilities)) {
        log_message(LOG_LEVEL.WARNING, `performAction(): Ability ${action.ability} ` +
          `is not included in ${this.name}'s ability list.`);
        return false;
      }
      this.abilities[action.ability].use(State.time, this, target, reactiveEvents, futureEvents);
    }
  }


  handleEvent(event, State, reactiveEvents, futureEvents) {
    // Scheduled events, eg prepull actions
    if (this.name == "Tank" && event.type == "scheduledEvent") {
      handleScheduledEvent(event, this, this.target, reactiveEvents, futureEvents);
      return;
    }
    // Auras
    this.auras.forEach(aura => {
      aura.handleEvent(event, this, this.target, reactiveEvents, futureEvents);
    });

    // Auto attacks
    if (event.type == "swingTimer" && this.name == event.source) {
      if (event.name == "OH Swing")
        this.abilities["offhand_swing"].use(State.time, this, this.target, reactiveEvents, futureEvents);
      else if (event.name == "MH Swing")
        this.abilities["mainhand_swing"].use(State.time, this, this.target, reactiveEvents, futureEvents);
      else
        throw new Error(`Invalid swingTimer event name: ${event.name}.`);
    }

    if (this.name == "Tank") {
      // Procs
      this.procs.forEach(proc => {
        proc.handleEvent(event, this, this.target, reactiveEvents, futureEvents)
      });
      // Potentially generate rage from the dmg taken/done (white swing)
      if (event.type == "damage") {
        let rageEvent = generateRageEventFromDamage(this, this.target, event, ["MH Swing", "OH Swing"].includes(event.name));
        if (rageEvent !== undefined)
          reactiveEvents.push(rageEvent);
        // An ability came off cooldown, check if we should use it
      } else if (event.type == "cooldownFinish" && !this.onGCD) {
        performAction(State, this, this.target, reactiveEvents, futureEvents)
      } else if (event.type == "rage") {
        this.addRage(event);
        // We might have just gotten rage to perform an action
        performAction(State, this, this.target, reactiveEvents, futureEvents)
      } else if (event.type == "extra attack") {
        let index = futureEvents.findIndex(e => { return (e.type == "swingTimer" && e.name == "MH Swing" && e.source == event.source) })
        if (index >= 0)
          futureEvents.splice(index, 1)
        this.abilities["mainhand_swing"].use(State.time, this, this.target, reactiveEvents, futureEvents);
      } else {
        // Placeholder for if we just got rage to be able to take an action
        if (!this.onGCD) {
          performAction(State, this, this.target, reactiveEvents, futureEvents)
        }
      }
    }
  }

  addRage(event, add = false) {
    event.currentAmount = this.rage;
    this.rage = Math.max(0, Math.min(100, this.rage + event.amount))
  }

  getSwingTimer() {
    return this.stats.mainhand.swingtimer / (1 + this.haste / 100)
  }
  getOHSwingTimer() {
    return this.stats.offhand.swingtimer / (1 + this.haste / 100)
  }

  getArmor() {
    return Math.max(0, (this.armor + this.getAgility() / 20) * this.armorMod + this.bonusArmor);
  }

  // TODO: Rename to getAttackpower().
  getAP() {
    return this.attackpower + this.strength * this.strengthMod;
  }

  getStamina() {
    return this.stamina * this.staminaMod;
  }

  getAgility() {
    return this.agility * this.agilityMod;
  }

  getStrength() {
    return this.strength * this.strengthMod;
  }

  getHealth() {
    return this.health + this.getStamina() * 10;
  }

  // TODO: Scale agi correctly depending on player level.
  getDodge() {
    return this.dodge + this.getAgility() / 20;
  }

  getBlockValue() {
    return this.blockvalue + this.strength / 20;
  }

  getCrit() {
    return this.crit + this.getAgility() / 20;
  }

  getPhysDamageMod() {
    return this.damageMod * this.physDamageMod;
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


  // Initiate, or reset, stats to their starting values.
  init() {
    for (let ability in this.abilities) {
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
    this.uptimes = {};

    this.strength = this.stats.strength;
    this.stamina = this.stats.stamina;
    this.agility = this.stats.agility;

    this.staminaMod = this.stats.staminaMod;
    this.strengthMod = this.stats.strengthMod;
    this.agilityMod = this.stats.agilityMod;
    this.flatArmor = this.stats.flatArmor;
    this.flatDamage = this.stats.flatDamage;
    this.threatMod = this.stats.threatMod;
    this.damageMod = this.stats.damageMod;
    this.physDamageMod = this.stats.physDamageMod;
    this.armorMod = this.stats.armorMod;

    this.attackpower = this.stats.attackpower;
    this.haste = this.stats.haste;
    this.armor = this.stats.armor;
    this.bonusArmor = this.stats.bonusArmor;
    this.defense = this.stats.defense;
    this.crit = this.stats.crit;
    this.hit = this.stats.hit;
    this.blockvalue = this.stats.blockvalue;
    this.block = this.stats.block;
    this.health = this.stats.health;

    this.rage = this.stats.startRage;
    this.rageGained = 0;
    this.rageSpent = 0;

    // Special stuff
    this.onGCD = false;
    this.inCombat = false;
    this.IEA = false;
    this.isHeroicStrikeQueued = false;
    this.windfury = false;
  }
}
