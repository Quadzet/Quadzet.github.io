"use strict";
import { ITEM_SLOTS, ENCHANT_SLOTS,
  TANK_SETTINGS, BOSS_SETTINGS } from './constants.js';
import { AURA_DATA } from './buffs.js'
import { selectItem, selectEnchant } from './gear.js'
import { loadTalents, getTalents } from './talents.js';
import { LOG_LEVEL, log_message } from './logging.js';
import { refreshLinks } from './wowhead.js'
import { updateRotation } from './rotation.js'

const DEFAULT_APL_SCRIPT = `use death_wish;
use bloodthirst;
use revenge;
use heroic_strike if player.rage > 50;
wait if bloodthirst.cooldown < 0.5;
use sunder_armor if player.rage > 60;`;

const DEFAULT_PROFILE = {
  "version": "1.0.0",
  "gear":
    { "head": "22418", "hands": "21581", "neck": "22732", "waist": "22422",
      "shoulder": "22419", "legs": "22417", "back": "23045", "feet": "22420",
      "chest": "22416", "wrist": "22423", "finger1": "23059",
      "finger2": "19376", "trinket1": 0, "trinket2": 0, "mainhand": "23054",
      "offhand": "236336", "ranged": "236322" },
  "aplScript": DEFAULT_APL_SCRIPT,
  "tankSettings": 
    { "level": 50, "race-ix": 0, "startRage": "70" },
  "enchants":
    { "head-enchant-id": 0, "shoulder-enchant-id": 0, "back-enchant-id": 0,
      "chest-enchant-id": 0, "wrist-enchant-id": 0, "hands-enchant-id": 0,
      "legs-enchant-id": 0, "feet-enchant-id": 0, "mainhand-enchant-id": 0,
      "offhand-enchant-id": 0 },
  "talents":
    { "cruelty": 2, "shield-specialization": 5, "improved-bloodrage": 2,
      "toughness": 5, "last-stand": 1, "improved-shield-block": 1,
      "improved-revenge": 3, "defiance": 5, "improved-sunder-armor": 3,
      "concussion-blow": 1, "one-handed-specialization": 5, "shield-slam": 1 },
  "buffs":
    { "battleshout": false, "motw": false, "kings": false, "might": false,
      "strtotem": false, "fort": false, "bloodpact": false, "devo": false,
      "loh": false, "inspiration": false, "defense": false,
      "fort-elixir": false, "shadow-oil": false, "rumsey": false,
      "oh-shadow-oil": false, "dmf": false, "wcb": false, "zandalar": false,
      "dragonslayer": false, "moldar": false, "fengus": false, "slipkik": false,
      "songflower": false, "sunder": false, "iea": false, "faeriefire": false,
      "cor": false, "agi-elixir": false, "giant-growth": false,
      "dark-desire": false, "stam-food": false, "str-scroll": false,
      "leader": false, "trueshot": false },
  "bossSettings":
    { "bossLevel": 0, "swingMax": "4000", "swingMin": "4000",
      "swingTimer": "2", "bossArmor": "3731" },
  "calcSettings":
    { "iterations": "10000", "fightLength": "20" }
};

function generateProfile() {
  let profile = {};
  profile.version = '1.0.0';

  // Gear
  let gear = {};
  ITEM_SLOTS.forEach(slot => {
    let element = document.getElementById(slot + '-slot');
    let itemID = element.getAttribute('itemid');
    itemID = itemID ? itemID : 0;
    gear[`${slot}`] = itemID;
  });
  profile.gear = gear;

  // APL Script
  profile.aplScript = document.getElementById('apl-script').value;

  // Tank Settings
  let tankSettings = {};
  TANK_SETTINGS.forEach(setting => {
    if (setting == "startRage" || setting == "player-level")
      tankSettings[`${setting}`] = document.getElementById(setting).value;
    else
      tankSettings[`${setting}-ix`] = document.getElementById(setting).selectedIndex;
  });
  profile.tankSettings = tankSettings;

  // Enchants
  let enchants = {};
  ENCHANT_SLOTS.forEach(slot => {
    const element = document.getElementById(slot + '-enchant');
    let enchantID = Number(element.getAttribute('enchantID'));
    enchants[`${slot}-enchant-id`] = enchantID;
  });
  profile.enchants = enchants;

  // Talents
  profile.talents = getTalents();

  // Buffs
  let auras = {};
  Object.keys(AURA_DATA).forEach(aura => {
    let element = document.getElementById(`${aura}-aura-img`);
    if (!element)
      return;
    auras[`${aura}`] = element.classList.contains('aura-toggle-active');
  });
  profile.buffs = auras;

  // Boss Settings
  let bossSettings = {};
  BOSS_SETTINGS.forEach(setting => {
    let element = document.getElementById(setting);
    if (setting == "bossLevel")
      bossSettings[`${setting}`] = element.selectedIndex;
    else if (['CoR', 'faeriefire', 'iea', 'homunculi'].includes(setting))
      bossSettings[`${setting}`] = element.checked;
    else
      bossSettings[`${setting}`] = element.value;
  });
  profile.bossSettings = bossSettings;

  // Calc Settings
  let calcSettings = {
    'iterations': document.getElementById("iterations").value,
    'fightLength': document.getElementById("fightLength").value,
  }
  profile.calcSettings = calcSettings;
  return profile;
}

