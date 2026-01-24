"use strict";

import { AURA_DATA } from './buffs.js';
import { ITEM_SLOTS, ENCHANT_SLOTS, BUFFS, DEBUFFS, WORLD_BUFFS, CONSUMES,
  OH_BUFFS, IMP_BUFFS } from './constants.js';
import { LOG_LEVEL, log_message } from './logging.js';
import { formatEvent } from './eventHelpFuncs.js';
import { createTalentTrees, selectTalent, deselectTalent, resetTalents } from './talents.js';
import { updateStats, getIndex } from './config.js';
import { loadItemData } from './loadData.js'
import { generateGearList, createGearRows, showEnchantDropdown,
  hideEnchantDropdown, showItemDropdown, hideItemDropdown } from './gear.js'
import { refreshLinks } from './wowhead.js'
import { updateRotation } from './rotation.js'
import { saveInput, loadProfile, loadLocalstorage, processJson,
  copyToClipboard } from './profiles.js'

function sleep(ms) {
  return new Promise((r) =>
    setTimeout(r, ms));
}

function average(array) {
  if (array) return array.reduce((a, b) => a + b) / array.length;
  else return 0;
};

const std = (arr) => {
  const mu = average(arr);
  const diffArr = arr.map(a => (a - mu) ** 2);
  return Math.sqrt(diffArr.reduce((a, b) => a + b) / (arr.length - 1));
};

async function updateProgressbar(progressPerc) {
  document.querySelector("#progressBar").style.width = `${progressPerc}%`;
  await sleep(0);
}

export function toggleAura(event, aura) {

  event.preventDefault();
  let data = AURA_DATA[`${aura}`];
  const element = document.getElementById(aura + '-aura-img');

  // TODO: If an aura (eg battle squawk) can have multiple stacks,
  // handle it with the 'value' attribute.
  element.classList.toggle('aura-toggle-active');

  // Turn off any grouped (ie exlusive) auras.
  if (data['group'] && element.classList.contains('aura-toggle-active')) {
    for (const [l_aura, l_data] of Object.entries(AURA_DATA)) {
      if (l_aura == aura)
        continue;
      if (l_data['group'] == data['group']) {
        const groupedElement = document.getElementById(l_aura + '-aura-img');
        if (groupedElement)
          groupedElement.classList.remove('aura-toggle-active');
      }
    }
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

function createAuraRow(auras, level) {
  let aura_row = '';
  auras.forEach(aura => {
    let ix = getIndex(AURA_DATA[`${aura}`], level);
    if (ix == -1)
      return; // We are too low level for this aura.

    let type = AURA_DATA[`${aura}`]['type'].toLowerCase();
    let id = AURA_DATA[`${aura}`]['ids'][ix];
    let img = aura;
    if (AURA_DATA[`${aura}`]['img'])
      img = AURA_DATA[`${aura}`]['img'][ix];

    aura_row += `
          <div class="aura-toggle" id="${aura}-aura">
            <a href="https://classic.wowhead.com/${type}=${id}" data-wh-rename-link="false" onclick="toggleAura(event, '${aura}')">
              <img class="aura-toggle-default" src="img/${img}.jpg" id="${aura}-aura-img" active="false">
            </a>
          </div>`
  });
  return aura_row;
}

function createAuraRows() {
  let level = document.getElementById("player-level").value

  let element = document.getElementById("aura-row-buffs")
  element.innerHTML = createAuraRow(BUFFS, level)

  element = document.getElementById("aura-row-oh-wep-buffs")
  element.innerHTML = createAuraRow(OH_BUFFS, level)

  element = document.getElementById("aura-row-consumes")
  element.innerHTML = createAuraRow(CONSUMES, level)

  element = document.getElementById("aura-row-world-buffs")
  element.innerHTML = createAuraRow(WORLD_BUFFS, level)

  element = document.getElementById("aura-row-debuffs")
  element.innerHTML = createAuraRow(DEBUFFS, level)

  element = document.getElementById("aura-row-imp-auras")
  element.innerHTML = createAuraRow(IMP_BUFFS, level)
}

function updateAuraRows() {
  let level = document.getElementById("player-level").value

  updateAuraRow(BUFFS, level, "aura-row-buffs");
  updateAuraRow(OH_BUFFS, level, "aura-row-oh-wep-buffs");
  updateAuraRow(CONSUMES, level, "aura-row-consumes");
  updateAuraRow(WORLD_BUFFS, level, "aura-row-world-buffs");
  updateAuraRow(DEBUFFS, level, "aura-row-debuffs");
  updateAuraRow(IMP_BUFFS, level, "aura-row-imp-auras");
}

function updateAuraRow(auras, level, rowId) {
  const container = document.getElementById(rowId);

  auras.forEach(aura => {
    let ix = getIndex(AURA_DATA[`${aura}`], level);
    let auraDiv = document.getElementById(`${aura}-aura`);
    let auraImg = document.getElementById(`${aura}-aura-img`);

    if (ix == -1) {
      // Remove unavailable aura elements.
      if (auraDiv) {
        auraDiv.style.display = 'none';
      }
      return;
    }

    let type = AURA_DATA[`${aura}`]['type'].toLowerCase();
    let id = AURA_DATA[`${aura}`]['ids'][ix];
    let img = aura;
    if (AURA_DATA[`${aura}`]['img'])
      img = AURA_DATA[`${aura}`]['img'][ix];

    // Update existing aura element.
    if (auraDiv && auraImg) {
      auraDiv.style.display = '';
      auraImg.src = `img/${img}.jpg`;
      const link = auraDiv.querySelector('a');
      if (link) {
        link.href = `https://classic.wowhead.com/${type}=${id}`;
      }
    } else { // Create missing aura element.
      const newAuraDiv = document.createElement('div');
      newAuraDiv.className = 'aura-toggle';
      newAuraDiv.id = `${aura}-aura`;
      newAuraDiv.innerHTML = `
        <a href="https://classic.wowhead.com/${type}=${id}" data-wh-rename-link="false" onclick="toggleAura(event, '${aura}')">
          <img class="aura-toggle-default" src="img/${img}.jpg" id="${aura}-aura-img" active="false">
        </a>`;
      container.appendChild(newAuraDiv);
    }
  });
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

export function onLevelChange() {
  const level = document.querySelector("#player-level").value;
  const output = document.getElementById("player-level-span");
  output.innerHTML = level;

  resetTalents(false);
  updateAuraRows();
  let globals = updateStats();
  updateRotation(globals);
  refreshLinks();
}

async function onLoadPage() {
  disableCalc();
  createGearRows();
  createAuraRows()
  refreshLinks();
  addEventListeners();
  createTalentTrees();
  await loadItemData();
  loadLocalstorage();
  let globals = updateStats();
  updateRotation(globals);
  enableCalc();
}

async function main() {

  // Cache the user input locally.
  saveInput();
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
      if (e.data.type == 'error') {
        console.error('Worker error:', e.data.message, e.data.stack);
        return;
      }
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
window.toggleAura = toggleAura;
window.onLevelChange = onLevelChange;

function initWhenReady() {
  if (typeof window.Papa === 'undefined') {
    log_message(LOG_LEVEL.INFO, 'Waiting for Papa Parse to load...');
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
