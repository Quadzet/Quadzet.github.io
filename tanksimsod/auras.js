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
        if (!input.strMod) this.strMod = 0; else this.strMod = input.strMod; // additive
        if (!input.critMod) this.critMod = 0; else this.critMod = input.critMod; // percentage
        if (!input.damageMod) this.damageMod = 1; else this.damageMod = input.damageMod; // multiplicative
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
        owner.armor += this.armorMod
        owner.block += this.blockMod
        owner.damageMod *= this.damageMod

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
          // reactiveEvents.push({
          //     type: "auraExpire",
          //     name: this.name,
          //     owner: owner.name,
          //     source: this.source,
          //     stacks: this.stacks,
          //     auraType: this.type,
          //     timestamp: timestamp,
          // })
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
              owner.block += this.blockMod
              owner.damageMod *= this.damageMod
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

    removeStack(timestamp, owner, reactiveEvents, futureEvents) {
        if (this.duration == 0)
          return;
        if(this.stacks == 1)
            this.expire(timestamp, owner, reactiveEvents, futureEvents)
        else {
            reactiveEvents.push({
                type: "auraRemoveStack",
                name: this.name,
                owner: owner.name,
                source: this.source,
                stacks: this.stacks,
                auraType: this.type,
                timestamp: timestamp,
            })
            this.stacks -= 1
            if(this.scalingStacks) {
                owner.armor -= this.armorMod
                owner.block -= this.blockMod
                owner.damageMod /= this.damageMod
            }
        }
    }

    expire(event, owner, reactiveEvents, futureEvents) {
        // Add all modifiers here, remember scalingstacks
        if (this.duration == 0)
          return;
        owner.armor -= this.armorMod * (this.scalingStacks ? this.stacks : 1) 
        owner.block -= this.blockMod * (this.scalingStacks ? this.stacks : 1)
        owner.damageMod /= this.damageMod * (this.scalingStacks ? this.stacks : 1)
        event.stacks = this.stacks;
        this.stacks = 0
        this.duration = 0;
        delete owner.buffs[this.name]
        // if (addEvent)
        //   reactiveEvents.push({
        //     type: "auraExpire",
        //     name: this.name,
        //     owner: owner.name,
        //     source: this.source,
        //     stacks: this.stacks,
        //     auraType: this.type,
        //     timestamp: timestamp,
        //   })
        let index = futureEvents.findIndex(e => {return (e.type == "auraExpire" && e.name == this.name)})
        if(index >= 0)
            futureEvents.splice(index, 1)
    }

    handleEvent(event, owner, source, reactiveEvents, futureEvents) {
      log_message("Error: handleEvent not implemented for aura " + this.name + ".");
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
        this.expire(event, owner, reactiveEvents, futureEvents, true)
      }

    }
}

class ShieldBlockAura extends Aura {
    constructor() {
        super({
            type: "buff",
            name: "Shield Block",

            maxDuration: 6000,

            blockMod: 75,
            maxStacks: 2,
            startStacks: 2,
        })
    }
    handleEvent(event, owner, source, reactiveEvents, futureEvents) {
      
      // Add aura after Shield Block has been cast
      if (event.type == "spellCast" && event.name == this.name) {
        this.apply(event.timestamp, owner, event.source, reactiveEvents, futureEvents);
      }

      //  Remove a stack after blocking
      else if(event.type == "damage" && event.target == "Tank" && event.hit == "block") {
        this.removeStack(event.timestamp, owner, reactiveEvents, futureEvents)
      } 

      else if(event.type == "auraExpire") {
        this.expire(event, owner, reactiveEvents, futureEvents, true);
      }
    }
}

