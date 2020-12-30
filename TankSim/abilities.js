"use strict";

function updateRage(attacker, hit, rageCost) {
    if (attacker.stats.fivePieceWrath && Math.random() < 0.25) rageCost = Math.max(rageCost - 5, 0) // 0.25 instead of 0.2 to account for parry/dodge streaks not consuming the buff
    if (["dodge", "parry", "miss"].includes(hit)) attacker.addRage(-0.2*rageCost, true); // Default ability refund 80%
    else attacker.addRage(-rageCost, true);
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
        this.currentCooldown = 0
    }

    //if the ability or swing hits, returns threat.
    //if no connection, returns 0
    threatCalculator(dmg_event, attacker) {
        if (
            dmg_event.hit != "parry" && 
            dmg_event.hit != "dodge" && 
            dmg_event.hit != "miss" ) {
            return ((dmg_event.damage * this.threatScaling) +  this.staticThreat) * attacker.stats.threatMod;
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
    use(attacker, defender) {
        console.log(`Internal Error: Use function not implemented for ability ${this.name}!`);
    }

    isUsable(attacker, defender) {
        return this.currentCooldown <= 0 && (attacker.GCD <= 0 || this.onGCD == false) && attacker.rage >= this.rageCost;
    }
}

class MHSwing extends Ability {
    use(attacker, defender) {
        let damageEvent = {};
        // Heroic Strike
        if (attacker.isHeroicStrikeQueued && attacker.rage > (15 - attacker.stats.talents.impHS)) {
            let damage = this.weaponSwingRoll(attacker) + 157 + defender.additivePhysBonus;
            damage *= (1 - armorReduction(attacker.stats.level, defender.getArmor())) * attacker.getDamageMod();
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
        damage += attacker.stats.twoPieceDreadnaught ? 75 : 0;
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

