"use strict";


function updateRage(source, target, event, rageCost, isWhiteHit) {
  let rageEvent = {
      timestamp: event.timestamp,
      type: "rage",
      source: source.name,
      name: event.name,

      amount: 0,
  }
  if (event.type == "damage") {
    if (isWhiteHit) {
      let c = 82.25; // From Guybrush testing on SoD at lvl 25
      // 0.00911077836 * source.stats.level * source.stats.level + 3.225598133 * source.stats.level + 4.2562911; // Probably wrong, at least in SoD, but ti's the info we have
      let multiplier = (source.stats.runes && source.stats.runes.endlessRage) ? 1.25 : 1;
      if (source.name == "Tank") {
        if (event.hit == "miss") {}
        else if (["dodge", "parry"].includes(event.hit)) {//source.addRage(0.75*damage*multiplier*7.5/c, true); 
          rageEvent.amount = 0.75*event.amount*multiplier*7.5/c; // 'refund' 75% of the rage gain
        } else {
          rageEvent.amount = event.amount*7.5*multiplier/c;
          // source.addRage(event.amount*7.5*multiplier/c, true);
        }
      }
      else if (target.name == "Tank") {
        if (!["dodge", "parry", "miss"].includes(event.hit)) {
          rageEvent.amount = event.amount*2.5/c;
          // target.addRage(event.amount*2.5/c, true);
        }
      }
    } else { // Yellow hit
      if (source.stats.bonuses.fivePieceWrath && Math.random() < 0.25) { //rageCost = Math.max(rageCost - 5, 0) 
        rageEvent.amount = Math.max(rageCost - 5, 0); // 0.25 instead of 0.2 to account for parry/dodge streaks not consuming the buff
      }
      if (["dodge", "parry", "miss"].includes(event.hit)) { //source.addRage(-0.2*rageCost, true); 
        rageEvent.amount = -0.2*rageCost; // Default ability refund 80%
      }
      else { //source.addRage(-rageCost, true);
        rageEvent.amount = -rageCost;
      }
    }
  }
  else if (event.type == "spellCast") {
    rageEvent.amount = -rageCost;
  }
  return rageEvent;
}

class Ability {
    constructor(name, baseCooldown, rageCost, onGCD) {
        this.name = name
        this.baseCooldown = baseCooldown
        this.rageCost = rageCost
        this.onGCD = onGCD
        // TODO: spellCrit
        this.currentCooldown = 0
    }
    processDamageEvent(timestamp, damageEvent, source, target, eventList, futureEvents) {

        damageEvent.threat = this.threatCalculator(damageEvent, source)
        if (this.rank(source.stats.level) > 0)
          damageEvent.name = this.name + " (Rank " + this.rank(source.stats.level) + ")"
        else
          damageEvent.name = this.name
        damageEvent.timestamp = timestamp
        eventList.push(damageEvent)

        this.cooldownReady = timestamp + this.baseCooldown
        let rageEvent = updateRage(source, target, damageEvent, this.rageCost, false);
        eventList.push(rageEvent);
        
        if(this.onGCD) {
            source.onGCD = true
            let futureEvent = {
                type: "GCD",
                source: source.name,
                timestamp: timestamp + 1500
            }
            registerFutureEvent(futureEvent, futureEvents)
        }
        let futureEvent = {
            type: "cooldownFinish",
            name: this.name,
            source: source.name,
            timestamp: timestamp + this.baseCooldown
        }
        registerFutureEvent(futureEvent, futureEvents)
        
        source.handleEvent(damageEvent, eventList, futureEvents)
        target.handleEvent(damageEvent, eventList, futureEvents)

        source.handleEvent(rageEvent, eventList, futureEvents)
        target.handleEvent(rageEvent, eventList, futureEvents)
    }
    rank(level)
    {
      return 0;
    }
    damage(rank)
    {
      return 0;
    }
    staticThreat(rank)
    {
      return 0;
    }
    threatModifier(rank)
    {
      return 1;
    }
    //if the ability or swing hits, returns threat.
    //if no connection, returns 0
    threatCalculator(dmg_event, attacker) {
        if (
            dmg_event.hit != "parry" && 
            dmg_event.hit != "dodge" && 
            dmg_event.hit != "miss" ) {
            let rank = this.rank(attacker.stats.level);
            return ((dmg_event.amount * this.threatModifier(rank)) +  this.staticThreat(rank)) * attacker.stats.threatMod;
        }
        else return 0;
    }
    weaponSwingRoll(attacker) {
        return (
            Math.random()*(attacker.stats.MHMax - attacker.stats.MHMin) +
            attacker.stats.MHMin + attacker.getAP()*attacker.stats.MHSwing/
            (14*1000));
    }

