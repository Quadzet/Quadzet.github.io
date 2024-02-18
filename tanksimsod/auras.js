class Aura {
    constructor(input) {
        if (!input.type) this.type = "aura"; else this.type = input.type;
        if (!input.name) this.name = "unknown"; else this.name = input.name;
        if (!input.target) this.target = "unknown"; else this.target = input.target;
        if (!input.source) this.source = "unknown"; else this.source = input.source;
        if (!input.trackUptime) this.trackUptime = false; else this.trackUptime = input.trackUptime;

        if (!input.damage) this.damage = 0; else this.damage = input.damage;

        if (!input.duration) this.duration = 0; else this.duration = input.duration;
        if (!input.maxDuration) this.maxDuration = 0; else this.maxDuration = input.maxDuration;

        if (!input.stacks) this.stacks = 0; else this.stacks = input.stacks;
        if (!input.startStacks) this.startStacks = 1; else this.startStacks = input.startStacks;
        if (!input.maxStacks) this.maxStacks = -1; else this.maxStacks = input.maxStacks;
        if (!input.scalingStacks) this.scalingStacks = false; else this.scalingStacks = input.scalingStacks;

        if (!input.APMod) this.APMod = 0; else this.APMod = input.APMod; // additive
        if (!input.APMultMod) this.APMultMod = 1; else this.APMultMod = input.APMultMod; // multiplicative
        if (!input.strMod) this.strMod = 0; else this.strMod = input.strMod; // additive
        if (!input.critMod) this.critMod = 0; else this.critMod = input.critMod; // percentage
        if (!input.damageMod) this.damageMod = 1; else this.damageMod = input.damageMod; // multiplicative
        if (!input.physDamageMod) this.physDamageMod = 1; else this.physDamageMod = input.physDamageMod; // multiplicative
        if (!input.hastePerc) this.hastePerc = 0; else this.hastePerc = input.hastePerc; // percentage
        if (!input.percArmorMod) this.percArmorMod = 1; else this.percArmorMod = input.percArmorMod; // percentage
        if (!input.armorMod) this.armorMod = 0; else this.armorMod = input.armorMod; // additive
        if (!input.defenseMod) this.defenseMod = 0; else this.defenseMod = input.defenseMod; // additive
        if (!input.blockMod) this.blockMod = 0; else this.blockMod = input.blockMod; // additive
    }

    apply(timestamp, owner, source, reactiveEvents, futureEvents) {
        // owner.auras[this.name] = this

        if (this.duration > 0) {
          this.refresh(timestamp, owner, reactiveEvents, futureEvents);
          return;
        }

        if(this.maxStacks > 0)
            this.stacks = this.startStacks;
        this.duration = this.maxDuration;

        // this.owner = owner
        this.source = source

        // Add all modifiers here
        owner.armor += this.armorMod;
        owner.percArmorMod *= this.percArmorMod;
        owner.block += this.blockMod;
        owner.hastePerc += this.hastePerc;
        owner.damageMod *= this.damageMod;
        owner.physDamageMod *= this.physDamageMod;
        owner.APMultMod *= this.APMultMod;

        let applyEvent = { 
            type: "auraApply",
            name: this.name,
            owner: owner.name,
            source: this.source,
            stacks: this.stacks,
            auraType: this.type,
            timestamp: timestamp,
        }
        reactiveEvents.push(applyEvent);

        // Remove and update any coming auraExpires from this aura
        let index = futureEvents.findIndex(e => {return (e.type == "auraExpire" && e.name == this.name && e.owner == owner.name)})
        if(index >= 0)
            futureEvents.splice(index, 1);
        let futureEvent = {
            type: "auraExpire",
            name: this.name,
            owner: owner.name,
            source: this.source,
            stacks: this.stacks,
            auraType: this.type,
            timestamp: timestamp + this.maxDuration,
        }
        futureEvents.push(futureEvent);
    }

    refresh(timestamp, owner, reactiveEvents, futureEvents) {
      if(this.stacks < this.maxStacks) {
          // Either add one stack, such as for sunder, or set to max stacks, such as for flurry/consumed by rage
          this.stacks = Math.min(Math.max(this.stacks + 1, this.startStacks), this.maxStacks);
          reactiveEvents.push({
              type: "auraApply",
              name: this.name,
              owner: owner.name,
              source: this.source,
              stacks: this.stacks,
              auraType: this.type,
              timestamp: timestamp,
          })
          // Add all modifiers here
          if(this.scalingStacks) {
              owner.armor += this.armorMod
              owner.percArmorMod *= this.percArmorMod;
              owner.block += this.blockMod
              owner.hastePerc += this.hastePerc;
              owner.damageMod *= this.damageMod
              owner.physDamageMod /= this.physDamageMod;
              owner.APMultMod *= this.APMultMod;
          }
        }
        else {
          reactiveEvents.push({
                type: "auraRefresh",
                name: this.name,
                owner: owner.name,
                source: this.source,
                stacks: this.stacks,
                auraType: this.type,
                timestamp: timestamp,
            })
        }
        futureEvents.forEach(e => {
            if(e.type == "auraExpire" && e.name == this.name)
                e.timestamp = timestamp + this.maxDuration
        })
        sortDescending(futureEvents)
    }

    removeStack(event, owner, reactiveEvents, futureEvents) {
        if (this.duration == 0)
          return;
        if(this.stacks == 1)
            this.expire(event, owner, reactiveEvents, futureEvents, true)
        else {
            reactiveEvents.push({
                type: "auraRemoveStack",
                name: this.name,
                owner: owner.name,
                source: this.source,
                stacks: this.stacks,
                auraType: this.type,
                timestamp: event.timestamp,
            })
            this.stacks -= 1
            if(this.scalingStacks) {
                owner.armor -= this.armorMod;
                owner.block -= this.blockMod;
                owner.percArmorMod /= this.percArmorMod;
                owner.hastePerc -= this.hastePerc;
                owner.damageMod /= this.damageMod;
                owner.physDamageMod /= this.physDamageMod;
                owner.APMultMod /= this.APMultMod;
            }
        }
    }

    expire(event, owner, reactiveEvents, futureEvents, addEvent) {
        // Add all modifiers here, remember scalingstacks
        if (this.duration == 0)
          return;
        owner.armor -= this.armorMod * (this.scalingStacks ? this.stacks : 1) 
        owner.block -= this.blockMod * (this.scalingStacks ? this.stacks : 1)
        owner.percArmorMod /= this.percArmorMod * (this.scalingStacks ? this.stacks : 1)
        owner.hastePerc -= this.hastePerc * (this.scalingStacks ? this.stacks : 1)
        owner.damageMod /= this.damageMod * (this.scalingStacks ? this.stacks : 1)
        owner.physDamageMod /= this.physDamageMod * (this.scalingStacks ? this.stacks : 1)
        owner.APMultMod /= this.APMultMod * (this.scalingStacks ? this.stacks : 1);
        event.stacks = this.stacks;
        this.stacks = 0
        this.duration = 0;
        delete owner.buffs[this.name]
        let index = futureEvents.findIndex(e => {return (e.type == "auraExpire" && e.name == this.name)})
        if(index >= 0)
            futureEvents.splice(index, 1)
        if (addEvent)
          reactiveEvents.push({
            type: "auraExpire",
            name: this.name,
            owner: owner.name,
            source: this.source,
            stacks: this.stacks,
            auraType: this.type,
            timestamp: event.timestamp,
          })
    }

    handleEvent(event, owner, source, reactiveEvents, futureEvents) {
      log_message(LOG_LEVEL.ERROR, "handleEvent not implemented for aura " + this.name + ".");
    }
}


