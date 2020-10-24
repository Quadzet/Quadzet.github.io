"use strict";

// GLOBALS 
let _landedHits = ["hit", "crit", "block", 'crit block'];
let _simDuration = 12; // Fight duration in seconds
let _iterations = 10000; // Number of fights simulated
let _timeStep = 25; // Timestep used for each fight
let _config = {}; // tank and boss settings
let _startRage = 0;

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

function fetchSettings(calcSettings, tankSettings, bossSettings) {

    _iterations = Number(calcSettings.querySelector("#iterations").value)
    _simDuration = Number(calcSettings.querySelector("#fightLength").value)
    _startRage = Number(tankSettings.querySelector("#startRage").value)

    _config = {
        tankStats: new StaticStats({
            type: "tank",
            level: 60,

            MHMin: Number(tankSettings.querySelector("#MHMin").value),
            MHMax: Number(tankSettings.querySelector("#MHMax").value),
            MHSwing: Number(tankSettings.querySelector("#MHSwing").value)*1000,

            OHMin: Number(tankSettings.querySelector("#OHMin").value),
            OHMax: Number(tankSettings.querySelector("#OHMax").value),
            OHSwing: Number(tankSettings.querySelector("#OHSwing").value)*1000,

            MHWepSkill: Number(tankSettings.querySelector("#MHWepSkill").value),
            OHWepSkill: Number(tankSettings.querySelector("#OHWepSkill").value),
            AP: Number(tankSettings.querySelector("#AP").value),
            crit: Number(tankSettings.querySelector("#crit").value),
            hit: Number(tankSettings.querySelector("#hit").value),
            
            parry: Number(tankSettings.querySelector("#parry").value),
            dodge: Number(tankSettings.querySelector("#dodge").value),
            block: Number(tankSettings.querySelector("#block").value),
            blockValue: 0,
            defense: Number(tankSettings.querySelector("#defense").value),
            baseArmor: Number(tankSettings.querySelector("#armor").value),

            threatMod: 1.495,
        }),

        bossStats: new StaticStats({
            type: "boss",
            level: 63,

            MHMin: Number(bossSettings.querySelector("#swingMin").value),
            MHMax: Number(bossSettings.querySelector("#swingMax").value),
            MHSwing: Number(bossSettings.querySelector("#swingTimer").value)*1000,

            MHWepSkill: 315,
            AP: 0, //TODO: AP needs to scale correctly for npc vs players, add APScaling, also 270 base
            crit: 5,
            blockValue: 47,

            parry: 12.5, // 14%  with skilldiff
            dodge: 5,    // 6.5% with skilldiff
            block: 5,
            defense: 315,
            baseArmor: Number(bossSettings.querySelector("#armor").value),

            threatMod: 0,
        })
    }
}