    // This function needs to be implemented in the sub classes!
    use(timestamp, source, target, eventList, futureEvents) {
        console.log(`Internal Error: Use function not implemented for ability ${this.name}!`);
    }

    isUsable(timestamp, source) {
        return this.rank(source.stats.level) != -1 && this.cooldownReady <= timestamp && (!source.onGCD || !this.onGCD) && source.rage >= this.rageCost;
    }
}

class Autoattack extends Ability {
    constructor() {
        super("MH Swing", 0, 0, false)
    }

    use(timestamp, source, target, eventList, futureEvents) {
        let damageEvent = {};
        let rageEvent = {};
        // Heroic Strike
        if (source.isHeroicStrikeQueued && source.rage > (15 - source.stats.talents.impHS)) {
            let damage = this.weaponSwingRoll(source) + this.damage(this.rank(source.stats.level)) + target.additivePhysBonus;
            damage *= (1 - armorReduction(source.stats.level, target.getArmor())) * source.getDamageMod();
            damageEvent = rollAttack(source, target, damage, true);
            damageEvent.threat = this.threatCalculator(damageEvent, source);
            damageEvent.name = "Heroic Strike (Rank " + this.rank(source.stats.level) + ")";
            damageEvent.timestamp = timestamp
            eventList.push(damageEvent)

            // Remove rage
            rageEvent = updateRage(source, target, damageEvent, (15 - source.stats.talents.impHS), false);
            eventList.push(rageEvent);
            // updateRage(source, damageEvent.hit, (15 - source.stats.talents.impHS));
        }
        // White Swing
        else {
            let damage = this.weaponSwingRoll(source) + target.additivePhysBonus;
            damage *= (1 - armorReduction(source.stats.level, target.getArmor())) * source.getDamageMod();
            damageEvent = rollAttack(source, target, damage, false, source.stats.dualWield);
            damageEvent.threat = this.threatCalculator(damageEvent, source);
            damageEvent.name = "MH Swing";
            damageEvent.timestamp = timestamp
            eventList.push(damageEvent)

            rageEvent = updateRage(source, target, damageEvent, this.rageCost, true);
            eventList.push(rageEvent);
        }
        
        source.isHeroicStrikeQueued = false
        let futureEvent = {
            type: "swingTimer",
            source: source.name,
            target: target.name,
            name: "MH Swing",
            timestamp: timestamp + source.getSwingTimer(),
            swingStart: timestamp,
        }
        registerFutureEvent(futureEvent, futureEvents)

        source.handleEvent(damageEvent, eventList, futureEvents)
        target.handleEvent(damageEvent, eventList, futureEvents)
        source.handleEvent(rageEvent, eventList, futureEvents)
        target.handleEvent(rageEvent, eventList, futureEvents)
    }
    // Needs to be overridden since MHSwing is actually both HS and MHSwing...
    threatCalculator(dmg_event, attacker) {
        if (
            dmg_event.hit != "parry" && 
            dmg_event.hit != "dodge" && 
            dmg_event.hit != "miss" ) {
            if (attacker.isHeroicStrikeQueued && attacker.rage > (15 - attacker.stats.talents.impHS)) {
              let rank = this.rank(attacker.stats.level);
              return ((dmg_event.amount * this.threatModifier(rank)) +  this.staticThreat(rank)) * attacker.stats.threatMod;
            } else {
              return dmg_event.amount * attacker.stats.threatMod;
            }
        }
        else return 0;
    }
    rank(level)
    {
      if (level < 8) return 1;
      else if (level < 16) return 2;
      else if (level < 24) return 3;
      else if (level < 32) return 4;
      else if (level < 40) return 5;
      else if (level < 48) return 6;
      else if (level < 56) return 7;
      else if (level < 60) return 8; // TODO: Used at 60 without skill book
      else return 9;
    }
    damage(rank) {
      if (rank == 1) return 11;
      else if (rank == 2) return 21;
      else if (rank == 3) return 32;
      else if (rank == 4) return 44;
      else if (rank == 5) return 58;
      else if (rank == 6) return 80;
      else if (rank == 7) return 111;
      else if (rank == 8) return 138; // TODO: Used at 60 without skill book
      else if (rank == 9) return 157;
      else 
      {
        console.log("Error: invalid rank for Heroic Strike: " + rank)
        return 0;
      }
    }
    staticThreat(rank) {
      if (rank == 1) return 20;
      else if (rank == 2) return 39;
      else if (rank == 3) return 59;
      else if (rank == 4) return 78;
      else if (rank == 5) return 98;
      else if (rank == 6) return 118;
      else if (rank == 7) return 137;
      else if (rank == 8) return 145; // TODO: Used at 60 without skill book
      else if (rank == 9) return 175;
      else 
      {
        console.log("Error: invalid rank for Heroic Strike: " + rank)
        return 0;
      }
    }
}