class SunderArmorAura extends Aura {
    constructor() {
        super({
            type: "debuff",
            name: "Sunder Armor",

            maxDuration: 30000,
            maxStacks: 5,
            scalingStacks: true,
            armorMod: 0//-520, Apply full stacks at pull instead
        })
    }
    handleEvent(event, owner, source, reactiveEvents, futureEvents) {
      // TODO
      // log_message("Error: handleEvent not implemented for aura " + this.name + ".");
    }
}


class DefensiveState extends Aura {
    constructor() {
        super({
            type: "buff",
            name: "Defensive State",

            maxDuration: 5000,
        })
    }
    handleEvent(event, owner, source, reactiveEvents, futureEvents) {
      
      // Add aura after a dodge/block/parry
      if(event.type == "damage" && event.target == owner.name && ["block", "parry", "dodge"].includes(event.hit)) {
          this.apply(event.timestamp, owner, event.target, reactiveEvents, futureEvents)
      }
      
      // Expire after casting Revenge 
      if(event.source == this.name && event.name == "Revenge") {
          this.expire(event, owner, reactiveEvents, futureEvents, true)
      }

      if (event.type == "auraExpire" && event.name == this.name && event.owner == owner.name) {
        this.expire(event, owner, reactiveEvents, futureEvents, false)
      }

    }
}

