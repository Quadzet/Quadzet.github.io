"use strict";

// GLOBALS 
const _landedHits = ["hit", "crit", "block", "crit block", "glance"];
const _timeStep = 25; // Timestep used for each fight

// Calc Settings
let _simDuration = 12; // Fight duration in seconds
let _iterations = 10000; // Number of fights simulated
let _snapshotLen = 400;
let _config = {}; // tank and boss settings
let _breakpointValue = 0;
let _breakpointTime = 0;
//let _firstBatch = 0;

// Tank Settings
let _startRage = 0;
let _deathwish = true;
let _crusaderMH = true;
let _crusaderOH = false;
let _windfury = false;
let _windfuryAP = 315;
let _wcb = false;
let _dmf = false;
let _mrp = false;

// Weapons
let _thunderfuryMH = true;
let _thunderfuryOH = false;
let _edMH = false;
let _edOH = false;
let _qsMH = false;
let _perdsMH = false;
let _perdsOH = false;
let _dbMH = false;
let _dbOH = false;
let _eskMH = false;
let _msaMH = false;
let _msaOH = false;

// Talents
let _impHS = 3;
let _impSA = 0;
let _defiance = 5;
let _impale = 0;
let _dwspec = 5;

// Trinkets
let _kots = false;
let _diamondflask = false;
let _earthstrike = false;
let _slayerscrest = false;
let _jomgabbar = false;
let _lgg = false; 
let _hoj = false;

// Other Bonuses
let _twoPieceDreadnaught = false;
let _fivePieceWrath = false;
let _berserking = false;

// Fight config
let _debuffDelay = 0;


/*  TODOS 
<option value="Felstriker">Felstriker</option>
<option value="Arlokk's Grasp">Arlokk's Grasp</option>
<option value="Thekal's Grasp">Thekal's Grasp</option>
<option value="Eskhandar's Left Claw">Eskhandar's Left Claw</option>
<option value="Teebu's Blazing Longsword">Teebu's Blazing Longsword</option>
*/