class OHSwing extends Ability {

    use(timestamp, source, target, eventList, futureEvents) {
        let damage = Math.random()*(source.stats.OHMax - source.stats.OHMin) + source.stats.OHMin + source.getAP()*source.stats.OHSwing/(14*1000); // swing timer is in ms
        damage = damage*(0.5 + 0.025*source.stats.talents.dwspec) +  target.additivePhysBonus;
        damage *=(1 - armorReduction(source.stats.level, target.getArmor())) * source.getDamageMod();
        let damageEvent = rollAttack(source, target, damage, false, !source.isHeroicStrikeQueued, true);
        damageEvent.threat = 0;
        damageEvent.threat = this.threatCalculator(damageEvent, source);
        damageEvent.name = this.name;
        eventList.push(damageEvent)

        // let multiplier = (source.stats.runes && source.stats.runes.endlessRage) ? 1.25 : 1;
        // let c = 0.00911077836 * source.stats.level * source.stats.level + 3.225598133 * source.stats.level + 4.2562911; // Probably wrong, at least in SoD, but ti's the info we have
        // if (damageEvent.hit == "miss") {}
        // else if (["dodge", "parry"].includes(damageEvent.hit)) source.addRage(0.75*damage*7.5*multiplier/c, true); // 'refund' 75% of the rage gain
        // else {
        //     source.addRage(damageEvent.amount*7.5*multiplier/c, true);
        //     target.addRage(damageEvent.amount*2.5/c);
        // }
        // Add rage
        let rageEvent = updateRage(source, target, damageEvent, this.rageCost, true);
        // TODO: SET FUTURE_EVENT OH SWING
        source.handleevent(damageEvent, eventList, futureEvents)
        target.handleevent(damageEvent, eventList, futureEvents)
        source.handleevent(rageEvent, eventList, futureEvents)
        target.handleevent(rageEvent, eventList, futureEvents)
        eventList.push(rageEvent);
    }
}
/*
class Bloodthirst extends Ability {
    use(attacker, defender) {
        let damage = 0.45*attacker.getAP() + defender.additivePhysBonus;
        damage *= (1 - armorReduction(attacker.stats.level, defender.getArmor())) * attacker.getDamageMod();
        let damageEvent = rollAttack(attacker, defender, damage, true, false, false, true);
        damageEvent.threat = 0;
        damageEvent.threat = this.threatCalculator(damageEvent, attacker);
        damageEvent.name = this.name;

        // Remove rage
        updateRage(attacker, damageEvent.hit, this.rageCost)
        return damageEvent;
    }
}
*/

