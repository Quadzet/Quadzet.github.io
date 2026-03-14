// tests/sim-fixtures.js
// Test fixtures for simulation regression tests
export function getBasicTankStats() {
  return {
    "level": "60",
    "type": "tank",
    "agility": 210,
    "strength": 510,
    "stamina": 807.8,
    "crit": 35.839999999999996,
    "spellcrit": 0,
    "hit": 7,
    "attackpower": 1781,
    "haste": 15,
    "defense": 392,
    "armor": 3831,
    "bonusArmor": -2385,
    "parry": 23.68,
    "dodge": 35.08,
    "block": 0,
    "blockvalue": 0,
    "health": 6284,
    "staminaMod": 1.4,
    "strengthMod": 1.25,
    "agilityMod": 1.25,
    "armorMod": 1,
    "damageMod": 0.9900000000000001,
    "critMod": 1,
    "abilityCritMod": 1,
    "threatMod": 1.45,
    "physDamageMod": 1,
    "flatArmor": 0,
    "flatDamage": 0,
    "mainhand": {
        "name": "Gressil, Dawn of Ruin",
        "slot": "onehand",
        "type": "Sword",
        "ilvl": 89,
        "armor": 0,
        "agility": 0,
        "strength": 0,
        "stamina": 15,
        "crit": 0,
        "hit": 0,
        "attackpower": 40,
        "mindmg": 138,
        "maxdmg": 257,
        "swingtimer": 2700,
        "defense": 0,
        "parry": 0,
        "dodge": 0,
        "block": 0,
        "blockvalue": 0,
        "skill": 0,
        "skilltype": []
    },
    "offhand": {
        "name": "The Hungering Cold",
        "slot": "onehand",
        "type": "Sword",
        "ilvl": 89,
        "armor": 140,
        "agility": 0,
        "strength": 0,
        "stamina": 14,
        "crit": 0,
        "hit": 0,
        "attackpower": 0,
        "mindmg": 76,
        "maxdmg": 143,
        "swingtimer": 1500,
        "defense": 0,
        "parry": 0,
        "dodge": 0,
        "block": 0,
        "blockvalue": 0,
        "skill": 6,
        "skilltype": [
            "Sword"
        ]
    },
    "mhskill": 311,
    "ohskill": 311,
    "wield": "Dual wield",
    "normSwing": 2400,
    "startRage": 70,
    "gear": {
        "head": "22418",
        "hands": "21581",
        "neck": "22732",
        "waist": "22422",
        "shoulder": "22419",
        "legs": "22417",
        "back": "23045",
        "feet": "22420",
        "chest": "22416",
        "wrist": "22423",
        "finger1": "19432",
        "finger2": "23059",
        "mainhand": "23054",
        "offhand": "23577",
        "ranged": "236322"
    },
    "rotation": {
        "death-wish": {
            "use": true,
            "rage": 0
        },
        "revenge": {
            "use": false,
            "rage": 60
        },
        "rend": {
            "use": false,
            "rage": 60
        },
        "heroic-strike": {
            "use": true,
            "rage": 50
        },
        "shield-block": {
            "use": false,
            "rage": 90
        },
        "shield-slam": {
            "use": true,
            "rage": 60
        },
        "bloodthirst": {
            "use": true,
            "rage": 30
        },
        "mortal-strike": {
            "use": false,
            "rage": 60
        },
        "sunder-armor": {
            "use": true,
            "rage": 60
        }
    },
    "talents": {
        "deathwish": true,
        "bloodthirst": true,
        "mortalStrike": false,
        "shieldslam": false,
        "flurry": 5,
        "enrage": 5,
        "deepWounds": 0,
        "toughness": 3,
        "anticipation": 0,
        "deflection": 3,
        "cruelty": 5,
        "shieldspec": 5,
        "impHS": 0,
        "impSA": 0,
        "impRend": 0,
        "defiance": 5,
        "impale": 0,
        "impSB": 1,
        "impTC": 0,
        "dwspec": 4,
        "swordSpec": 0,
        "axeSpec": 0,
        "poleSpec": 0
    },
    "bonuses": {
        "mhoil": false,
        "ohoil": false,
        "goa": false,
        "fivePieceWrath": false,
        "twoPieceDreadnaught": false,
        "windfury": false
    },
    "procs": []
  }
}

export function getBasicBossStats() {
  return {
      "level": 63,
      "type": "boss",
      "agility": 0,
      "strength": 0,
      "stamina": 0,
      "crit": 5,
      "spellcrit": 0,
      "hit": 0,
      "attackpower": 90,
      "haste": 0,
      "defense": 315,
      "armor": 36,
      "bonusArmor": -3695,
      "parry": 5,
      "dodge": 5,
      "block": 5,
      "blockvalue": 48,
      "health": 1,
      "staminaMod": 1,
      "strengthMod": 1,
      "agilityMod": 1,
      "armorMod": 1,
      "damageMod": 0.9,
      "critMod": 1,
      "abilityCritMod": 1,
      "threatMod": 0,
      "physDamageMod": 1,
      "flatArmor": 0,
      "flatDamage": 0,
      "mainhand": {
          "mindmg": 4000,
          "maxdmg": 4000,
          "swingtimer": 2000,
          "type": "none"
      },
      "offhand": {},
      "mhskill": 315,
      "ohskill": 0,
      "wield": "Unarmed",
      "normSwing": 2400,
      "startRage": 0,
      "gear": {},
      "rotation": {},
      "talents": {},
      "bonuses": {},
      "procs": []
  }
}

export function getBasicConfig(iterations = 1, simDuration = 60) {
    return {
        simDuration: simDuration,
        iterations: iterations
    }
}

export function getBasicGlobals(iterations = 1, simDuration = 60) {
  return {
    tankStats: getBasicTankStats(),
    bossStats: getBasicBossStats(),
    config: getBasicConfig(iterations, simDuration),
  };
}

// Reference results from 1000 iteration baseline run
// These values are used for regression detection
export const REFERENCE_RESULTS = {
  // Single iteration, 60s fight - sanity check ranges
  // Note: Single iteration has high variance, ranges are wide
  singleIter60s: {
    config: { iterations: 1, simDuration: 60 },
    tpsRange: [800, 2000],   // Expected TPS range
    dpsRange: [500, 1200],   // Expected DPS range
    dtpsRange: [200, 1200],  // Expected DTPS range (high variance in single iteration)
  },
  // 1000 iterations, 60s fight - regression baseline
  // Updated after APL system implementation
  multiIter60s: {
    config: { iterations: 1000, simDuration: 60 },
    tps:  { value: 1142.09, tolerance: 0.05 },
    dps:  { value: 735.95, tolerance: 0.05 },
    dtps: { value: 581.89, tolerance: 0.05 },
  },
};

