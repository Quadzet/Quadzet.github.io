"use strict";


function average(array) {
    if (array) return array.reduce((a, b) => a + b) / array.length;
    else return 0;
};
const range = (length) =>
  Array.from({ length }, (_, i) => i)

function linspace(start, end, length = Math.max(Math.round(end-start) + 1, 1)) {
    if(length < 2) { return length === 1 ? [start] : [] ; }
    var i, ret = Array(length);
    length--;
    for(i = length; i >= 0; i--) { ret[i] = (i*end+(length-i)*start)/length; }
    return ret;
}

const asc = arr => arr.sort((a, b) => a - b);

// sample standard deviation
const std = (arr) => {
    const mu = average(arr);
    const diffArr = arr.map(a => (a - mu) ** 2);
    return Math.sqrt(diffArr.reduce((a, b) => a + b) / (arr.length - 1));
};

const quantile = (arr, q) => {
    const sorted = asc(arr);
    const pos = (sorted.length - 1) * q;
    const base = Math.floor(pos);
    const rest = pos - base;
    if (sorted[base + 1] !== undefined) {
        return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
    } else {
        return sorted[base];
    }
};

function getAmount(event, ability, type) {
    if (event[`${type}`] && event.ability == ability) return event[`${type}`];
    else return 0;
}

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
        this.rage = _startRage
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
        this.rage = _startRage
        this.isHeroicStrikeQueued = false
        this.damageMod = this.stats.damageMod
        this.hastePerc = this.stats.hastePerc
        this.rageGained = 0 // remove?
        this.rageSpent = 0
        this.flurryUptime = 0
        this.crusaderUptime = 0
    }

}

function performAction(events, ms, attacker, defender) {
    attacker.abilities.forEach(ability => {
        if (ability.isUsable(attacker)) {
            let abilityEvent = ability.use(attacker, defender);

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
                attacker.procs.forEach(proc => proc.handleEvent(attacker, defender, abilityEvent, events));
                
                if (abilityEvent.type == "damage" && abilityEvent.hit == "parry") defender.addParryHaste();
            }
        }
    })

    // Ability cds and aura durations tick down
    attacker.abilities.forEach(ability => {
        if (["MH Swing", "OH Swing", "Auto Attack"].includes(ability.name))
            ability.currentCooldown = ability.currentCooldown - _timeStep*(1+attacker.hastePerc/100);
        else ability.currentCooldown = ability.currentCooldown - _timeStep;
    });
    attacker.auras.forEach(aura => aura.handleGameTick(ms, attacker, events));

    attacker.GCD = attacker.GCD - _timeStep;
}


