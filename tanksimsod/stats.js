/*

{
    strength: 0,
    stamina: 0,
    agility: 0,

    hit: 0,
    crit: 0,
    attackpower: 0,

    armor: 0,
    parry: 0,
    dodge: 0,
    defense: 0,
    block: 0,
    blockvalue: 0,

    skill: 0,
    skilltype: 'none'
},

*/

let races = {
    "Dwarf": {
    strength: 56,
    stamina: 53,
    agility: 35,

    hit: 0,
    crit: 0,
    attackpower: 55,

    armor: 0,
    parry: 0,
    dodge: 0,
    defense: 0,
    block: 0,
    blockvalue: 0,

    skill: 0,
    skilltype: 'none'
},
    "Gnome": {
    strength: 49,
    stamina: 49,
    agility: 42,

    hit: 0,
    crit: 0,
    attackpower: 55,

    armor: 0,
    parry: 0,
    dodge: 0,
    defense: 0,
    block: 0,
    blockvalue: 0,

    skill: 0,
    skilltype: 'none'
},
    "Human": {
    strength: 54,
    stamina: 50,
    agility: 39,

    hit: 0,
    crit: 0,
    attackpower: 55,

    armor: 0,
    parry: 0,
    dodge: 0,
    defense: 0,
    block: 0,
    blockvalue: 0,

    skill: 5,
    skilltype: ["Sword", "Mace"],
},
    "Night Elf": {
    strength: 51,
    stamina: 49,
    agility: 44,

    hit: 0,
    crit: 0,
    attackpower: 55,

    armor: 0,
    parry: 0,
    dodge: 1,
    defense: 0,
    block: 0,
    blockvalue: 0,

    skill: 0,
    skilltype: 'none'
},
    "Orc": {
    strength: 57,
    stamina: 52,
    agility: 36,

    hit: 0,
    crit: 0,
    attackpower: 55,

    armor: 0,
    parry: 0,
    dodge: 0,
    defense: 0,
    block: 0,
    blockvalue: 0,

    skill: 5,
    skilltype: ["Axe"]
},
    "Tauren": {
    strength: 59,
    stamina: 52,
    agility: 34,

    hit: 0,
    crit: 0,
    attackpower: 55,

    armor: 0,
    parry: 0,
    dodge: 0,
    defense: 0,
    block: 0,
    blockvalue: 0,

    skill: 0,
    skilltype: 'none'
},
    "Troll": {
    strength: 55,
    stamina: 51,
    agility: 41,

    hit: 0,
    crit: 0,
    attackpower: 55,

    armor: 0,
    parry: 0,
    dodge: 0,
    defense: 0,
    block: 0,
    blockvalue: 0,

    skill: 0,
    skilltype: 'none'
},
    "Undead": {
    strength: 119,
    stamina: 111,
    agility: 78,

    hit: 0,
    crit: 0,
    attackpower: 160,

    armor: 0,
    parry: 0,
    dodge: 0,
    defense: 0,
    block: 0,
    blockvalue: 0,

    skill: 0,
    skilltype: 'none'
},

}

