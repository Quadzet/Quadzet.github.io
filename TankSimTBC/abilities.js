"use strict";

function updateRage(attacker, hit, rageCost) {
    if (attacker.stats.bonuses.fivePieceWrath && Math.random() < 0.25) rageCost = Math.max(rageCost - 5, 0) // 0.25 instead of 0.2 to account for parry/dodge streaks not consuming the buff
    if (["dodge", "parry", "miss"].includes(hit)) attacker.addRage(-0.2*rageCost, true) // Default ability refund 80%
    else attacker.addRage(-rageCost, true)
}

class Ability {
    constructor(name, baseCooldown, rageCost, onGCD, staticThreat = 0, threatScaling = 1) {
        this.name = name
        this.baseCooldown = baseCooldown
        this.rageCost = rageCost
        this.onGCD = onGCD
        this.staticThreat = staticThreat
        this.threatScaling = threatScaling
        // TODO: spellCrit
        this.cooldownReady = 0
    }


    processDamageEvent(timestamp, damageEvent, source, target, eventList, futureEvents) {

        damageEvent.threat = 0
        damageEvent.threat = this.threatCalculator(damageEvent, source)
        damageEvent.name = this.name
        damageEvent.timestamp = timestamp
        eventList.push(damageEvent)

        this.cooldownReady = timestamp + this.baseCooldown
        updateRage(source, damageEvent.hit, this.rageCost)
        
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
    }



    //if the ability or swing hits, returns threat.
    //if no connection, returns 0
    threatCalculator(dmg_event, attacker) {
        if (
            dmg_event.hit != "parry" && 
            dmg_event.hit != "dodge" && 
            dmg_event.hit != "miss" ) {
            return ((dmg_event.amount * this.threatScaling) +  this.staticThreat) * attacker.stats.threatMod
        }
        else return 0
    }
    weaponSwingRoll(attacker) {
        return (
            Math.random()*(attacker.stats.MHMax - attacker.stats.MHMin) +
            attacker.stats.MHMin + attacker.getAP()*attacker.stats.MHSwing/
            (14*1000))
    }

    // This function needs to be implemented in the sub classes!
    use(sourceName, targetName) {
        console.log(`Internal Error: Use function not implemented for ability ${this.name}!`)
    }

    isUsable(timestamp, source) {
        return this.cooldownReady <= timestamp && (!source.onGCD || !this.onGCD) && source.rage >= this.rageCost
    }
}

class Autoattack extends Ability {
    constructor() {
        super("MH Swing", 0, 0, false, 0, 1)
    }

    use(timestamp, source, target, eventList, futureEvents) {
        let damageEvent = {}
        if(!source.windfury && source.isHeroicStrikeQueued && source.rage >= (15 - source.stats.talents.impHS - source.stats.talents.focusedrage)) {
            this.staticThreat = 194
            let damage = this.weaponSwingRoll(source) + target.additivePhysBonus + 176
            damage *= (1 - armorReduction(source.stats.level, target.getArmor())) * source.getDamageMod()
            damageEvent = rollAttack(source, target, damage, true)

            damageEvent.threat = this.threatCalculator(damageEvent, source)
            damageEvent.name = "Heroic Strike"
            damageEvent.timestamp = timestamp
            eventList.push(damageEvent)

            this.staticThreat = 0

            updateRage(source, damageEvent.hit, (15 - source.stats.talents.impHS - source.stats.talents.focusedrage))

        } else {
            let damage = this.weaponSwingRoll(source) + target.additivePhysBonus
            damage *= (1 - armorReduction(source.stats.level, target.getArmor())) * source.getDamageMod()
            damageEvent = rollAttack(source, target, damage, false, source.stats.dualWield)
            
            damageEvent.threat = 0
            damageEvent.threat = this.threatCalculator(damageEvent, source)
            damageEvent.name = "MH Swing"
            damageEvent.timestamp = timestamp
            eventList.push(damageEvent)

            // Add rage
            let rageBonus = source.stats.MHSwing*2.5/1000
            if(damageEvent.hit == "crit")
                rageBonus *=2

            if (damageEvent.hit == "miss") {}
            else if (["dodge", "parry"].includes(damageEvent.hit)) source.addRage(0.75*(damage*7.5/274.7 + rageBonus)/2, true) // 'refund' 75% of the rage gain
            else {
                source.addRage((damageEvent.amount*7.5/274.7 + rageBonus)/2, true)
                target.addRage(damageEvent.amount*2.5/274.7, true)
            }
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
    }
}

class ShieldSlam extends Ability {
    constructor() {
        super("Shield Slam", 6000, 20, true, 305, 1)
    }

