"use strict";

/*  TODOS 
<option value="Felstriker">Felstriker</option>
<option value="Arlokk's Grasp">Arlokk's Grasp</option>
<option value="Thekal's Grasp">Thekal's Grasp</option>
<option value="Eskhandar's Left Claw">Eskhandar's Left Claw</option>
<option value="Teebu's Blazing Longsword">Teebu's Blazing Longsword</option>
*/

let weaponlists = {
    "Shields": `<option value="None">None</option>
    <option value="Commander's Crest">Commander's Crest</option>`,
    
    "Axes": `
    `,

    "Daggers": `
    `,

    "Fists": `
    `,

    "Maces": `
    `,

    "Swords": `<option value="None">None</option>
    <option value="Legionnaire's Sword">Legionnaire's Sword</option>`,
}

let ohenchantlist = {
    weapon: `<option value="None">None</option>
    `,

    shield: `<option value="None">None</option>
    <option value="Minor Stamina">Minor Stamina</option>
    `,
}

function updateMHWeaponList(doUpdateStats)
{
    let mhselect = document.getElementById("mainhand")
    let weapontype = document.getElementById("mhweptypelist").value

    mhselect.innerHTML = weaponlists[weapontype]
    if(doUpdateStats) updateStats();
}
function updateOHWeaponList(doUpdateStats)
{
    let ohselect = document.getElementById("offhand")
    let ohtype = document.getElementById("ohweptypelist").value

    ohselect.innerHTML = weaponlists[ohtype]
    
    let ohenchantselect = document.getElementById("ohwepenchant")
    let index = ohenchantselect.selectedIndex
    if(ohtype == "Shields") {
        ohenchantselect.innerHTML = ohenchantlist.shield
    } else {
        ohenchantselect.innerHTML = ohenchantlist.weapon
    }
    if(index < ohenchantselect.length) ohenchantselect.selectedIndex = index

    if(doUpdateStats) updateStats();
}

function checkRuneToggle(name) {
  let element = document.getElementById(`${name}-rune-img`);
  return element.classList.contains('rune-toggle-active');
}

function checkAuraToggle(name) {
  let element = document.getElementById(`${name}-aura-img`);
  return element.classList.contains('aura-toggle-active');
}

function getFFArmor(level) {
  if (level < 18) return 0;
  else if (level < 30) return 175;
  else if (level < 42) return 285;
  else if (level < 54) return 395;
  else return 505;
}
function getCoRArmor(level) {
  if (level < 14) return 0;
  else if (level < 28) return 140;
  else if (level < 42) return 290;
  else if (level < 56) return 465;
  else return 640;
}
function getHomunArmor(level) {
  return 1550;//1025; // TODO: other levels I guess lol
}

function getSAArmor(level) {
  if (level < 10) return 0;
  else if (level < 22) return 450; 
  else if (level < 34) return 900; 
  else if (level < 46) return 1350; 
  else if (level < 58) return 1800; 
  else return 2250;
}

// Note: Only with 2/2 imp expose
function getIEAArmor(level) {
  if (level < 14) return 0;
  else if (level < 26) return 600;
  else if (level < 36) return 1087.5;
  else if (level < 46) return 1575;
  else if (level < 56) return 2062.5;
  else return 2550;
}

function getBossArmor(level, bossLevel, SA, CoR, faerieFire, IEA, homunculi, armor) {
  armor = armor ? armor : 0;
  if (CoR) armor -= getCoRArmor(level);
  if (faerieFire) armor -= getFFArmor(level);
  let SAArmor = SA ? getSAArmor(level) : 0;
  let IEAArmor = IEA ? getIEAArmor(level) : 0;
  let homunArmor = homunculi ? getHomunArmor(level) : 0;
  armor -= Math.max(SAArmor, IEAArmor, homunArmor);
  armor = Math.max(0, armor);
  return armor;
}

function getDevoArmor(level) {
  if (level < 10) return 55;
  else if (level < 20) return 160;
  else if (level < 30) return 275;
  else if (level < 40) return 390;
  else if (level < 50) return 505;
  else if (level < 60) return 620;
  else return 735;
}

function getMOTWArmor(level) {
  if (level < 10) return 25;
  else if (level < 20) return 65;
  else if (level < 30) return 105;
  else if (level < 40) return 150;
  else if (level < 50) return 195;
  else if (level < 60) return 240;
  else return 285;
}

