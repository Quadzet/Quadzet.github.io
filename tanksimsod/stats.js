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
    skilltype: ["Swords", "Maces"],
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
    skilltype: ["Axes"]
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

let heads = {
    "None": {
        "crit": 0,
        "hit": 0,
        "strength": 0,
        "stamina": 0,
        "agility": 0,
        "attackpower": 0,
        "dodge": 0,
        "parry": 0,
        "defense": 0,
        "armor": 0,
        "skill": 0,
        "skilltype": 0,
        "blockvalue": 0,
        "block": 0
    },
    "Brutal Helm": {
        "crit": 0,
        "hit": 0,
        "strength": 0,
        "stamina": 8,
        "agility": 7,
        "attackpower": 0,
        "dodge": 0,
        "parry": 0,
        "defense": 0,
        "armor": 163,
        "skill": 0,
        "skilltype": 0,
        "blockvalue": 0,
        "block": 0
    },
}

let necks = {
    "None": {
        "crit": 0,
        "hit": 0,
        "strength": 0,
        "stamina": 0,
        "agility": 0,
        "attackpower": 0,
        "dodge": 0,
        "parry": 0,
        "defense": 0,
        "armor": 0,
        "skill": 0,
        "skilltype": 0,
        "blockvalue": 0,
        "block": 0
    },
    "Scout's Medallion": {
        "crit": 0,
        "hit": 0,
        "strength": 0,
        "stamina": 2,
        "agility": 6,
        "attackpower": 0,
        "dodge": 0,
        "parry": 0,
        "defense": 0,
        "armor": 0,
        "skill": 0,
        "skilltype": 0,
        "blockvalue": 0,
        "block": 0
    },
}

let chests = {
    "None": {
        "crit": 0,
        "hit": 0,
        "strength": 0,
        "stamina": 0,
        "agility": 0,
        "attackpower": 0,
        "dodge": 0,
        "parry": 0,
        "defense": 0,
        "armor": 0,
        "skill": 0,
        "skilltype": 0,
        "blockvalue": 0,
        "block": 0
    },
    "Brutal Hauberk": {
        "crit": 0,
        "hit": 0,
        "strength": 5,
        "stamina": 14,
        "agility": 0,
        "attackpower": 0,
        "dodge": 0,
        "parry": 0,
        "defense": 0,
        "armor": 218,
        "skill": 0,
        "skilltype": 0,
        "blockvalue": 0,
        "block": 0
    },
 }

let shoulders = {
    "None": {
        "crit": 0,
        "hit": 0,
        "strength": 0,
        "stamina": 0,
        "agility": 0,
        "attackpower": 0,
        "dodge": 0,
        "parry": 0,
        "defense": 0,
        "armor": 0,
        "skill": 0,
        "skilltype": 0,
        "blockvalue": 0,
        "block": 0
    },
    "Sentry's Shoulderguards of the Monkey": {
        "crit": 0,
        "hit": 0,
        "strength": 0,
        "stamina": 6,
        "agility": 6,
        "attackpower": 0,
        "dodge": 0,
        "parry": 0,
        "defense": 0,
        "armor": 149,
        "skill": 0,
        "skilltype": 0,
        "blockvalue": 0,
        "block": 0
    },
}

let capes = {
    "None": {
        "crit": 0,
        "hit": 0,
        "strength": 0,
        "stamina": 0,
        "agility": 0,
        "attackpower": 0,
        "dodge": 0,
        "parry": 0,
        "defense": 0,
        "armor": 0,
        "skill": 0,
        "skilltype": 0,
        "blockvalue": 0,
        "block": 0
    },
    "Cape of the Brotherhood": {
        "crit": 0,
        "hit": 0,
        "strength": 0,
        "stamina": 3,
        "agility": 6,
        "attackpower": 0,
        "dodge": 0,
        "parry": 0,
        "defense": 0,
        "armor": 21,
        "skill": 0,
        "skilltype": 0,
        "blockvalue": 0,
        "block": 0
    },
}

let wrists = {
    "None": {
        "crit": 0,
        "hit": 0,
        "strength": 0,
        "stamina": 0,
        "agility": 0,
        "attackpower": 0,
        "dodge": 0,
        "parry": 0,
        "defense": 0,
        "armor": 0,
        "skill": 0,
        "skilltype": 0,
        "blockvalue": 0,
        "block": 0
    },
    "Jimmied Handcuffs": {
        "crit": 0,
        "hit": 0,
        "strength": 3,
        "stamina": 7,
        "agility": 0,
        "attackpower": 0,
        "dodge": 0,
        "parry": 0,
        "defense": 0,
        "armor": 89,
        "skill": 0,
        "skilltype": 0,
        "blockvalue": 0,
        "block": 0
    },
}