    use(timestamp, source, target, eventList, futureEvents) {

        let damage = 350 + source.getBlockValue()
        damage *= (1 - armorReduction(source.stats.level, target.getArmor())) * source.getDamageMod()
        let damageEvent = rollAttack(source, target, damage, true, false, false, true)

        this.processDamageEvent(timestamp, damageEvent, source, target, eventList, futureEvents)
    }
    isUsable(timestamp, source) {
        return this.cooldownReady <= timestamp && (!source.onGCD || !this.onGCD) && (source.rage >= this.rageCost - source.stats.talents.focusedrage)
    }
}

class Devastate extends Ability {
    constructor() {
        super("Devastate", 15, 0, true)
    }

    use(timestamp, source, target, eventList, futureEvents) {
        // TODO: IEA interaction 
        let stacks = 0
        if(target.debuffs["Sunder Armor"])
            stacks = target.debuffs["Sunder Armor"].stacks

        let damage = 0.35 * (source.stats.MHMin + Math.random()*(source.stats.MHMax - source.stats.MHMin) + source.getAP()*source.stats.MHSwing/(14*1000)) + stacks * 50
        damage *= (1 - armorReduction(source.stats.level, target.getArmor())) * source.getDamageMod()
        let damageEvent = rollAttack(source, target, damage, true, false, false, true)
        let threat = 0
        if(!["miss", "parry", "dodge"].includes(damageEvent.hit) && !Globals.config.IEA)
            threat = (damageEvent.amount + 100 + ((stacks == 5) ? 0 : 305.1))*source.stats.threatMod
        else
            (damageEvent.amount + 100)*source.stats.threatMod
        damageEvent.threat = threat
        damageEvent.name = this.name
        damageEvent.timestamp = timestamp

        eventList.push(damageEvent)

        if(!["miss", "parry", "dodge"].includes(damageEvent.hit) && !Globals.config.IEA)
            target.applyAura(timestamp, "Sunder Armor", source.name, eventList, futureEvents, false)

        source.onGCD = true
        updateRage(source, damageEvent.hit, this.rageCost - source.stats.talents.focusedrage - source.stats.talents.impSA)
        let futureEvent = {
            type: "GCD",
            source: source.name,
            timestamp: timestamp + 1500
        }
        registerFutureEvent(futureEvent, futureEvents)

        source.handleEvent(damageEvent, eventList, futureEvents)
        target.handleEvent(damageEvent, eventList, futureEvents)
    }
    isUsable(timestamp, source) {
        return this.cooldownReady <= timestamp && (!source.onGCD || !this.onGCD) && (source.rage >= this.rageCost - source.stats.talents.focusedrage - source.stats.talents.impSA)
    }
}

class Revenge extends Ability {
    constructor() {
        super("Revenge", 5000, 5, true, 200, 1)
    }