function getMOTWStats(level) {
  if (level < 10) return 0;
  else if (level < 20) return 2;
  else if (level < 30) return 4;
  else if (level < 40) return 6;
  else if (level < 50) return 8;
  else if (level < 60) return 10;
  else return 12;
}

function getMightAP(level) {
  if (level < 4) return 0;
  else if (level < 12) return 20;
  else if (level < 22) return 35;
  else if (level < 32) return 55;
  else if (level < 42) return 85;
  else if (level < 52) return 115;
  else if (level < 60) return 155;
  else return 185;
}

function getBShoutAP(level) {
  if (level < 12) return 20;
  else if (level < 22) return 40;
  else if (level < 32) return 60;
  else if (level < 42) return 94;
  else if (level < 52) return 139;
  else if (level < 60) return 193;
  else return 232;
}

function getTrueshotAP(level) {
  if (level < 50) return 50;
  else if (level < 60) return 75;
  else return 100;
}

function getFortStam(level) {
  if (level < 12) return 3;
  else if (level < 24) return 8;
  else if (level < 36) return 20;
  else if (level < 48) return 32;
  else if (level < 60) return 43;
  else return 54;
}

function getPactStam(level) {
  if (level < 4) return 0;
  else if (level < 14) return 3;
  else if (level < 26) return 9;
  else if (level < 38) return 19;
  else if (level < 50) return 30;
  else return 42;
}

function getEarthStr(level) {
  if (level < 10) return 0;
  else if (level < 24) return 10;
  else if (level < 38) return 20;
  else if (level < 52) return 36;
  else if (level < 60) return 61;
  else return 77;
}

function getBlockValue(itemID) {
  switch(itemID) {
    case 211460: return 15;
    case 6223: return 14;
    case 13079: return 14;
    case 7002: return 13;
    case 6320: return 13;
    case 209424: return 14;
    case 13245: return 9;
    case 12997: return 11;
    case 4064: return 11;
    case 6676: return 10;
    case 15891: return 9;
    case 5443: return 9;
    case 3656: return 10;
    default:
      log_message(LOG_LEVEL.WARNING, 'Unknown shield item id: ' + itemID + '. Could not fetch block value.')
      return 0;
  }
}

function getTalentValue(name) {
  const element = document.getElementById(`${name}`);
  return Number(element.getAttribute('value'));
}