class ShieldBlockAura extends Aura {
    constructor(impSB) {
        super({
            type: "buff",
            name: "Shield Block",

            maxDuration: 6000 + impSB * 0.5,

            blockMod: 75,
            maxStacks: 1 + (impSB > 0 ? 1 : 0),
            startStacks: 1 + (impSB > 0 ? 1 : 0),
        })
    }
    handleEvent(event, owner, source, reactiveEvents, futureEvents) {
      
      // Add aura after Shield Block has been cast
      if (event.type == "spellCast" && event.name == this.name) {
        this.apply(event.timestamp, owner, event.source, reactiveEvents, futureEvents);
      }

      //  Remove a stack after blocking
      else if(event.type == "damage" && event.target == "Tank" && event.hit == "block") {
        this.removeStack(event, owner, reactiveEvents, futureEvents)
      } 

      else if(event.type == "auraExpire" && event.name == this.name && event.owner == owner.name) {
        this.expire(event, owner, reactiveEvents, futureEvents, false);
      }
    }
}

class FlagellationAura extends Aura {
  constructor() {
    super({
      type: "buff",
      name: "Flagellation",
    
      maxDuration: 12000,

      physDamageMod: 1.25,
    })
  }
    handleEvent(event, owner, source, reactiveEvents, futureEvents) {
    
    // Apply the aura after activating either bers rage or bloodrage
    if (event.type == "auraApply" && ["Berserker Rage", "Bloodrage"].includes(event.name)) {
      this.apply(event.timestamp, owner, owner.name, reactiveEvents, futureEvents);
    }

    if (event.type == "auraExpire" && event.name == this.name && event.owner == owner.name) {
      this.expire(event, owner, reactiveEvents, futureEvents, false)
    }

  }
}

class FlurryAura extends Aura {
  constructor(points) {
    super({
      type: "buff",
      name: "Flurry",
    
      maxDuration: 12000,

      maxStacks: 3,
      startStacks: 3,
      hastePerc: 5 + 5*points,

    })
  }
    handleEvent(event, owner, source, reactiveEvents, futureEvents) {
    
    if (event.type == "damage" && ["crit", "crit block"].includes(event.hit) && ["MH Swing", "OH Swing", "Heroic Strike", "Ravenge", "Bloodthirst", "Shield Slam", "Raging Blow", "Slam", "Execute", "Quickstrike", "Whirlwind", "Devastate", "Mortal Strike"].includes(event.name) && event.source == owner.name) {
      this.apply(event.timestamp, owner, owner.name, reactiveEvents, futureEvents);
    }
    if (event.type == "damage" && ["MH Swing", "OH Swing", "Heroic Strike"].includes(event.name) && event.source == owner.name) {
      this.removeStack(event, owner, reactiveEvents, futureEvents);
    }
  }
}