class Revenge extends Ability {
    constructor() {
        super("Revenge", 5000, 5, true)
    }
    use(timestamp, source, target, eventList, futureEvents) {
        let damage = this.damage(this.rank(source.stats.level)) + target.additivePhysBonus;
        damage += source.stats.bonuses.twoPieceDreadnaught ? 75 : 0;
        damage *= (1 - armorReduction(source.stats.level, target.getArmor())) * source.getDamageMod();
        let damageEvent = rollAttack(source, target, damage, true, false, false, true);
        this.processDamageEvent(timestamp, damageEvent, source, target, eventList, futureEvents)
    }

    isUsable(timestamp, source) {
        let defensiveState = false
        source.auras.forEach(aura => {
         if (aura.name == "Defensive State" && aura.duration > 0) 
          defensiveState = true;
        });
        return defensiveState && this.cooldownReady <= timestamp && (!source.onGCD || !this.onGCD) && (source.rage >= this.rageCost)
    }
    rank(level) {
      if (level < 14) return -1;
      else if (level < 24) return 1;
      else if (level < 34) return 2;
      else if (level < 44) return 3;
      else if (level < 54) return 4;
      else if (level < 60) return 5;
      else return 6;
    }
    damage(rank) {
      if (rank == 1) return Math.random()*2 + 12;
      else if (rank == 2) return Math.random()*4 + 18;
      else if (rank == 3) return Math.random()*6 + 25;
      else if (rank == 4) return Math.random()*10 + 43;
      else if (rank == 5) return Math.random()*14 + 64;
      else if (rank == 6) return Math.random()*18 + 81;
      else 
      {
        console.log("Error: invalid rank for " + this.name + ": " + rank)
        return 0;
      }
    }
    staticThreat(rank) {
      if (rank == 1) return 63;
      else if (rank == 2) return 108; 
      else if (rank == 3) return 153; // NEEDS TESTING
      else if (rank == 4) return 198; // NEEDS TESTING
      else if (rank == 5) return 243;
      else if (rank == 6) return 273;
      else 
      {
        console.log("Error: invalid rank for " + this.name + ": " + rank)
        return 0;
      }
    }
    threatModifier(rank) {
      return 2.25;
    }
}

class ShieldBlock extends Ability {
    constructor() {
        super("Shield Block", 6000, 10, false)
    }
    use(timestamp, source, target, eventList, futureEvents) {
        let spellCastEvent = {
            type: "spellCast",
            name: this.name,
            source: source.name,
            timestamp: timestamp,
        }
        this.processDamageEvent(timestamp, spellCastEvent, source, target, eventList, futureEvents)
        // eventList.push(spellCastEvent)
        // source.onGCD = true
        // this.cooldownReady = timestamp + this.baseCooldown

        // source.applyAura(timestamp, "Shield Block", source.name, eventList, futureEvents)

        // updateRage(source, 'hit', this.rageCost)
    }
    threatCalculator(event, source) {
      return 0;
    }
}

