"use strict";


function average(array) {
    if (array) return array.reduce((a, b) => a + b) / array.length;
    else return 0;
};
const range = (length) =>
  Array.from({ length }, (_, i) => i)

function getAmount(event, ability, type) {
    if (event[`${type}`] && event.ability == ability) return event[`${type}`];
    else return 0;
}

class Actor {
    constructor(name, target, abilities, stats, auras) {
        this.name = name
        this.target = target
        this.abilities = abilities
        this.threatMod = 1.495
        this.damageMod = 0.9 // Defensive Stance, functions the same for boss and tank
        this.hasteMod = 0
        this.armor = stats.baseArmor
        this.stats = stats
        this.GCD = 0
        this.rage = 45 // TODO: start-rage
        this.isHeroicStrikeQueued = false

        this.auras = auras

        this.rageGained = 0 // remove?
        this.rageSpent = 0
    }
    getArmor() {
        this.armor = this.stats.baseArmor
        this.auras.forEach(aura => {
            if (aura.duration > 0) {
                if (aura.armorMod != 0) {
                    let multiplier = 1;
                    if (aura.scalingStacks) multiplier = aura.stacks;
                    this.armor += aura.armorMod * multiplier;
                }
            }
        });
        return this.armor;
    }

    //def AP()
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
}

function performAction(events, ms, attacker, defender) {
    attacker.abilities.forEach(ability => {
        if (ability.isUsable(attacker)) {
            let abilityEvent = ability.use(attacker, defender);

            //console.log(abilityEvent);
            if(abilityEvent) { // DANGEROUS

                // TODO: Move these into Ability.use()
                abilityEvent.timestamp = ms;
                abilityEvent.target = defender.name;
                abilityEvent.source = attacker.name;

                events.push(abilityEvent);
                ability.currentCooldown = ability.baseCooldown;
                if (ability.onGCD) attacker.GCD = 1500;

                // Update Actor Auras if the event applies to the Aura
                attacker.auras.forEach(aura => aura.handleEvent(attacker, abilityEvent, events));
                defender.auras.forEach(aura => aura.handleEvent(defender, abilityEvent, events));
            
                if (abilityEvent.type == "damage" && abilityEvent.hit == "parry") defender.addParryHaste();
            }
        }
    })

    // Ability cds and aura durations tick down
    attacker.abilities.forEach(ability => {
        if (["MH Swing", "OH Swing", "Auto Attack"].includes(ability.name))
            ability.currentCooldown = ability.currentCooldown - _timeStep*(1+attacker.hasteMod/100);
        else ability.currentCooldown = ability.currentCooldown - _timeStep;
    });
    attacker.auras.forEach(aura => aura.handleGameTick(ms, attacker, events));

    attacker.GCD = attacker.GCD - _timeStep;
}


function main() {

    let Tank = new Actor("Tank", "Boss", playerAbilities, config["tankStats"], TankAuras)
    let Boss = new Actor("Boss", "Tank", bossAbilities, config["bossStats"], BossAuras)

    let start = Date.now()
    let results = {
        "MH Swing": Array.apply(null, Array(_iterations)).map((x, i) => 0),
        "OH Swing": Array.apply(null, Array(_iterations)).map((x, i) => 0),
        "Heroic Strike": Array.apply(null, Array(_iterations)).map((x, i) => 0),
        "Bloodthirst": Array.apply(null, Array(_iterations)).map((x, i) => 0),
        "Sunder Armor": Array.apply(null, Array(_iterations)).map((x, i) => 0),
        "Revenge": Array.apply(null, Array(_iterations)).map((x, i) => 0),
    };
    //console.log(results.MHSwing.length);
    let tps = [];
    let dps = [];
    let dtps = [];
    let rageGained = [];
    let rageSpent = [];
    // snapshots are used to graph the threat percentiles
    let snapshots = [];
    for (let i in range(_simDuration*2+1)) snapshots.push([]);
    for (let i in range(_iterations)) {
        
        let snapshot = 0;
        let events = [];
        let ms = 0;
        let threat = 0;
        let damage = 0;
        let dmgTaken = 0;

        // Set armor debuffs...
        Boss.auras.forEach(aura => {
            if (aura.name == "Sunder Armor") {
                for (let _j in range(5)) { 
                    aura.handleEvent(Boss, { "type": "damage", "ability": "Sunder Armor", "hit": "hit", "timestamp": ms}, events);
                }
            }
            if (aura.name == "Faerie Fire") aura.handleEvent(Boss, { "type": "damage", "ability": "Faerie Fire", "hit": "hit", "timestamp": ms}, events);
            if (aura.name == "Curse of Recklessness") aura.handleEvent(Boss, { "type": "damage", "ability": "Curse of Recklessness", "hit": "hit", "timestamp": ms}, events);
        });

        while(ms <= _simDuration*1000) {

            let iterationEvents = [];
            performAction(iterationEvents, ms, Tank, Boss);
            performAction(iterationEvents, ms, Boss, Tank);
            
            events = events.concat(iterationEvents);

            //console.log(events);

            if (ms == snapshot*500) {
                let snapshotThreat = 0;
                events.forEach(event => {
                    if (event.threat) snapshotThreat += event.threat;
                })
                snapshots[snapshot].push(snapshotThreat);
                snapshot += 1;
            }
            ms+=_timeStep
        }

        //console.log(events);
        events.forEach(event => {
            if (event) {
                if (event.source == "Boss") {
                    if (event.damage) dmgTaken += event.damage;
                } else {
                    //print(formatEvent(event))
                    //console.log(event.threat);
                    if (event.threat) threat += event.threat;
                    if (event.damage) damage += event.damage;
                    for (let ability in results) {
                        //console.log(ability);
                        //console.log(results[`${ability}`]);
                        if (ability == "Sunder Armor") {
                            //console.log(getAmount(event, ability, "threat")/_simDuration);
                            //console.log(event);
                            //console.log(event.damage && event.ability == ability);
                        }
                        results[`${ability}`][i] += getAmount(event, ability, "threat")/_simDuration;
                    }
                    //results.forEach(result => result.ability[i] += getAmount(event, ability, "threat")/_simDuration);
                }
            }
        });

        tps.push(threat/_simDuration)
        dps.push(damage/_simDuration)
        rageGained.push(Tank.rageGained/_simDuration)
        Tank.rageGained = 0
        rageSpent.push(Tank.rageSpent/_simDuration)
        Tank.rageSpent = 0
        dtps.push(dmgTaken/_simDuration)
    }
    let end = Date.now()

    let ret = `Calculated ${_iterations} iterations of ${_simDuration}s. fights with timestep ${_timeStep} ms in ${(end-start)/1000} seconds.`;
    console.log(ret);
    console.log(`TPS: ${average(tps)}`);
    console.log(`DPS: ${average(dps)}`);
    console.log(`DTPS: ${average(dtps)}`);
    for (let ability in results)
        console.log(`${ability}: ${average(results[`${ability}`])}`);
    console.log(`gainRPS: ${average(rageGained)}`);
    console.log(`spentRPS: ${average(rageSpent)}`);
}

