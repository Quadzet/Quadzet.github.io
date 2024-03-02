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

const races = {
    "Dwarf": {
    strength: 81, //56,
    stamina: 75, //53,
    agility: 50, //35,

    hit: 0,
    crit: 0,
    attackpower: 100,
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
    strength: 74,//49,
    stamina: 71,//49,
    agility: 57,//42,

    hit: 0,
    crit: 0,
    attackpower: 100,
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
    strength: 79,//54,
    stamina: 72,//50,
    agility: 54,//39,

    hit: 0,
    crit: 0,
    attackpower: 100,
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
    strength: 76, //51,
    stamina: 71, //49,
    agility: 59, //44,

    hit: 0,
    crit: 0,
    attackpower: 100,
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
    strength: 57 + 25,
    stamina: 52 + 22,
    agility: 36 + 15,

    hit: 0,
    crit: 0,
    attackpower: 100,
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
    strength: 59 + 25,
    stamina: 52 + 22,
    agility: 34 + 15,

    hit: 0,
    crit: 0,
    attackpower: 100,
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
    strength: 55 + 25,
    stamina: 51 + 22,
    agility: 41 + 15,

    hit: 0,
    crit: 0,
    attackpower: 100,
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
    strength: 78,
    stamina: 73,
    agility: 52,

    hit: 0,
    crit: 0,
    attackpower: 100,
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

const ENCHANT_DATA = {
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
    19058: {
       "name": "Rugged Armor Kit",
       "description": "+40 armor",
       "health": 0,
       "strength": 0,
       "stamina": 0,
       "agility": 0,
       "armor": 40,

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
    13695: {
       "name": "Impact",
       "description": "+5 damage",
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

       "damage": 5,

       "proc": 0,
       "ppm": 0,
    },
    13529: {
       "name": "Lesser Impact",
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

const onUseData = {
  215114: {
    name: "Hyperconductive Shock",
    cooldown: 600000,

    maxDuration: 10000,
    hastePerc: 20,
  },
  215161: {
    name: "Intense Concentration",
    cooldown: 600000,

    maxDuration: 10000,
    hastePerc: 20,
  },
  213105: {
    name: "Spicy!",
    cooldown: 120000,

    maxDuration: 30000,
    hastePerc: 4,
  },
  213348: {
    name: "Gyromatic Experiment 420b",
    cooldown: 1800000,

    maxDuration: 20000,
    hastePerc: 5,
  },
  9449: {
    name: "Haste",
    cooldown: 1800000,

    maxDuration: 30000,
    hastePerc: 50,
  },
  210741: {
    name: "Haste",
    cooldown: 1800000,

    maxDuration: 30000,
    hastePerc: 50,
  },
}

// For now this is just a manual lookup table, idk where to find reliable data.
const ShieldBlockValue = {
  2: {
    55: 29,
    45: 20,
    44: 20,
    43: 19,
    42: 18,
    41: 17,
    40: 17,
    39: 16,
    38: 15,
    37: 15,
    36: 14,
    35: 14,
    34: 13,
    33: 13,
    32: 12,
    31: 12,
    30: 11,
    29: 11,
    28: 10,
    27: 10,
    26: 9,
    25: 9,
    24: 9,
    23: 8,
    22: 8,
    21: 7,
    20: 7,
    17: 6,
    16: 6,
    15: 5,
  },
  3: {
    45: 24,
    44: 23,
    42: 22,
    38: 19,
    37: 18,
    36: 17,
    33: 15,
    31: 14,
    30: 14,
    29: 13,
    28: 13,
    25: 11,
    24: 11,
    20: 9,
  },
  4: {
    45: 29,
    41: 25,
    40: 24,
  }
}

