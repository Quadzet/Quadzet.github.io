"use strict";
class Actor {
    constructor(name, target, abilities, stats, auras, procs) {
        this.name = name
        this.target = target
        this.abilities = abilities
        this.threatMod = 1.495
        this.damageMod = stats.damageMod
        this.hastePerc = stats.hastePerc
        this.armor = stats.baseArmor
        this.stats = stats
        this.GCD = 0
        this.rage = stats.startRage
        this.isHeroicStrikeQueued = false

        this.auras = auras
        this.procs = procs

        this.rageGained = 0 // remove?
        this.rageSpent = 0
        this.flurryUptime = 0
        this.crusaderUptime = 0
    }
    getArmor() {
        this.armor = this.stats.baseArmor
        let percArmorMod = 1;
        this.auras.forEach(aura => {
            if (aura.duration > 0) {
                if (aura.armorMod != 0) {
                    let multiplier = 1;
                    if (aura.scalingStacks) multiplier = aura.stacks;
                    this.armor += aura.armorMod * multiplier;
                }
                if (aura.percArmorMod != 1) percArmorMod *= (1 + aura.percArmorMod/100);
            }
        });
        return this.armor * percArmorMod;
    }

    getAP() {
        let AP = this.stats.AP;
        this.auras.forEach(aura => {
            if (aura.duration > 0) {
                if (aura.strMod > 0) {
                    AP += aura.strMod * 2; // TODO: Kings, Hakkar buff, AP buffs etc 
                }
                if (aura.APMod > 0) {
                    if(!aura.scalingStacks) AP += aura.APMod;
                    else AP += aura.APMod * aura.stacks;
                }
            }
        });
        return AP;
    }

    getDamageMod() {
        let damageMod = this.damageMod
        this.auras.forEach(aura => {
            if (aura.duration > 0) {
                if (aura.damageMod != 1) {
                    let multiplier = 1;
                    if (aura.scalingStacks) multiplier = aura.stacks;
                    damageMod *= aura.damageMod * multiplier;
                }
            }
        });
        return damageMod;
    }

    addRage(rage, add=false) {
        this.rage = Math.max(0, Math.min(100, this.rage + rage))

        if (this.name == "Tank" && add) {
            if (rage > 0) this.rageGained += rage;
            else this.rageSpent -= rage;
        }
    }

    addParryHaste() {
        this.abilities.forEach(ability => {
            if (["MH Swing", "Auto Attack"].includes(ability.name))
                ability.currentCooldown = getParryHastedSwing(ability.currentCooldown, ability.baseCooldown);
        });
    }

    reset() {
        this.abilities.forEach(ability => { ability.currentCooldown = 0; });
        this.auras.forEach(aura => {
            aura.stacks = 0;
            aura.duration = 0;
        })
        this.GCD = 0
        this.rage = this.stats.startRage
        this.isHeroicStrikeQueued = false
        this.damageMod = this.stats.damageMod
        this.hastePerc = this.stats.hastePerc
        this.rageGained = 0 // remove?
        this.rageSpent = 0
        this.flurryUptime = 0
        this.crusaderUptime = 0
    }

}