let ENCHANT_DATA = {
    0: {
       "name": "None",
       "description": "Add Enchant",
       "health": 0,
       "strength": 0,
       "stamina": 0,
       "agility": 0,
       "armor": 0,

       "crit": 0,
       "hit": 0,
       "attackpower": 0,

       "dodge": 0,
       "block": 0,
       "blockvalue": 0,
       "defense": 0,
       "parry": 0,

       "skill": 0,
       "skilltype": [],

       "damage": 0,

       "proc": 0,
       "ppm": 0,
    },

    13882: {
       "name": "Lesser Agility",
       "description": "+3 agility",
       "health": 0,
       "strength": 0,
       "stamina": 0,
       "agility": 3,
       "armor": 0,

       "crit": 0,
       "hit": 0,
       "attackpower": 0,

       "dodge": 0,
       "block": 0,
       "blockvalue": 0,
       "defense": 0,
       "parry": 0,

       "skill": 0,
       "skilltype": [],

       "damage": 0,

       "proc": 0,
       "ppm": 0,
    },
    7867: {
       "name": "Minor Agility",
       "description": "+1 agility",
       "health": 0,
       "strength": 0,
       "stamina": 0,
       "agility": 1,
       "armor": 0,

       "crit": 0,
       "hit": 0,
       "attackpower": 0,

       "dodge": 0,
       "block": 0,
       "blockvalue": 0,
       "defense": 0,
       "parry": 0,

       "skill": 0,
       "skilltype": [],

       "damage": 0,

       "proc": 0,
       "ppm": 0,
    },
    7779: {
       "name": "Minor Agility",
       "description": "+1 agility",
       "health": 0,
       "strength": 0,
       "stamina": 0,
       "agility": 1,
       "armor": 0,

       "crit": 0,
       "hit": 0,
       "attackpower": 0,

       "dodge": 0,
       "block": 0,
       "blockvalue": 0,
       "defense": 0,
       "parry": 0,

       "skill": 0,
       "skilltype": [],

       "damage": 0,

       "proc": 0,
       "ppm": 0,
    },
    13626: {
       "name": "Minor Stats",
       "description": "+1 stats",
       "health": 0,
       "strength": 1,
       "stamina": 1,
       "agility": 1,
       "armor": 0,

       "crit": 0,
       "hit": 0,
       "attackpower": 0,

       "dodge": 0,
       "block": 0,
       "blockvalue": 0,
       "defense": 0,
       "parry": 0,

       "skill": 0,
       "skilltype": [],

       "damage": 0,

       "proc": 0,
       "ppm": 0,
    },
    13501: {
       "name": "Lesser Stamina",
       "description": "+3 stamina",
       "health": 0,
       "strength": 0,
       "stamina": 3,
       "agility": 0,
       "armor": 0,

       "crit": 0,
       "hit": 0,
       "attackpower": 0,

       "dodge": 0,
       "block": 0,
       "blockvalue": 0,
       "defense": 0,
       "parry": 0,

       "skill": 0,
       "skilltype": [],

       "damage": 0,

       "proc": 0,
       "ppm": 0,
    },
    3780: {
       "name": "Heavy Armor Kit",
       "description": "+24 armor",
       "health": 0,
       "strength": 0,
       "stamina": 0,
       "agility": 0,
       "armor": 24,

       "crit": 0,
       "hit": 0,
       "attackpower": 0,

       "dodge": 0,
       "block": 0,
       "blockvalue": 0,
       "defense": 0,
       "parry": 0,

       "skill": 0,
       "skilltype": [],

       "damage": 0,

       "proc": 0,
       "ppm": 0,
    },
    13503: {
       "name": "Lesser Striking",
       "description": "+2 damage",
       "health": 0,
       "strength": 0,
       "stamina": 0,
       "agility": 0,
       "armor": 0,

       "crit": 0,
       "hit": 0,
       "attackpower": 0,

       "dodge": 0,
       "block": 0,
       "blockvalue": 0,
       "defense": 0,
       "parry": 0,

       "skill": 0,
       "skilltype": [],

       "damage": 2,

       "proc": 0,
       "ppm": 0,
    },
    7788: {
       "name": "Minor Striking",
       "description": "+1 damage",
       "health": 0,
       "strength": 0,
       "stamina": 0,
       "agility": 0,
       "armor": 0,

       "crit": 0,
       "hit": 0,
       "attackpower": 0,

       "dodge": 0,
       "block": 0,
       "blockvalue": 0,
       "defense": 0,
       "parry": 0,

       "skill": 0,
       "skilltype": [],

       "damage": 1,

       "proc": 0,
       "ppm": 0,
    },
    13536: {
       "name": "Lesser Strength",
       "description": "+3 strength",
       "health": 0,
       "strength": 3,
       "stamina": 0,
       "agility": 0,
       "armor": 0,

       "crit": 0,
       "hit": 0,
       "attackpower": 0,

       "dodge": 0,
       "block": 0,
       "blockvalue": 0,
       "defense": 0,
       "parry": 0,

       "skill": 0,
       "skilltype": [],

       "damage": 0,

       "proc": 0,
       "ppm": 0,
    },
    241: {
       "name": "Lesser Strength",
       "description": "+3 strength",
       "health": 0,
       "strength": 3,
       "stamina": 0,
       "agility": 0,
       "armor": 0,

       "crit": 0,
       "hit": 0,
       "attackpower": 0,

       "dodge": 0,
       "block": 0,
       "blockvalue": 0,
       "defense": 0,
       "parry": 0,

       "skill": 0,
       "skilltype": [],

       "damage": 0,

       "proc": 0,
       "ppm": 0,
    },
    7428: {
       "name": "Minor Deflect",
       "description": "+1 defense",
       "health": 0,
       "strength": 0,
       "stamina": 0,
       "agility": 0,
       "armor": 0,

       "crit": 0,
       "hit": 0,
       "attackpower": 0,

       "dodge": 0,
       "block": 0,
       "blockvalue": 0,
       "defense": 1,
       "parry": 0,

       "skill": 0,
       "skilltype": [],

       "damage": 0,

       "proc": 0,
       "ppm": 0,
    },
    248: {
       "name": "Minor Strength",
       "description": "+1 strength",
       "health": 0,
       "strength": 1,
       "stamina": 0,
       "agility": 0,
       "armor": 0,

       "crit": 0,
       "hit": 0,
       "attackpower": 0,

       "dodge": 0,
       "block": 0,
       "blockvalue": 0,
       "defense": 0,
       "parry": 0,

       "skill": 0,
       "skilltype": [],

       "damage": 0,

       "proc": 0,
       "ppm": 0,
    },
    13378: {
       "name": "Minor Stamina",
       "description": "+1 stamina",
       "health": 0,
       "strength": 0,
       "stamina": 1,
       "agility": 0,
       "armor": 0,

       "crit": 0,
       "hit": 0,
       "attackpower": 0,

       "dodge": 0,
       "block": 0,
       "blockvalue": 0,
       "defense": 0,
       "parry": 0,

       "skill": 0,
       "skilltype": [],

       "damage": 0,

       "proc": 0,
       "ppm": 0,
    },
    7863: {
       "name": "Minor Stamina",
       "description": "+1 stamina",
       "health": 0,
       "strength": 0,
       "stamina": 1,
       "agility": 0,
       "armor": 0,

       "crit": 0,
       "hit": 0,
       "attackpower": 0,

       "dodge": 0,
       "block": 0,
       "blockvalue": 0,
       "defense": 0,
       "parry": 0,

       "skill": 0,
       "skilltype": [],

       "damage": 0,

       "proc": 0,
       "ppm": 0,
    },

    13464: {
       "name": "Lesser Protection",
       "description": "+30 armor",
       "health": 0,
       "strength": 0,
       "stamina": 0,
       "agility": 0,
       "armor": 30,

       "crit": 0,
       "hit": 0,
       "attackpower": 0,

       "dodge": 0,
       "block": 0,
       "blockvalue": 0,
       "defense": 0,
       "parry": 0,

       "skill": 0,
       "skilltype": [],

       "damage": 0,

       "proc": 0,
       "ppm": 0,
    },

    6042: {
       "name": "Iron Shield Spike",
       "description": "8-12 reflect",
       "health": 0,
       "strength": 0,
       "stamina": 0,
       "agility": 0,
       "armor": 0,

       "crit": 0,
       "hit": 0,
       "attackpower": 0,

       "dodge": 0,
       "block": 0,
       "blockvalue": 0,
       "defense": 0,
       "parry": 0,

       "skill": 0,
       "skilltype": [],

       "damage": 0,

       "proc": 0,
       "ppm": 0,
    },

    13421: {
       "name": "Lesser Protection",
       "description": "+20 armor",
       "health": 0,
       "strength": 0,
       "stamina": 0,
       "agility": 0,
       "armor": 20,

       "crit": 0,
       "hit": 0,
       "attackpower": 0,

       "dodge": 0,
       "block": 0,
       "blockvalue": 0,
       "defense": 0,
       "parry": 0,

       "skill": 0,
       "skilltype": [],

       "damage": 0,

       "proc": 0,
       "ppm": 0,
    },

    7857: {
       "name": "Health",
       "description": "+25 health",
       "health": 25,
       "strength": 0,
       "stamina": 0,
       "agility": 0,
       "armor": 0,

       "crit": 0,
       "hit": 0,
       "attackpower": 0,

       "dodge": 0,
       "block": 0,
       "blockvalue": 0,
       "defense": 0,
       "parry": 0,

       "skill": 0,
       "skilltype": [],

       "damage": 0,

       "proc": 0,
       "ppm": 0,
    },
} 
