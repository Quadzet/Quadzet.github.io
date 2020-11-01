self.addEventListener('message', function(e) {
    //self.postMessage(e.data + ' yourself!')
    //console.log(`iterations: ${e.data.iterations}`)
    let globals = e.data.globals;

    importScripts('../abilities.js', '../actor.js', '../attacktable.js');

    function getAmount(event, ability, type) {
        if (event[`${type}`] && event.ability == ability) return event[`${type}`];
        else return 0;
    }

    function getTankProcs() {
        let ret = []
        if(globals._thunderfury) {
            ret.push(
                new Thunderfury({
                    name: "Thunderfury",
                    damage: 300,
                })
            )
        }
    
        if(globals._windfury) {
            ret.push(
                new WindfuryProc({
                    name: "Windfury", 
                })
            )
        }
    
        return ret;
    }

    "use strict";

    class Proc {

        constructor(input) {
    
            if (!input.name) this.name = "unknown"; else this.name = input.name;
            if (!input.damage) this.damage = 0; else this.damage = input.damage;
    
        }
    
        handleEvent(source, target, event, events) {
            return;
        }
    
    }
    
    class Thunderfury extends Proc {
        constructor(input) {
            super(input)
        }
        handleEvent(source, target, event, events) {
            if (event.type == "damage" && event.ability != "OH Swing" && globals._landedHits.includes(event.hit)) {
                let rng = Math.random()
                if (rng < 0.19*0.83) { // 0.83 derives from 17% chance to resist 
                    // TODO: Spell-AttackTable ! Needed for crits mainly, potentially also for resists
                    let procEvent = {
                        "type": "damage",
                        "ability": this.name,
                        "hit": "hit",
                        "timestamp": event.timestamp,
                        "damage": this.damage*source.damageMod, // don't count enrage, use default 0.9 only
                        "threat": (252 + this.damage)*source.threatMod, // 252 from debuff applications, my own testing.
                    }
                    events.push(procEvent);
                    // Ensure that the target the get debuff applied
                    target.auras.forEach(aura => aura.handleEvent(target, procEvent, events))
                }
            }
        }
    }
    
    class WindfuryProc extends Proc {
        constructor(input) {
            super(input)
        }
        handleEvent(source, target, event, events) {
            if (event.type == "damage" && event.ability != "OH Swing" && globals._landedHits.includes(event.hit)) {
                let rng = Math.random()
                if (rng < 0.2) {
                    let procEvent = {
                        "type": "extra attack",
                        "source": event.ability,
                        "ability": this.name,
                        "timestamp": event.timestamp,
                    }
                    events.push(procEvent);
    
                    // Ensure that the Windfury buff gets applied and that it resets MH swing timer
                    source.auras.forEach(aura => aura.handleEvent(target, procEvent, events))
                    source.abilities.forEach(ability => {
                        if (ability.name == "MH Swing") {
                            ability.currentCooldown = 0;
                        }
                    })
                }
            }
        }
    }

    class Aura {
        constructor(input) {
            if (!input.type) this.type = "aura"; else this.type = input.type;
            if (!input.name) this.name = "unknown"; else this.name = input.name;
            if (!input.target) this.target = "unknown"; else this.target = input.target;
            if (!input.source) this.source = "unknown"; else this.source = input.source;
    
            if (!input.damage) this.damage = 0; else this.damage = input.damage;
    
            if (!input.duration) this.duration = 0;
            if (!input.maxDuration) this.maxDuration = 0; else this.maxDuration = input.maxDuration;
            if (!input.stacks) this.stacks = 0;
            if (!input.maxStacks) this.maxStacks = -1; else this.maxStacks = input.maxStacks;
            if (!input.scalingStacks) this.scalingStacks = false; else this.scalingStacks = input.scalingStacks;
    
            if (!input.APMod) this.APMod = 0; else this.APMod = input.APMod; // additive
            if (!input.strMod) this.strMod = 0; else this.strMod = input.strMod; // additive
            if (!input.critMod) this.critMod = 0; else this.critMod = input.critMod; // percentage
            if (!input.damageMod) this.damageMod = 1; else this.damageMod = input.damageMod; // multiplicative
            if (!input.hastePerc) this.hastePerc = 0; else this.hastePerc = input.hastePerc; // percentage
            if (!input.percArmorMod) this.percArmorMod = 1; else this.percArmorMod = input.percArmorMod; // percentage
            if (!input.armorMod) this.armorMod = 0; else this.armorMod = input.armorMod; // additive
        }
    
        handleGameTick(ms, owner, events) {
            if (this.duration <= 0) return;
            this.duration = this.duration - globals._timeStep;
            if (this.name == "Flurry") owner.flurryUptime += globals._timeStep;
            if (this.name == "Crusader") owner.crusaderUptime += globals._timeStep;
            if (this.duration <= 0) {
                events.push({
                "type": "buff lost",
                "timestamp": ms,
                "name": this.name,
                "stacks": this.stacks,
                "source": this.source,
                "target": this.target,
                })
                if (this.hastePerc > 0) owner.hastePerc -= this.hastePerc;
            }
        }
    
        handleEvent(owner, event, events) {
            return;
        }
    }
    
    class SunderArmorDebuff extends Aura {
        constructor(input) {
            super(input);
        }
        handleEvent(owner, event, events) {
            if (event.type == "damage" && event.ability == "Sunder Armor" && ["hit", "block"].includes(event.hit)) {
                this.stacks = Math.min(5, this.stacks + 1);
                this.duration = this.maxDuration;
                events.push({
                    type: "buff gained",
                    timestamp: event.timestamp, 
                    name: this.name,
                    stacks: this.stacks,
                    target: this.target,
                    source: this.source,
                    });
            }
        }
    }
    
    class FaerieFire extends Aura {
        constructor(input) {
            super(input);
        }
        handleEvent(owner, event, events) {
            if (event.type == "damage" && event.ability == "Faerie Fire" && event.hit == "hit") {
                this.duration = this.maxDuration;
                events.push({
                    type: "buff gained",
                    timestamp: event.timestamp, 
                    name: this.name,
                    stacks: this.stacks,
                    target: this.target,
                    source: this.source,
                    });
            }
        }
        // Never let this expire
        handleGameTick(ms, owner, events) {
            return;
        }
    }
    
    class CurseOfRecklessness extends Aura {
        constructor(input) {
            super(input);
        }
        handleEvent(owner, event, events) {
            if (event.type == "damage" && event.ability == "Curse of Recklessness" && event.hit == "hit") {
                this.duration = this.maxDuration;
                events.push({
                    type: "buff gained",
                    timestamp: event.timestamp, 
                    name: this.name,
                    stacks: this.stacks,
                    target: this.target,
                    source: this.source,
                    });
            }
        }
    
        // Never let this expire
        handleGameTick(ms, owner, events) {
            return; 
        }
    }
    
    class Flurry extends Aura {
        constructor(input) {
            super(input);
        }
        handleEvent(owner, event, events) {
            if (event.type == "damage" && ["Bloodthirst", "MH Swing", "OH Swing", "Revenge", "Heroic Strike"].includes(event.ability) && ["hit", "crit", "block"].includes(event.hit)) {
                if (this.stacks > 0) {
                    events.push({
                        "type": "buff lost",
                        "timestamp": event["timestamp"],
                        "name": this.name,
                        "stacks": this.stacks,
                        "source": this.source,
                        "target": this.target,
                        });
                    if (this.stacks == 1) {
                        this.duration = 0;
                        owner.hastePerc -= this.hastePerc;
                    }
                }
                this.stacks = Math.max(0, this.stacks - 1);
            }
    
            if (event.type == "damage" && 
                ["Bloodthirst", "MH Swing", "OH Swing", "Revenge", "Heroic Strike"].includes(event.ability) &&
                (event.hit == "crit" || event.hit == 'crit block')) {
    
                // If gaining the buff (not just refreshing), update the owner hastePerc
                if (this.duration <= 0 || this.stacks == 0) owner.hastePerc += this.hastePerc;
                this.stacks = this.maxStacks;
                this.duration = this.maxDuraton;
                events.push({
                    type: "buff gained",
                    timestamp: event.timestamp, 
                    name: this.name,
                    stacks: this.stacks,
                    target: this.target,
                    source: this.source,
                    });
            }
        }
    }
    
    class Enrage extends Aura {
        constructor(input) {
            super(input);
        }
        handleEvent(owner, event, events) {
            if (event.type == "damage" && ["Bloodthirst", "MH Swing", "OH Swing", "Revenge", "Heroic Strike"].includes(event.ability)) {
                if (this.stacks > 0) {
                    events.push({
                        "type": "buff lost",
                        "timestamp": event["timestamp"],
                        "name": this.name,
                        "stacks": this.stacks,
                        "source": this.source,
                        "target": this.target,
                        });
                }
                this.stacks = Math.max(0, this.stacks - 1);
                if (this.stacks == 0) this.duration = 0;
            }
    
            if (event.type == "damage" && event.hit == "crit" && event.target == "Tank") {
                this.stacks = this.maxStacks;
                this.duration = this.maxDuration;
                events.push({
                    type: "buff gained",
                    timestamp: event.timestamp, 
                    name: this.name,
                    stacks: this.stacks,
                    target: this.target,
                    source: this.source,
                    });
            }
        }
    }
    
    class DefensiveState extends Aura {
        constructor(input) {
            super(input);
        }
        handleEvent(owner, event, events) {
            // Might be that Defensive State is only removed when it expires but it makes no difference in practice
            if (event.type == "damage" && event.ability == "Revenge") {
                this.duration = 0;
                events.push({
                    type: "buff lost",
                    timestamp: event.timestamp,
                    name: this.name,
                    stacks: this.stacks,
                    source: this.source,
                    target: this.target,
                    });
            }
    
            if (event.type == "damage" &&  ["parry", "dodge", "block"].includes(event.hit) && event.target == "Tank") {
                this.duration = this.maxDuration;
                events.push({
                    type: "buff gained",
                    timestamp: event.timestamp, 
                    name: this.name,
                    stacks: this.stacks,
                    target: this.target,
                    source: this.source,
                    });
            }
        }
    }
    
    class CrusaderMH extends Aura {
        constructor(input) {
            super(input);
        }
        handleEvent(owner, event, events) {
            if (event.type == "damage" && event.ability != "OH Swing" && globals._landedHits.includes(event.hit)) {
                let rng = Math.random()
                if (rng < owner.stats.MHSwing/(60*1000)) { 
                    this.duration = this.maxDuration;
                    events.push({
                        type: "buff gained",
                        timestamp: event.timestamp,
                        name: this.name,
                        stacks: this.stacks,
                        source: this.source,
                        target: this.target,
                        });
                }
            }
        }
    }
    
    class CrusaderOH extends Aura {
        constructor(input) {
            super(input);
        }
        handleEvent(owner, event, events) {
            if (event.type == "damage" && event.ability == "OH Swing" && globals._landedHits.includes(event.hit)) {
                let rng = Math.random()
                if (rng < owner.stats.OHSWing/(60*1000)) { 
                    this.duration = this.maxDuration;
                    events.push({
                        type: "buff gained",
                        timestamp: event.timestamp,
                        name: this.name,
                        stacks: this.stacks,
                        source: this.source,
                        target: this.target,
                        });
                }
            }
        }
    }
    
    class ThunderfuryDebuff extends Aura {
        constructor(input) {
            super(input);
        }
        handleEvent(owner, event, events) {
            if (event.type == "damage" && event.ability == "Thunderfury" && globals._landedHits.includes(event.hit)) {
    
                if (this.duration <= 0) owner.hastePerc += this.hastePerc;
                this.duration = this.maxDuraton;
                events.push({
                    type: "buff gained",
                    timestamp: event.timestamp, 
                    name: this.name,
                    stacks: this.stacks,
                    target: this.target,
                    source: this.source,
                    });
            }
        }
    }
    
    class WindfuryBuff extends Aura {
        constructor(input) {
            super(input)
        }
        handleEvent(owner, event, events) {
            if (event.type == "extra attack" && event.ability == "Windfury") {
                this.duration = this.maxDuration;
                let stacks = 2;
                if (["MH Swing", "Heroic Strike"].includes(event.source)) stacks = 1; // MH Swing removes a stack itself.
                this.stacks = stacks
                events.push({
                    type: "buff gained",
                    timestamp: event.timestamp, 
                    name: this.name,
                    stacks: stacks,
                    target: this.target,
                    source: this.source,
                    });
            }
            if (event.type == "damage" && ["Heroic Strike", "MH Swing", "OH Swing"].includes(event.ability)) {
                if (this.stacks > 0) {
                    events.push({
                        type: "buff lost",
                        timestamp: event["timestamp"],
                        name: this.name,
                        stacks: this.stacks,
                        source: this.source,
                        target: this.target,
                        });
                }
                this.stacks = Math.max(0, this.stacks - 1);
                if (this.stacks == 0) this.duration = Math.min(this.duration, 400); // Buff remains for one batch after its last stack is removed
            }
        }
    }
    
    class PrePullAura extends Aura {
        handleGameTick(ms, owner, events) {
            // Use at pull
            if(ms == 0) {
                this.duration = this.maxDuration;
                events.push({
                    type: "buff gained",
                    timestamp: ms, 
                    name: this.name,
                    stacks: this.stacks,
                    target: this.target,
                    source: this.source,
                    });
                owner.hastePerc += this.hastePerc;
                return;
            }
            if (this.duration <= 0) return;
            this.duration = this.duration - globals._timeStep;
            if (this.duration <= 0) {
                events.push({
                "type": "buff lost",
                "timestamp": ms,
                "name": this.name,
                "stacks": this.stacks,
                "source": this.source,
                "target": this.target,
                })
                if (this.hastePerc > 0) owner.hastePerc -= this.hastePerc;
            }
    
        }
    }
    
    class JomGabbar extends Aura {
        handleGameTick(ms, owner, events) {
            // Use at pull
            if(ms == 0) {
                this.duration = this.maxDuration;
                events.push({
                    type: "buff gained",
                    timestamp: ms, 
                    name: this.name,
                    stacks: this.stacks,
                    target: this.target,
                    source: this.source,
                    });
                this.stacks = 1;
                return;
            }
            this.duration -= globals._timeStep;
            if(this.duration <= 0) {
                if(this.stacks >= 10) {
                    events.push({
                        type: "buff lost",
                        timestamp: ms,
                        name: this.name,
                        stacks: this.stacks,
                        source: this.source,
                        target: this.target,
                    });
                    this.stacks = 0;
                } else {
                    this.stacks += 1;
                    this.duration = this.maxDuration;
                    events.push({
                        type: "buff gained",
                        timestamp: ms, 
                        name: this.name,
                        stacks: this.stacks,
                        target: this.target,
                        source: this.source,
                        });
                }
            }
        }
    }
    
    class LifegivingGem extends Aura {
        handleGameTick(ms, owner, events) {
            // Use at pull
            if(ms == 0) {
                this.duration = this.maxDuration;
                let threat = owner.stats.baseHealth * 0.15 * 0.5;// * owner.threatMod; // TODO: Verify.
                events.push({
                    type: "buff gained",
                    timestamp: ms, 
                    name: this.name,
                    threat: threat,
                    stacks: this.stacks,
                    target: this.target,
                    source: this.source,
                    });
                this.stacks = 1;
                return;
            }
        }
    }
    
    const defaultTankAuras = [
            new Flurry({
                    name: "Flurry",
                    maxDuration: 12000,
                    maxStacks: 3,
                    hastePerc: 30,
    
                    target: "Tank",
                    source: "Tank",
                    }),
            new Enrage({
                    name: "Enrage",
                    maxDuration: 12000,
                    maxStacks: 12,
                    damageMod: 1.25,
    
                    target: "Tank",
                    source: "Tank",
                    }),
            new DefensiveState({
                    name: "Defensive State",
                    maxDuration: 6000,
    
                    target: "Tank",
                    source: "Tank",
            }),
    ]
    
    const defaultBossAuras = [
        new SunderArmorDebuff({
                name: "Sunder Armor",
                maxDuration: 30000,
                maxStacks: 5,
                armorMod: -450,
                scalingStacks: true,
    
                target: "Boss",
                source: "Tank",
                }),
        new FaerieFire({
                name: "Faerie Fire",
                maxDuration: 30000,
                armorMod: -505,
    
                target: "Boss",
                source: "Tank",
                }),
        new CurseOfRecklessness({
                name: "Curse of Recklessness",
                maxDuration: 30000,
                armorMod: -640,
    
                target: "Boss",
                source: "Tank",
                }),
    ]


    function addOptionalAuras(tankAuras, bossAuras) {

        if(globals._deathwish) {
            tankAuras.push(new PrePullAura({
                name: "Death Wish",
                maxDuration: 28500, // uses a gcd
                damageMod: 1.2,
                percArmorMod: -20,

                target: "Tank",
                source: "Tank",
            }));
        }

        if(globals._crusaderMH) {
            tankAuras.push(new CrusaderMH({
                    name: "Crusader",
                    maxDuration: 15000,

                    strMod: 100,

                    target: "Tank",
                    source: "Tank",
            }));
        }

        if(globals._crusaderOH) {
            tankAuras.push(new CrusaderOH({
                    name: "Crusader",
                    maxDuration: 15000,

                    strMod: 100,

                    target: "Tank",
                    source: "Tank",
            }));
        }

        if(globals._thunderfury) {
            bossAuras.push(new ThunderfuryDebuff({
                    name: "Thunderfury",
                    maxDuration: 12000,

                    hastePerc: -20,

                    target: "Boss",
                    source: "Tank",
            }));
        }

        if(globals._windfury) {
            tankAuras.push(new WindfuryBuff({
                    name: "Windfury", 
                    maxDuration: 1500,
                    maxStacks: 2,
                    APMod: 315,

                    target: "Tank",
                    source: "Tank",
            }));
        }

        // TRINKETS
        if(globals._kots) {
            tankAuras.push(new PrePullAura({
                name: "Kiss of the Spider",
                maxDuration: 15000,
                hastePerc: 20,

                target: "Tank",
                source: "Tank",
            }));
        }

        if(globals._diamondflask) {
            tankAuras.push(new PrePullAura({
                name: "Diamond Flask",
                maxDuration: 60000,
                strMod: 75,

                target: "Tank",
                source: "Tank",
            }));
        }

        if(globals._earthstrike) {
            tankAuras.push(new PrePullAura({
                name: "Earthstrike",
                maxDuration: 20000,
                APMod: 280,

                target: "Tank",
                source: "Tank",
            }));
        }

        if(globals._slayerscrest) {
            tankAuras.push(new PrePullAura({
                name: "Slayer's Crest",
                maxDuration: 20000,
                APMod: 260,

                target: "Tank",
                source: "Tank",
            }));
        }

        if(globals._jomgabbar) {
            tankAuras.push(new JomGabbar({
                name: "Jom Gabbar",
                maxDuration: 2000,
                APMod: 65,

                scalingStacks: true,
                stacks: 1,


                target: "Tank",
                source: "Tank",
            }));
        }

        if(globals._lgg) {
            tankAuras.push(new LifegivingGem({
                name: "Lifegiving Gem",
                maxDuration: 20000,

                target: "Tank",
                source: "Tank",
            }));
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
                ability.currentCooldown = ability.currentCooldown - globals._timeStep*(1+attacker.hastePerc/100);
            else ability.currentCooldown = ability.currentCooldown - globals._timeStep;
        });
        attacker.auras.forEach(aura => aura.handleGameTick(ms, attacker, events));
    
        attacker.GCD = attacker.GCD - globals._timeStep;
    }



    const range = (length) =>
        Array.from({ length }, (_, i) => i)

    let playerAbilities = [
        new Bloodthirst("Bloodthirst", 6000, 30, true),
        new Revenge("Revenge", 5000, 5, true, 273, 2.25),
        new HeroicStrike("Heroic Strike", 0, 15, false, 175),
        new SunderArmor("Sunder Armor", 0, 15, true, 260),
        new OHSwing("OH Swing", globals._config.tankStats.OHSwing, 0, false),
        new MHSwing("MH Swing", globals._config.tankStats.MHSwing, 0, false),
    ];
    let bossAbilities = [new MHSwing("Auto Attack", 2000, 0, false)];

    let TankAuras = [...defaultTankAuras]
    let BossAuras = [...defaultBossAuras]
    addOptionalAuras(TankAuras, BossAuras); // Adds crusader/thunderfury etc auras to tank/boss if they are set in config.

    let TankProcs = getTankProcs();
    let BossProcs = [];

    let Tank = new Actor("Tank", "Boss", playerAbilities, globals._config.tankStats, TankAuras, TankProcs)
    let Boss = new Actor("Boss", "Tank", bossAbilities,   globals._config.bossStats, BossAuras, BossProcs)

    let results = {
        "MH Swing": Array.apply(null, Array(globals._iterations)).map((x, i) => 0),
        "OH Swing": Array.apply(null, Array(globals._iterations)).map((x, i) => 0),
        "Heroic Strike": Array.apply(null, Array(globals._iterations)).map((x, i) => 0),
        "Bloodthirst": Array.apply(null, Array(globals._iterations)).map((x, i) => 0),
        "Sunder Armor": Array.apply(null, Array(globals._iterations)).map((x, i) => 0),
        "Revenge": Array.apply(null, Array(globals._iterations)).map((x, i) => 0),
        "Thunderfury": Array.apply(null, Array(globals._iterations)).map((x, i) => 0),
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
    for (let _i in range(globals._simDuration*1000/globals._snapshotLen+1)) snapshots.push([]);
    for (let i in range(globals._iterations)) {
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

        while(ms <= globals._simDuration*1000) {

            let iterationEvents = [];
            performAction(iterationEvents, ms, Tank, Boss);
            performAction(iterationEvents, ms, Boss, Tank);
            
            events = events.concat(iterationEvents);

            if (ms == snapshot*globals._snapshotLen) {
                let snapshotThreat = 0;
                events.forEach(event => {
                    if (event.threat) snapshotThreat += event.threat;
                })
                snapshots[snapshot].push(snapshotThreat);
                snapshot += 1;
            }

            if (ms == globals._breakpointTime) {
                let breakpointThreat = 0;
                events.forEach(event => {
                    if (event.threat) breakpointThreat += event.threat;
                })
                breaches += breakpointThreat < globals._breakpointValue ? 1 : 0;
            }


            ms+=globals._timeStep
        }

        events.forEach(event => {
            if (event) {
                if (event.source == "Boss") {
                    if (event.damage) dmgTaken += event.damage;
                } else {
                    if (event.threat) threat += event.threat;
                    if (event.damage) damage += event.damage;
                    for (let ability in results) {
                        results[`${ability}`][i] += getAmount(event, ability, "threat")/globals._simDuration;
                    }
                }
            }
        });

        tps.push(threat/globals._simDuration)
        dps.push(damage/globals._simDuration)
        rageGained.push(Tank.rageGained/globals._simDuration)
        flurryUptime.push(Tank.flurryUptime/(globals._simDuration*10)) // divide by 1000 due to ms, multiply by 100 due to decimal to percentage => divide by 10.
        crusaderUptime.push(Tank.crusaderUptime/(globals._simDuration*10))
        Tank.rageGained = 0
        rageSpent.push(Tank.rageSpent/globals._simDuration)
        Tank.rageSpent = 0
        dtps.push(dmgTaken/globals._simDuration)
        //console.log(events)
    }
    console.log("Calculations complete!")
    ret = {
        tps: tps,
        dps: dps,
        dtps: dtps,
        rageGained: rageGained,
        rageSpent: rageSpent,
        flurryUptime: flurryUptime,
        crusaderUptime: crusaderUptime,
        results: results,
        breaches: breaches,
        snapshots: snapshots,
    }

    postMessage(ret);

})