class SunderArmor extends Ability {
  constructor(impSA) {
    super("Sunder Armor", 0, 15-impSA, true)
  }
    use(timestamp, source, target, eventList, futureEvents) {
        let damage = 0;
        let damageEvent = rollAttack(source, target, damage, true);
        if (damageEvent.hit == "crit") damageEvent.hit = "hit";  // TODO this can't crit...
        this.processDamageEvent(timestamp, damageEvent, source, target, eventList, futureEvents)
    }
    isUsable(timestamp, source) {
        return this.cooldownReady <= timestamp && (!source.onGCD || !this.onGCD) && (source.rage >= this.rageCost - source.stats.talents.impSA)
    }
    rank(level) {
      if (level < 10) return -1;
      else if (level < 22) return 1;
      else if (level < 34) return 2;
      else if (level < 46) return 3;
      else if (level < 58) return 4;
      else return 5;
    }
    staticThreat(rank) {
      if (rank == 1) return 45;
      else if (rank == 2) return 99; 
      else if (rank == 3) return 153; // NEEDS TESTING
      else if (rank == 4) return 207; // NEEDS TESTING
      else if (rank == 5) return 261;
      else 
      {
        console.log("Error: invalid rank for " + this.name + ": " + rank)
        return 0;
      }
    }
}

class Bloodrage extends Ability {
    constructor() {
        super("Bloodrage", 60000, -10, false) // "cost" is negative 10 rage, ie you gain 10 rage
    }

    use(timestamp, source, target, eventList, futureEvents) {
        let spellCastEvent = {
            type: "spellCast",
            name: this.name,
            source: source.name,
            timestamp: timestamp,
        }
        this.processDamageEvent(timestamp, spellCastEvent, source, target, eventList, futureEvents)
        // eventList.push(spellCastEvent)
    }
    isUsable(timestamp, source) {
        return (this.cooldownReady <= timestamp);
    }
    threatCalculator(event, source) {
      return 50;
    }
}

class HeroicStrike extends Ability {
    constructor() {
        super("Heroic Strike", 0, 0, false)
    }

    use(timestamp, source, target, eventList, futureEvents) {
        let spellCastEvent = {
            type: "spellCast",
            name: this.name,
            source: source.name,
            timestamp: timestamp,
        }
        eventList.push(spellCastEvent)

        source.isHeroicStrikeQueued = true
    }
    isUsable(timestamp, source) {
        return (source.isHeroicStrikeQueued == false && source.rage > this.rageCost + (source.stats.dualWield ? 0 : 60));
    }
    threatCalculator(event, source) {
      return 0;
    }
}

class BattleShout extends Ability {
    constructor() {
        super("Battle Shout", 10, 0, true)
    }
    threatCalculator(damageEvent, attacker) {
        return attacker.stats.bshouttargets * this.staticThreat(this.rank(attacker.stats.level)) * attacker.stats.threatMod; 
    }
    
    use(timestamp, source, target, eventList, futureEvents) {
        let spellCastEvent = {
            type: "spellCast",
            name: this.name,
            ability: this.name, 
            threat: this.threatCalculator({}, source),
            hit: "hit"
        }
        this.processDamageEvent(timestamp, damageEvent, source, target, eventList, futureEvents)
    }
    isUsable(timestamp, source) {
        return (defender.IEA && (attacker.GCD <= 0 || this.onGCD == false) && attacker.rage > this.rageCost + (attacker.stats.dualWield ? 10 : 15));
    }
    rank(level) {
      if (level < 12) return 1;
      else if (level < 22) return 2;
      else if (level < 32) return 3;
      else if (level < 42) return 4;
      else if (level < 52) return 5;
      else if (level < 60) return 6;
      else return 7;
    }
    staticThreat(rank) {
      if (rank == 1) return 1; // NEEDS TESTING
      else if (rank == 2) return 12; // NEEDS TESTING
      else if (rank == 3) return 22; // NEEDS TESTING
      else if (rank == 4) return 32; // NEEDS TESTING
      else if (rank == 5) return 42; // NEEDS TESTING
      else if (rank == 6) return 52;
      else if (rank == 7) return 60;
      else 
      {
        console.log("Error: invalid rank for " + this.name + ": " + rank)
        return 0;
      }
    }
}