let hands = {
    "None": {
        "crit": 0,
        "hit": 0,
        "strength": 0,
        "stamina": 0,
        "agility": 0,
        "attackpower": 0,
        "dodge": 0,
        "parry": 0,
        "defense": 0,
        "armor": 0,
        "skill": 0,
        "skilltype": 0,
        "blockvalue": 0,
        "block": 0
    },
    "Warsong Gauntlets": {
        "crit": 0,
        "hit": 0,
        "strength": 10,
        "stamina": 3,
        "agility": 0,
        "attackpower": 0,
        "dodge": 0,
        "parry": 0,
        "defense": 0,
        "armor": 130,
        "skill": 0,
        "skilltype": 0,
        "blockvalue": 0,
        "block": 0
    },
}

let waists = {
    "None": {
        "crit": 0,
        "hit": 0,
        "strength": 0,
        "stamina": 0,
        "agility": 0,
        "attackpower": 0,
        "dodge": 0,
        "parry": 0,
        "defense": 0,
        "armor": 0,
        "skill": 0,
        "skilltype": 0,
        "blockvalue": 0,
        "block": 0
    },
    "Wicked Chain Waistband of the Monkey": {
        "crit": 0,
        "hit": 0,
        "strength": 0,
        "stamina": 6,
        "agility": 6,
        "attackpower": 0,
        "dodge": 0,
        "parry": 0,
        "defense": 0,
        "armor": 111,
        "skill": 0,
        "skilltype": 0,
        "blockvalue": 0,
        "block": 0
    },
}

let legs = {
    "None": {
        "crit": 0,
        "hit": 0,
        "strength": 0,
        "stamina": 0,
        "agility": 0,
        "attackpower": 0,
        "dodge": 0,
        "parry": 0,
        "defense": 0,
        "armor": 0,
        "skill": 0,
        "skilltype": 0,
        "blockvalue": 0,
        "block": 0
    },
    "Sentry's Leggings of the Monkey": {
        "crit": 0,
        "hit": 0,
        "strength": 0,
        "stamina": 7,
        "agility": 7,
        "attackpower": 0,
        "dodge": 0,
        "parry": 0,
        "defense": 0,
        "armor": 171,
        "skill": 0,
        "skilltype": 0,
        "blockvalue": 0,
        "block": 0
    },
}

let feet = {
    "None": {
        "crit": 0,
        "hit": 0,
        "strength": 0,
        "stamina": 0,
        "agility": 0,
        "attackpower": 0,
        "dodge": 0,
        "parry": 0,
        "defense": 0,
        "armor": 0,
        "skill": 0,
        "skilltype": 0,
        "blockvalue": 0,
        "block": 0
    },
    "Battleforge Boots of the Monkey": {
        "crit": 0,
        "hit": 0,
        "strength": 0,
        "stamina": 6,
        "agility": 6,
        "attackpower": 0,
        "dodge": 0,
        "parry": 0,
        "defense": 0,
        "armor": 134,
        "skill": 0,
        "skilltype": 0,
        "blockvalue": 0,
        "block": 0
    },
}

let rings = {
    "None": {
        "crit": 0,
        "hit": 0,
        "strength": 0,
        "stamina": 0,
        "agility": 0,
        "attackpower": 0,
        "dodge": 0,
        "parry": 0,
        "defense": 0,
        "armor": 0,
        "skill": 0,
        "skilltype": 0,
        "blockvalue": 0,
        "block": 0
    },
    "Seal of Sylvanas": {
        "crit": 0,
        "hit": 0,
        "strength": 3,
        "stamina": 8,
        "agility": 0,
        "attackpower": 0,
        "dodge": 0,
        "parry": 0,
        "defense": 0,
        "armor": 0,
        "skill": 0,
        "skilltype": 0,
        "blockvalue": 0,
        "block": 0
    },
    "Legionnaire's Band": {
        "crit": 0,
        "hit": 0,
        "strength": 4,
        "stamina": 2,
        "agility": 4,
        "attackpower": 0,
        "dodge": 0,
        "parry": 0,
        "defense": 0,
        "armor": 0,
        "skill": 0,
        "skilltype": 0,
        "blockvalue": 0,
        "block": 0
    },
}

let trinkets = {
    "None": {
        "crit": 0,
        "hit": 0,
        "strength": 0,
        "stamina": 0,
        "agility": 0,
        "attackpower": 0,
        "dodge": 0,
        "parry": 0,
        "defense": 0,
        "armor": 0,
        "skill": 0,
        "skilltype": 0,
        "blockvalue": 0,
        "block": 0
    },
    "Insignia of the Horde": {
        "crit": 0,
        "hit": 0,
        "strength": 0,
        "stamina": 0,
        "agility": 0,
        "attackpower": 0,
        "dodge": 0,
        "parry": 0,
        "defense": 0,
        "armor": 0,
        "skill": 0,
        "skilltype": 0,
        "blockvalue": 0,
        "block": 0
    },
    "Rune of Duty": {
        "crit": 0,
        "hit": 0,
        "strength": 0,
        "stamina": 4,
        "agility": 0,
        "attackpower": 0,
        "dodge": 0,
        "parry": 0,
        "defense": 0,
        "armor": 0,
        "skill": 0,
        "skilltype": 0,
        "blockvalue": 0,
        "block": 0
    },
}