export function saveInput() {
  let profile_name = "Default"; // TODO: Turn into user input
  let profiles = localStorage.getItem("fresh_profiles");
  profiles = profiles ? JSON.parse(profiles) : {};
  let profile = generateProfile();
  profiles[`${profile_name}`] = profile;
  localStorage.setItem("fresh_profiles", JSON.stringify(profiles));
}

export function loadProfile(profile) {
  profile = profile == null ? DEFAULT_PROFILE : profile;

  let gear = profile.gear ? profile.gear : {};

  ITEM_SLOTS.forEach(slot => {
    let element = document.getElementById(slot + '-slot');
    let itemID = gear[`${slot}`] !== undefined ? gear[`${slot}`] : DEFAULT_PROFILE['gear'][`${slot}`];
    if (element) {
      element.setAttribute('itemid', itemID); // Update the HTML
      selectItem(itemID, slot); // Update the UI
    }
  });

  // APL Script
  const aplScriptEl = document.getElementById('apl-script');
  if (aplScriptEl)
    aplScriptEl.value = profile.aplScript != null ? profile.aplScript : DEFAULT_APL_SCRIPT;

  // Tank Settings
  let tankSettings = profile.tankSettings == null ? {} : profile.tankSettings;
  TANK_SETTINGS.forEach(setting => {
    if (setting == 'startRage') {
      if (tankSettings[`${setting}`] != null)
        document.getElementById(setting).value = tankSettings[`${setting}`];
    } else {
      if (tankSettings[`${setting}-ix`] != null)
        document.getElementById(setting).selectedIndex = tankSettings[`${setting}-ix`];
    }
  });

  // Enchants
  let enchants = profile.enchants == null ? {} : profile.enchants;
  ENCHANT_SLOTS.forEach(enchant => {
    if (enchants[`${enchant}-enchant-id`] != null) {
      selectEnchant(enchants[`${enchant}-enchant-id`], enchant)
    }
  });

  // Talents 
  let talents = profile.talents == null ? {} : profile.talents;
  loadTalents(talents);

  // Buffs
  let buffs = profile.buffs == null ? {} : profile.buffs;
  Object.keys(AURA_DATA).forEach(aura => {
    let element = document.getElementById(`${aura}-aura-img`);
    if (!element)
      return; // Aura might be missing from DOM due to level requirements.
    element.classList.remove('aura-toggle-active');
    if (buffs[`${aura}`])
      element.classList.add('aura-toggle-active');
  });

  // Boss Settings
  let bossSettings = profile.bossSettings == null ? {} : profile.bossSettings;
  BOSS_SETTINGS.forEach(setting => {
    if (bossSettings[`${setting}`] != null) {
      if (setting == 'bossLevel')
        document.getElementById(setting).selectedIndex = bossSettings[`${setting}`];
      else
        document.getElementById(setting).value = bossSettings[`${setting}`];
    }
  });

  // Calc Settings
  let calcSettings = profile.calcSettings == null ? {} : profile.calcSettings;
  if (calcSettings.iterations != null)
    document.getElementById("iterations").value = calcSettings.iterations;
  if (calcSettings.fightLength != null)
    document.getElementById("fightLength").value = calcSettings.fightLength;
  refreshLinks();
}

export function loadLocalstorage() {
  try {
    let profiles = localStorage.getItem("fresh_profiles");
    profiles = profiles ? JSON.parse(profiles) : {};
    let profile_name = "Default"; // TODO: Make user input
    let profile = profiles[`${profile_name}`];
    loadProfile(profile);
  } catch ({ name, message }) {
    log_message(LOG_LEVEL.WARNING, "Unable to load profile: " + message + ". Loading default profile.");
    loadProfile(null);
  }
}

export function processJson() {
  try {
    const jsonInput = document.getElementById('jsonInput').value;
    const parsedJson = JSON.parse(jsonInput);
    loadProfile(parsedJson);
    let globals = updateStats();
    updateRotation(globals);
  } catch (error) {
    alert(`Error processing profile JSON: ${error}.`);
  }
}


export function copyToClipboard() {
  let profile = generateProfile();
  const tempInput = document.createElement('input');
  tempInput.value = JSON.stringify(profile);
  document.body.appendChild(tempInput);
  tempInput.select();
  document.execCommand('copy');
  document.body.removeChild(tempInput);
  alert('JSON copied to clipboard!');
}

