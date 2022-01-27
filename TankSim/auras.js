class Aura {
    constructor(input) {
        if (!input.type) this.type = "aura"; else this.type = input.type;
        if (!input.name) this.name = "unknown"; else this.name = input.name;
        if (!input.target) this.target = "unknown"; else this.target = input.target;
        if (!input.source) this.source = "unknown"; else this.source = input.source;
        if (!input.trackUptime) this.trackUptime = false; else this.trackUptime = input.trackUptime;

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
        if (!input.defenseMod) this.defenseMod = 0; else this.defenseMod = input.defenseMod; // additive
    }

    handleGameTick(ms, owner, events, config) {
        if (this.duration <= 0) return;
        this.duration = this.duration - config.timeStep;
        if(this.trackUptime) {
            if(!owner.uptimes[`${this.name}`]) owner.uptimes[`${this.name}`] = 0;
            owner.uptimes[`${this.name}`] += config.timeStep;
        }
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
            if (this.defenseMod > 0) owner.defense -= this.defenseMod;
        }
    }

    handleEvent(owner, event, events, config) {
        return;
    }
}

class SunderArmorDebuff extends Aura {
    constructor(input) {
        super(input);
    }
    handleEvent(owner, event, events, config) {
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
    handleEvent(owner, event, events, config) {
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
    handleGameTick(ms, owner, events, config) {
        return;
    }
}

class CurseOfRecklessness extends Aura {
    constructor(input) {
        super(input);
    }
    handleEvent(owner, event, events, config) {
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
    handleGameTick(ms, owner, events, config) {
        return; 
    }
}

class IEA extends Aura {
    handleEvent(owner, event, events, config) {
        if (event.type == "damage" && event.ability == "Improved Expose Armor" && event.hit == "hit") {
            this.duration = this.maxDuration;
            events.push({
                type: "buff gained",
                timestamp: event.timestamp, 
                name: this.name,
                stacks: this.stacks,
                target: this.target,
                source: this.source,
                });
            // Remove sunder armor and set the variable to ensure that no further sunders are applied
            owner.IEA = true;
            owner.auras.forEach(aura => {
                if(aura.name == "Sunder Armor") {
                    aura.stacks = 0;
                    aura.duration = 0;
                }
            });
        }
    }

    // Never let this expire
    handleGameTick(ms, owner, events, config) {
        return; 
    }
}

class Flurry extends Aura {
    constructor(input) {
        super(input);
    }
    // Only swings remove stacks, even if parried/dodged/missed.
    handleEvent(owner, event, events, config) {
        if (event.type == "damage" && ["MH Swing", "OH Swing", "Heroic Strike"].includes(event.ability)) {
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
    handleEvent(owner, event, events, config) {
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
    handleEvent(owner, event, events, config) {
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
    handleEvent(owner, event, events, config) {
        if (event.type == "damage" && event.ability != "OH Swing" && config.landedHits.includes(event.hit)) {
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
    handleEvent(owner, event, events, config) {
        if (event.type == "damage" && event.ability == "OH Swing" && config.landedHits.includes(event.hit)) {
            let rng = Math.random()
            if (rng < owner.stats.OHSwing/(60*1000)) { 
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

class DemolisherMH extends Aura {
    handleEvent(owner, event, events, config) {
        if (event.type == "damage" && event.ability != "OH Swing" && config.landedHits.includes(event.hit)) {
            let rng = Math.random()
            if (rng < owner.stats.MHSwing/(60*1000)) { // swing*ppm/(60*1000)
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

class DemolisherOH extends Aura {
    handleEvent(owner, event, events, config) {
        if (event.type == "damage" && event.ability == "OH Swing" && config.landedHits.includes(event.hit)) {
            let rng = Math.random()
            if (rng < owner.stats.OHSwing/(60*1000)) { 
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

class EskhandarMH extends Aura {
    handleEvent(owner, event, events, config) {
        if (event.type == "damage" && event.ability != "OH Swing" && config.landedHits.includes(event.hit)) {
            let rng = Math.random()
            if (rng < owner.stats.MHSwing/(60*1000)) { // swing*ppm/(60*1000)
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
class QuelMH extends Aura {
    handleEvent(owner, event, events, config) {
        if (event.type == "damage" && event.ability != "OH Swing" && config.landedHits.includes(event.hit)) {
            let rng = Math.random()
            if (rng < owner.stats.MHSwing*2/(60*1000)) { // swing*ppm/(60*1000)
                if (this.duration <= 0) owner.defense += this.defenseMod;
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

class FelstrikerMH extends Aura {
    handleEvent(owner, event, events, config) {
        if (event.type == "damage" && event.ability != "OH Swing" && config.landedHits.includes(event.hit)) {
            let rng = Math.random()
            if (rng < owner.stats.MHSwing/(60*1000)) { // swing*ppm/(60*1000)
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

class FelstrikerOH extends Aura {
    handleEvent(owner, event, events, config) {
        if (event.type == "damage" && event.ability != "OH Swing" && config.landedHits.includes(event.hit)) {
            let rng = Math.random()
            if (rng < owner.stats.MHSwing/(60*1000)) { // swing*ppm/(60*1000)
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
    handleEvent(owner, event, events, config) {
        if (event.type == "damage" && event.ability == "Thunderfury" && config.landedHits.includes(event.hit)) {

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

class GiftofArthas extends Aura {

    handleGameTick(ms, owner, events, config) {
        if (this.duration <= 0) return;
        this.duration = this.duration - config.timeStep;
        if (this.duration <= 0) {
            events.push({
            "type": "buff lost",
            "timestamp": ms,
            "name": this.name,
            "stacks": this.stacks,
            "source": this.source,
            "target": this.target,
            })
            owner.additivePhysBonus -= 8;
        }
    }

    handleEvent(owner, event, events, config) {
        if (event.type == "proc" && event.ability == "Gift of Arthas") {
            if ( this.duration <= 0 ) owner.additivePhysBonus += 8;
            this.duration = this.maxDuration;
            events.push({
                type: "buff gained",
                timestamp: event.timestamp, 
                name: this.name,
                stacks: this.stacks,
                target: this.target,
                source: this.source,
            })
        }
    }
}

class WindfuryBuff extends Aura {
    constructor(input) {
        super(input)
    }
    handleEvent(owner, event, events, config) {
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
    handleGameTick(ms, owner, events, config) {
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
        this.duration = this.duration - config.timeStep;
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
    handleGameTick(ms, owner, events, config) {
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
        this.duration -= config.timeStep;
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
    handleGameTick(ms, owner, events, config) {
        // Use at pull
        if(ms == 0) {
            this.duration = this.maxDuration;
            let threat = owner.stats.baseHealth * 0.15 * 0.5;
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
]


function addOptionalAuras(tankAuras, bossAuras, globals) {

if(globals.tankStats.talents.flurry > 0) {
    tankAuras.push(new Flurry({
        name: "Flurry",
        maxDuration: 12000,
        maxStacks: 3,
        hastePerc: 5 + 5*globals.tankStats.talents.flurry,

        trackUptime: true,
        target: "Tank",
        source: "Tank",
        }));
}

if(globals.tankStats.talents.enrage > 0) {
    tankAuras.push(new Enrage({
        name: "Enrage",
        maxDuration: 12000,
        maxStacks: 12,
        damageMod: 1 + 0.05*globals.tankStats.talents.enrage,

        trackUptime: true,
        target: "Tank",
        source: "Tank",
        }));
}

if(globals.tankStats.talents.deathwish) {
    tankAuras.push(new PrePullAura({
        name: "Death Wish",
        maxDuration: 28500, // uses a gcd
        damageMod: 1.2,
        percArmorMod: -20,

        target: "Tank",
        source: "Tank",
    }));
}

if(globals.tankStats.bonuses.mrp) {
    tankAuras.push(new PrePullAura({
        name: "Mighty Rage Potion",
        maxDuration: 20000,
        strMod: 60,

        target: "Tank",
        source: "Tank",
    }));
}

if(globals.tankStats.bonuses.crusaderMH) {
    tankAuras.push(new CrusaderMH({
            name: "Crusader MH",
            maxDuration: 15000,

            strMod: 100,

            trackUptime: true,
            target: "Tank",
            source: "Tank",
    }));
}

if(globals.tankStats.bonuses.crusaderOH) {
    tankAuras.push(new CrusaderOH({
            name: "Crusader OH",
            maxDuration: 15000,

            strMod: 100,

            trackUptime: true,
            target: "Tank",
            source: "Tank",
    }));
}

if(globals.tankStats.weapons.thunderfuryMH || globals.tankStats.weapons.thunderfuryOH) {
    bossAuras.push(new ThunderfuryDebuff({
            name: "Thunderfury",
            maxDuration: 12000,

            hastePerc: -20,

            target: "Boss",
            source: "Tank",
    }));
}

if(globals.tankStats.bonuses.windfury) {
    tankAuras.push(new WindfuryBuff({
            name: "Windfury", 
            maxDuration: 1500,
            maxStacks: 2,
            APMod: globals.tankStats.bonuses.windfuryAP,

            target: "Tank",
            source: "Tank",
    }));
}

if(globals.tankStats.bonuses.goa) {
    bossAuras.push(new GiftofArthas({
        name: "Gift of Arthas",
        maxDuration: 180000,

        target: "Boss",
        source: "Tank",
    }))
}

if(globals.tankStats.bonuses._berserking) {
    tankAuras.push(new PrePullAura({
        name: "Berserking",
        maxDuration: 10000,
        hastePerc: 10, // Assuming only 10%, anything else would be kinda weird


        target: "Tank",
        source: "Tank",
    }))
}

if(globals.tankStats.weapons.edMH) {
    tankAuras.push(new DemolisherMH({
        name: "Empyrean Demolisher MH",
        maxDuration: 10000,
        hastePerc: 20,
        trackUptime: true,

        target: "Tank",
        source: "Tank",
    }))
}

if(globals.tankStats.weapons.edOH) {
    tankAuras.push(new DemolisherOH({
        name: "Empyrean Demolisher OH",
        maxDuration: 10000,
        hastePerc: 20,
        trackUptime: true,

        target: "Tank",
        source: "Tank",
    }))
}

if(globals.tankStats.weapons.eskMH) {
    tankAuras.push(new EskhandarMH({
        name: "Eskhandar's Right Claw",
        maxDuration: 5000,
        hastePerc: 30,
        trackUptime: true,

        target: "Tank",
        source: "Tank",
    }))
}

if(globals.tankStats.weapons.qsMH) {
    tankAuras.push(new QuelMH({
        name: "Quel'Serrar",
        maxDuration: 10000,
        armorMod: 300,
        defenseMod: 13,
        trackUptime: true,

        target: "Tank",
        source: "Tank",
    }))
}

if(globals.tankStats.weapons.fsMH) {
    tankAuras.push(new FelstrikerMH({
        name: "Felstriker MH",
        maxDuration: 300,
        critMod: 100,
        trackUptime: true,

        target: "Tank",
        source: "Tank",
    }))
}

if(globals.tankStats.weapons.fsOH) {
    tankAuras.push(new FelstrikerOH({
        name: "Felstriker OH",
        maxDuration: 300,
        critMod: 100,
        trackUptime: true,

        target: "Tank",
        source: "Tank",
    }))
}

// TRINKETS
if(globals.tankStats.trinkets.kots) {
    tankAuras.push(new PrePullAura({
        name: "Kiss of the Spider",
        maxDuration: 15000,
        hastePerc: 20,

        target: "Tank",
        source: "Tank",
    }));
}

if(globals.tankStats.trinkets.diamondflask) {
    tankAuras.push(new PrePullAura({
        name: "Diamond Flask",
        maxDuration: 60000,
        strMod: 75,

        target: "Tank",
        source: "Tank",
    }));
}

if(globals.tankStats.trinkets.earthstrike) {
    tankAuras.push(new PrePullAura({
        name: "Earthstrike",
        maxDuration: 20000,
        APMod: 280,

        target: "Tank",
        source: "Tank",
    }));
}

if(globals.tankStats.trinkets.slayerscrest) {
    tankAuras.push(new PrePullAura({
        name: "Slayer's Crest",
        maxDuration: 20000,
        APMod: 260,

        target: "Tank",
        source: "Tank",
    }));
}

if(globals.tankStats.trinkets.jomgabbar) {
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

if(globals.tankStats.trinkets.lgg) {
    tankAuras.push(new LifegivingGem({
        name: "Lifegiving Gem",
        maxDuration: 20000,

        target: "Tank",
        source: "Tank",
    }));
}  

// Boss debuffs
    if(globals.config.faerieFire) {
        bossAuras.push(new FaerieFire({
            name: "Faerie Fire",
            maxDuration: 30000,
            armorMod: -505,

            target: "Boss",
            source: "Other",
            }));
        }
    if(globals.config.CoR) {
        bossAuras.push(new CurseOfRecklessness({
            name: "Curse of Recklessness",
            maxDuration: 30000,
            armorMod: -640,

            target: "Boss",
            source: "Other",
            }));
        }
    if(globals.config.IEA) {
        bossAuras.push(new IEA({
            name: "Improved Expose Armor",
            maxDuration: 30000,
            armorMod: -2550,
        
            target: "Boss",
            source: "Other",
            }));
        }

}
