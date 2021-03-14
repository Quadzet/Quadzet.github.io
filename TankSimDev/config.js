"use strict";

/*  TODOS 
<option value="Felstriker">Felstriker</option>
<option value="Arlokk's Grasp">Arlokk's Grasp</option>
<option value="Thekal's Grasp">Thekal's Grasp</option>
<option value="Eskhandar's Left Claw">Eskhandar's Left Claw</option>
<option value="Teebu's Blazing Longsword">Teebu's Blazing Longsword</option>
*/

let weaponlists = {
    "Shields": `
    <option value="Aegis of the Blood God">Aegis of the Blood God</option>
    <option value="Blessed Qiraji Bulwark">Blessed Qiraji Bulwark</option>
    <option value="Buru's Skull Fragment">Buru's Skull Fragment</option>
    <option value="Draconian Deflector">Draconian Deflector</option>
    <option value="Drillborer Disk">Drillborer Disk</option>
    <option value="Earthen Guard">Earthen Guard</option>
    <option value="Elementium Reinforced Bulwark">Elementium Reinforced Bulwark</option>
    <option value="Grand Marshal's Aegis">Grand Marshal's Aegis</option>
    <option value="High Warlord's Shield Wall">High Warlord's Shield Wall</option>
    <option value="Stygian Buckler">Stygian Buckler</option>
    <option value="The Face of Death">The Face of Death</option>
    <option value="The Immovable Object">The Immovable Object</option>
    <option value="The Plague Bearer">The Plague Bearer</option>`,
    
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

let ohenchantlist = {
    weapon: `<option value="None">None</option>
        <option value="Agility">Agility</option>
        <option value="Crusader">Crusader</option>
        <option value="Strength">Strength</option>`,

    shield: `<option value="None">None</option>
        <option value="Greater Stamina">Greater Stamina</option>`,
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


function updateStats()
{
    // Gear
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

    let _startRage = Number(document.querySelector("#startRage").value);
    let _mrp = false;
    if(document.getElementById("potion").value == "Mighty Rage") {
        _startRage = Math.min(100, _startRage + 45 + Math.random()*30);
        _mrp = true;
    }

    extrahp += document.getElementById("hpelixir").checked ? 120 : 0;
    extrahp += document.getElementById("titans").checked ? 1200 : 0;
    extrahp += document.getElementById("chestenchant").value == "Major Health" ? 100 : 0;
    extrahp += legenchant == "Libram of Constitution" ? 100 : 0;
    extrahp += headenchant == "Libram of Constitution" ? 100 : 0;
    let _wcb = document.querySelector("#wcb").checked;
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
    console.log(`${extraagility}, ${agilityMultiplier}`)
    console.log(`${extrastrength}, ${strengthMultiplier}`)

    extraarmor *= document.getElementById("inspiration").checked ? 1.25 : 1;
    extraarmor *= document.getElementById("imploh").checked ? 1.3 : 1;

    agility = Math.floor(agility)
    strength = Math.floor(strength)
    stamina = Math.floor(stamina)

    crit = crit + cruelty + agility/20 + (mhwepskill-300)*0.04

    parry += 5 + deflection + defense*0.04
    dodge += agility/20 + defense*0.04
    block += shieldspec + 5 + defense*0.04
    blockvalue += strength/20

    block = _dualWield ? 0 : block
    blockvalue = _dualWield ? 0 : blockvalue

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
    document.getElementById("playerdefense").innerHTML = `${defense + 300} `;
    document.getElementById("playermhskill").innerHTML = `${mhwepskill} `;
    document.getElementById("playerohskill").innerHTML = `${ohwepskill} `;

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
    blockvalue += extrablockvalue + extrastrength;
    mhwepskill += extramhskill;
    ohwepskill += extraohskill;

    
    let globals = {
        tankStats: {
            type: "tank",
            level: 60,

            dualWield: _dualWield,

            MHMin: mhmin,
            MHMax: mhmax,
            MHSwing: mhswing,
            
            OHMin: ohmin,
            OHMax: ohmax,
            OHSwing: ohswing,
            
            MHWepSkill: mhwepskill,
            OHWepSkill: _dualWield ? ohwepskill : 0,
            damageMod: document.querySelector("#dmf").checked ? 0.99 : 0.9, // Defensive Stance + dmf
            physDmgMod: 1 + 0.02*Number(document.getElementById("1hspec").value), // passive phys damage mods
            hastePerc: _wcb ? 15 : 0, 
            AP: attackpower + strength*2,
            crit: crit,
            spellcrit: spellcrit,
            hit: hit,
            
            parry: parry,
            dodge: dodge,
            block: block,
            blockValue: blockvalue,
            defense: 300 + defense,
            baseArmor: armor,
            baseHealth: (stamina*10 + extrahp)*(document.getElementById("race").value == "Tauren" ? 1.05 : 1),
            
            threatMod: 1.3 * (1 + 0.03*defiance) * (document.getElementById("handenchant").value == "Threat" ? 1.02 : 1),
            critMod: 2 + impale*0.1,

            startRage: _startRage,
            bshouttargets: Number(document.getElementById("bshouttargets").value),

            staminaMultiplier: staminaMultiplier,
            strengthMultiplier: strengthMultiplier,
            agilityMultiplier: agilityMultiplier,

            talents: {
                deathwish: document.getElementById("deathwish").checked,
                bloodthirst: document.getElementById("bloodthirst").checked,
                shieldslam: document.getElementById("shieldslam").checked,
                flurry: Number(document.getElementById("flurry").value),
                enrage: Number(document.getElementById("enrage").value),
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
                twoPieceDreadnaught: document.querySelector("#twoPieceDreadnaught").checked,
                threePieceConqueror: document.getElementById("threePieceConqueror").checked,
                fivePieceWrath: document.querySelector("#fivePieceWrath").checked,
                threatenchant: document.getElementById("handenchant").value == "Threat",
                berserking: document.getElementById("berserking").checked,
                goa: document.getElementById("goa").checked,

                windfury: document.querySelector("#windfury").checked,
                wcb: _wcb,
                dmf: document.querySelector("#dmf").checked,
                crusaderMH: mhwepenchant == "Crusader",
                crusaderOH: ohwepenchant == "Crusader",
                windfuryAP: document.getElementById("impweptotems").checked ? 410 : 315,
                mrp: _mrp,
            }
            
        },
        
        bossStats: {
            type: "boss",
            level: 63,
            
            MHMin: Number(document.querySelector("#swingMin").value),
            MHMax: Number(document.querySelector("#swingMax").value),
            MHSwing: Number(document.querySelector("#swingTimer").value)*1000,
            
            MHWepSkill: 315,
            damageMod: 0.9, // Defensive Stance
            physDmgMod: 1,
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
        },
        // Calc Settings and other globals
        config: {
            landedHits: ["hit", "crit", "block", "crit block", "glance"],
            timeStep: 25, // Timestep used for each fight
            simDuration: Math.round(Math.ceil(Number(document.querySelector("#fightLength").value)*2.5)*4)/10, // Fight duration in seconds
            iterations:  Number(document.querySelector("#iterations").value), // Number of fights simulated
            snapshotLen: 400, // By god given
            breakpointValue:  Number(document.querySelector("#TBPvalue").value),
            breakpointTime: Math.round(Number(document.querySelector("#TBPtime").value)*1000/25)*25,

            CoR: document.querySelector("#curseofrecklessness").checked,
            IEA: document.querySelector("#iea").checked,
            faerieFire: document.querySelector("#faeriefire").checked,
            debuffDelay: Number(document.querySelector("#debuffdelay").value)*1000,
            ieadelay: Number(document.querySelector("#ieadelay").value)*1000,
        },
    }
    return globals;
}