class ShieldSlam extends Ability {
    constructor() {
        super("Shield Slam", 6000, 20, true)
    }
    use(timestamp, source, target, eventList, futureEvents) {
        let damage = this.damage(this.rank(source.stats.level)) + source.getBlockValue() + target.additivePhysBonus;
        damage *= (1 - armorReduction(source.stats.level, target.getArmor())) * source.getDamageMod();
        let damageEvent = rollAttack(source, target, damage, true, false, false, true);

        this.processDamageEvent(timestamp, damageEvent, source, target, eventList, futureEvents)
    }
    rank(level) {
      if (level < 40) return -1;
      else if (level < 48) return 1;
      else if (level < 54) return 2;
      else if (level < 60) return 3;
      else return 4;
    }
    damage(rank) {
      if (rank == 1) return Math.random()*10 + 225;
      else if (rank == 2) return Math.random()*12 + 264;
      else if (rank == 3) return Math.random()*14 + 303;
      else if (rank == 4) return Math.random()*16 + 342;
      else 
      {
        console.log("Error: invalid rank for " + this.name + ": " + rank)
        return 0;
      }
    }
    staticThreat(rank) {
      if (rank == 1) return 178;
      else if (rank == 2) return 203;
      else if (rank == 3) return 229;
      else if (rank == 4) return 254;
      else 
      {
        console.log("Error: invalid rank for " + this.name + ": " + rank)
        return 0;
      }
    }
}

class Devastate extends Ability {
    constructor(impSA) {
        super("Devastate", 0, 15-impSA, true)
    }

    use(timestamp, source, target, eventList, futureEvents) {
      let stacks = 0
      target.auras.forEach(aura => {
        if (aura.name == "Sunder Armor" && aura.duration > 0)
          stacks = aura.stacks;
      })
      if (target.IEA || target.homonculi)
        stacks = 5;
      let damage = 0.6 * (source.stats.MHMin + Math.random()*(source.stats.MHMax - source.stats.MHMin) + source.getAP()*source.stats.playerNormSwing/(14*1000)) * (1 + stacks * 0.06) + target.additivePhysBonus;
      damage *= (1 - armorReduction(source.stats.level, target.getArmor())) * source.getDamageMod()
      let damageEvent = rollAttack(source, target, damage, true, false, false, true)
      this.processDamageEvent(timestamp, damageEvent, source, target, eventList, futureEvents)
    }
    rank(level) {
      if (level < 10) return -1;
      else if (level < 22) return 1;
      else if (level < 34) return 2;
      else if (level < 46) return 3;
      else if (level < 58) return 4;
      else return 5;
    }
    staticThreat(rank) {
      if (rank == 1) return 45;
      else if (rank == 2) return 99; // NEEDS TESTING
      else if (rank == 3) return 153; // NEEDS TESTING
      else if (rank == 4) return 207; // NEEDS TESTING
      else if (rank == 5) return 261;
      else 
      {
        console.log("Error: invalid rank for " + this.name + ": " + rank)
        return 0;
      }
    }
    isUsable(timestamp, source) {
        return this.cooldownReady <= timestamp && (!source.onGCD || !this.onGCD) && (source.rage >= this.rageCost - source.stats.talents.impSA)
    }
}

class RagingBlow extends Ability {
    constructor() {
        super("Raging Blow", 8000, 0, true)
    }
    use(timestamp, source, target, eventList, futureEvents) {
        let damage = (source.stats.MHMin + Math.random()*(source.stats.MHMax - source.stats.MHMin) + source.getAP()*source.stats.playerNormSwing/(14*1000)) + target.additivePhysBonus;
        damage *= (1 - armorReduction(source.stats.level, target.getArmor())) * source.getDamageMod();
        let damageEvent = rollAttack(source, target, damage, true, false, false, true);

        this.processDamageEvent(timestamp, damageEvent, source, target, eventList, futureEvents)
    }
    isUsable(timestamp, source) {
        let isEnraged = false;
        source.auras.forEach(aura => {
          if (["Berserker Rage", "Bloodrage", "Enrage", "Consumed by Rage"].includes(aura.name) && aura.duration > 0)
            isEnraged = true;
        })
        return this.cooldownReady <= timestamp && isEnraged && (!source.onGCD || !this.onGCD) && source.rage >= this.rageCost;
    }
}