    isUsable(timestamp, source) {
        let defensiveState = false
        if(source.buffs["Defensive State"])
            defensiveState = true
        return defensiveState && this.cooldownReady <= timestamp && (!source.onGCD || !this.onGCD) && (source.rage >= this.rageCost - source.stats.talents.focusedrage)
    }
    use(timestamp, source, target, eventList, futureEvents) {
        let damage = Math.random()*75 + 343 + target.additivePhysBonus // Rank6: 81-99 dmg
        damage *= (1 - armorReduction(source.stats.level, target.getArmor())) * source.getDamageMod()
        let damageEvent = rollAttack(source, target, damage, true, false, false, true)

        this.processDamageEvent(timestamp, damageEvent, source, target, eventList, futureEvents)
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
        eventList.push(spellCastEvent)
        source.onGCD = true
        this.cooldownReady = timestamp + this.baseCooldown

        source.applyAura(timestamp, "Shield Block", source.name, eventList, futureEvents)

        updateRage(source, 'hit', this.rageCost)
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


}



let TankAbilities = {
    "MH Swing": new Autoattack(),
    "Shield Slam": new ShieldSlam(),
    "Devastate": new Devastate(),
    "Revenge": new Revenge(),
    "Shield Block": new ShieldBlock(),
    "Heroic Strike": new HeroicStrike(),
}

let BossAbilities = {
    "MH Swing": new Autoattack(),
}

/*


class MHSwing extends Ability {
    use(attacker, defender) {
        let damageEvent = {}
        // Heroic Strike
        if (attacker.isHeroicStrikeQueued && attacker.rage > (15 - attacker.stats.talents.impHS)) {
            let damage = this.weaponSwingRoll(attacker) + 157 + defender.additivePhysBonus
            damage *= (1 - armorReduction(attacker.stats.level, defender.getArmor())) * attacker.getDamageMod()
            damageEvent = rollAttack(attacker, defender, damage, true);
            this.staticThreat = 175;
            damageEvent.threat = this.threatCalculator(damageEvent, attacker);
            this.staticThreat = 0;
            damageEvent.ability = "Heroic Strike";
            // Remove rage
            updateRage(attacker, damageEvent.hit, (15 - attacker.stats.talents.impHS));
        }
        // White Swing
        else {
            let damage = this.weaponSwingRoll(attacker) + defender.additivePhysBonus;
            damage *= (1 - armorReduction(attacker.stats.level, defender.getArmor())) * attacker.getDamageMod();
            damageEvent = rollAttack(attacker, defender, damage, false, attacker.stats.dualWield);
            
            damageEvent.threat = 0;
            damageEvent.threat = this.threatCalculator(damageEvent, attacker);
            damageEvent.ability = "MH Swing";
            
            // Add rage
            if (damageEvent.hit == "miss") return damageEvent;
            else if (["dodge", "parry"].includes(damageEvent.hit)) attacker.addRage(0.75*damage*7.5/230.6, true); // 'refund' 75% of the rage gain
            else {
                attacker.addRage(damageEvent.damage*7.5/230.6, true);
                defender.addRage(damageEvent.damage*2.5/230.6, true);
            }
        }
        
        attacker.isHeroicStrikeQueued = false;
        return damageEvent;
    }
}

class OHSwing extends Ability {

    use(attacker, defender) {
        let damage = Math.random()*(attacker.stats.OHMax - attacker.stats.OHMin) + attacker.stats.OHMin + attacker.getAP()*attacker.stats.OHSwing/(14*1000); // swing timer is in ms
        damage = damage*(0.5 + 0.025*attacker.stats.talents.dwspec) +  defender.additivePhysBonus;
        damage *=(1 - armorReduction(attacker.stats.level, defender.getArmor())) * attacker.getDamageMod();
        let damageEvent = rollAttack(attacker, defender, damage, false, !attacker.isHeroicStrikeQueued, true);
        damageEvent.threat = 0;
        damageEvent.threat = this.threatCalculator(damageEvent, attacker);
        damageEvent.ability = this.name;
        // Add rage
        if (damageEvent.hit == "miss") return damageEvent;
        else if (["dodge", "parry"].includes(damageEvent.hit)) attacker.addRage(0.75*damage*7.5/230.6, true); // 'refund' 75% of the rage gain
        else {
            attacker.addRage(damageEvent.damage*7.5/230.6, true);
            defender.addRage(damageEvent.damage*2.5/230.6);
        }
        return damageEvent;
    }
}
class Bloodthirst extends Ability {
    use(attacker, defender) {
        let damage = 0.45*attacker.getAP() + defender.additivePhysBonus;
        damage *= (1 - armorReduction(attacker.stats.level, defender.getArmor())) * attacker.getDamageMod();
        let damageEvent = rollAttack(attacker, defender, damage, true, false, false, true);
        damageEvent.threat = 0;
        damageEvent.threat = this.threatCalculator(damageEvent, attacker);
        damageEvent.ability = this.name;

        // Remove rage
        updateRage(attacker, damageEvent.hit, this.rageCost)
        return damageEvent;
    }
}

class Revenge extends Ability {
    use(attacker, defender) {
        let damage = Math.random()*18 + 81 + defender.additivePhysBonus; // Rank6: 81-99 dmg
        damage += attacker.stats.bonuses.twoPieceDreadnaught ? 75 : 0;
        damage *= (1 - armorReduction(attacker.stats.level, defender.getArmor())) * attacker.getDamageMod();
        let damageEvent = rollAttack(attacker, defender, damage, true, false, false, true);
        damageEvent.threat = 0;
        damageEvent.threat = this.threatCalculator(damageEvent, attacker);
        damageEvent.ability = this.name;
        // Remove rage
        updateRage(attacker, damageEvent.hit, this.rageCost);
        return damageEvent;
    }

    isUsable(attacker, defender) {
        let offCD = (this.currentCooldown <= 0 && (attacker.GCD <= 0 || this.onGCD == false) && attacker.rage > this.rageCost);
        if (!offCD) return false;
        var defStateActive = false;
        attacker.auras.forEach(aura => {
            if (aura.name == "Defensive State" && aura.duration > 0)
                defStateActive = true; 
        })
        return defStateActive;
    }
}

class SunderArmor extends Ability {
    use(attacker, defender) {
        let damage = 0;
        let damageEvent = rollAttack(attacker, defender, damage, true);
        if (damageEvent.hit == "crit") damageEvent.hit = "hit";  // TODO this can't crit...
        damageEvent.threat = 0;
        damageEvent.threat = this.threatCalculator(damageEvent, attacker);
        damageEvent.ability = this.name;
        // Remove rage
        updateRage(attacker, damageEvent.hit, this.rageCost);
        return damageEvent;
    }
    isUsable(attacker, defender) {
        return (!defender.IEA && this.currentCooldown <= 0 && (attacker.GCD <= 0 || this.onGCD == false) && attacker.rage > this.rageCost + (attacker.stats.dualWield ? 10 : 15));
    }
}

class HeroicStrike extends Ability {
    use(attacker, defender) {
        // Note that just pressing the ability has no rage cost
        attacker.isHeroicStrikeQueued = true;
        return {
                type: "spell cast",
                name: this.name,
        };
    }
    isUsable(attacker, defender) {
        return (attacker.isHeroicStrikeQueued == false && attacker.rage > this.rageCost + (attacker.stats.dualWield ? 0 : 60));
    }
}

class BattleShout extends Ability {
    threatCalculator(damageEvent, attacker) {
        return attacker.stats.bshouttargets * 60 * attacker.stats.threatMod; // Base threat = 60
    }
    
    use(attacker, defender) {
        let spellCastEvent = {
            type: "spell cast",
            name: this.name,
            ability: this.name,
            threat: this.threatCalculator({}, attacker),
        }
        // Remove rage
        updateRage(attacker, "hit", this.rageCost);
        return spellCastEvent;
    }
    isUsable(attacker, defender) {
        return (defender.IEA && (attacker.GCD <= 0 || this.onGCD == false) && attacker.rage > this.rageCost + (attacker.stats.dualWield ? 10 : 15));
    }
}

class ShieldSlam extends Ability {
    use(attacker, defender) {
        let damage = 350 + attacker.getBlockValue();
        damage *= (1 - armorReduction(attacker.stats.level, defender.getArmor())) * attacker.getDamageMod();
        let damageEvent = rollAttack(attacker, defender, damage, true, false, false, true);
        damageEvent.threat = 0;
        damageEvent.threat = this.threatCalculator(damageEvent, attacker);
        damageEvent.ability = this.name;

        // Remove rage
        updateRage(attacker, damageEvent.hit, this.rageCost)
        return damageEvent;
    }
}
*/