let rangedweps = {
    "None": {
        "crit": 0,
        "hit": 0,
        "strength": 0,
        "stamina": 0,
        "agility": 0,
        "attackpower": 0,
        "dodge": 0,
        "parry": 0,
        "defense": 0,
        "armor": 0,
        "skill": 0,
        "skilltype": 0,
        "blockvalue": 0,
        "block": 0
    },
    "Ranger Bow": {
        "crit": 0,
        "hit": 0,
        "strength": 0,
        "stamina": 0,
        "agility": 1,
        "attackpower": 0,
        "dodge": 0,
        "parry": 0,
        "defense": 0,
        "armor": 0,
        "skill": 0,
        "skilltype": 0,
        "blockvalue": 0,
        "block": 0
    },
 }

let shields = {
    "None": {
        "crit": 0,
        "hit": 0,
        "strength": 0,
        "stamina": 0,
        "agility": 0,
        "attackpower": 0,
        "dodge": 0,
        "parry": 0,
        "defense": 0,
        "armor": 0,
        "skill": 0,
        "skilltype": 0,
        "blockvalue": 0,
        "block": 0
    },
    "Commander's Crest": {
        "strength": 6,
        "stamina": 3,
        "agility": 0,
        "hit": 0,
        "crit": 0,
        "attackpower": 0,
        "parry": 0,
        "dodge": 0,
        "defense": 7,
        "armor": 623,
        "blockvalue": 13,
        "block": 0
    },
}

let weapons = {
    "None": {
        "min": 0,
        "max": 0,
        "swingtimer": 2,
        "crit": 0,
        "hit": 0,
        "strength": 0,
        "stamina": 0,
        "agility": 0,
        "attackpower": 0,
        "dodge": 0,
        "parry": 0,
        "defense": 0,
        "armor": 0,
        "skill": 0,
        "skilltype": 0,
        "blockvalue": 0,
        "block": 0
    },
    "Legionnaire's Sword": {
       "min": 40,
       "max": 61,
       "swingtimer": 2.7,
       "strength": 5,
       "stamina": 3,
       "agility": 0,
       "hit": 0,
       "crit": 0,
       "attackpower": 0,
       "armor": 0,
       "parry": 0,
       "dodge": 0,
       "defense": 0,
       "skill": 0,
       "blockvalue": 0,
       "block": 0
    },
}

let enchants = {
    "None": {
       "strength": 0,
       "stamina": 0,
       "agility": 0,
       "crit": 0,
       "hit": 0,
       "attackpower": 0,
       "dodge": 0,
       "block": 0,
       "blockvalue": 0,
       "defense": 0,
       "armor": 0,
       "parry": 0
    },
    "Minor Agility": {
       "strength": 0,
       "stamina": 0,
       "agility": 1,
       "crit": 0,
       "hit": 0,
       "attackpower": 0,
       "dodge": 0,
       "block": 0,
       "blockvalue": 0,
       "defense": 0,
       "armor": 0,
       "parry": 0
    },
    "Minor Stats": {
       "strength": 1,
       "stamina": 1,
       "agility": 1,
       "crit": 0,
       "hit": 0,
       "attackpower": 0,
       "dodge": 0,
       "block": 0,
       "blockvalue": 0,
       "defense": 0,
       "armor": 0,
       "parry": 0
    },
    "Minor Stamina": {
       "strength": 0,
       "stamina": 1,
       "agility": 0,
       "crit": 0,
       "hit": 0,
       "attackpower": 0,
       "dodge": 0,
       "block": 0,
       "blockvalue": 0,
       "defense": 0,
       "armor": 0,
       "parry": 0
    },
    "Lesser Stamina": {
       "strength": 0,
       "stamina": 3,
       "agility": 0,
       "crit": 0,
       "hit": 0,
       "attackpower": 0,
       "dodge": 0,
       "block": 0,
       "blockvalue": 0,
       "defense": 0,
       "armor": 0,
       "parry": 0
    },
    "Heavy Armor Kit": {
       "strength": 0,
       "stamina": 0,
       "agility": 0,
       "crit": 0,
       "hit": 0,
       "attackpower": 0,
       "dodge": 0,
       "block": 0,
       "blockvalue": 0,
       "defense": 0,
       "armor": 24,
       "parry": 0
    },
    "Lesser Striking": {
       "strength": 0,
       "stamina": 0,
       "agility": 0,
       "crit": 0,
       "hit": 0,
       "attackpower": 0,
       "dodge": 0,
       "block": 0,
       "blockvalue": 0,
       "defense": 0,
       "armor": 0,
       "parry": 0
    },
} 
