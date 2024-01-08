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
  return 1025; // TODO: other levels I guess lol
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

function getBossArmor(level, bossLevel, CoR, faerieFire, IEA, homunculi, armor) {
  armor = armor ? armor : 0;
  if (bossLevel == 27) armor = 1108;
  if (CoR) armor -= getCoRArmor(level);
  if (faerieFire) armor -= getFFArmor(level);
  if (IEA && homunculi) armor -= Math.max(getHomunArmor(level), getIEAArmor(level));
  else if (IEA) armor -= getIEAArmor(level);
  else if (homunculi) armor -= getHomunArmor(level);
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
      log_message('Unknown shield item id: ' + itemID + '. Could not fetch block value.')
      return 0;
  }
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
    };
    ITEM_SLOTS.forEach(slot => {
      let element = document.getElementById(`${slot}-slot`)
      let itemID = element.getAttribute('itemid');
      if (itemID != null && itemID != 0) {
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
      }
    });
    let race = document.querySelector("#race").value
    // let head = document.querySelector("#head").value
    // let neck = document.querySelector("#neck").value
    // let shoulder = document.querySelector("#shoulder").value
    // let cape = document.querySelector("#cape").value
    // let chest = document.querySelector("#chest").value
    // let wrist = document.querySelector("#wrist").value
    // let hand = document.querySelector("#hands").value
    // let waist = document.querySelector("#waist").value
    // let leg = document.querySelector("#legs").value
    // let boots = document.querySelector("#feet").value
    // let ringone = document.querySelector("#ringone").value
    // let ringtwo = document.querySelector("#ringtwo").value
    // let trinketone = document.querySelector("#trinketone").value
    // let trinkettwo = document.querySelector("#trinkettwo").value
    // let ranged = document.querySelector("#ranged").value
    // let mainhand = document.querySelector("#mainhand").value
    // let offhand = document.querySelector("#offhand").value

    // Enchants
    let headenchant = document.querySelector("#headenchant").value
    let shoulderenchant = document.querySelector("#shoulderenchant").value
    let backenchant = document.querySelector("#backenchant").value
    let chestenchant = document.querySelector("#chestenchant").value
    let wristenchant = document.querySelector("#wristenchant").value
    let handenchant = document.querySelector("#handenchant").value
    let legenchant = document.querySelector("#legenchant").value
    let feetenchant = document.querySelector("#feetenchant").value
    let mhwepenchant = document.querySelector("#mhwepenchant").value
    let ohwepenchant = document.querySelector("#ohwepenchant").value

    // Talents
    let deflection = Number(document.getElementById("deflection").value);
    let cruelty = Number(document.getElementById("cruelty").value);
    let anticipation = Number(document.getElementById("anticipation").value);
    let toughness = Number(document.getElementById("toughness").value);
    let shieldspec = Number(document.getElementById("shield-spec").value);
    let impHS = Number(document.getElementById("impHS").value);
    let impSA = Number(document.getElementById("impSA").value);
    let impRend = Number(document.getElementById("impRend").value);
    let defiance = Number(document.getElementById("defiance").value);
    let impale = Number(document.getElementById("impale").value);

    let gear = [
        races[race],
        enchants[headenchant],
        enchants[shoulderenchant],
        enchants[backenchant],
        enchants[chestenchant],
        enchants[wristenchant],
        enchants[handenchant],
        enchants[legenchant],
        enchants[feetenchant],
        enchants[mhwepenchant],
        enchants[ohwepenchant],
    ];

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
    let defense = Math.round(anticipation*2);
    let block = 0;
    let blockvalue = 0;
    let extrahp = 94; // Base hp for all races

    let mainhand = {};
    let offhand = {};
    let mhwep = document.getElementById('mainhand-slot').getAttribute('itemid');
    if (mhwep != undefined && mhwep != "0") {
      mainhand = ITEMS[`${mhwep}`];
    }
    let ohwep = document.getElementById('offhand-slot').getAttribute('itemid');
    if (ohwep != undefined && ohwep != "0") {
      offhand = ITEMS[`${ohwep}`];
    }
    let mhweapontype = mainhand.type == undefined ? "" : mainhand.type; // eg "Sword"
    let ohweapontype = offhand.type == undefined ? "" : offhand.type; // eg "Sword"
    let _dualWield = ohweapontype != 'Shield';
    let mhwepskill = level * 5;
    let ohwepskill = _dualWield ? level * 5 : 0;
    if (!_dualWield) blockvalue += getBlockValue(Number(ohwep));
    ITEM_SLOTS.forEach(slot => {
      let element = document.getElementById(`${slot}-slot`)
      let itemID = element.getAttribute('itemid');
      if (itemID && itemID != 0) {
        let itemStats = ITEMS[`${itemID}`];
        if (itemStats) {
          if(itemStats.skilltype.includes(mhweapontype))
            mhwepskill += itemStats.skill;
          if(itemStats.skilltype.includes(mhweapontype))
            ohwepskill += itemStats.skill;
        }
      }
    });

    let mhmin = mainhand.mindmg;
    let mhmax = mainhand.maxdmg;
    let mhswing = mainhand.swingtimer;
    let ohmin = 0;
    let ohmax = 0;
    let ohswing = 0;


    if (_dualWield) {
        ohmin = offhand.mindmg;
        ohmax = offhand.maxdmg;
        ohswing = offhand.swingtimer;
    }
    gear.forEach(item => {
        strength += item.strength;
        stamina += item.stamina;
        agility += item.agility;
        hit += item.hit;
        crit += item.crit;
        attackpower += item.attackpower;
        armor += item.armor;
        parry += item.parry;
        dodge += item.dodge;
        defense += item.defense;
        block += item.block;
        blockvalue += item.blockvalue;
        if(item.skilltype !== undefined && item.skilltype != 'none') {
          if (item.skilltype.includes(mhweapontype))
            mhwepskill += item.skill;
          if (item.skilltype.includes(ohweapontype))
            ohwepskill += item.skill;
        }
    })

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

    armor *= (1+0.02*toughness); // Only applies to armor from gear
    armor *= checkAuraToggle("loh") ? 1.3 : 1;
    // Buffs
    mhmin += checkAuraToggle('coarse') ? 3 : 0;
    mhmax += checkAuraToggle('coarse') ? 3 : 0;
    mhmin += document.getElementById("mhwepenchant") == "Lesser Striking" ? 2 : 0;
    mhmax += document.getElementById("mhwepenchant") == "Lesser Striking" ? 2 : 0;
    hit += checkAuraToggle('bfdstone') ? 2 : 0;

    strength += checkAuraToggle('ogre') ? 8 : 0;
    agility += checkAuraToggle('lesseragi') ? 8 : 0;
    stamina += checkAuraToggle('food') ? 8 : 0;
    stamina += checkAuraToggle('rumsey') ? 15 : 0;

    let _startRage = Number(document.querySelector("#startRage").value);

    extrahp += checkAuraToggle('minorfort') ? 27 : 0;
    extrahp += document.getElementById("chestenchant").value == "Major Health" ? 100 : 0;
    extrahp += legenchant == "Libram of Constitution" ? 100 : 0;
    extrahp += headenchant == "Libram of Constitution" ? 100 : 0;
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
    agility += checkAuraToggle('horn') ? 6 : 0;
    strength += checkAuraToggle('horn') ? 6 : 0;

    let bleedBonus = checkAuraToggle('mangle') ? 1.3 : 1;

    let impFort = true; // TODO
    stamina += checkAuraToggle('fort') ? Math.floor(getFortStam(level) * (impFort ? 1.3 : 1)) : 0; // Assumed improved
    let impImp = true; // TODO
    stamina += checkAuraToggle('bloodpact') ? Math.floor(getPactStam(level) * (impImp ? 1.3 : 1)) : 0;
   
    let damageMod = 0.9; // Def stance
    damageMod *= checkAuraToggle("dmf") ? 1.1 : 1; 
    damageMod *= checkAuraToggle("ashcry") ? 1.05 : 1; 
    crit += checkAuraToggle("botbf") ? 2 : 0;
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
    stamina *= checkAuraToggle("kings") ? 1.1 : 1;
    agility *= checkAuraToggle("kings") ? 1.1 : 1;
    strength *= checkAuraToggle("kings") ? 1.1 : 1;

    armor += agility*2;
    armor *= checkAuraToggle("inspiration") ? 1.25 : 1;
    // armor += document.getElementById("potion").value == "Greater Stoneshield" ? 2000 : 0;
    let impDevo = true; // TODO
    armor += checkAuraToggle("devo") ? Math.floor(getDevoArmor(level) * (impDevo ? 1.25 : 1)) : 0;
    armor += checkAuraToggle("defense") ? 150 : 0;
    armor += mark ? Math.floor(getMOTWArmor(level) * (impMOTW ? 1.35 : 1)) : 0;

    let staminaMultiplier = (checkAuraToggle("moldar") ? 1.15 : 1)*(checkAuraToggle("zandalar") ? 1.15 : 1)*(checkAuraToggle("kings") ? 1.1 : 1)
    let strengthMultiplier = (checkAuraToggle("zandalar") ? 1.15 : 1)*(checkAuraToggle("kings") ? 1.1 : 1)
    let agilityMultiplier = (checkAuraToggle("zandalar") ? 1.15 : 1)*(checkAuraToggle("kings") ? 1.1 : 1)

    extrastamina *= staminaMultiplier;
    extrastrength *= strengthMultiplier;
    extraagility *= agilityMultiplier;

    extraarmor *= checkAuraToggle("inspiration") ? 1.25 : 1;
    extraarmor *= checkAuraToggle("loh") ? 1.3 : 1;

    agility = Math.floor(agility)
    strength = Math.floor(strength)
    stamina = Math.floor(stamina)

    crit = crit + cruelty + agility/9 + (mhwepskill-(level * 5))*0.04

    parry += 5 + deflection + defense*0.04
    dodge += agility/9 + defense*0.04
    block += shieldspec + 5 + defense*0.04
    blockvalue += strength/20

    block = _dualWield ? 0 : block
    blockvalue = _dualWield ? 0 : blockvalue

    let hastePerc = extrahaste + (document.getElementById("headenchant").value == "Libram of Rapidity" ? 1 : 0) + (document.getElementById("legenchant").value == "Libram of Rapidity" ? 1 : 0) + ( document.getElementById("handenchant").value == "Minor Haste" ? 1 : 0);
        hastePerc += checkAuraToggle('wcb') ? 15 : 0;

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
    let CoR = checkAuraToggle("cor");
    let IEA = checkAuraToggle("iea");
    let faerieFire = checkAuraToggle("faeriefire");
    let homunculi = checkAuraToggle("degrade");
    let bossArmor = Number(document.querySelector("#bossArmor").value);
    bossArmor = getBossArmor(level, bossLevel, CoR, faerieFire, IEA, homunculi, bossArmor);

    let rotation = [];
    ABILITIES.forEach(ability => {
      let obj = {};
      let use = document.getElementById('use-' + ability).checked;
      use = use ? use : false;
      let rage = 0;
      if (ability != 'raging-blow')
        rage = Number(document.getElementById(ability + '-rage').value);
      obj.use = use;
      obj.rage = rage;
      rotation[`${ability}`] = obj;
    });
    rotation.cbrStacks = 0;
    if (document.getElementById('use-cbr-stop-rage').checked)
        rotation.cbrStacks = Number(document.getElementById('cbr-stacks').value);


    let globals = {
        tankStats: {
            type: "tank",
            level: Number(document.querySelector("#level").value),

            dualWield: _dualWield,
            playerNormSwing: document.querySelector("#mhweptypelist") == "Daggers" ? 1700: 2400,

            MHMin: mhmin,
            MHMax: mhmax,
            MHSwing: mhswing,
            
            OHMin: ohmin,
            OHMax: ohmax,
            OHSwing: ohswing,
            
            MHWepSkill: mhwepskill,
            OHWepSkill: _dualWield ? ohwepskill : 0,
            damageMod: damageMod,
            physDmgMod: 1,// + 0.02*Number(document.getElementById("1hspec").value), // passive phys damage mods
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
            
            threatMod: 1.3 * (1 + 0.03*defiance) * (document.getElementById("handenchant").value == "Threat" ? 1.02 : 1),
            critMod: 2 + impale*0.1,

            startRage: _startRage,

            staminaMultiplier: staminaMultiplier,
            strengthMultiplier: strengthMultiplier,
            agilityMultiplier: agilityMultiplier,

            rotation: rotation,

            talents: {
                // deathwish: document.getElementById("deathwish").checked,
                // bloodthirst: document.getElementById("bloodthirst").checked,
                // shieldslam: document.getElementById("shieldslam").checked,
                // flurry: Number(document.getElementById("flurry").value),
                enrage: Number(document.getElementById("enrage").value),
                deepWounds: Number(document.getElementById("deep-wounds").value),
                deflection: deflection,
                cruelty: cruelty,
                anticipation: anticipation,
                toughness: toughness,
                shieldspec: shieldspec,
                impHS: impHS,
                impSA: impSA,
                impRend: impRend,
                defiance: defiance,
                impale: impale,
                // dwspec: dwspec,
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

            // trinkets: {
            //     kots: (trinketone == "Kiss of the Spider") || (trinkettwo == "Kiss of the Spider"),
            //     earthstrike: (trinketone == "Earthstrike") || (trinkettwo == "Earthstrike"),
            //     diamondflask: (trinketone == "Diamond Flask") || (trinkettwo == "Diamond Flask"),
            //     jomgabbar: (trinketone == "Jom Gabbar") || (trinkettwo == "Jom Gabbar"),
            //     slayerscrest: (trinketone == "Slayer's Crest") || (trinkettwo == "Slayer's Crest"),
            //     hoj: (trinketone == "Hand of Justice") || (trinkettwo == "Hand of Justice"),
            // },

            bonuses: {
                // twoPieceDreadnaught: document.querySelector("#twoPieceDreadnaught").checked,
                // threePieceConqueror: document.getElementById("threePieceConqueror").checked,
                // fivePieceWrath: document.querySelector("#fivePieceWrath").checked,
                threatenchant: document.getElementById("handenchant").value == "Threat",
                // berserking: document.getElementById("berserking").checked,
                // goa: document.getElementById("goa").checked,

                // windfury: document.querySelector("#windfury").checked,
                wildStrikes: checkAuraToggle("wildstrikes"),
                wcb: checkAuraToggle('wcb'),
                dmf: checkAuraToggle("dmf"),
                crusaderMH: mhwepenchant == "Crusader",
                crusaderOH: ohwepenchant == "Crusader",
                // windfuryAP: document.getElementById("impweptotems").checked ? 410 : 315,
                // mrp: _mrp,
            },

            runes: {
              devastate: document.getElementById("devastate").checked,
              endlessRage: document.getElementById("endless-rage").checked,
              consumedByRage: document.getElementById("consumed-by-rage").checked,
              furiousThunder: document.getElementById("furious-thunder").checked,
              flagellation: document.getElementById("flagellation").checked,
              ragingBlow: document.getElementById("raging-blow").checked,
              bloodFrenzy: document.getElementById("blood-frenzy").checked,
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
            physDmgMod: 1,
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
            
            critMod: 2,
            threatMod: 0,
            startRage: 0,
        },
        // Calc Settings and other globals
        config: {
            landedHits: ["hit", "crit", "block", "crit block", "glance"],
            simDuration: Math.round(Math.ceil(Number(document.querySelector("#fightLength").value)*2.5)*4)/10, // Fight duration in seconds
            iterations:  Number(document.querySelector("#iterations").value), // Number of fights simulated

        },
    }
    return globals;
}