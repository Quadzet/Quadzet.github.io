"use strict";

// GLOBALS 
const _landedHits = ["hit", "crit", "block", "crit block"];
const _timeStep = 25; // Timestep used for each fight

// Calc Settings
let _simDuration = 12; // Fight duration in seconds
let _iterations = 10000; // Number of fights simulated
let _snapshotLen = 400;
let _config = {}; // tank and boss settings
//let _firstBatch = 0;

// Tank Settings
let _startRage = 0;
let _deathwish = true;
let _crusaderMH = true;
let _crusaderOH = false;
let _thunderfury = true;
let _windfury = false;
let _wcb = false;
let _dmf = false;

// Trinkets
let _kots = false;
let _diamondflask = false;
let _earthstrike = false;
let _slayerscrest = false;
let _jomgabbar = false;
let _lgg = false; 

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
        this.damageMod = stats.damageMod;
        this.hastePerc = stats.hastePerc;
        this.crit = stats.crit;
        this.AP = stats.AP;
        this.blockValue = stats.blockValue;
        this.hit = stats.hit;

        this.parry = stats.parry;
        this.dodge = stats.dodge;
        this.block = stats.block;
        this.defense = stats.defense;
        this.baseArmor = stats.baseArmor;
        this.baseHealth = stats.baseHealth;

        this.threatMod = stats.threatMod;
    }
}

function fetchSettings() {

    let tankSettings = document.querySelector("#tankSettings");
    let bossSettings = document.querySelector("#bossSettings");
    let calcSettings = document.querySelector("#calcSettings");
    let trinkets = document.querySelector("#trinkets");
    //let graphSettings = document.querySelector("#graphSettings");


    _iterations = Number(calcSettings.querySelector("#iterations").value)
    _simDuration = Number(calcSettings.querySelector("#fightLength").value)
    _startRage = Number(tankSettings.querySelector("#startRage").value)
    //_firstBatch = Number(graphSettings.querySelector("#firstbatch").value)

    _deathwish = tankSettings.querySelector("#deathwish").checked
    _crusaderMH = tankSettings.querySelector("#crusaderMH").checked
    _crusaderOH = tankSettings.querySelector("#crusaderOH").checked
    _thunderfury = tankSettings.querySelector("#thunderfury").checked
    _windfury = tankSettings.querySelector("#windfury").checked
    _wcb = tankSettings.querySelector("#wcb").checked
    _dmf = tankSettings.querySelector("#dmf").checked

    // Trinkets
    _kots = trinkets.querySelector("#kots").checked
    _earthstrike = trinkets.querySelector("#earthstrike").checked
    _diamondflask = trinkets.querySelector("#diamondflask").checked
    _jomgabbar = trinkets.querySelector("#jomgabbar").checked
    _slayerscrest = trinkets.querySelector("#slayerscrest").checked
    //_lgg = trinkets.querySelector("#lgg").checked

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
            damageMod: _dmf ? 0.99 : 0.9, // Defensive Stance + dmf
            hastePerc: _wcb ? 10 : 0, 
            AP: Number(tankSettings.querySelector("#AP").value),
            crit: Number(tankSettings.querySelector("#crit").value),
            hit: Number(tankSettings.querySelector("#hit").value),
            
            parry: Number(tankSettings.querySelector("#parry").value),
            dodge: Number(tankSettings.querySelector("#dodge").value),
            block: 0, //Number(tankSettings.querySelector("#block").value),
            blockValue: 0,
            defense: Number(tankSettings.querySelector("#defense").value),
            baseArmor: Number(tankSettings.querySelector("#tankarmor").value),
            baseHealth: Number(tankSettings.querySelector("#health").value),

            threatMod: 1.495,
        }),

        bossStats: new StaticStats({
            type: "boss",
            level: 63,

            MHMin: Number(bossSettings.querySelector("#swingMin").value),
            MHMax: Number(bossSettings.querySelector("#swingMax").value),
            MHSwing: Number(bossSettings.querySelector("#swingTimer").value)*1000,

            MHWepSkill: 315,
            damageMod: 0.9, // Defensive Stance
            hastePerc: 0,
            AP: 0, //TODO: AP needs to scale correctly for npc vs players, add APScaling, also 270 base
            crit: 5,
            blockValue: 47,

            parry: 12.5, // 14%  with skilldiff
            dodge: 5,    // 6.5% with skilldiff
            block: 5,
            defense: 315,
            baseArmor: Number(bossSettings.querySelector("#bossarmor").value),

            threatMod: 0,
        })
    }
}