function updateStats()
{
    let level = document.querySelector("#level").value
    // Gear
    let stats = {
      armor: 0,
      agility: 0,
      strength: 0,
      stamina: 0,

      crit: 0,
      hit: 0,
      attackpower: 0,

      defense: 0,
      parry: 0,
      dodge: 0,
      block: 0,
      blockvalue: 0,

      procs: [],
    };
    let gear = {};
    ITEM_SLOTS.forEach(slot => {
      let element = document.getElementById(`${slot}-slot`)
      let itemID = element.getAttribute('itemid');
      if (itemID != null && itemID != 0) {
        gear[`${slot}`] = itemID;
        let itemStats = ITEMS[`${itemID}`];

        stats.armor       += itemStats.armor;
        stats.agility     += itemStats.agility;
        stats.strength    += itemStats.strength;
        stats.stamina     += itemStats.stamina;
        stats.crit        += itemStats.crit;
        stats.hit         += itemStats.hit;
        stats.attackpower += itemStats.attackpower;
        stats.defense     += itemStats.defense;
        stats.parry       += itemStats.parry;
        stats.dodge       += itemStats.dodge;
        stats.block       += itemStats.block;
        stats.blockvalue  += itemStats.blockvalue;

        if (itemStats.proc != null) 
          stats.procs.push(itemStats.proc);
      }
    });

    // Talents
    let deflection = getTalentValue("deflection");
    let cruelty = getTalentValue("cruelty");
    let anticipation = getTalentValue("anticipation");
    let shieldspec = getTalentValue("shield-specialization");
    let impHS = getTalentValue("improved-heroic-strike");
    let impSA = getTalentValue("improved-sunder-armor");
    let impRend = getTalentValue("improved-rend");
    let defiance = getTalentValue("defiance");
    let impale = getTalentValue("impale");
    let toughness = getTalentValue("toughness");
    stats.armor *= (1 + 0.02*toughness); // Only applies to armor from gear
    
    let race = document.querySelector("#race").value
    stats.strength += races[race].strength;
    stats.stamina += races[race].stamina;
    stats.agility += races[race].agility;

    stats.hit += races[race].hit;
    stats.crit += races[race].crit;
    stats.attackpower += races[race].attackpower;

    stats.armor += races[race].armor;
    stats.parry += races[race].parry;
    stats.dodge += races[race].dodge;
    stats.defense += races[race].defense;
    stats.block += races[race].block;
    stats.blockvalue += races[race].blockvalue;

    let strength = 0;
    let stamina = 0;
    let agility = 0;
    let hit = 0;
    let crit = 0;
    let spellcrit = 0;
    let attackpower = 0;
    let armor = 0;
    let parry = 0;
    let dodge = 0;
    let defense = 0 + Math.round(anticipation*2);
    let block = 0;
    let blockvalue = 0;
    let extrahp = 94; // Base hp for all races

    let mainhand = {};
    let offhand = {};
    let mhwep = document.getElementById('mainhand-slot').getAttribute('itemid');
    if (mhwep != undefined && mhwep != "0") {
      mainhand = ITEMS[`${mhwep}`];
    } else {
      mainhand = {
        mindmg: 0,
        maxdmg: 0,
        swingtimer: 2000,
        type: 'none',
      };
    }
    let ohwep = document.getElementById('offhand-slot').getAttribute('itemid');
    if (ohwep != undefined && ohwep != "0") {
      offhand = ITEMS[`${ohwep}`];
    }
    let mhweapontype = mainhand.type == undefined ? "" : mainhand.type; // eg "Sword"
    let ohweapontype = offhand.type == undefined ? "" : offhand.type; // eg "Sword"
    let twohand = mainhand.slot == 'twohand';
    let _dualWield = ohwep != "0" && ohweapontype != 'Shield' && !twohand;
    if (mhweapontype == "Axe" || mhweapontype == "Two-handed Axe")
      crit += getTalentValue('axe-specialization');
    if (mhweapontype == "Polearm")
      crit += getTalentValue('polearm-specialization');
    let mhwepskill = level * 5;
    let ohwepskill = _dualWield ? level * 5 : 0;
    if (!_dualWield && !twohand) blockvalue += getBlockValue(Number(ohwep));
    ITEM_SLOTS.forEach(slot => {
      let element = document.getElementById(`${slot}-slot`)
      let itemID = element.getAttribute('itemid');
      if (itemID && itemID != 0) {
        let itemStats = ITEMS[`${itemID}`];
        if (itemStats.skilltype) {
          if(itemStats.skilltype.includes(mhweapontype))
            mhwepskill += itemStats.skill;
          if(itemStats.skilltype.includes(ohweapontype))
            ohwepskill += itemStats.skill;
        }
      }
    });
    if(races[race].skilltype.includes(mhweapontype))
      mhwepskill += races[race].skill;
    if(races[race].skilltype.includes(ohweapontype))
      ohwepskill += races[race].skill;

    let mhmin = mainhand.mindmg;
    let mhmax = mainhand.maxdmg;
    mhmin += document.getElementById('head-slot').getAttribute('itemid') == 215166 ? 3 : 0;
    mhmax += document.getElementById('head-slot').getAttribute('itemid') == 215166 ? 3 : 0;
    let mhswing = mainhand.swingtimer;
    let ohmin = 0;
    let ohmax = 0;
    let ohswing = 0;

    // set bonuses
    const equippedIDs = Object.values(gear).map(value => parseInt(value, 10));
    ITEM_SETS.forEach(set => {
      let n_equipped = set.itemIDs.filter(element => equippedIDs.includes(element)).length;
      if (n_equipped > 0) {
        set.bonuses.forEach(bonus => {
          if (bonus.requires > n_equipped)
            return;
          stats.armor       += (bonus.armor ? bonus.armor : 0);
          stats.agility     += (bonus.agility ? bonus.agility  : 0);
          stats.strength    += (bonus.strength ? bonus.strength  : 0);
          stats.stamina     += (bonus.stamina ? bonus.stamina  : 0);
          stats.crit        += (bonus.crit ? bonus.crit  : 0);
          stats.hit         += (bonus.hit ? bonus.hit  : 0);
          stats.attackpower += (bonus.attackpower ? bonus.attackpower  : 0);
          stats.defense     += (bonus.defense ? bonus.defense  : 0);
          stats.parry       += (bonus.parry ? bonus.parry  : 0);
          stats.dodge       += (bonus.dodge ? bonus.dodge  : 0);
          stats.block       += (bonus.block ? bonus.block  : 0);
          stats.blockvalue  += (bonus.blockvalue ? bonus.blockvalue  : 0);
          if (bonus.skilltype) {
            if(bonus.skilltype.includes(mhweapontype))
              mhwepskill += bonus.skill;
            if(bonus.skilltype.includes(ohweapontype))
              ohwepskill += bonus.skill;
        }
        });
      }
    });

    // Update the procchance based on mh wep swingtimer
    stats.procs.forEach(proc => {
      proc.procChance = proc.ppm * mhswing / 60000;
    });

    if (_dualWield) {
        ohmin = offhand.mindmg;
        ohmax = offhand.maxdmg;
        ohswing = offhand.swingtimer;
    }

    // *** Get Enchant Bonuses *** //
    let enchants = {};
    ENCHANT_SLOTS.forEach(slot => {
      const element = document.getElementById(slot + '-enchant');
      let id = Number(element.getAttribute('enchantID'));
      let enchant = ENCHANT_DATA[id];
      enchants[`${slot}`] = id;

        extrahp += enchant.health;
        strength += enchant.strength;
        stamina += enchant.stamina;
        agility += enchant.agility;
        hit += enchant.hit;
        crit += enchant.crit;
        attackpower += enchant.attackpower;
        armor += enchant.armor;
        parry += enchant.parry;
        dodge += enchant.dodge;
        defense += enchant.defense;
        block += enchant.block;
        blockvalue += enchant.blockvalue;
        if(enchant.skilltype !== undefined && enchant.skilltype != 'none') {
          if (enchant.skilltype.includes(mhweapontype))
            mhwepskill += enchant.skill;
          if (enchant.skilltype.includes(ohweapontype))
            ohwepskill += enchant.skill;
        if (_dualWield) {
          ohmin += enchant.damage;
          ohmax += enchant.damage;
        }
        mhmin += enchant.damage;
        mhmax += enchant.damage;
        }
    });
    
    armor       += stats.armor;
    agility     += stats.agility;
    strength    += stats.strength;
    stamina     += stats.stamina;
    crit        += stats.crit;
    hit         += stats.hit;
    attackpower += stats.attackpower;
    defense     += stats.defense;
    parry       += stats.parry;
    dodge       += stats.dodge;
    block       += stats.block;
    blockvalue  += stats.blockvalue;

    armor *= checkAuraToggle("loh") ? 1.3 : 1;
    // Buffs
    mhmin += checkAuraToggle('solid') ? 6 : 0;
    mhmax += checkAuraToggle('solid') ? 6 : 0;
    ohmin += checkAuraToggle('oh-solid') ? 6 : 0;
    ohmax += checkAuraToggle('oh-solid') ? 6 : 0;
    // mhmin += checkAuraToggle('dense') ? 8 : 0;
    // mhmax += checkAuraToggle('dense') ? 8 : 0;
    // ohmin += checkAuraToggle('oh-dense') ? 8 : 0;
    // ohmax += checkAuraToggle('oh-dense') ? 8 : 0;

    strength += checkAuraToggle('giants') ? 8 : 0;
    strength += checkAuraToggle('ogre') ? 8 : 0;
    strength += checkAuraToggle('str-scroll') ? 13 : 0;
    agility += checkAuraToggle('agi') ? 15 : 0;
    stamina += checkAuraToggle('stam-food') ? 12 : 0;
    stamina += checkAuraToggle('rumsey') ? 15 : 0;
    hit     += checkAuraToggle('dark-desire') ? 2 : 0;

    let _startRage = Number(document.querySelector("#startRage").value);

    extrahp += checkAuraToggle('fort-elixir') ? 120 : 0;
    extrahp += checkAuraToggle('wcb') ? 300 : 0;

    let mark = checkAuraToggle('motw'); // Assumed to be improved
    let impMOTW = true; // TODO
    // Should we floor..?
    stamina += mark ? Math.floor(getMOTWStats(level) * (impMOTW ? 1.35 : 1)) : 0; 
    agility += mark ? Math.floor(getMOTWStats(level) * (impMOTW ? 1.35 : 1)) : 0;
    strength += mark ? Math.floor(getMOTWStats(level) * (impMOTW ? 1.35 : 1)) : 0;
    let impMight = true; // TODO
    attackpower += checkAuraToggle('might') ? Math.floor(getMightAP(level) * (impMight ? 1.2 : 1)): 0;
    let impBShout = true; // TODO
    attackpower += checkAuraToggle('battleshout') ? Math.floor(getBShoutAP(level) * (impBShout ? 1.2 : 1)) : 0; 
    attackpower += checkAuraToggle('trueshot') ? Math.floor(getTrueshotAP(level)) : 0;
    agility += checkAuraToggle('horn') ? 17 : 0;
    strength += checkAuraToggle('horn') ? 17 : 0;
    crit += checkAuraToggle('leader-of-the-pack') ? 3 : 0;

    let bleedBonus = (checkAuraToggle('mangle') ? 1.3 : 1) * (1 - document.getElementById('bleed-resistance').value / 100);

    let impFort = true; // TODO
    stamina += checkAuraToggle('fort') ? Math.floor(getFortStam(level) * (impFort ? 1.3 : 1)) : 0; // Assumed improved
    let impImp = true; // TODO
    stamina += checkAuraToggle('bloodpact') ? Math.floor(getPactStam(level) * (impImp ? 1.3 : 1)) : 0;
   
    let damageMod = 0.9; // Def stance
    damageMod *= checkAuraToggle("dmf") ? 1.1 : 1; 
    damageMod *= checkAuraToggle("ashcry") ? 1.05 : 1; 
    damageMod *= checkRuneToggle("shield-mastery") && ohweapontype == 'Shield' ? 1.1 : 1; 
    crit += checkAuraToggle("botbf") ? 2 : 0;
    crit += checkAuraToggle("fotte") ? 5 : 0;
    attackpower += checkAuraToggle("botbf") ? 20 : 0;
    attackpower += checkAuraToggle("dragonslayer") ? 140 : 0;
    crit += checkAuraToggle("dragonslayer") ? 5 : 0;
    attackpower += checkAuraToggle("fengus") ? 200 : 0;
    crit += checkAuraToggle("songflower") ? 5 : 0;
    stamina += checkAuraToggle("songflower") ? 15 : 0;
    agility += checkAuraToggle("songflower") ? 15 : 0;
    strength += checkAuraToggle("songflower") ? 15 : 0;
    
    spellcrit += checkAuraToggle("dragonslayer") ? 10 : 0;
    spellcrit += checkAuraToggle("slipkik") ? 3 : 0;
    spellcrit += checkAuraToggle("songflower") ? 5 : 0;
    spellcrit += checkAuraToggle("spark-of-inspiration") ? 4 : 0;

    let enhTotems = true; // TODO
    strength += checkAuraToggle("strtotem") ? Math.floor(getEarthStr(level) * (enhTotems ? 1.15 : 1)) : 0;

    // Stat deltas input by user
    let extrastrength    = Number(document.getElementById("playerextrastrength").value);
    let extrastamina     = Number(document.getElementById("playerextrastamina").value);
    let extraagility     = Number(document.getElementById("playerextraagility").value);
    let extrahit         = Number(document.getElementById("playerextrahit").value);
    let extracrit        = Number(document.getElementById("playerextracrit").value);
    let extraattackpower = Number(document.getElementById("playerextraattackpower").value);
    let extraarmor       = Number(document.getElementById("playerextraarmor").value);
    let extrablock       = Number(document.getElementById("playerextrablock").value);
    let extrablockvalue  = Number(document.getElementById("playerextrablockvalue").value);
    let extraparry       = Number(document.getElementById("playerextraparry").value);
    let extradodge       = Number(document.getElementById("playerextradodge").value);
    let extradefense     = Number(document.getElementById("playerextradefense").value);
    let extramhskill     = Number(document.getElementById("playerextramhskill").value);
    let extraohskill     = Number(document.getElementById("playerextraohskill").value);
    let extrahaste       = Number(document.getElementById("playerextrahaste").value);

    // Multiplicative buffs last, except for armor
    stamina *= checkAuraToggle("moldar") ? 1.15 : 1;
    stamina *= checkAuraToggle("zandalar") ? 1.15 : 1;
    agility *= checkAuraToggle("zandalar") ? 1.15 : 1;
    strength *= checkAuraToggle("zandalar") ? 1.15 : 1;
    stamina *= checkAuraToggle("fotte") ? 1.08 : 1;
    agility *= checkAuraToggle("fotte") ? 1.08 : 1;
    strength *= checkAuraToggle("fotte") ? 1.08 : 1;
    stamina *= (checkAuraToggle("kings") || checkAuraToggle('lion')) ? 1.1 : 1;
    agility *= (checkAuraToggle("kings") || checkAuraToggle('lion')) ? 1.1 : 1;
    strength *= (checkAuraToggle("kings") || checkAuraToggle('lion')) ? 1.1 : 1;

    armor += agility*2;
    armor *= checkAuraToggle("inspiration") ? 1.25 : 1;
    let impDevo = true; // TODO
    armor += checkAuraToggle("devo") ? Math.floor(getDevoArmor(level) * (impDevo ? 1.25 : 1)) : 0;
    armor += checkAuraToggle("defense") ? 250 : 0;
    armor += mark ? Math.floor(getMOTWArmor(level) * (impMOTW ? 1.35 : 1)) : 0;

    let staminaMultiplier = (checkAuraToggle("moldar") ? 1.15 : 1)*(checkAuraToggle("zandalar") ? 1.15 : 1)*((checkAuraToggle("kings") || checkAuraToggle('lion')) ? 1.1 : 1)
    let strengthMultiplier = (checkAuraToggle("zandalar") ? 1.15 : 1)*((checkAuraToggle("kings") || checkAuraToggle('lion')) ? 1.1 : 1)
    let agilityMultiplier = (checkAuraToggle("zandalar") ? 1.15 : 1)*((checkAuraToggle("kings") || checkAuraToggle('lion')) ? 1.1 : 1)

    extrastamina *= staminaMultiplier;
    extrastrength *= strengthMultiplier;
    extraagility *= agilityMultiplier;

    extraarmor *= checkAuraToggle("inspiration") ? 1.25 : 1;
    extraarmor *= checkAuraToggle("loh") ? 1.3 : 1;

    agility = Math.floor(agility)
    strength = Math.floor(strength)
    stamina = Math.floor(stamina)

    crit = crit + agility * 0.0610 /*0.0758*/ + (mhwepskill-(level * 5))*0.04 + cruelty;

    parry += 5 + defense * 0.04 + deflection;
    dodge += agility * 0.0610 /*0.0758*/ + defense*0.04
    block += 5 + defense * 0.04 + shieldspec;
    blockvalue += strength / 20;

    block = (_dualWield || twohand) ? 0 : block
    blockvalue = (_dualWield || twohand) ? 0 : blockvalue

    let hastePerc = (checkAuraToggle('wcb') ? 15 : 0) + (twohand && checkRuneToggle('frenzied-assault') ? 20 : 0) + (checkAuraToggle("spark-of-inspiration") ? 10 : 0);

    document.getElementById("playerhp").innerHTML = `${Math.round((stamina*10 + extrahp)*(document.getElementById("race").value == "Tauren" ? 1.05 : 1))}`;
    document.getElementById("playerstrength").innerHTML = `${Math.round(strength)}`;
    document.getElementById("playerstamina").innerHTML = `${Math.round(stamina)}`;
    document.getElementById("playeragility").innerHTML = `${Math.round(agility)}`;
    document.getElementById("playerhit").innerHTML = `${hit}`;
    document.getElementById("playercrit").innerHTML = `${Math.round(crit*10)/10}`;
    document.getElementById("playerattackpower").innerHTML = `${Math.round(attackpower + strength*2)}`;
    document.getElementById("playerarmor").innerHTML = `${Math.round(armor)}`;
    document.getElementById("playerblock").innerHTML = `${Math.round((block)*100)/100}`;
    document.getElementById("playerblockvalue").innerHTML = `${Math.round(blockvalue)}`;
    document.getElementById("playerparry").innerHTML = `${Math.round((parry)*100)/100}`;
    document.getElementById("playerdodge").innerHTML = `${Math.round((dodge)*100)/100}`;
    document.getElementById("playerdefense").innerHTML = `${defense + level * 5}`;
    document.getElementById("playermhskill").innerHTML = `${mhwepskill}`;
    document.getElementById("playerohskill").innerHTML = `${ohwepskill}`;
    document.getElementById("playerhaste").innerHTML = `${hastePerc}`;

    // Add stat deltas to stats, note str -> ap/blockvalue interaction not accounted for.
    strength += extrastrength;
    stamina += extrastamina;
    agility += extraagility;
    hit += extrahit;
    crit += extracrit + extraagility/20;
    attackpower += extraattackpower;
    armor += extraarmor + extraagility;
    parry += extraparry;
    dodge += extradodge + extraagility/20;
    defense += extradefense;
    block += extrablock;
    blockvalue += extrablockvalue + extrastrength/20;
    mhwepskill += extramhskill;
    ohwepskill += extraohskill;

    let bossLevel = Number(document.querySelector("#level").value) + Number(document.querySelector("#bossLevel").value)
    let SA = checkAuraToggle("sunder");
    let CoR = checkAuraToggle("cor");
    let IEA = checkAuraToggle("iea");
    let faerieFire = checkAuraToggle("faeriefire");
    let homunculi = checkAuraToggle("degrade");
    let bossArmor = Number(document.querySelector("#bossArmor").value);
    bossArmor = getBossArmor(level, bossLevel, SA, CoR, faerieFire, IEA, homunculi, bossArmor);

    let rotation = [];
    ABILITIES.forEach(ability => {
      let obj = {};
      const element = document.getElementById('use-' + ability);
      let use = element.checked && element.style != 'none';
      use = use ? use : false;
      let rage = 0;
      if (!['raging-blow', 'death-wish'].includes(ability))
        rage = Number(document.getElementById(ability + '-rage').value);
      obj.use = use;
      obj.rage = rage;
      rotation[`${ability}`] = obj;
    });
    rotation.cbrStacks = 0;
    if (document.getElementById('use-cbr-stop-rage').checked && document.getElementById('rotation-consumed-by-rage').style.display != 'none')
        rotation.cbrStacks = Number(document.getElementById('cbr-stacks').value);


    let globals = {
        tankStats: {
            type: "tank",
            level: Number(document.querySelector("#level").value),

            dualWield: _dualWield,
            twohand: twohand,
            playerNormSwing: mhweapontype == "Daggers" ? 1700: twohand ? 3300 : 2400,

            MHMin: mhmin,
            MHMax: mhmax,
            MHSwing: mhswing,
            
            OHMin: ohmin,
            OHMax: ohmax,
            OHSwing: ohswing,
            
            MHWepSkill: mhwepskill,
            OHWepSkill: _dualWield ? ohwepskill : 0,
            damageMod: damageMod,
            physDamageMod: 1 + 0.02*getTalentValue('one-handed-specialization') + (checkRuneToggle('single-minded-fury') && _dualWield ? 0.1 : 0) + (twohand ? getTalentValue('two-handed-weapon-specialization') * 0.01 : 0), // passive phys damage mods
            additivePhysBonus: 0, 
            hastePerc: hastePerc, 
            AP: attackpower + strength*2,
            crit: crit,
            spellcrit: spellcrit,
            hit: hit,
            
            parry: parry,
            dodge: dodge,
            block: block,
            blockValue: blockvalue,
            defense: level * 5 + defense,
            baseArmor: armor,
            baseHealth: (stamina*10 + extrahp)*(document.getElementById("race").value == "Tauren" ? 1.05 : 1),
            
            threatMod: 1.3 * (1 + 0.03*defiance),
            abilityCritMod: 1 + impale*0.1,
            critMod: 1,

            startRage: _startRage,

            staminaMultiplier: staminaMultiplier,
            strengthMultiplier: strengthMultiplier,
            agilityMultiplier: agilityMultiplier,

            rotation: rotation,

            gear: gear,
            enchants: enchants,

            talents: {
                deathwish: getTalentValue("death-wish") > 0,
                bloodthirst: getTalentValue("bloodthirst") > 0,
                mortalStrike: getTalentValue("mortal-strike") > 0,
                shieldslam: getTalentValue("shield-slam") > 0,
                flurry: getTalentValue("flurry"),
                enrage: getTalentValue("enrage"),
                deepWounds: getTalentValue("deep-wounds"),
                deflection: deflection,
                cruelty: cruelty,
                anticipation: anticipation,
                toughness: toughness,
                shieldspec: shieldspec,
                impHS: impHS,
                impSA: impSA,
                impSB: getTalentValue("improved-shield-block"),
                impTC: getTalentValue("improved-thunderclap"),
                impRend: impRend,
                defiance: defiance,
                impale: impale,
                dwspec: getTalentValue("dual-wield-specialization"),
                swordSpec: mhweapontype == "Sword" ? getTalentValue('sword-specialization') : 0,
            },
            weapons: {
                thunderfuryMH: mainhand == "Thunderfury",
                thunderfuryOH: offhand == "Thunderfury",
                edMH: mainhand == "Empyrean Demolisher",
                edOH: offhand == "Empyrean Demolisher",
                qsMH: mainhand == "Quel'Serrar",
                perdsMH: mainhand == "Perdition's Blade",
                perdsOH: offhand == "Perdition's Blade",
                dbMH: mainhand == "Deathbringer",
                dbOH: offhand == "Deathbringer",
                eskMH: mainhand == "Eskhandar's Right Claw",
                msaMH: mainhand == "Misplaced Servo Arm",
                msaOH: offhand == "Misplaced Servo Arm",
            },

            // TODO: make these procs..?
            bonuses: {
                mhoil: checkAuraToggle('shadow-oil'),
                ohoil: checkAuraToggle('oh-shadow-oil'),
                mhDismantle: Number(document.getElementById('mainhand-enchant').getAttribute('enchantID')) == 435481,
                ohDismantle: Number(document.getElementById('offhand-enchant').getAttribute('enchantID')) == 435481,

                wildStrikes: checkAuraToggle("wildstrikes"),
                wcb: checkAuraToggle('wcb'),
                dmf: checkAuraToggle("dmf"),
            },
            procs: stats.procs,
            runes: {
              devastate: checkRuneToggle("devastate"),
              endlessRage: checkRuneToggle("endless-rage"),
              consumedByRage: checkRuneToggle("consumed-by-rage"),
              furiousThunder: checkRuneToggle("furious-thunder"),
              flagellation: checkRuneToggle("flagellation"),
              ragingBlow: checkRuneToggle("raging-blow"),
              shieldMastery: checkRuneToggle("shield-mastery"),
              bloodFrenzy: checkRuneToggle("blood-frenzy"),
              preciseTiming: checkRuneToggle("precise-timing"),
              bloodsurge: checkRuneToggle("bloodsurge"),
              focusedRage: checkRuneToggle("focused-rage"),
              quickStrike: checkRuneToggle("quick-strike"),
              wreckingCrew: checkRuneToggle("wrecking-crew"),
            }
            
        },
        
        bossStats: {
            type: "boss",
            level: bossLevel, 
            
            MHMin: Number(document.querySelector("#swingMin").value),
            MHMax: Number(document.querySelector("#swingMax").value),
            MHSwing: Number(document.querySelector("#swingTimer").value)*1000,
            
            MHWepSkill: bossLevel * 5, 
            damageMod: 0.9, // Defensive Stance
            physDamageMod: 1,
            bleedBonus: bleedBonus,
            additivePhysBonus: checkAuraToggle('cov') ? 2 : 0,
            hastePerc: 0,
            AP: 0, //TODO: AP needs to scale correctly for npc vs players, add APScaling, also 270 base
            crit: 5,
            blockValue: Math.max(0, bossLevel - 15), // Not confirmed, seems to more or less match at lvl 27 and 63.
            
            parry: 5,
            dodge: 5,
            block: 5,
            defense: bossLevel * 5,
            baseArmor: bossArmor, 
            
            abilityCritMod: 2,
            critMod: 1,
            threatMod: 0,
            startRage: 0,

            bonuses: {
              armorDebuff: IEA || homunculi,
            },
        },
        // Calc Settings and other globals
        config: {
            landedHits: ["hit", "crit", "block", "crit block", "glance"],
            simDuration: Number(document.querySelector("#fightLength").value), // Fight duration in seconds
            iterations:  Number(document.querySelector("#iterations").value), // Number of fights simulated

        },
    }
    return globals;
}