let weaponlists = {
    "Shields": `<option value="Elementium Reinforced Bulwark">Elementium Reinforced Bulwark</option>`,
    "Axes": `<option value="Ancient Hakkari Manslayer">Ancient Hakkari Manslayer</option>
    <option value="Annihilator">Annihilator</option>
    <option value="Axe of the Deep Woods">Axe of the Deep Woods</option>
    <option value="Blessed Qiraji War Axe">Blessed Qiraji War Axe</option>
    <option value="Bone Slicing Hatchet">Bone Slicing Hatchet</option>
    <option value="Crul'Shorukh, Edge of Chaos">Crul'Shorukh, Edge of Chaos</option>
    <option value="Dark Iron Destroyer">Dark Iron Destroyer</option>
    <option value="Deathbringer">Deathbringer</option>
    <option value="Doom's Edge">Doom's Edge</option>
    <option value="Flurry Axe">Flurry Axe</option>
    <option value="Frostbite">Frostbite</option>
    <option value="Hatchet of Sundered Bone">Hatchet of Sundered Bone</option>
    <option value="Iceblade Hacker">Iceblade Hacker</option>
    <option value="R14 Axe">R14 Axe</option>
    <option value="Rivenspike">Rivenspike</option>
    <option value="Serathil">Serathil</option>
    <option value="Sickle of Unyielding Strength">Sickle of Unyielding Strength</option>
    <option value="Soulrender">Soulrender</option>
    <option value="Zulian Hacker of Strength">Zulian Hacker of Strength</option>
    <option value="Zulian Hacker of the Tiger">Zulian Hacker of the Tiger</option>`,

    "Daggers": `<option value="Alcor's Sunrazor">Alcor's Sunrazor</option>
    <option value="Black Amnesty">Black Amnesty</option>
    <option value="Blessed Qiraji Pugio">Blessed Qiraji Pugio</option>
    <option value="Bonescraper">Bonescraper</option>
    <option value="Core Hound Tooth">Core Hound Tooth</option>
    <option value="Darrowspike">Darrowspike</option>
    <option value="Death's Sting">Death's Sting</option>
    <option value="Distracting Dagger">Distracting Dagger</option>
    <option value="Dragonfang Blade">Dragonfang Blade</option>
    <option value="Emerald Dragonfang">Emerald Dragonfang</option>
    <option value="Fang of the Faceless">Fang of the Faceless</option>
    <option value="Finkle's Skinner">Finkle's Skinner</option>
    <option value="Glacial Blade">Glacial Blade</option>
    <option value="Gutgore Ripper">Gutgore Ripper</option>
    <option value="Harbinger of Doom">Harbinger of Doom</option>
    <option value="Heartseeker">Heartseeker</option>
    <option value="R14 Dagger">R14 Dagger</option>
    <option value="Kingsfall">Kingsfall</option>
    <option value="Maexxna's Fang">Maexxna's Fang</option>
    <option value="Perdition's Blade">Perdition's Blade</option>
    <option value="Qiraji Sacrificial Dagger">Qiraji Sacrificial Dagger</option>
    <option value="Scarlet Kris">Scarlet Kris</option>
    <option value="Scout's Blade">Scout's Blade</option>
    <option value="Shadowsong's Sorrow">Shadowsong's Sorrow</option>
    <option value="The Lobotomizer">The Lobotomizer</option>
    <option value="The Thunderwood Poker">The Thunderwood Poker</option>`,

    "Fists": `
    <option value="Claw of the Black Drake">Claw of the Black Drake</option>
    <option value="Claw of the Frost Wyrm">Claw of the Frost Wyrm</option>
    <option value="Eskhandar's Right Claw">Eskhandar's Right Claw</option>
    <option value="R14 Claw">R14 Claw</option>
    <option value="Lefty's Brass Knuckle">Lefty's Brass Knuckle</option>
    <option value="Silithid Claw">Silithid Claw</option>
    <option value="Willey's Back Scratcher">Willey's Back Scratcher</option>`,

    "Maces": `<option value="Anubisath Warhammer">Anubisath Warhammer</option>
    <option value="Blessed Qiraji War Hammer">Blessed Qiraji War Hammer</option>
    <option value="Ebon Hand">Ebon Hand</option>
    <option value="Empyrean Demolisher">Empyrean Demolisher</option>
    <option value="Ironfoe">Ironfoe</option>
    <option value="Hammer of Bestial Fury">Hammer of Bestial Fury</option>
    <option value="R14 Hammer">R14 Hammer</option>
    <option value="Mass of McGowan">Mass of McGowan</option>
    <option value="Misplaced Servo Arm">Misplaced Servo Arm</option>
    <option value="Persuader">Persuader</option>
    <option value="Sand Polished Hammer">Sand Polished Hammer</option>
    <option value="Sceptre of Smiting">Sceptre of Smiting</option>
    <option value="Spineshatter">Spineshatter</option>
    <option value="Stormstrike Hammer">Stormstrike Hammer</option>
    <option value="The Castigator">The Castigator</option>
    <option value="Timeworn Mace">Timeworn Mace</option>`,

    "Swords": `<option value="Ancient Qiraji Ripper">Ancient Qiraji Ripper</option>
    <option value="Blackguard">Blackguard</option>
    <option value="Bloodlord's Defender">Bloodlord's Defender</option>
    <option value="Brutality Blade">Brutality Blade</option>
    <option value="Cho'Rush's Blade">Cho'Rush's Blade</option>
    <option value="Chromatically Tempered Sword">Chromatically Tempered Sword</option>
    <option value="Cold Forged Blade">Cold Forged Blade</option>
    <option value="Dal'Rend's Sacred Charge">Dal'Rend's Sacred Charge</option>
    <option value="Dal'Rend's Tribal Guardian">Dal'Rend's Tribal Guardian</option>
    <option value="Dark Iron Reaver">Dark Iron Reaver</option>
    <option value="Fiery Retributor">Fiery Retributor</option>
    <option value="Gressil, Dawn of Ruin">Gressil, Dawn of Ruin</option>
    <option value="Iblis, Blade of the Fallen Seraph">Iblis, Blade of the Fallen Seraph</option>
    <option value="Krol Blade">Krol Blade</option>
    <option value="Lord General's Sword">Lord General's Sword</option>
    <option value="Maladath">Maladath</option>
    <option value="Mirah's song">Mirah's song</option>
    <option value="Nightmare Blade">Nightmare Blade</option>
    <option value="Quel'Serrar">Quel'Serrar</option>
    <option value="R14 Longsword">R14 Longsword</option>
    <option value="R14 Swift Blade">R14 Swift Blade</option>
    <option value="Ravencrest's Legacy">Ravencrest's Legacy</option>
    <option value="Ravenholdt Slicer">Ravenholdt Slicer</option>
    <option value="Skullforge Reaver">Skullforge Reaver</option>
    <option value="Sword of Zeal">Sword of Zeal</option>
    <option value="Zulian Slicer">Zulian Slicer</option>
    <option value="The Hungering Cold">The Hungering Cold</option>
    <option value="Thunderfury">Thunderfury</option>
    <option value="Warblade of the Hakkari (MH)">Warblade of the Hakkari (MH)</option>
    <option value="Warblade of the Hakkari (OH)">Warblade of the Hakkari (OH)</option>
    <option value="Widow's Remorse">Widow's Remorse</option>
    <option value="Vis'kag the Bloodletter">Vis'kag the Bloodletter</option>`,
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
    if(doUpdateStats) updateStats();
}


