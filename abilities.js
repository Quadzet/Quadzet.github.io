"use strict";

function updateRage(attacker, hit, rageCost) {
    if (hit in ["dodge", "parry", "miss"]) attacker.addRage(-0.25*rageCost, true); // Default ability refund 80%
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

    isUsable(actor) {
        return this.currentCooldown <= 0 && (actor.GCD <= 0 || this.onGCD == false) && actor.rage > this.rageCost;
    }
}

class MHSwing extends Ability {
    use(attacker, defender) {
        let damageEvent = {};
        // Heroic Strike
        if (attacker.isHeroicStrikeQueued && attacker.rage > 15) {
            let damage = this.weaponSwingRoll(attacker) + 157;
            damage *= (1 - armorReduction(attacker.stats.level, defender.getArmor())) * attacker.getDamageMod();
            damageEvent = rollAttack(attacker.stats, defender.stats, damage, true);
            this.staticThreat = 175;
            damageEvent.threat = this.threatCalculator(damageEvent, attacker);
            this.staticThreat = 0;
            damageEvent.ability = "Heroic Strike";

            // Remove rage
            updateRage(attacker, damageEvent.hit, 15);
        }
        // White Swing
        else {
            let damage = this.weaponSwingRoll(attacker);
            damage *= (1 - armorReduction(attacker.stats.level, defender.getArmor())) * attacker.getDamageMod();
            damageEvent = rollAttack(attacker.stats, defender.stats, damage, false, true);

            damageEvent.threat = 0;
            damageEvent.threat = this.threatCalculator(damageEvent, attacker);
            damageEvent.ability = "MH Swing";

            // Add rage
            if (damageEvent.hit == "miss") return;
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
        damage *= 0.625*(1 - armorReduction(attacker.stats.level, defender.getArmor())) * attacker.getDamageMod();
        let damageEvent = rollAttack(attacker.stats, defender.stats, damage, false, !attacker.isHeroicStrikeQueued, true);

        damageEvent.threat = 0;
        damageEvent.threat = this.threatCalculator(damageEvent, attacker);
        damageEvent.ability = this.name;
        // Add rage
        if (damageEvent.hit == "miss") return;
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
        let damage = 0.45*attacker.getAP();
        damage *= (1 - armorReduction(attacker.stats.level, defender.getArmor())) * attacker.getDamageMod();
        let damageEvent = rollAttack(attacker.stats, defender.stats, damage, true, false, false, true);
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
        let damage = Math.random()*18 + 81; // Rank6: 81-99 dmg
        damage *= (1 - armorReduction(attacker.stats.level, defender.getArmor())) * attacker.getDamageMod();
        let damageEvent = rollAttack(attacker.stats, defender.stats, damage, true, false, false, true);
        damageEvent.threat = 0;
        damageEvent.threat = this.threatCalculator(damageEvent, attacker);
        damageEvent.ability = this.name;
        // Remove rage
        updateRage(attacker, damageEvent.hit, this.rageCost);
        return damageEvent;
    }

    isUsable(actor) {
        let offCD = (this.currentCooldown <= 0 && (actor.GCD <= 0 || this.onGCD == false) && actor.rage > this.rageCost);
        if (!offCD) return false;
        var defStateActive = false;
        actor.auras.forEach(aura => {
            if (aura.name == "Defensive State" && aura.duration > 0)
                defStateActive = true; 
        })
        return defStateActive;
    }
}

class SunderArmor extends Ability {
    use(attacker, defender) {
        let damage = 0;
        let damageEvent = rollAttack(attacker.stats, defender.stats, damage, true);
        if (damageEvent.hit == "crit") damageEvent.hit = "hit";  // TODO this can't crit...
        damageEvent.threat = 0;
        damageEvent.threat = this.threatCalculator(damageEvent, attacker);
        damageEvent.ability = this.name;
        // Remove rage
        updateRage(attacker, damageEvent.hit, this.rageCost);
        return damageEvent;
    }
    isUsable(actor) {
        return (this.currentCooldown <= 0 && (actor.GCD <= 0 || this.onGCD == false) && actor.rage > 60);
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
    isUsable(actor) {
        return (actor.isHeroicStrikeQueued == false && actor.rage > 50);
    }
}