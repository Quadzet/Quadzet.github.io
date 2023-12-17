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

function updateStats()
{
    // Gear
    let level = document.querySelector("#level").value
    let race = document.querySelector("#race").value
    let head = document.querySelector("#head").value
    let neck = document.querySelector("#neck").value
    let shoulder = document.querySelector("#shoulder").value
    let cape = document.querySelector("#cape").value
    let chest = document.querySelector("#chest").value
    let wrist = document.querySelector("#wrist").value
    let hand = document.querySelector("#hands").value
    let waist = document.querySelector("#waist").value
    let leg = document.querySelector("#legs").value
    let boots = document.querySelector("#feet").value
    let ringone = document.querySelector("#ringone").value
    let ringtwo = document.querySelector("#ringtwo").value
    let trinketone = document.querySelector("#trinketone").value
    let trinkettwo = document.querySelector("#trinkettwo").value
    let ranged = document.querySelector("#ranged").value
    let mainhand = document.querySelector("#mainhand").value
    let offhand = document.querySelector("#offhand").value

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
    let shieldspec = Number(document.getElementById("shieldspec").value);
    let impHS = Number(document.getElementById("impHS").value);
    let impSA = Number(document.getElementById("impSA").value);
    let defiance = Number(document.getElementById("defiance").value);
    let impale = Number(document.getElementById("impale").value);
    let dwspec = Number(document.getElementById("dwspec").value);

    let gear = [
        races[race],
        heads[head],
        necks[neck],
        shoulders[shoulder],
        capes[cape],
        chests[chest],
        wrists[wrist],
        hands[hand],
        waists[waist],
        legs[leg],
        feet[boots],
        rings[ringone],
        rings[ringtwo],
        trinkets[trinketone],
        trinkets[trinkettwo],
        rangedweps[ranged],
        weapons[mainhand],
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
    let _dualWield = document.querySelector("#ohweptypelist").value == 'Shields' ? false : true;
    if (_dualWield) {
        gear.push(weapons[offhand])
    } else {
        gear.push(shields[offhand])
    }

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

    let mhmin = weapons[mainhand].min;
    let mhmax = weapons[mainhand].max;
    let mhswing = weapons[mainhand].swingtimer*1000;
    let ohmin = 0;
    let ohmax = 0;
    let ohswing = 0;
    if (_dualWield) {
        ohmin = weapons[offhand].min;
        ohmax = weapons[offhand].max;
        ohswing = weapons[offhand].swingtimer*1000;
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
    })

    let mhwepskill = level * 5;
    let ohwepskill = _dualWield ? level * 5 : 0;
    let mhweapontype = document.getElementById("mhweptypelist").value
    let ohweapontype = document.getElementById("ohweptypelist").value

    gear.forEach(item => {
        if(item.skilltype && item.skilltype != 'none') {
            if(item.skilltype.includes(mhweapontype))
                mhwepskill += item.skill;
        }
    })

    gear.forEach(item => {
        if(item.skilltype && item.skilltype != 'none') {
            if(item.skilltype.includes(ohweapontype))
                ohwepskill += item.skill;
        }
    })

    armor *= (1+0.02*toughness); // Only applies to armor from gear
    armor *= document.getElementById("imploh").checked ? 1.3 : 1;
    // Buffs
    let mhstone = document.getElementById("mhstone").value
    crit += mhstone == "Elemental" ? 2 : 0;
    attackpower += mhstone == "Consecrated" ? 100 : 0;
    mhmin += mhstone == "Coarse Sharpening Stone" ? 3 : 0;
    mhmax += mhstone == "Coarse Sharpening Stone" ? 3 : 0;
    mhmin += document.getElementById("mhwepenchant") == "Lesser Striking" ? 2 : 0;
    mhmax += document.getElementById("mhwepenchant") == "Lesser Striking" ? 2 : 0;
    hit += mhstone == "BFD Sharpening Stone" ? 2 : 0;

    let ohstone = document.getElementById("ohstone").value
    if (_dualWield) {
        crit += ohstone == "Elemental" ? 2 : 0;
        attackpower += ohstone == "Consecrated" ? 100 : 0;
        ohmin += ohstone == "Coarse Sharpening Stone" ? 3 : 0;
        ohmax += ohstone == "Coarse Sharpening Stone" ? 3 : 0;
        ohmin += document.getElementById("ohwepenchant") == "Lesser Striking" ? 2 : 0;
        ohmax += document.getElementById("ohwepenchant") == "Lesser Striking" ? 2 : 0;
        hit += ohstone == "BFD Sharpening Stone" ? 2 : 0;
    }

    strength += Number(document.getElementById("strbuff").value)
    agility += Number(document.getElementById("agibuff").value)
    // agility += document.getElementById("agibuff").value == "Elixir of the Mongoose" ? 25 : 0;
    // agility += document.getElementById("agibuff").value == "Elixir of Greater Agility" ? 25 : 0;
    crit += document.getElementById("agibuff").value == "Elixir of the Mongoose" ? 2 : 0;
    attackpower += Number(document.getElementById("apbuff").value)

    let statbuff = document.getElementById("statbuff").value
    agility += statbuff == "Ground Scorpok Assay" ? 25 : 0;
    strength += statbuff == "R.O.I.D.S." ? 25 : 0;
    stamina += statbuff == "Spirit of Zanza" ? 50 : 0;

    let foodbuff = document.getElementById("foodbuff").value
    stamina += foodbuff == "Heavy Crocolisk Stew" ? 8 : 0;
    strength += foodbuff == "Smoked Desert Dumplings" ? 25 : 0;
    strength += foodbuff == "Blessed Sunfruit" ? 10 : 0;
    agility += foodbuff == "Grilled Squid" ? 10 : 0;
    stamina += foodbuff == "Dirge's Kickin' Chimaerok Chops" ? 25 : 0;
    stamina += foodbuff == "Tender Wolf Steak" ? 12 : 0;
    
    stamina += Number(document.getElementById("alcohol").value);

    let _startRage = Number(document.querySelector("#startRage").value);
    let _mrp = false;
    if(document.getElementById("potion").value == "Mighty Rage") {
        _startRage = Math.min(100, _startRage + 45 + Math.random()*30);
        _mrp = true;
    }

    extrahp += document.getElementById("hpelixir").checked ? 27 : 0;
    // extrahp += document.getElementById("titans").checked ? 1200 : 0;
    extrahp += document.getElementById("chestenchant").value == "Major Health" ? 100 : 0;
    extrahp += legenchant == "Libram of Constitution" ? 100 : 0;
    extrahp += headenchant == "Libram of Constitution" ? 100 : 0;
    let _wcb = document.querySelector("#wcb").checked;
    extrahp += _wcb ? 300 : 0;

    // crit += document.getElementById("pack").checked ? 3 : 0;
    // attackpower += document.getElementById("trueshot").checked ? 100 : 0;

    let mark = document.getElementById("mark").checked; // Assumed to be improved
    let impMOTW = true; // TODO
    // Should we floor..?
    stamina += mark ? Math.floor(getMOTWStats(level) * (impMOTW ? 1.35 : 1)) : 0; 
    agility += mark ? Math.floor(getMOTWStats(level) * (impMOTW ? 1.35 : 1)) : 0;
    strength += mark ? Math.floor(getMOTWStats(level) * (impMOTW ? 1.35 : 1)) : 0;
    let impMight = true; // TODO
    attackpower += document.getElementById("might").checked ? Math.floor(getMightAP(level) * (impMight ? 1.2 : 1)): 0;
    let impBShout = true; // TODO
    attackpower += document.getElementById("bshout").checked ? Math.floor(getBShoutAP(level) * (impBShout ? 1.2 : 1)) : 0; 
    // TODO: Exclusive with Might
    agility += document.getElementById("hornOfLord").checked ? 6 : 0;
    strength += document.getElementById("hornOfLord").checked ? 6 : 0;

    let bleedBonus = document.getElementById("mangle").checked ? 1.3 : 1;

    let impFort = true; // TODO
    stamina += document.getElementById("fortitude").checked ? Math.floor(getFortStam(level) * (impFort ? 1.3 : 1)) : 0; // Assumed improved
    let impImp = true; // TODO
    stamina += document.getElementById("bloodpact").checked ? Math.floor(getPactStam(level) * (impImp ? 1.3 : 1)) : 0;
   
    let damageMod = 0.9; // Def stance
    damageMod *= document.querySelector("#dmf").checked ? 1.1 : 1; 
    damageMod *= document.querySelector("#ashenvaleCry").checked ? 1.05 : 1; 
    crit += document.getElementById("boonOfTheBlackfathom").checked ? 2 : 0;
    attackpower += document.getElementById("boonOfTheBlackfathom").checked ? 20 : 0;
    attackpower += document.getElementById("dragonslayer").checked ? 140 : 0;
    crit += document.getElementById("dragonslayer").checked ? 5 : 0;
    attackpower += document.getElementById("dmAP").checked ? 200 : 0;
    crit += document.getElementById("songflower").checked ? 5 : 0;
    stamina += document.getElementById("songflower").checked ? 15 : 0;
    agility += document.getElementById("songflower").checked ? 15 : 0;
    strength += document.getElementById("songflower").checked ? 15 : 0;
    
    spellcrit += document.getElementById("dragonslayer").checked ? 10 : 0;
    spellcrit += document.getElementById("dmspell").checked ? 3 : 0;
    spellcrit += document.getElementById("songflower").checked ? 5 : 0;

    let enhTotems = true; // TODO
    strength += document.getElementById("strofearth").checked ? Math.floor(getEarthStr(level) * (enhTotems ? 1.15 : 1)) : 0;
    // agility += document.getElementById("graceofair").checked ? 20 : 0;

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

    // Set bonuses
    if(mainhand == "Dal'Rend's Sacred Charge" && offhand == "Dal'Rend's Tribal Guardian") attackpower += 50;
    if(mainhand == "Warblade of the Hakkari (MH)" && offhand == "Warblade of the Hakkari (OH)") {
        mhwepskill += 6
        ohwepskill += 6
    }


    // Multiplicative buffs last, except for armor
    stamina *= document.getElementById("dmstamina").checked ? 1.15 : 1;
    stamina *= document.getElementById("zandalar").checked ? 1.15 : 1;
    agility *= document.getElementById("zandalar").checked ? 1.15 : 1;
    strength *= document.getElementById("zandalar").checked ? 1.15 : 1;
    stamina *= document.getElementById("kings").checked ? 1.1 : 1;
    agility *= document.getElementById("kings").checked ? 1.1 : 1;
    strength *= document.getElementById("kings").checked ? 1.1 : 1;

    armor += agility*2;
    armor *= document.getElementById("inspiration").checked ? 1.25 : 1;
    armor += document.getElementById("potion").value == "Greater Stoneshield" ? 2000 : 0;
    let impDevo = true; // TODO
    armor += document.getElementById("devo").checked ? Math.floor(getDevoArmor(level) * (impDevo ? 1.25 : 1)) : 0;
    armor += document.getElementById("armorelixir").checked ? 150 : 0;
    armor += mark ? Math.floor(getMOTWArmor(level) * (impMOTW ? 1.35 : 1)) : 0;

    let staminaMultiplier = (document.getElementById("dmstamina").checked ? 1.15 : 1)*(document.getElementById("zandalar").checked ? 1.15 : 1)*(document.getElementById("kings").checked ? 1.1 : 1)
    let strengthMultiplier = (document.getElementById("zandalar").checked ? 1.15 : 1)*(document.getElementById("kings").checked ? 1.1 : 1)
    let agilityMultiplier = (document.getElementById("zandalar").checked ? 1.15 : 1)*(document.getElementById("kings").checked ? 1.1 : 1)

    extrastamina *= staminaMultiplier;
    extrastrength *= strengthMultiplier;
    extraagility *= agilityMultiplier;

    extraarmor *= document.getElementById("inspiration").checked ? 1.25 : 1;
    extraarmor *= document.getElementById("imploh").checked ? 1.3 : 1;

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
        hastePerc += _wcb ? 15 : 0;

    document.getElementById("playerhp").innerHTML = `${Math.round((stamina*10 + extrahp)*(document.getElementById("race").value == "Tauren" ? 1.05 : 1))}              `;
    document.getElementById("playerstrength").innerHTML = `${Math.round(strength)} `;
    document.getElementById("playerstamina").innerHTML = `${Math.round(stamina)} `;
    document.getElementById("playeragility").innerHTML = `${Math.round(agility)} `;
    document.getElementById("playerhit").innerHTML = `${hit} `;
    document.getElementById("playercrit").innerHTML = `${Math.round(crit*10)/10} `;
    document.getElementById("playerattackpower").innerHTML = `${Math.round(attackpower + strength*2)} `;
    document.getElementById("playerarmor").innerHTML = `${Math.round(armor)} `;
    document.getElementById("playerblock").innerHTML = `${Math.round((block)*100)/100} `;
    document.getElementById("playerblockvalue").innerHTML = `${Math.round(blockvalue)} `;
    document.getElementById("playerparry").innerHTML = `${Math.round((parry)*100)/100} `;
    document.getElementById("playerdodge").innerHTML = `${Math.round((dodge)*100)/100} `;
    document.getElementById("playerdefense").innerHTML = `${defense + level * 5} `;
    document.getElementById("playermhskill").innerHTML = `${mhwepskill} `;
    document.getElementById("playerohskill").innerHTML = `${ohwepskill} `;
    document.getElementById("playerhaste").innerHTML = `${hastePerc} `;

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
    let CoR = document.querySelector("#curseofrecklessness").checked;
    let IEA = document.querySelector("#iea").checked;
    let faerieFire = document.querySelector("#faeriefire").checked;
    let homunculi = document.querySelector("#homunculi").checked;
    let bossArmor = Number(document.querySelector("#bossarmor").value);
    bossArmor = getBossArmor(level, bossLevel, CoR, faerieFire, IEA, homunculi, bossArmor);

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
            physDmgMod: 1 + 0.02*Number(document.getElementById("1hspec").value), // passive phys damage mods
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

            talents: {
                deathwish: document.getElementById("deathwish").checked,
                bloodthirst: document.getElementById("bloodthirst").checked,
                shieldslam: document.getElementById("shieldslam").checked,
                flurry: Number(document.getElementById("flurry").value),
                enrage: Number(document.getElementById("enrage").value),
                deepWounds: Number(document.getElementById("deepWounds").value),
                deflection: deflection,
                cruelty: cruelty,
                anticipation: anticipation,
                toughness: toughness,
                shieldspec: shieldspec,
                impHS: impHS,
                impSA: impSA,
                defiance: defiance,
                impale: impale,
                dwspec: dwspec,
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

            trinkets: {
                kots: (trinketone == "Kiss of the Spider") || (trinkettwo == "Kiss of the Spider"),
                earthstrike: (trinketone == "Earthstrike") || (trinkettwo == "Earthstrike"),
                diamondflask: (trinketone == "Diamond Flask") || (trinkettwo == "Diamond Flask"),
                jomgabbar: (trinketone == "Jom Gabbar") || (trinkettwo == "Jom Gabbar"),
                slayerscrest: (trinketone == "Slayer's Crest") || (trinkettwo == "Slayer's Crest"),
                hoj: (trinketone == "Hand of Justice") || (trinkettwo == "Hand of Justice"),
            },

            bonuses: {
                // twoPieceDreadnaught: document.querySelector("#twoPieceDreadnaught").checked,
                // threePieceConqueror: document.getElementById("threePieceConqueror").checked,
                // fivePieceWrath: document.querySelector("#fivePieceWrath").checked,
                threatenchant: document.getElementById("handenchant").value == "Threat",
                // berserking: document.getElementById("berserking").checked,
                // goa: document.getElementById("goa").checked,

                // windfury: document.querySelector("#windfury").checked,
                wildStrikes: document.querySelector("#wildStrikes").checked,
                wcb: _wcb,
                dmf: document.querySelector("#dmf").checked,
                crusaderMH: mhwepenchant == "Crusader",
                crusaderOH: ohwepenchant == "Crusader",
                // windfuryAP: document.getElementById("impweptotems").checked ? 410 : 315,
                mrp: _mrp,
            },

            runes: {
              devastate: document.getElementById("devastate").checked,
              endlessRage: document.getElementById("endlessRage").checked,
              // quickStrike: document.getElementById("quickStrike").checked,
              consumedByRage: document.getElementById("consumedByRage").checked,
              furiousThunder: document.getElementById("furiousThunder").checked,
              flagellation: document.getElementById("flagellation").checked,
              ragingBlow: document.getElementById("ragingBlow").checked,
              bloodFrenzy: document.getElementById("bloodFrenzy").checked,
            }
            
        },
        
        bossStats: {
            type: "boss",
            level: bossLevel, 
            
            MHMin: Number(document.querySelector("#swingMin").value),
            MHMax: Number(document.querySelector("#swingMax").value),
            MHSwing: Number(document.querySelector("#swingTimer").value)*1000,
            
            MHWepSkill: level * 5 + 15, // TODO: Boss level
            damageMod: 0.9, // Defensive Stance
            physDmgMod: 1,
            bleedBonus: bleedBonus,
            additivePhysBonus: document.getElementById("CoV").checked ? 2 : 0,
            hastePerc: 0,
            AP: 0, //TODO: AP needs to scale correctly for npc vs players, add APScaling, also 270 base
            crit: 5,
            blockValue: Math.min(0, bossLevel - 15), // Not confirmed, seems to more or less match at lvl 27 and 63.
            
            parry: 5,
            dodge: 5,
            block: 5,
            defense: level * 5 + 15,
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