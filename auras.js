"use strict";

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

        if (!input.strMod) this.strMod = 0; else this.strMod = input.strMod; // additive
        if (!input.critMod) this.critMod = 0; else this.critMod = input.critMod; // additive
        if (!input.damageMod) this.damageMod = 1; else this.damageMod = input.damageMod; // multiplicative
        if (!input.hasteMod) this.hasteMod = 0; else this.hasteMod = input.hasteMod; // percentage
        if (!input.armorMod) this.armorMod = 0; else this.armorMod = input.armorMod; // additive
    }

    handleGameTick(ms, owner, events) {
        if (this.duration <= 0) return;
        this.duration = this.duration - _timeStep;
        if (this.name == "Flurry") owner.flurryUptime += _timeStep;
        if (this.duration <= 0) {
            events.push({
            "type": "buff lost",
            "timestamp": ms,
            "name": this.name,
            "stacks": this.stacks,
            "source": this.source,
            "target": this.target,
            })
            if (this.hasteMod > 0) owner.hasteMod -= this.hasteMod;
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
                    owner.hasteMod -= this.hasteMod;
                }
            }
            this.stacks = Math.max(0, this.stacks - 1);
        }

        if (event.type == "damage" && 
            ["Bloodthirst", "MH Swing", "OH Swing", "Revenge", "Heroic Strike"].includes(event.ability) &&
            (event.hit == "crit" || event.hit == 'crit block')) {

            // If gaining the buff (not just refreshing), update the owner hasteMod
            if (this.duration <= 0 || this.stacks == 0) owner.hasteMod += this.hasteMod;
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
        if (event.type == "damage" && event.ability != "OH Swing" && _landedHits.includes(event.hit)) {
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
        if (event.type == "damage" && event.ability == "OH Swing" && _landedHits.includes(event.hit)) {
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
        if (event.type == "damage" && event.ability == "Thunderfury" && _landedHits.includes(event.hit)) {

            if (this.duration <= 0) owner.hasteMod += this.hasteMod;
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

const defaultTankAuras = [
        new Flurry({
                name: "Flurry",
                maxDuration: 12000,
                maxStacks: 3,
                hasteMod: 30,

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
    if(_crusaderMH) {
        tankAuras.push(new CrusaderMH({
                        name: "Crusader",
                        maxDuration: 15000,

                        strMod: 100,

                        target: "Tank",
                        source: "Tank",
        }));
    }

    if(_crusaderOH) {
        tankAuras.push(new CrusaderOH({
                name: "Crusader",
                maxDuration: 15000,

                strMod: 100,

                target: "Tank",
                source: "Tank",
        }));
    }

    if(_thunderfury) {
        bossAuras.push(new ThunderfuryDebuff({
                name: "Thunderfury",
                maxDuration: 12000,

                hasteMod: -20,

                target: "Boss",
                source: "Tank",
        }));
    }

}
