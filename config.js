"use strict";

// GLOBALS 
let _landedHits = ["hit", "crit", "block", 'crit block'];
let _simDuration = 12; // Fight duration in seconds
let _iterations = 10000; // Number of fights simulated
let _timeStep = 25; // Timestep used for each fight


class StaticStats {
    constructor(stats) {
        this.type = stats.type;
        this.level = stats.level;

        this.MHMin = stats.MHMin;
        this.MHMax = stats.MHMax;
        this.MHSwing = stats.MHSwing;
        this.OHMin = stats.OHMin;
        this.OHMax = stats.OHMax;
        this.OHSwing = stats.OHSwing;

        this.MHWepSkill = stats.MHWepSkill;
        this.OHWepSkill = stats.OHWepSkill;
        this.crit = stats.crit;
        this.AP = stats.AP;
        this.blockValue = stats.blockValue;
        this.hit = stats.hit;

        this.parry = stats.parry;
        this.dodge = stats.dodge;
        this.block = stats.block;
        this.defense = stats.defense;
        this.baseArmor = stats.baseArmor;

        this.threatMod = stats.threatMod;
    }
}

const config = {
    tankStats: new StaticStats({
            type: "tank",
            level: 60,

            MHMin: 86,
            MHMax: 162,
            MHSwing: 2200,

            OHMin: 83,
            OHMax: 154,
            OHSwing: 2300,

            MHWepSkill: 311,
            OHWepSkill: 307,
            crit: 25.4,
            AP: 1202, //912,
            blockValue: 0,
            hit: 6,

            parry: 7.72,
            dodge: 21.67,
            block: 0,
            defense: 343,
            baseArmor: 5982,

            threatMod: 1.495,
        }),

    bossStats: new StaticStats({
            type: "boss",
            level: 63,

            MHMin: 5000,
            MHMax: 5000,
            MHSwing: 2000,

            MHWepSkill: 315,
            AP: 0, //TODO: AP needs to scale correctly for npc vs players, add APScaling, also 270 base
            crit: 5,
            blockValue: 47,

            parry: 12.5, // 14%  with skilldiff
            dodge: 5,    // 6.5% with skilldiff
            block: 5,
            defense: 315,
            baseArmor: 3731,

            threatMod: 0,
        })
}