class EnrageAura extends Aura {
  constructor() {
    super({
      type: "buff",
      name: "Enrage",
    
      maxDuration: 12000,

      physDamageMod: 1.1,
      maxStacks: 12,
      startStacks: 12,

    })
  }
    handleEvent(event, owner, source, reactiveEvents, futureEvents) {
    
    // Add aura after rage goes from below 80 to above 80, and the aura is not already active.
    // NOTE: This relies on the implicit fact that the rage has not yet been added to the Actor
    //       This logic might change in the future, watch out.
    if (owner.stats.runes.consumedByRage && event.type == "rage" && owner.rage + event.amount >= 80 && owner.rage < 80) {
      if (this.duration > 0 && this.stacks > 0 && this.physDamageMod > 1.1)
        return; // We are affected by a more powerful enrage
      this.expire(event, owner, reactiveEvents, futureEvents, true);
      this.physDamageMod = 1.1;
      this.apply(event.timestamp, owner, owner.name, reactiveEvents, futureEvents);
    }

    if (owner.stats.talents.enrage > 0 && event.type == "damage" && event.target == owner.name && event.hit == 'crit') {
      if (this.duration > 0 && this.stacks > 0 && this.physDamageMod > owner.stats.talents.enrage * 0.05 + 1)
        return; // We are affected by a more powerful enrage
      this.expire(event, owner, reactiveEvents, futureEvents, true);
      this.physDamageMod = owner.stats.talents.enrage * 0.05 + 1;
      this.apply(event.timestamp, owner, owner.name, reactiveEvents, futureEvents);
    }

    //  Remove a stack after successfully hitting a target
    if(event.type == "damage" && event.source == owner.name && ["MH Swing", "OH Swing", "Devastate", "Heroic Strike", "Rend", "Raging Blow", "Revenge"].includes(event.name)) {
      this.removeStack(event, owner, reactiveEvents, futureEvents)
    }

    if (event.type == "auraExpire" && event.name == this.name && event.owner == owner.name) {
      this.expire(event, owner, reactiveEvents, futureEvents, false)
    }

  }
}

class DeathWishAura extends Aura {
  constructor() {
    super({
      type: "debuff",
      name: "Death Wish",
    
      maxDuration: 30000,
      physDamageMod: 1.2,
      percArmorMod: 0.8,
    })
  }
    handleEvent(event, owner, source, reactiveEvents, futureEvents) {
    
    // Add aura after rage goes from below 80 to above 80, and the aura is not already active.
    if (event.type == "spellCast" && event.name == "Death Wish") {
      this.apply(event.timestamp, owner, owner.name, reactiveEvents, futureEvents);
    }

    if (event.type == "auraExpire" && event.name == this.name && event.owner == owner.name) {
      this.expire(event, owner, reactiveEvents, futureEvents, false)
    }

  }
}

class BloodrageAura extends Aura {
  constructor() {
    super({
      type: "buff",
      name: "Bloodrage",
    
      maxDuration: 10000,
    })
  }
    handleEvent(event, owner, source, reactiveEvents, futureEvents) {
    
    // Add aura after rage goes from below 80 to above 80, and the aura is not already active.
    if (event.type == "spellCast" && event.name == "Bloodrage") {
      this.apply(event.timestamp, owner, owner.name, reactiveEvents, futureEvents);
      for (let i = 0; i < 10; i++) {
        futureEvents.push(
        {
          timestamp: event.timestamp + (i+1)*1000,
          type: "rage",
          source: owner.name,
          name: this.name,

          amount: 1,
          threat: 5, // TODO: threat even when rage-capped..
        });
      }
    }

    if (event.type == "auraExpire" && event.name == this.name && event.owner == owner.name) {
      this.expire(event, owner, reactiveEvents, futureEvents, false)
    }

  }
}

class WildStrikesAura extends Aura {
  constructor() {
    super({
      type: "buff",
      name: "Wild Strikes",
    
      maxDuration: 1500,
      APMultMod: 1.2,
    })
  }
    handleEvent(event, owner, source, reactiveEvents, futureEvents) {
    
    if (event.type == "extra attack" && event.name == "Wild Strikes") {
      this.apply(event.timestamp, owner, owner.name, reactiveEvents, futureEvents);
    }

    if (event.type == "auraExpire" && event.name == this.name && event.owner == owner.name) {
      this.expire(event, owner, reactiveEvents, futureEvents, false)
    }
  }
}

class BloodsurgeAura extends Aura {
  constructor() {
    super({
      type: "buff",
      name: "Bloodsurge",
    
      maxDuration: 15000,
    })
  }
    handleEvent(event, owner, source, reactiveEvents, futureEvents) {
    
    if (event.type == "damage" && event.source == owner.name && ['Quick Strike', 'Whirlwind', 'Heroic Strike', 'Bloodthirst'].includes(event.name) && landedHits.includes(event.hit) && Math.random() < 0.3) {
      this.apply(event.timestamp, owner, owner.name, reactiveEvents, futureEvents);
    }

    if (event.type == "damage" && event.source == owner.name && event.name == 'Slam') {
      this.expire(event, owner, reactiveEvents, futureEvents, true);
    }

    if (event.type == "auraExpire" && event.name == this.name && event.owner == owner.name) {
      this.expire(event, owner, reactiveEvents, futureEvents, false);
    }
  }
}
class RendAura extends Aura {
  constructor() {
    super({
      type: "debuff",
      name: "Rend",
    
      maxDuration: 15000,
    })
  }
    handleEvent(event, owner, source, reactiveEvents, futureEvents) {
    
    if (event.type == "damage" && event.name == "Rend" && event.hit == "hit") {

      this.apply(event.timestamp, owner, owner.name, reactiveEvents, futureEvents);
    }

    if (event.type == "auraExpire" && event.name == this.name && event.owner == owner.name) {
      this.expire(event, owner, reactiveEvents, futureEvents, false)
    }
  }

