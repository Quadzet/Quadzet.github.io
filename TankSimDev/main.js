"use strict";

import { BUFF_DATA, DEBUFF_DATA, WORLD_BUFF_DATA, CONSUMES_DATA, OH_BUFF_DATA } from './buffs.js';
import { ITEM_SLOTS, ABILITIES, ENCHANT_SLOTS,  BUFFS, TANK_SETTINGS, BOSS_SETTINGS } from './constants.js';
import { LOG_LEVEL, log_message } from './logging.js';
import { formatEvent } from './eventHelpFuncs.js';
import { createTalentTrees, loadTalents, getTalents, selectTalent, deselectTalent } from './talents.js';
import { updateStats } from './config.js';
import { loadItemData } from './loadData.js'
import { generateGearList, selectItem, selectEnchant, createGearRows, showEnchantDropdown, hideEnchantDropdown, showItemDropdown, hideItemDropdown } from './gear.js'
import { refreshLinks } from './wowhead.js'
import { updateRotation } from './rotation.js'

function sleep(ms) {
  return new Promise((r) =>
    setTimeout(r, ms));
}

function average(array) {
  if (array) return array.reduce((a, b) => a + b) / array.length;
  else return 0;
};

// sample standard deviation
const std = (arr) => {
  const mu = average(arr);
  const diffArr = arr.map(a => (a - mu) ** 2);
  return Math.sqrt(diffArr.reduce((a, b) => a + b) / (arr.length - 1));
};

// Fill the progressbar
async function updateProgressbar(progressPerc) {
  document.querySelector("#progressBar").style.width = `${progressPerc}%`;
  await sleep(0);
}

export function toggleAura(event, id, exclusives) {
  event.preventDefault();
  const element = document.getElementById(id + '-aura-img');
  element.classList.toggle('aura-toggle-active');
  if (exclusives != null && element.classList.contains('aura-toggle-active')) {
    exclusives.forEach(name => {
      var exElement = document.getElementById(name + '-aura-img');
      exElement.classList.remove('aura-toggle-active');
    });
  }
  let globals = updateStats();
  updateRotation(globals);
}

function addEventListeners() {
  ITEM_SLOTS.forEach(slot => {
    const element = document.getElementById(slot + '-slot');
    element.addEventListener('click', function(event) {
      event.preventDefault();
    })
  });
  ENCHANT_SLOTS.forEach(slot => {
    const element = document.getElementById(slot + '-enchant');
    element.addEventListener('click', function(event) {
      event.preventDefault();
    })
  });

  document.body.addEventListener('click', function(event) {
    // Check if the clicked element is not part of the dropdown
    // if (!event.target.closest('.gear-slot')) {
    if (!event.target.closest('.dropdown-content')) {
      ITEM_SLOTS.forEach(slot => {
        hideItemDropdown(slot);
      });
      ENCHANT_SLOTS.forEach(slot => {
        hideEnchantDropdown(slot);
      });
    }
  });
  window.addEventListener('click', function(event) {
    const element = document.getElementById('profiles')
    if (event.target === element) {
      hideProfiles();
    }
  })
}

function get_index(buff, level) {
  let ix = -1;
  for (let i = 0; i < buff['levels'].length; i++) {
    if (buff['levels'][i] < level)
      ix = i
    else
      break
  }
  return ix
}

function createAuraRow(data, level) {
  let aura_row = ''
  Object.keys(data).forEach(buff => {
    let ix = get_index(data[`${buff}`], level)

    let type = data[`${buff}`]['type'].toLowerCase()
    let id = data[`${buff}`]['ids'][ix]
    aura_row += `
          <div class="aura-toggle" id="${data}-aura">
            <a href="https://classic.wowhead.com/${type}=${id}" data-wh-rename-link="false" onclick="toggleAura(event, '${buff}')">
              <img class="aura-toggle-default" src="img/${buff}.jpg" id="${buff}-aura-img" active="false">
            </a>
          </div>`
  })
  return aura_row
}

function createAuraRows() {
  let level = document.getElementById("player-level").value

  let element = document.getElementById("aura-row-buffs")
  element.innerHTML = createAuraRow(BUFF_DATA, level)

  element = document.getElementById("aura-row-oh-wep-buffs")
  element.innerHTML = createAuraRow(OH_BUFF_DATA, level)

  element = document.getElementById("aura-row-consumes")
  element.innerHTML = createAuraRow(CONSUMES_DATA, level)

  element = document.getElementById("aura-row-world-buffs")
  element.innerHTML = createAuraRow(WORLD_BUFF_DATA, level)

  element = document.getElementById("aura-row-debuffs")
  element.innerHTML = createAuraRow(DEBUFF_DATA, level)
}