function updateStats()
{
    // Boss Settings
    _debuffDelay = Number(document.querySelector("#debuffdelay").value)

    // Calc Settings
    _iterations = Number(document.querySelector("#iterations").value)
    _simDuration = Math.round(Math.ceil(Number(document.querySelector("#fightLength").value)*2.5)*4)/10
    _breakpointValue = Number(document.querySelector("#TBPvalue").value)
    _breakpointTime = Number(document.querySelector("#TBPtime").value)
    _breakpointTime = Math.round(_breakpointTime*1000/_timeStep)*_timeStep;

    // Tank Settings
    _startRage = Number(document.querySelector("#startRage").value)
    _deathwish = document.querySelector("#deathwish").checked
    _windfury = document.querySelector("#windfury").checked
    _wcb = document.querySelector("#wcb").checked
    _dmf = document.querySelector("#dmf").checked
    let _goa = document.getElementById("goa").checked
    let _dualWield = document.querySelector("#ohweptypelist").value == 'Shields' ? false : true

    // Talents 
    let deflection = Number(document.getElementById("deflection").value)
    let cruelty = Number(document.getElementById("cruelty").value)
    let anticipation = Number(document.getElementById("anticipation").value)
    let toughness = Number(document.getElementById("toughness").value)
    _impHS = Number(document.getElementById("impHS").value) 
    _impSA = Number(document.getElementById("impSA").value) 
    _defiance = Number(document.getElementById("defiance").value) 
    _impale = Number(document.getElementById("impale").value) 
    _dwspec = Number(document.getElementById("dwspec").value) 

    // Other Bonuses
    _twoPieceDreadnaught = document.querySelector("#twoPieceDreadnaught").checked
    _fivePieceWrath = document.querySelector("#fivePieceWrath").checked
    let threatenchant = document.getElementById("handenchant").value == "Threat";
    _berserking = document.getElementById("berserking").checked


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

    let gear;
    if (_dualWield) {
        gear = [
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
            weapons[offhand],
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
        ]
    }
    else {
        gear = [
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
            shields[offhand],
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
        ]        
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
    let extrahp = 1509; // Base hp for all races

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

    let mhwepskill = 300;
    let ohwepskill = _dualWield ? 300 : 0;
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
    mhmin += mhstone == "Dense" ? 8 : 0;
    mhmax += mhstone == "Dense" ? 8 : 0;

    let ohstone = document.getElementById("ohstone").value
    if (_dualWield) {
        crit += ohstone == "Elemental" ? 2 : 0;
        attackpower += ohstone == "Consecrated" ? 100 : 0;
        ohmin += ohstone == "Dense" ? 8 : 0;
        ohmax += ohstone == "Dense" ? 8 : 0;
    }

    strength += Number(document.getElementById("strbuff").value)
    agility += document.getElementById("agibuff").value == "Elixir of the Mongoose" ? 25 : 0;
    agility += document.getElementById("agibuff").value == "Elixir of Greater Agility" ? 25 : 0;
    crit += document.getElementById("agibuff").value == "Elixir of the Mongoose" ? 2 : 0;
    attackpower += Number(document.getElementById("apbuff").value)

    let statbuff = document.getElementById("statbuff").value
    agility += statbuff == "Ground Scorpok Assay" ? 25 : 0;
    strength += statbuff == "R.O.I.D.S." ? 25 : 0;
    stamina += statbuff == "Spirit of Zanza" ? 50 : 0;

    let foodbuff = document.getElementById("foodbuff").value
    strength += foodbuff == "Smoked Desert Dumplings" ? 25 : 0;
    strength += foodbuff == "Blessed Sunfruit" ? 10 : 0;
    agility += foodbuff == "Grilled Squid" ? 10 : 0;
    stamina += foodbuff == "Dirge's Kickin' Chimaerok Chops" ? 25 : 0;
    stamina += foodbuff == "Tender Wolf Steak" ? 12 : 0;
    
    stamina += Number(document.getElementById("alcohol").value);

    if(document.getElementById("potion").value == "Mighty Rage") {
        _startRage = Math.min(100, _startRage + 45 + Math.random()*30);
        _mrp = true;
    }

    extrahp += document.getElementById("hpelixir").checked ? 120 : 0;
    extrahp += document.getElementById("titans").checked ? 1200 : 0;
    extrahp += document.getElementById("chestenchant").value == "Major Health" ? 100 : 0;
    extrahp += _wcb ? 300 : 0;

    crit += document.getElementById("pack").checked ? 3 : 0;
    attackpower += document.getElementById("trueshot").checked ? 100 : 0;

    let mark = document.getElementById("mark").checked; // Assumed to be improved
    stamina += mark ? 16 : 0;
    agility += mark ? 16 : 0;
    strength += mark ? 16 : 0;
    attackpower += document.getElementById("might").checked ? 222 : 0; // Assumed improved
    attackpower += document.getElementById("bshout").checked ? 290 : 0; // Assumed improved

    stamina += document.getElementById("fortitude").checked ? 70 : 0; // Assumed improved
    stamina += document.getElementById("bloodpact").checked ? 42 : 0;
    
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

    strength += document.getElementById("strofearth").checked ? 77 : 0;
    agility += document.getElementById("graceofair").checked ? 77 : 0;
    _windfuryAP = document.getElementById("impweptotems").checked ? 410 : 315;
    
    // Stat deltas input by user
    let extrastrength = Number(document.getElementById("playerextrastrength").value);
    let extrastamina = Number(document.getElementById("playerextrastamina").value);
    let extraagility = Number(document.getElementById("playerextraagility").value);
    let extrahit = Number(document.getElementById("playerextrahit").value);
    let extracrit = Number(document.getElementById("playerextracrit").value);
    let extraattackpower = Number(document.getElementById("playerextraattackpower").value);
    let extraarmor = Number(document.getElementById("playerextraarmor").value);
    let extraparry = Number(document.getElementById("playerextraparry").value);
    let extradodge = Number(document.getElementById("playerextradodge").value);
    let extradefense = Number(document.getElementById("playerextradefense").value);
    let extramhskill = Number(document.getElementById("playerextramhskill").value);
    let extraohskill = Number(document.getElementById("playerextraohskill").value);

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
    armor += document.getElementById("devo").checked ? Math.floor(918.75) : 0; // Assumed improved
    armor += document.getElementById("armorelixir").checked ? 450 : 0;
    armor += mark ? Math.floor(384.75) : 0;

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

    document.getElementById("playerhp").innerHTML = `${Math.round((stamina*10 + extrahp)*(document.getElementById("race").value == "Tauren" ? 1.05 : 1))}              `;
    document.getElementById("playerstrength").innerHTML = `${Math.round(strength)} `;
    document.getElementById("playerstamina").innerHTML = `${Math.round(stamina)} `;
    document.getElementById("playeragility").innerHTML = `${Math.round(agility)} `;
    document.getElementById("playerhit").innerHTML = `${hit} `;
    document.getElementById("playercrit").innerHTML = `${Math.round((crit + cruelty + agility/20 + (mhwepskill-300)*0.04)*10)/10} `;
    document.getElementById("playerattackpower").innerHTML = `${Math.round(attackpower + strength*2)} `;
    document.getElementById("playerarmor").innerHTML = `${Math.round(armor)} `;
    document.getElementById("playerparry").innerHTML = `${Math.round((parry + 5 + deflection + defense*0.04)*100)/100} `;
    document.getElementById("playerdodge").innerHTML = `${Math.round((dodge + agility/20 + defense*0.04)*100)/100} `;
    document.getElementById("playerdefense").innerHTML = `${defense + 300} `;
    document.getElementById("playermhskill").innerHTML = `${mhwepskill} `;
    document.getElementById("playerohskill").innerHTML = `${ohwepskill} `;

    // Add stat deltas to stats, note str/ap interaaction not accounted for.
    strength += extrastrength;
    stamina += extrastamina;
    agility += extraagility;
    hit += extrahit;
    crit += extracrit;
    attackpower += extraattackpower;
    armor += extraarmor;
    parry += extraparry;
    dodge += extradodge;
    defense += extradefense;
    mhwepskill += extramhskill;
    ohwepskill += extraohskill;

    // Tank Settings
    _crusaderMH = mhwepenchant == "Crusader";
    _crusaderOH = ohwepenchant == "Crusader";

    // Weapons
    _thunderfuryMH = mainhand == "Thunderfury";
    _thunderfuryOH = offhand == "Thunderfury";
    _edMH = mainhand == "Empyrean Demolisher";
    _edOH = offhand == "Empyrean Demolisher";
    _qsMH = mainhand == "Quel'Serrar";
    _perdsMH = mainhand == "Perdition's Blade";
    _perdsOH = offhand == "Perdition's Blade";
    _dbMH = mainhand == "Deathbringer";
    _dbOH = offhand == "Deathbringer";
    _eskMH = mainhand == "Eskhandar's Right Claw";
    _msaMH = mainhand == "Misplaced Servo Arm";
    _msaOH = offhand == "Misplaced Servo Arm";

    // Trinkets
    _kots = (trinketone == "Kiss of the Spider") || (trinkettwo == "Kiss of the Spider")
    _earthstrike = (trinketone == "Earthstrike") || (trinkettwo == "Earthstrike")
    _diamondflask = (trinketone == "Diamond Flask") || (trinkettwo == "Diamond Flask")
    _jomgabbar = (trinketone == "Jom Gabbar") || (trinkettwo == "Jom Gabbar")
    _slayerscrest = (trinketone == "Slayer's Crest") || (trinkettwo == "Slayer's Crest")
    _hoj = (trinketone == "Hand of Justice") || (trinkettwo == "Hand of Justice")


    _config = {
        tankStats: new StaticStats({
            type: "tank",
            level: 60,

            dualWield: _dualWield,

            MHMin: mhmin,
            MHMax: mhmax,
            MHSwing: mhswing,

            OHMin: _dualWield ? ohmin : 0,
            OHMax: _dualWield ? ohmax : 0,
            OHSwing: _dualWield ? ohswing : 0,

            MHWepSkill: mhwepskill,
            OHWepSkill: _dualWield ? ohwepskill : 0,
            damageMod: _dmf ? 0.99 : 0.9, // Defensive Stance + dmf
            hastePerc: _wcb ? 15 : 0, 
            AP: strength*2 + attackpower,
            crit: agility/20 + crit, // TODO: add wepskill
            spellcrit: spellcrit,
            hit: hit,
            
            parry: parry + 5, // TODO talents, defense, check formula
            dodge: agility/20 + dodge, // TODO: talents, defense
            block: block + 5, // TODO talents, defense, check formula
            blockValue: blockvalue,
            defense: 300 + defense, // TODO: talents
            baseArmor: agility*2 + armor, // TODO: talents
            baseHealth: stamina*10, // TODO: basehealth

            threatMod: 1.3 * (1 + 0.03*_defiance) * (threatenchant ? 1.02 : 1),
            critMod: 2 + _impale*0.1,
            startRage: _startRage,

            twoPieceDreadnaught: _twoPieceDreadnaught,
            fivePieceWrath: _fivePieceWrath,

            staminaMultiplier: staminaMultiplier,
            strengthMultiplier: strengthMultiplier,
            agilityMultiplier: agilityMultiplier,

        }),

        bossStats: new StaticStats({
            type: "boss",
            level: 63,

            MHMin: Number(document.querySelector("#swingMin").value),
            MHMax: Number(document.querySelector("#swingMax").value),
            MHSwing: Number(document.querySelector("#swingTimer").value)*1000,

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
            baseArmor: Number(document.querySelector("#bossarmor").value),

            critMod: 2,
            threatMod: 0,
            startRage: 0,
        }),
        debuffDelay: _debuffDelay*1000, // seconds -> ms
        goa: _goa,
    }
}


class StaticStats {
    constructor(stats) {
        this.type = stats.type;
        this.level = stats.level;

        this.dualWield = stats.dualWield;

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
        this.spellcrit = stats.spellcrit;
        this.AP = stats.AP;
        this.blockValue = stats.blockValue;
        this.hit = stats.hit;

        this.parry = stats.parry;
        this.dodge = stats.dodge;
        this.block = stats.block;
        this.defense = stats.defense;
        this.baseArmor = stats.baseArmor;
        this.baseHealth = stats.baseHealth;

        this.critMod = stats.critMod;
        this.threatMod = stats.threatMod;
        this.startRage = stats.startRage;

        this.twoPieceDreadnaught = stats.twoPieceDreadnaught;
        this.fivePieceWrath = stats.fivePieceWrath;
        this.threatenchant = stats.threatenchant;

        this.staminaMultiplier = stats.staminaMultiplier;
        this.strengthMultiplier = stats.strengthMultiplier;
        this.agilityMultiplier = stats.agilityMultiplier;
    }
}