  duration(rank) {
    if (rank == 1) return 9000;
    if (rank == 2) return 12000;
    if (rank == 3) return 15000;
    if (rank == 4) return 18000;
    else if (rank < 8) return 21000;
    else log_message(LOG_LEVEL.ERROR, "Invalid rank of " + this.name + ": " + rank);
  }
}

class DeepWoundsAura extends Aura {
  constructor() {
    super({
      type: "debuff",
      name: "Deep Wounds",
    
      maxDuration: 12000,
    })
  }
    handleEvent(event, owner, source, reactiveEvents, futureEvents) {
    
    if (event.type == "damage" && event.hit == "crit" && event.target == owner.name) {

      this.apply(event.timestamp, owner, source.name, reactiveEvents, futureEvents);
      // Remove all current DW ticks in the futureEvents
      // Add the new additional dmg to the DW pool
      // Generate new ticks with 1/3 the total dmg
      // Note double dipping dmg mods
      let totalDmg = owner.stats.bleedBonus * source.stats.talents.deepWounds * 0.2 * source.getPhysDamageMod() * source.getPhysDamageMod() * (source.stats.MHMin + source.stats.MHMax + 2 * source.getAP() * source.stats.MHSwing/14000)/2;
      while (true) {
        let index = futureEvents.findIndex(e => {return (e.type == "damage" && e.name == this.name)})
        if(index >= 0) {
          totalDmg += futureEvents[index].amount;
          futureEvents.splice(index, 1)
        }
        else 
          break;
      }
      for (let i = 0; i < 4; i++) {
        futureEvents.push(
        {
            timestamp: event.timestamp + (i+1)*3000,
            type: "damage",
            source: source.name,
            target: event.target,
            name: this.name,
            hit: "tick",
            threat: totalDmg*source.stats.threatMod/4,

            amount: totalDmg/4,
            trigger: false,
        });
      }
    }

    if (event.type == "auraExpire" && event.name == this.name && event.owner == owner.name) {
      this.expire(event, owner, reactiveEvents, futureEvents, false)
    }
  }
}


// Globals
let Debuffs = {
    "Sunder Armor": new SunderArmorAura(),
}

let Buffs = {
    "Defensive State": new DefensiveState(),
    "Shield Block": new ShieldBlockAura(),
    "Enrage": new EnrageAura(),
    "Bloodrage": new BloodrageAura(),
}

function TankAuras(globals) {
  let ret = [
    new DefensiveState(),
    new BloodrageAura(),
  ]
  if (globals.tankStats.runes.consumedByRage || globals.tankStats.talents.enrage > 0)
    ret.push(new EnrageAura());
  if (globals.tankStats.runes.bloodsurge)
    ret.push(new BloodsurgeAura());
  if (globals.tankStats.runes.flagellation)
    ret.push(new FlagellationAura());
  if (globals.tankStats.bonuses.wildStrikes)
    ret.push(new WildStrikesAura());
  if (globals.tankStats.talents.flurry > 0)
    ret.push(new FlurryAura(globals.tankStats.talents.flurry));
  if (globals.tankStats.talents.deathwish)
    ret.push(new DeathWishAura());
  if (!globals.tankStats.dualWield && !globals.tankStats.twohand)
    ret.push(new ShieldBlockAura(globals.tankStats.talents.impSB));

  return ret;
}

function BossAuras(globals) {

  let ret = [
    new SunderArmorAura(),
    new RendAura(),
  ]
  if (globals.tankStats.talents.deepWounds > 0) {
    ret.push(new DeepWoundsAura)
  }
  return ret;
}