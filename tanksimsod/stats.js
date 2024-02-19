/*

{
    strength: 0,
    stamina: 0,
    agility: 0,

    hit: 0,
    crit: 0,
    attackpower: 0,
    haste: 0,

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
    haste: 0,

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
    haste: 0,

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
    haste: 0,

    armor: 0,
    parry: 0,
    dodge: 0,
    defense: 0,
    block: 0,
    blockvalue: 0,

    skill: 5,
    skilltype: ["Sword", "Mace", "Two-handed Sword", "Two-handed Mace"],
},
    "Night Elf": {
    strength: 51,
    stamina: 49,
    agility: 44,

    hit: 0,
    crit: 0,
    attackpower: 55,
    haste: 0,

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
    haste: 0,

    armor: 0,
    parry: 0,
    dodge: 0,
    defense: 0,
    block: 0,
    blockvalue: 0,

    skill: 5,
    skilltype: ["Axe", "Two-handed Axe"]
},
    "Tauren": {
    strength: 59,
    stamina: 52,
    agility: 34,

    hit: 0,
    crit: 0,
    attackpower: 55,
    haste: 0,

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
    haste: 0,

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
    haste: 0,

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
       "haste": 0,

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
       "haste": 0,

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
       "haste": 0,

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
       "haste": 0,

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
       "haste": 0,

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
       "haste": 0,

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
       "haste": 0,

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
       "haste": 0,

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
       "haste": 0,

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
       "haste": 0,

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
       "haste": 0,

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
       "haste": 0,

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
       "haste": 0,

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
       "haste": 0,

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
       "haste": 0,

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
       "haste": 0,

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
       "haste": 0,

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
       "haste": 0,

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
       "haste": 0,

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
    13693: {
       "name": "Striking",
       "description": "+3 damage",
       "health": 0,
       "strength": 0,
       "stamina": 0,
       "agility": 0,
       "armor": 0,

       "crit": 0,
       "hit": 0,
       "attackpower": 0,
       "haste": 0,

       "dodge": 0,
       "block": 0,
       "blockvalue": 0,
       "defense": 0,
       "parry": 0,

       "skill": 0,
       "skilltype": [],

       "damage": 3,

       "proc": 0,
       "ppm": 0,
    },
    13700: {
       "name": "Lesser Stats",
       "description": "+2 stats",
       "health": 0,
       "strength": 2,
       "stamina": 2,
       "agility": 2,
       "armor": 0,

       "crit": 0,
       "hit": 0,
       "attackpower": 0,
       "haste": 0,

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
    13887: {
       "name": "Strength",
       "description": "+5 strength",
       "health": 0,
       "strength": 5,
       "stamina": 0,
       "agility": 0,
       "armor": 0,

       "crit": 0,
       "hit": 0,
       "attackpower": 0,
       "haste": 0,

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
    13661: {
       "name": "Strength",
       "description": "+5 strength",
       "health": 0,
       "strength": 5,
       "stamina": 0,
       "agility": 0,
       "armor": 0,

       "crit": 0,
       "hit": 0,
       "attackpower": 0,
       "haste": 0,

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
    10487: {
       "name": "Thick Armor Kit",
       "description": "+32 armor",
       "health": 0,
       "strength": 0,
       "stamina": 0,
       "agility": 0,
       "armor": 32,

       "crit": 0,
       "hit": 0,
       "attackpower": 0,
       "haste": 0,

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
    13815: {
       "name": "Agility",
       "description": "+5 agility",
       "health": 0,
       "strength": 0,
       "stamina": 0,
       "agility": 5,
       "armor": 0,

       "crit": 0,
       "hit": 0,
       "attackpower": 0,
       "haste": 0,

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
    13948: {
       "name": "Minor Haste",
       "description": "+1% haste",
       "health": 0,
       "strength": 0,
       "stamina": 0,
       "agility": 0,
       "armor": 0,

       "crit": 0,
       "hit": 0,
       "attackpower": 0,
       "haste": 1,

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
    435481: {
       "name": "Dismantle",
       "description": "dmg to mechs",
       "health": 0,
       "strength": 0,
       "stamina": 0,
       "agility": 0,
       "armor": 0,

       "crit": 0,
       "hit": 0,
       "attackpower": 0,
       "haste": 0,

       "dodge": 0,
       "block": 0,
       "blockvalue": 0,
       "defense": 0,
       "parry": 0,

       "skill": 0,
       "skilltype": [],

       "damage": 0,

       "proc": 75,
       "ppm": 1,
    },
    27837: {
       "name": "Agility",
       "description": "+25 agility",
       "health": 0,
       "strength": 0,
       "stamina": 0,
       "agility": 25,
       "armor": 0,

       "crit": 0,
       "hit": 0,
       "attackpower": 0,
       "haste": 0,

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
    6043: {
       "name": "Iron Counterweight",
       "description": "+3% haste",
       "health": 0,
       "strength": 0,
       "stamina": 0,
       "agility": 0,
       "armor": 0,

       "crit": 0,
       "hit": 0,
       "attackpower": 0,
       "haste": 3,

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
    20030: {
       "name": "Superior Impact",
       "description": "+9 damage",
       "health": 0,
       "strength": 0,
       "stamina": 0,
       "agility": 0,
       "armor": 0,

       "crit": 0,
       "hit": 0,
       "attackpower": 0,
       "haste": 0,

       "dodge": 0,
       "block": 0,
       "blockvalue": 0,
       "defense": 0,
       "parry": 0,

       "skill": 0,
       "skilltype": [],

       "damage": 9,

       "proc": 0,
       "ppm": 0,
    },
    13937: {
       "name": "Greater Impact",
       "description": "+7 damage",
       "health": 0,
       "strength": 0,
       "stamina": 0,
       "agility": 0,
       "armor": 0,

       "crit": 0,
       "hit": 0,
       "attackpower": 0,
       "haste": 0,

       "dodge": 0,
       "block": 0,
       "blockvalue": 0,
       "defense": 0,
       "parry": 0,

       "skill": 0,
       "skilltype": [],

       "damage": 7,

       "proc": 0,
       "ppm": 0,
    },
    13637: {
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
       "haste": 0,

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
    13746: {
       "name": "Greater Defense",
       "description": "+50 armor",
       "health": 0,
       "strength": 0,
       "stamina": 0,
       "agility": 0,
       "armor": 50,

       "crit": 0,
       "hit": 0,
       "attackpower": 0,
       "haste": 0,

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
    13646: {
       "name": "Lesser Deflection",
       "description": "+2 defense",
       "health": 0,
       "strength": 0,
       "stamina": 0,
       "agility": 0,
       "armor": 0,

       "crit": 0,
       "hit": 0,
       "attackpower": 0,
       "haste": 0,

       "dodge": 0,
       "block": 0,
       "blockvalue": 0,
       "defense": 2,
       "parry": 0,

       "skill": 0,
       "skilltype": [],

       "damage": 0,

       "proc": 0,
       "ppm": 0,
    },
    13817: {
       "name": "Stamina",
       "description": "+5 stamina",
       "health": 0,
       "strength": 0,
       "stamina": 5,
       "agility": 0,
       "armor": 0,

       "crit": 0,
       "hit": 0,
       "attackpower": 0,
       "haste": 0,

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
    13689: {
       "name": "Lesser Block",
       "description": "+2% block",
       "health": 0,
       "strength": 0,
       "stamina": 0,
       "agility": 0,
       "armor": 0,

       "crit": 0,
       "hit": 0,
       "attackpower": 0,
       "haste": 0,

       "dodge": 0,
       "block": 2,
       "blockvalue": 0,
       "defense": 0,
       "parry": 0,

       "skill": 0,
       "skilltype": [],

       "damage": 0,

       "proc": 0,
       "ppm": 0,
    },
    13631: {
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
       "haste": 0,

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
    13817: {
       "name": "Stamina",
       "description": "+5 stamina",
       "health": 0,
       "strength": 0,
       "stamina": 5,
       "agility": 0,
       "armor": 0,

       "crit": 0,
       "hit": 0,
       "attackpower": 0,
       "haste": 0,

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
    13815: {
       "name": "Agility",
       "description": "+5 agility",
       "health": 0,
       "strength": 0,
       "stamina": 0,
       "agility": 5,
       "armor": 0,

       "crit": 0,
       "hit": 0,
       "attackpower": 0,
       "haste": 0,

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
       "haste": 0,

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
       "haste": 0,

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
