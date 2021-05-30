"use strict";


// TODO: create Boss and Tank subclasses
class Actor {
    constructor(name, stats, abilities, procs) {
        this.name = name
        this.stats = stats
        this.swingTimer = 2000 // remove
        this.attackpower = 2000 // remove
        this.weaponDamage = 100 // remove
        this.abilities = abilities
        
        this.threatMod = stats.threatMod
        this.damageMod = stats.damageMod
        this.additivePhysBonus = 0; // Gift of Arthas
        this.hastePerc = stats.hastePerc
        this.armor = stats.baseArmor
        this.defense = stats.defense
        this.resilience = stats.resilience
        this.crit = stats.crit
        this.hit = stats.hit
        this.crit = stats.crit
        this.block = stats.block
        this.GCD = 0
        this.onGCD = false
        this.rage = stats.startRage

        this.buffs = {}
        this.debuffs = {}
        this.procs = procs
        
        this.uptimes = {}
        
        this.rageGained = 0 // remove?
        this.rageSpent = 0
        
        this.staminaMultiplier = stats.staminaMultiplier;
        this.strengthMultiplier = stats.strengthMultiplier;
        this.agilityMultiplier = stats.agilityMultiplier;

        // Special stuff
        this.IEA = false
        this.isHeroicStrikeQueued = false
        this.windfury = false

    }
    
    handleEvent(event, eventList, futureEvents) {

        // TODO: The boss obviously does not need Revenge logic
        if(event.type == "damage" && this.name == "Tank") {

            // Procs
            if(event.source == "Tank") {
                this.procs.forEach(proc => {
                    proc.handleEvent(event.source, event.target, event, eventList, futureEvents)
                })
            }
            // We might have just gotten rage to perform an action
            if(event.source == "Tank" && event.name == "MH Swing")
                performAction(event.timestamp, this, eventList, futureEvents)

            // We gained Defensive state, meaning it's possible we can use revenge straight away
            if(event.target == this.name && ["block", "parry", "dodge"].includes(event.hit)) {
                this.applyAura(event.timestamp, "Defensive State", event.source, eventList, futureEvents)
                performAction(event.timestamp, this, eventList, futureEvents)
            }

            // Remove defensive State after using Revenge
            if(event.source == this.name && event.name == "Revenge") {
                this.buffs["Defensive State"].expire(event.timestamp, eventList, futureEvents)
            }

            //  Remove stacks of Shield Block after blocking
            if(event.target == "Tank" && event.hit == "block") {
                if(this.buffs["Shield Block"]) {
                    this.buffs["Shield Block"].removeStack(event.timestamp, this, eventList, futureEvents)
                }
            }

        // An ability came off cooldown, check if we should use it
        } else if(event.type == "cooldownFinish" && !this.onGCD) {
            performAction(event.timestamp, this, eventList, futureEvents)
        }

        // Parry haste
        if(event.type == "damage" && event.target == this.name && event.hit == "parry") {
            futureEvents.forEach(e => {
                if(e.type == "swingTimer" && e.source == this.name)
                    e.timestamp = getParryHastedSwingEnd(e.swingStart, e.timestamp, event.timestamp)
            })
            sortDescending(futureEvents)
        }

        // Placeholder for if we just got rage to be able to take an action
        if(!this.onGCD) {
            performAction(event.timestamp, this, eventList, futureEvents)
        }
    }



    applyAura(timestamp, name, source, eventList, futureEvents, isBuff = true) {
        if(isBuff) {
            if(this.buffs[name]) {
                this.buffs[name].refresh(timestamp, this.name, eventList, futureEvents)
            }
            else {
                let buff = Buffs[name]
                buff.apply(timestamp, this.name, source, eventList, futureEvents)
            }
        }
        else {
            if(this.debuffs[name]) {
                this.debuffs[name].refresh(timestamp, this.name, eventList, futureEvents)
            }
            else {
                let debuff = Debuffs[name]
                debuff.apply(timestamp, this.name, source, eventList, futureEvents)
            }
        }
    }



    addRage(rage, add=false) {
        this.rage = Math.max(0, Math.min(100, this.rage + rage))
    }

    getSwingTimer() {
        return this.stats.MHSwing/(1+this.hastePerc/100)
    }

    // *** old *** 
    getArmor() {
        return Math.max(0, this.armor);
    }

    getAP() {
        let AP = this.stats.AP;
        if (this.windfury) {
            AP += this.stats.bonuses.windfuryAP
        }
        return AP;
    }

    getBlockValue() {
        let blockValue = this.stats.blockValue;
        return blockValue;
    }

    getBlock() {
        return this.block
    }

    // Physical dmg mod
    getDamageMod() {
        let damageMod = this.damageMod
        damageMod *= this.stats.physDmgMod;
        return damageMod;
    }


    reset() {
        for(let ability in this.abilities) {
            this.abilities[`${ability}`].cooldownReady = 0
        }
        this.buffs = {}
        this.debuffs = {}
        this.onGCD = false
        this.rage = this.stats.startRage
        this.isHeroicStrikeQueued = false
        this.IEA = false
        this.damageMod = this.stats.damageMod
        this.hastePerc = this.stats.hastePerc
        this.defense = this.stats.defense
        this.additivePhysBonus = 0
        this.rageGained = 0
        this.rageSpent = 0
        this.uptimes = {}
    }


}

let Actors = {}

/*
class Actor {
    constructor(name, target, abilities, stats, auras, procs) {
        this.stats = stats
        this.name = name
        this.target = target
        this.abilities = abilities
        this.threatMod = stats.threatMod
        this.damageMod = stats.damageMod
        this.additivePhysBonus = 0; // Gift of Arthas
        this.hastePerc = stats.hastePerc
        this.armor = stats.baseArmor
        this.defense = stats.defense
        this.GCD = 0
        this.rage = stats.startRage

        this.auras = auras
        this.procs = procs
        
        this.uptimes = {}
        
        this.rageGained = 0 // remove?
        this.rageSpent = 0
        
        this.staminaMultiplier = stats.staminaMultiplier;
        this.strengthMultiplier = stats.strengthMultiplier;
        this.agilityMultiplier = stats.agilityMultiplier;

        // Special stuff
        this.IEA = false
        this.isHeroicStrikeQueued = false
        
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
        //if(this.name == "Boss") console.log(this.armor)
        return Math.max(0, this.armor * percArmorMod);
    }

    getAP() {
        let AP = this.stats.AP;
        this.auras.forEach(aura => {
            if (aura.duration > 0) {
                if (aura.strMod > 0) {
                    AP += aura.strMod * 2 * this.strengthMultiplier;
                }
                if (aura.APMod > 0) {
                    if(!aura.scalingStacks) AP += aura.APMod;
                    else AP += aura.APMod * aura.stacks;
                }
            }
        });
        return AP;
    }

    getBlockValue() {
        let blockValue = this.stats.blockValue;
        this.auras.forEach(aura => {
            if(aura.duration > 0) {
                if(aura.blockValue > 0) {
                    blockValue += aura.blockValue;
                }
                if(aura.strMod > 0) {
                    blockValue += aura.strMod/20;
                }
            }
        })
        return blockValue;
    }

    // Physical dmg mod
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
        damageMod *= this.stats.physDmgMod;
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
        this.IEA = false
        this.damageMod = this.stats.damageMod
        this.hastePerc = this.stats.hastePerc
        this.defense = this.stats.defense
        this.additivePhysBonus = 0
        this.rageGained = 0
        this.rageSpent = 0
        this.uptimes = {}
    }

}
*/