class Rend extends Ability {
    constructor() {
        super("Rend", 0, 10, true)
    }
    use(timestamp, source, target, eventList, futureEvents) {
        let damage = 0;
        let damageEvent = rollAttack(source, target, damage, true);
        if (!["dodge", "miss", "parry"].includes(damageEvent.hit)) damageEvent.hit = "hit";  // TODO this can't crit...
        damageEvent.rank = this.rank(source.stats.level);
        this.processDamageEvent(timestamp, damageEvent, source, target, eventList, futureEvents)

        for (let i = 0; i < this.duration(this.rank(source.stats.level))/3000; i++) { 

          let impRendMult = 1;
          if (source.stats.talents.impRend)
            impRendMult += 0.05 + 0.1 * source.stats.talents.impRend;
          let dotDamage = statRound(this.damage(damageEvent.rank) * target.stats.bleedBonus * impRendMult);
          let dotEvent = 
          {
            timestamp: damageEvent.timestamp + (i+1)*3000,
            type: "damage",
            source: damageEvent.source,
            target: damageEvent.target,
            name: this.name,
            hit: "hit", 
            threat: dotDamage * source.stats.threatMod,

            amount: dotDamage,
          }
          dotEvent.threat = this.threatCalculator(dotEvent, source);
          registerFutureEvent(dotEvent, futureEvents);
        }
      }
    rank(level) {
      if (level < 4) return -1;
      else if (level < 10) return 1;
      else if (level < 20) return 2;
      else if (level < 30) return 3;
      else if (level < 40) return 4;
      else if (level < 50) return 5;
      else if (level < 60) return 6;
      else return 7;
    }
    duration(rank) {
      if (rank == 1) return 9000;
      if (rank == 2) return 12000;
      if (rank == 3) return 15000;
      if (rank == 4) return 18000;
      else if (rank < 8) return 21000;
      else log_message("Invalid rank of " + this.name + ": " + rank);
    }
    damage(rank) {
      if (rank == 1) return 5;
      if (rank == 2) return 7;
      if (rank == 3) return 9;
      if (rank == 4) return 11;
      if (rank == 5) return 14;
      if (rank == 6) return 18;
      if (rank == 7) return 21;
      else log_message("Invalid rank of " + this.name + ": " + rank);
    }
    isUsable(timestamp, source) {
        return this.cooldownReady <= timestamp && (!source.onGCD || !this.onGCD) && source.rage >= this.rageCost;
    }
}

// TODO: Make this a vector with priorities on each ability, like
// [
//    {prio: 1, ability: new Devastate()}
// ]
// Then we sort the vector wrt prio, and use TankAbilities[1].ability.name/use etc
function TankAbilities(tankStats) {
  let abilities = {
    "MH Swing": new Autoattack(),
    "Shield Slam": new ShieldSlam(),
    "Revenge": new Revenge(),
    "Shield Block": new ShieldBlock(),
    "Heroic Strike": new HeroicStrike(),
    "Bloodrage": new Bloodrage(),
    "Rend": new Rend(),
  }
  if (tankStats.runes.ragingBlow)
    abilities["Raging Blow"] = new RagingBlow();
  if (tankStats.runes.devastate)
    abilities["Devastate"] = new Devastate(tankStats.talents.impSA);
  else
    abilities["Sunder Armor"] = new SunderArmor(tankStats.talents.impSA);
  // TODO: OH swing
  return abilities;
}

let BossAbilities = {
    "MH Swing": new Autoattack(),
}