class FlagellationAura extends Aura {
  constructor() {
    super({
      type: "buff",
      name: "Flagellation",
    
      maxDuration: 12000,

      damageMod: 1.25,
    })
  }
    handleEvent(event, owner, source, reactiveEvents, futureEvents) {
    
    // Apply the aura after activating either bers rage or bloodrage
    if (event.type == "auraApply" && ["Berserker Rage", "Bloodrage"].includes(event.name)) {
      this.apply(event.timestamp, owner, owner.name, reactiveEvents, futureEvents);
    }

    if (event.type == "auraExpire" && event.name == this.name && event.owner == owner.name) {
      this.expire(event, owner, reactiveEvents, futureEvents, true)
    }

  }
}

class ConsumedByRageAura extends Aura {
  constructor() {
    super({
      type: "buff",
      name: "Consumed by Rage",
    
      maxDuration: 12000,

      damageMod: 1.25,
      maxStacks: 12,
      startStacks: 12,

    })
  }
    handleEvent(event, owner, source, reactiveEvents, futureEvents) {
    
    // Add aura after rage goes from below 80 to above 80, and the aura is not already active.
    // NOTE: This relies on the implicit fact that the rage has not yet been added to the Actor
    //       This logic might change in the future, watch out.
    if (event.type == "rage" && owner.rage + event.amount >= 80 && owner.rage < 80) {
      this.apply(event.timestamp, owner, owner.name, reactiveEvents, futureEvents);
    }

    //  Remove a stack after successfully hitting a target
    if(event.type == "damage" && event.source == "Tank" && ["MH Swing", "OH Swing", "Devastate", "Heroic Strike", "Rend (Rank 3)", "Raging Blow", "Revenge"].includes(event.name)) {
      this.removeStack(event.timestamp, owner, reactiveEvents, futureEvents)
    }

    if (event.type == "auraExpire" && event.name == this.name && event.owner == owner.name) {
      this.expire(event, owner, reactiveEvents, futureEvents, true)
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
      this.expire(event, owner, reactiveEvents, futureEvents, true)
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
    
    if (event.type == "damage" && event.name == "Rend (Rank 3)" && event.hit == "hit") {

      this.apply(event.timestamp, owner, owner.name, reactiveEvents, futureEvents);
    }

    if (event.type == "auraExpire" && event.name == this.name && event.owner == owner.name) {
      this.expire(event, owner, reactiveEvents, futureEvents, true)
    }
  }

  duration(rank) {
    if (rank == 1) return 9000;
    if (rank == 2) return 12000;
    if (rank == 3) return 15000;
    if (rank == 4) return 18000;
    else if (rank < 8) return 21000;
    else log_message("Invalid rank of " + this.name + ": " + rank);
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
    
    // Note the Devastate exception
    if (event.type == "damage" && event.hit == "crit" && event.target == owner.name && event.name != "Devastate") {

      this.apply(event.timestamp, owner, source.name, reactiveEvents, futureEvents);
      // Remove all current DW ticks in the futureEvents
      // Add the new additional dmg to the DW pool
      // Generate new ticks with 1/3 the total dmg
      // Note double dipping dmg mods
      let totalDmg = owner.stats.bleedBonus * source.stats.talents.deepWounds * 0.2 * source.getDamageMod() * source.getDamageMod() * (source.stats.MHMin + source.stats.MHMax + 2 * source.getAP() * source.stats.MHSwing/14000)/2;
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
            hit: "hit",
            threat: totalDmg*source.stats.threatMod/4,

            amount: totalDmg/4,
        });
      }
    }

    if (event.type == "auraExpire" && event.name == this.name && event.owner == owner.name) {
      this.expire(event, owner, reactiveEvents, futureEvents, true)
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
    "Consumed by Rage": new ConsumedByRageAura(),
    "Bloodrage": new BloodrageAura(),
}

function TankAuras(globals) {
  let ret = [
    new DefensiveState(),
    new ShieldBlockAura(),
    new BloodrageAura(),
  ]
  if (globals.tankStats.runes.consumedByRage)
    ret.push(new ConsumedByRageAura());
  if (globals.tankStats.runes.flagellation)
    ret.push(new FlagellationAura());
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