"use strict";
class Actor {
    // constructor(name, target, abilities, stats, procs) {
    constructor(name, stats, abilities, procs, auras) {
        this.name = name
        this.stats = stats
        this.abilities = abilities
        this.rotation = stats.rotation
        this.rageConv = 0.00911077836 * stats.level * stats.level + 3.225598133 * stats.level + 4.2562911;

        this.threatMod = stats.threatMod
        this.damageMod = stats.damageMod
        this.physDamageMod = stats.physDamageMod
        this.additivePhysBonus = stats.additivePhysBonus
        this.hastePerc = stats.hastePerc
        this.armor = stats.baseArmor
        this.percArmorMod = 1
        this.defense = stats.defense
        this.crit = stats.crit
        this.hit = stats.hit
        this.block = stats.block
        this.GCD = 0
        this.onGCD = false
        this.inCombat = false
        this.rage = stats.startRage

        this.procs = procs
        this.auras = auras
        
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

    handleEvent(event, reactiveEvents, futureEvents) {
        // Scheduled events, eg prepull actions
        if (this.name == "Tank" && event.type == "scheduledEvent") {
          handleScheduledEvent(event, this, this.target, reactiveEvents, futureEvents);
          return;
        }
        // Auras
        this.auras.forEach(aura => {
          aura.handleEvent(event, this, this.target, reactiveEvents, futureEvents);
        })

        if (this.name == "Tank") {
          // Procs
          if(this.name == "Tank") {
            this.procs.forEach(proc => {
              proc.handleEvent(this, this.target, event, reactiveEvents, futureEvents)
            })
          }
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
        return this.stats.MHSwing/(1+this.hastePerc/100)
    }
    getOHSwingTimer() {
        return this.stats.OHSwing/(1+this.hastePerc/100)
    }

    // *** old *** 
    getArmor() {
        // if(this.name == "Tank" && this.armor < 10)
        //     console.log(this.armor)
        return Math.max(0, this.armor * this.percArmorMod);
    }

    getAP() {
        let AP = this.stats.AP;
        // if (this.windfury) {
        //     AP += this.stats.bonuses.windfuryAP
        // }
        this.auras.forEach(aura => {
          if (aura.duration > 0)
            AP *= aura.APMultMod;
        })
        return AP;
    }

    getBlockValue() {
        let blockValue = this.stats.blockValue;
        return blockValue;
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
        this.auras.forEach(aura => {
          aura.duration = 0;
          aura.stacks = 0;
        })
        this.procs.forEach(proc => proc.reset())
        this.buffs = {}
        this.debuffs = {}
        this.onGCD = false
        this.inCombat = false
        this.rage = this.stats.startRage
        this.isHeroicStrikeQueued = false
        this.IEA = false
        this.damageMod = this.stats.damageMod
        this.physDamageMod = this.stats.physDamageMod
        this.hastePerc = this.stats.hastePerc
        this.defense = this.stats.defense
        this.additivePhysBonus = this.stats.additivePhysBonus 
        this.rageGained = 0
        this.rageSpent = 0
        this.armor = this.stats.baseArmor
        this.percArmorMod = 1
        this.uptimes = {}

        this.threatMod = this.stats.threatMod
        this.resilience = this.stats.resilience
        this.hit = this.stats.hit
        this.crit = this.stats.crit
        this.block = this.stats.block
        this.GCD = 0

        this.IEA = false
        this.isHeroicStrikeQueued = false
        this.windfury = false

    }




      /*  
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
*/
}