function main() {

    // Fetch and set all user input settings
    fetchSettings()

    let playerAbilities = [
        new Bloodthirst("Bloodthirst", 6000, 30, true),
        new Revenge("Revenge", 5000, 5, true, 273, 2.25),
        new HeroicStrike("Heroic Strike", 0, 15, false, 175),
        new SunderArmor("Sunder Armor", 0, 15, true, 260),
        new OHSwing("OH Swing", _config.tankStats.OHSwing, 0, false),
        new MHSwing("MH Swing", _config.tankStats.MHSwing, 0, false),
    ];
    let bossAbilities = [new MHSwing("Auto Attack", 2000, 0, false)];

    let TankAuras = [...defaultTankAuras]
    let BossAuras = [...defaultBossAuras]
    addOptionalAuras(TankAuras, BossAuras); // Adds crusader/thunderfury etc auras to tank/boss if they are set in config.

    let TankProcs = getTankProcs();
    let BossProcs = [];

    let Tank = new Actor("Tank", "Boss", playerAbilities, _config["tankStats"], TankAuras, TankProcs)
    let Boss = new Actor("Boss", "Tank", bossAbilities,   _config["bossStats"], BossAuras, BossProcs)
    

    let start = Date.now()
    let results = {
        "MH Swing": Array.apply(null, Array(_iterations)).map((x, i) => 0),
        "OH Swing": Array.apply(null, Array(_iterations)).map((x, i) => 0),
        "Heroic Strike": Array.apply(null, Array(_iterations)).map((x, i) => 0),
        "Bloodthirst": Array.apply(null, Array(_iterations)).map((x, i) => 0),
        "Sunder Armor": Array.apply(null, Array(_iterations)).map((x, i) => 0),
        "Revenge": Array.apply(null, Array(_iterations)).map((x, i) => 0),
        "Thunderfury": Array.apply(null, Array(_iterations)).map((x, i) => 0),
    };
    let tps = [];
    let dps = [];
    let dtps = [];
    let rageGained = [];
    let rageSpent = [];
    let flurryUptime = [];
    let crusaderUptime = [];
    let breaches = 0;
    // snapshots are used to graph the threat percentiles
    let snapshots = [];
    for (let _i in range(_simDuration*1000/_snapshotLen+1)) snapshots.push([]);
    for (let i in range(_iterations)) {

        // Reset buffs, GCD, cooldowns...
        Tank.reset();
        Boss.reset();
        
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

            if (ms == snapshot*_snapshotLen) {
                let snapshotThreat = 0;
                events.forEach(event => {
                    if (event.threat) snapshotThreat += event.threat;
                })
                snapshots[snapshot].push(snapshotThreat);
                snapshot += 1;
            }

            if (ms == _breakpointTime) {
                let breakpointThreat = 0;
                events.forEach(event => {
                    if (event.threat) breakpointThreat += event.threat;
                })
                breaches += breakpointThreat < _breakpointValue ? 1 : 0;
            }


            ms+=_timeStep
        }

        events.forEach(event => {
            if (event) {
                if (event.source == "Boss") {
                    if (event.damage) dmgTaken += event.damage;
                } else {
                    if (event.threat) threat += event.threat;
                    if (event.damage) damage += event.damage;
                    for (let ability in results) {
                        results[`${ability}`][i] += getAmount(event, ability, "threat")/_simDuration;
                    }
                }
            }
        });

        tps.push(threat/_simDuration)
        dps.push(damage/_simDuration)
        rageGained.push(Tank.rageGained/_simDuration)
        flurryUptime.push(Tank.flurryUptime/(_simDuration*10)) // divide by 1000 due to ms, multiply by 100 due to decimal to percentage => divide by 10.
        crusaderUptime.push(Tank.crusaderUptime/(_simDuration*10))
        Tank.rageGained = 0
        rageSpent.push(Tank.rageSpent/_simDuration)
        Tank.rageSpent = 0
        dtps.push(dmgTaken/_simDuration)
        //console.log(events)
    }
    let end = Date.now()

    // Some console logging...
    let ret = `Calculated ${_iterations} iterations of ${_simDuration}s. fights with timestep ${_timeStep} ms in ${(end-start)/1000} seconds.`;
    console.log(ret);
    console.log(`TPS: ${average(tps)}`);
    console.log(`DPS: ${average(dps)}`);
    console.log(`DTPS: ${average(dtps)}`);
    for (let ability in results)
        console.log(`${ability}: ${average(results[`${ability}`])}`);
    console.log(`gainRPS: ${average(rageGained)}`);
    console.log(`spentRPS: ${average(rageSpent)}`);

    // Make the result table
    let abilityVec = [];
    for (let ability in results) {
        abilityVec.push(`<td>${ability}:</td><td>${Math.round(average(results[`${ability}`])*100)/100}</td>`);
    }
    let threatStatsVec = [];
    threatStatsVec.push(`<td>TPS standard deviation:</td><td>${Math.round(std(tps)*100)/100}</ts><td> (${Math.round(std(tps)/average(tps)*10000)/100}%)</td>`)
    threatStatsVec.push(`<td>DPS standard deviation:</td><td>${Math.round(std(dps)*100)/100}</ts><td> (${Math.round(std(dps)/average(dps)*10000)/100}%)</td>`)
    threatStatsVec.push(`<td>Threshold failed:</td><td>${breaches}</ts><td> (${Math.round(breaches/_iterations*10000)/100}%)</td>`)

    let el_div = document.querySelector("#outputContainer");
    el_div.innerHTML = `
    <table>
        <tr><th>General Stats</th><th></th><th>Ability TPS</th><th/><th>Threat Stats</th></tr>
        <tr><td>TPS: </td><td>${Math.round(average(tps)*100)/100}</td>${abilityVec[0]}${threatStatsVec[0]}</tr>
        <tr><td>DPS: </td><td>${Math.round(average(dps)*100)/100}</td>${abilityVec[1]}${threatStatsVec[1]}</tr>
        <tr><td>DTPS: </td><td>${Math.round(average(dtps)*100)/100}</td>${abilityVec[2]}${threatStatsVec[2]}</tr>
        <tr><td>RPS gained: </td><td>${Math.round(average(rageGained)*100)/100}</td>${abilityVec[3]}</tr>
        <tr><td>RPS spent: </td><td>${Math.round(average(rageSpent)*100)/100}</td>${abilityVec[4]}</tr>
        <tr><td>Flurry uptime: </td><td>${Math.round(average(flurryUptime)*100)/100}%</td>${abilityVec[5]}</tr>
        <tr><td>Crusader uptime: </td><td>${Math.round(average(crusaderUptime)*100)/100}%</td>${abilityVec[6]}</tr>
    </table>`;

    var x = linspace(0, _simDuration, _simDuration*1000/_snapshotLen + 1);

    let lineShape = document.querySelector("#lineSelect").options[document.querySelector("#lineSelect").selectedIndex].value

    // Make the graph
    var y_avg = [];
    var y_99 = [];
    var y_95 = [];
    var y_05 = [];
    var y_01 = [];
    snapshots.forEach(snapshot => {
        y_avg.push(Math.round(average(snapshot)));
        y_99.push(Math.round(quantile(snapshot, 0.99)));
        y_95.push(Math.round(quantile(snapshot, 0.95)));
        y_05.push(Math.round(quantile(snapshot, 0.05)));
        y_01.push(Math.round(quantile(snapshot, 0.01)));
    });

    var traceAvg = {
        x: x,
        y: y_avg,
        mode: 'lines+markers',
        name: "Average Threat",
        line: {
            color: '#939C56',
            shape: `${lineShape}`,
        },
        marker: {
            size: 4,
        }
    }

    var trace99 = {
        x: x,
        y: y_99,
        mode: 'lines+markers',
        name: "99th percentile",
        line: {
            color: '#569C81',
            shape: `${lineShape}`,
        },
        marker: {
            size: 4,
        }
    }

    var trace95 = {
        x: x,
        y: y_95,
        mode: 'lines+markers',
        name: "95th percentile",
        line: {
            color: '#569B65',
            shape: `${lineShape}`,
        },
        marker: {
            size: 4,
        }
    }

    var trace05 = {
        x: x,
        y: y_05,
        mode: 'lines+markers',
        name: "5th percentile",
        line: {
            color: '#966C44',
            shape: `${lineShape}`,
        },
        marker: {
            size: 4,
        }
    }
    var trace01 = {
        x: x,
        y: y_01,
        mode: 'lines+markers',
        name: "1st percentile",
        line: {
            color: '#964343',
            shape: `${lineShape}`,
        },
        marker: {
            size: 4,
        }
    }

// BG grey 222629
// dark grey 474b4f
// medium grey 6b6e70
// light gray c8ced1


    var plotData = [ trace99, trace95, traceAvg, trace05, trace01 ];
    var layout = {
        title: 'Threat Distribution',
        width: 1440,
        height: 810,

        plot_bgcolor: "#222629",
        paper_bgcolor: "#222629",
        
        titlefont: {color: "#c8ced1"}, 
        xaxis:{
            title:"Time (s)", 
            titlefont: {color: "#c8ced1"},
            tickfont: {color: "#c8ced1"}, 
            rangemode: "tozero",
            gridcolor: "#474b4f",
            linecolor: "#c8ced1",
            autotick: false,
            ticks: 'outside',
            tick0: 0,
            dtick: 1.5,
        },
        yaxis:{
            title:"Threat",
            titlefont: {color: "#c8ced1"},
            tickcolor: "#c8ced1",
            tickfont: {color: "#c8ced1"},
            rangemode: "tozero",
            gridcolor: "#474b4f",
            linecolor: "#c8ced1"},
        legend: {font: {color: "#c8ced1"}},
    }
    Plotly.newPlot('plotContainer', plotData, layout);

}