// TODO: Remove
function createLinks() {
  refreshLinks();
}

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

  // Rotation
  let rotation = {};
  ABILITIES.forEach(ability => {
    let obj = {};
    let use = document.getElementById('use-' + ability).checked;
    let rage = 0;
    if ('death-wish' != ability)
      rage = Number(document.getElementById(ability + '-rage').value);
    obj.use = use;
    obj.rage = rage;
    rotation[`${ability}`] = obj;
  });
  profile.rotation = rotation;

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
  let buffs = {};
  BUFFS.forEach(buff => {
    let element = document.getElementById(`${buff}-aura-img`);
    buffs[`${buff}`] = element.classList.contains('aura-toggle-active');
  });
  profile.buffs = buffs;

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

function saveInput() {
  let profile_name = "Default"; // TODO: Turn into user input
  let profiles = localStorage.getItem("fresh_profiles");
  profiles = profiles ? JSON.parse(profiles) : {};
  let profile = generateProfile();
  profiles[`${profile_name}`] = profile;
  localStorage.setItem("fresh_profiles", JSON.stringify(profiles));
}

function loadProfile(profile) {
  const DEFAULT_PROFILE = { "version": "1.0.0", "gear": { "head": "22418", "hands": "21581", "neck": "22732", "waist": "22422", "shoulder": "22419", "legs": "22417", "back": "23045", "feet": "22420", "chest": "22416", "wrist": "22423", "finger1": "23059", "finger2": "19376", "trinket1": 0, "trinket2": 0, "mainhand": "23054", "offhand": "236336", "ranged": "236322" }, "rotation": { "slam": { "use": false, "rage": 60 }, "death-wish": { "use": false, "rage": 0 }, "revenge": { "use": true, "rage": 60 }, "raging-blow": { "use": false, "rage": 0 }, "rend": { "use": false, "rage": 60 }, "devastate": { "use": false, "rage": 70 }, "heroic-strike": { "use": false, "rage": 85 }, "shield-block": { "use": false, "rage": 90 }, "shield-slam": { "use": true, "rage": 60 }, "bloodthirst": { "use": false, "rage": 60 }, "quick-strike": { "use": false, "rage": 60 }, "mortal-strike": { "use": false, "rage": 60 }, "thunder-clap": { "use": false, "rage": 60 }, "cbrUse": false, "cbrStacks": 0 }, "tankSettings": { "level": 50, "race-ix": 0, "startRage": "70" }, "enchants": { "head-enchant-id": 0, "shoulder-enchant-id": 0, "back-enchant-id": 0, "chest-enchant-id": 0, "wrist-enchant-id": 0, "hands-enchant-id": 0, "legs-enchant-id": 0, "feet-enchant-id": 0, "mainhand-enchant-id": 0, "offhand-enchant-id": 0 }, "talents": { "cruelty": 2, "shield-specialization": 5, "improved-bloodrage": 2, "toughness": 5, "last-stand": 1, "improved-shield-block": 1, "improved-revenge": 3, "defiance": 5, "improved-sunder-armor": 3, "concussion-blow": 1, "one-handed-specialization": 5, "shield-slam": 1 }, "buffs": { "battleshout": false, "motw": false, "kings": false, "might": false, "horn": false, "strtotem": false, "fort": false, "bloodpact": false, "devo": false, "loh": false, "inspiration": false, "defense": false, "fort-elixir": false, "shadow-oil": false, "rumsey": false, "oh-shadow-oil": false, "dmf": false, "wcb": false, "zandalar": false, "dragonslayer": false, "moldar": false, "fengus": false, "slipkik": false, "songflower": false, "sunder": false, "iea": false, "faeriefire": false, "cor": false, "agi": false, "giants": false, "dark-desire": false, "stam-food": false, "str-scroll": false, "leader": false, "trueshot": false }, "bossSettings": { "bossLevel": 0, "swingMax": "4000", "swingMin": "4000", "swingTimer": "2", "bossArmor": "3731" }, "calcSettings": { "iterations": "10000", "fightLength": "20" } };
  profile = profile == null ? DEFAULT_PROFILE : profile;

  // Deprecated with the addition of default json profile
  let defaultGear = {
    'head': 211505,
    'hands': 209568,
    'neck': 209673,
    'waist': 211457,
    'shoulder': 209692,
    'legs': 209566,
    'back': 213087,
    'feet': 209581,
    'chest': 210794,
    'wrist': 211463,
    'finger1': 209565,
    'finger2': 2933,
    'trinket1': 211449,
    'trinket2': 21568,
    'mainhand': 209525,
    'offhand': 209424,
    'ranged': 209688,
  };
  let gear = profile.gear ? profile.gear : {};
  // TODO: Just use GEARSLOTS list? [sic]
  Object.keys(defaultGear).forEach(slot => {
    let element = document.getElementById(slot + '-slot');
    let itemID = gear[`${slot}`] !== undefined ? gear[`${slot}`] : defaultGear[`${slot}`];
    if (element) {
      element.setAttribute('itemid', itemID); // Update the HTML
      selectItem(itemID, slot); // Update the UI
      refreshLinks();
    }
  });

  let rotation = profile.rotation ? profile.rotation : {};
  ABILITIES.forEach(ability => {
    let abilityUse = document.getElementById('use-' + ability);
    let abilityRage = document.getElementById(ability + '-rage');
    let abilitySettings = rotation[`${ability}`] ? rotation[`${ability}`] : {};
    if (!["rend", "shield-block"].includes(ability))
      abilityUse.checked = abilitySettings.use === undefined ? true : abilitySettings.use; // Default to true
    else
      abilityUse.checked = abilitySettings.use === undefined ? false : abilitySettings.use; // Default to false
    if (!['raging-blow', 'death-wish'].includes(ability) && abilitySettings.rage !== undefined)
      abilityRage.value = abilitySettings.rage;
  });

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
      refreshLinks();
    }
  });

  // Talents 
  let talents = profile.talents == null ? {} : profile.talents;
  loadTalents(talents);

  // Buffs
  let buffs = profile.buffs == null ? {} : profile.buffs;
  BUFFS.forEach(buff => {
    let element = document.getElementById(`${buff}-aura-img`);
    element.classList.remove('aura-toggle-active');
    if (buffs[`${buff}`])
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
}

function loadLocalstorage() {
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

function processJson() {
  try {
    const jsonInput = document.getElementById('jsonInput').value;
    const parsedJson = JSON.parse(jsonInput);
    loadProfile(parsedJson);
    let globals = updateStats();
    updateRotation(globals);
  } catch (error) {
    alert('Invalid JSON format. Please check your input.');
  }
}


function copyToClipboard() {
  let profile = generateProfile();
  const tempInput = document.createElement('input');
  tempInput.value = JSON.stringify(profile);
  document.body.appendChild(tempInput);
  tempInput.select();
  document.execCommand('copy');
  document.body.removeChild(tempInput);
  alert('JSON copied to clipboard!');
}

const SECTIONS = ['gear', 'settings', 'results'];
function changeSection(id) {
  SECTIONS.forEach(section => {
    document.getElementById(section).style.display = 'none';
  });
  document.getElementById(id).style.display = 'flex';
}

function showProfiles(event) {
  event.stopPropagation();
  const element = document.getElementById('profiles');
  element.style.display = 'block';
}

function hideProfiles() {
  const element = document.getElementById('profiles');
  element.style.display = 'none';
}

function enableCalc() {
  document.getElementById("calcBtn").disabled = false;
}

function disableCalc() {
  document.getElementById("calcBtn").disabled = true;
}

async function onLoadPage() {
  disableCalc();
  createGearRows();
  createAuraRows()
  createLinks();
  addEventListeners();
  createTalentTrees();
  await loadItemData();
  loadLocalstorage();
  let globals = updateStats();
  updateRotation(globals);
  enableCalc();
}

async function main() {

  // Cache the user input locally
  saveInput();
  // Fetch and set all user input settings
  //fetchSettings()
  const globals = updateStats();

  document.getElementById("errorContainer").innerHTML = ""
  if (globals.config.iterations == 0 || globals.config.simDuration == 0) {
    enableCalc();
    return;
  }

  let start = Date.now()
  let results = {};
  let uptimes = {};
  let tps = []
  let dps = []
  let dtps = []
  let auras = {};
  let rageGained = []
  let rageSpent = []
  let snapshots = []
  let breaches = 0
  let bossSwings = 0;
  let exampleEvents = []

  updateProgressbar(0)
  document.querySelector("#progressBar").style.display = `block`;
  document.querySelector("#barContainer").style.display = `block`;
  let numWorkers = window.navigator.hardwareConcurrency;
  let remainderIterations = globals.config.iterations - Math.floor(globals.config.iterations / numWorkers) * numWorkers
  let numWorkersDone = 0;
  let progressPerc = 0;
  for (var i = 0; i < numWorkers; i++) {
    var worker = new Worker('./workers/worker.js', { type: 'module' });
    let iterations = i == 0 ? Math.floor(globals.config.iterations / numWorkers) + remainderIterations : Math.floor(globals.config.iterations / numWorkers);
    if (iterations <= 0) {
      numWorkersDone++;
      continue;
    }
    worker.postMessage({
      globals: globals,
      iterations: iterations,
    })
    worker.addEventListener('error', function(e) {
      log_message(LOG_LEVEL.ERROR, `Line ${e.lineno} in ${e.filename}: ${e.message}`)
    })
    worker.addEventListener('message', function(e) {
      if (e.data.type == 'progressUpdate') {
        progressPerc += e.data.progressPerc / numWorkers;
        updateProgressbar(progressPerc);
      } else {
        for (let ability in e.data.results.tpsBreakdown) {
          if (!results[`${ability}`]) results[`${ability}`] = [];
          results[`${ability}`] = results[`${ability}`].concat(e.data.results.tpsBreakdown[`${ability}`]);
        }
        tps = tps.concat(e.data.results.tps);
        dps = dps.concat(e.data.results.dps);
        dtps = dtps.concat(e.data.results.dtps);
        Object.keys(e.data.results.auras).forEach(aura => {
          let obj = auras[`${aura}`] == null ? { uptimes: [] } : auras[`${aura}`];
          obj.uptimes = obj.uptimes.concat(e.data.results.auras[`${aura}`].uptime);
          auras[`${aura}`] = obj;
        });
        if (++numWorkersDone === numWorkers) {
          exampleEvents = e.data.events
          postResults();
        }
      }
    })
  }

  function postResults() {

    let end = Date.now()
    let ret = `Calculated ${globals.config.iterations} iterations of ${globals.config.simDuration}s. fights with timestep ${globals.config.timeStep} ms using ${numWorkers} threads in ${(end - start) / 1000} seconds.`;

    let iterations = globals.config.iterations;
    // Pad the vector in case there were fight iterations where an ability was not used at all (is this really needed?)
    for (let result in results) {
      results[`${result}`] = [...Array(globals.config.iterations - results[`${result}`].length)].map((_, i) => { return { tps: 0, dps: 0, hits: 0, casts: 0 } }).concat(results[`${result}`])
    }

    let sortedResults = Object.keys(results).map(key => [key, results[key]])
    // Sort the abilities based on their average tps
    sortedResults.sort((a, b) => {
      let btps = b[1].reduce((a, b) => a += b.tps, 0);
      let atps = a[1].reduce((a, b) => a += b.tps, 0);
      return btps - atps;
    })

    let resultTable = `<table><tr><th class="table-first-col">Ability</th><th>TPS</th><th>DPS</th><th>Casts</th><th>Landed</th><th>Hit</th><th>Crit</th><th>Miss</th><th>Dodge</th><th>Parry</th><th>Block</th><th>Glance</th></tr>`;
    let totalTps = 0;
    let totalDps = 0;
    for (let i in sortedResults) {
      let result = { tps: 0, dps: 0, casts: 0, hits: 0 };
      if (sortedResults[i]) {
        result = sortedResults[i][1].reduce((accumulator, element) => {
          accumulator.tps += element.tps != null ? element.tps : 0;
          accumulator.dps += element.dps != null ? element.dps : 0;
          accumulator.casts += element.casts != null ? element.casts : 0;
          accumulator.hits += element.hits != null ? element.hits : 0;
          accumulator.crits += element.crits != null ? element.crits : 0;
          accumulator.misses += element.misses != null ? element.misses : 0;
          accumulator.dodges += element.dodges != null ? element.dodges : 0;
          accumulator.parries += element.parries != null ? element.parries : 0;
          accumulator.blocks += element.blocks != null ? element.blocks : 0;
          accumulator.glances += element.glances != null ? element.glances : 0;
          return accumulator;
        }, { tps: 0, dps: 0, hits: 0, casts: 0, crits: 0, glances: 0, misses: 0, dodges: 0, parries: 0, blocks: 0 });
      }
      resultTable = resultTable.concat(`<tr>
            <td class="table-first-col">${sortedResults[i][0]}:</td>
            <td>${(result.tps / iterations).toFixed(2)}</td>
            <td>${(result.dps / iterations).toFixed(2)}</td>
            <td>${(result.casts / iterations).toFixed(2)}</td>
            <td>${((result.hits + result.crits + result.glances + result.blocks) / iterations).toFixed(2)}</td>
            <td>${(result.hits / (result.casts) * 100).toFixed(2)}%</td>
            <td>${(result.crits / (result.casts) * 100).toFixed(2)}%</td>
            <td>${(result.misses / (result.casts) * 100).toFixed(2)}%</td>
            <td>${(result.dodges / (result.casts) * 100).toFixed(2)}%</td>
            <td>${(result.parries / (result.casts) * 100).toFixed(2)}%</td>
            <td>${(result.blocks / (result.casts) * 100).toFixed(2)}%</td>
            <td>${(result.glances / (result.casts) * 100).toFixed(2)}%</td>
          </tr>`);
      totalTps += result.tps;
      totalDps += result.dps;
    }
    resultTable = resultTable.concat(`
            <tr><td>Total:</td>
            <td>${Math.round(totalTps / iterations * 100) / 100}</td>
            <td>${Math.round(totalDps / iterations * 100) / 100}</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td></tr>`)
    resultTable = resultTable.concat(`</table>`)

    // Sort the auras based on their average uptime
    let sortedAuras = Object.keys(auras).map(key => [key, average(auras[key].uptimes)])
    sortedAuras.sort((a, b) => {
      return b[1] - a[1];
    });
    let auraTable = `<table><tr><th class="table-first-col">Aura</th><th>Uptime</th></tr>`;
    sortedAuras.forEach(vec => {
      auraTable += `<tr><td class="table-first-col">${vec[0]}</td><td>${(vec[1] * 100).toFixed(2)}%</td></tr>`;
    });
    auraTable += '</table>';

    let statsTable =
      `<table>
        <tr><th>Statistics</th><th></th><th></th></tr>
        <tr><td class="table-first-col">TPS standard deviation:</td><td>${Math.round(std(tps) * 100) / 100}</ts><td> (${Math.round(std(tps) / average(tps) * 10000) / 100}%)</td></tr>
        <tr><td class="table-first-col">DPS standard deviation:</td><td>${Math.round(std(dps) * 100) / 100}</ts><td> (${Math.round(std(dps) / average(dps) * 10000) / 100}%)</td></tr>
        </table>`

    let generalTable =
      `<table id="generalStatsTable">
        <tr><td>TPS: </td><td>${Math.round(average(tps) * 100) / 100}</td></tr>
        <tr><td>DPS: </td><td>${Math.round(average(dps) * 100) / 100}</td></tr>
        <tr><td>DTPS: </td><td>${Math.round(average(dtps) * 100) / 100}</td></tr>
        </table>
        `
    document.getElementById("generalStats").innerHTML = generalTable;
    document.getElementById("tpsTable").innerHTML = resultTable;
    document.getElementById("statistics").innerHTML = statsTable;
    document.getElementById("auraTable").innerHTML = auraTable;


    let timelineHeaderDOM = document.querySelector("#log-description")
    timelineHeaderDOM.innerHTML = `Calculated ${globals.config.iterations} iterations of ${globals.config.simDuration}s. fights using ${numWorkers} threads in ${(end - start) / 1000} seconds.`
    timelineHeaderDOM.innerHTML += "</br>"
    timelineHeaderDOM.innerHTML += "Example fight:"
    timelineHeaderDOM.innerHTML += "</br>"

    let timelineDOM = document.querySelector("#log>pre>code")
    timelineDOM.innerHTML = ""
    exampleEvents.forEach(e => {
      let eventLine = formatEvent(e);
      if (eventLine !== undefined) {
        timelineDOM.innerHTML += eventLine;
        timelineDOM.innerHTML += "</br>";
      }
    })
    document.querySelector("#progressBar").style.display = `none`;
    document.querySelector("#barContainer").style.display = `none`;
    document.querySelector("#resultContainer").style.display = `flex`;
    document.querySelector("#log").style.display = `flex`;
    enableCalc();
  }
}

async function calc() {
  disableCalc();
  await main();
}

// TODO: Use setEventHandler instead
// Attach functions to window for HTML event handlers
window.calc = calc;
window.changeSection = changeSection;
window.showProfiles = showProfiles;
window.hideProfiles = hideProfiles;
window.loadProfile = loadProfile;
window.copyToClipboard = copyToClipboard;
window.processJson = processJson;
window.selectTalent = selectTalent;
window.deselectTalent = deselectTalent;
window.updateStats = updateStats;
window.showItemDropdown = showItemDropdown;
window.showEnchantDropdown = showEnchantDropdown;
window.generateGearList = generateGearList;

function initWhenReady() {
  if (typeof window.Papa === 'undefined') {
    console.log('Waiting for Papa Parse to load...');
    setTimeout(initWhenReady, 50);
    return;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onLoadPage);
  } else {
    onLoadPage();
  }
}

initWhenReady();
