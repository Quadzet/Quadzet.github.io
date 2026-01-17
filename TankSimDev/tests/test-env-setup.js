import { setupTestDOM, cleanupDOM } from './dom-test-helper.js';
import { loadTestItemData } from './test-data-loader.js';

let envInitialized = false;
let cachedEnv = null;

export async function setupFullTestEnv() {
  if (envInitialized && cachedEnv) {
    return cachedEnv;
  }
  const { window, document, dom } = await setupTestDOM();

  global.document = document;
  global.window = window;

  await loadTestItemData();
  await createAuraElements(document);
  createTalentElements(document);
  initializeTalentState(document);

  envInitialized = true;
  cachedEnv = { window, document, dom };

  return cachedEnv;
}

export function cleanupFullTestEnv() {
  if (cachedEnv) {
    cleanupDOM(cachedEnv.dom);
    delete global.document;
    delete global.window;
    envInitialized = false;
    cachedEnv = null;
  }
}

async function createAuraElements(document) {
  const constants = await import('../constants.js');
  const { BUFFS, DEBUFFS, WORLD_BUFFS, CONSUMES, OH_BUFFS } = constants;

  const allAuras = [
    ...BUFFS,
    ...DEBUFFS,
    ...WORLD_BUFFS,
    ...CONSUMES,
    ...OH_BUFFS
  ];

  ['aura-row-buffs', 'aura-row-oh-wep-buffs', 'aura-row-consumes',
   'aura-row-world-buffs', 'aura-row-debuffs'].forEach(rowId => {
    let row = document.getElementById(rowId);
    if (!row) {
      row = document.createElement('div');
      row.id = rowId;
      row.className = 'aura-row';
      document.body.appendChild(row);
    }
  });

  allAuras.forEach(auraName => {
    const auraDiv = document.createElement('div');
    auraDiv.id = `${auraName}-aura`;
    auraDiv.className = 'aura-toggle';

    const auraImg = document.createElement('img');
    auraImg.id = `${auraName}-aura-img`;
    auraImg.className = 'aura-toggle-default';
    auraImg.src = `img/${auraName}.jpg`;

    auraDiv.appendChild(auraImg);
    document.body.appendChild(auraDiv);
  });
}

function createTalentElements(document) {
  const talents = [
    'bloodthirst', 'defiance', 'flurry', 'enrage', 'cruelty', 'impale',
    'death-wish', 'mortal-strike', 'shield-slam', 'toughness', 'anticipation',
    'deflection', 'shield-specialization', 'improved-heroic-strike',
    'improved-sunder-armor', 'improved-rend', 'improved-shield-block',
    'improved-thunderclap', 'dual-wield-specialization', 'sword-specialization',
    'axe-specialization', 'polearm-specialization', 'two-handed-weapon-specialization',
    'one-handed-specialization', 'deep-wounds'
  ];

  let talentsContainer = document.getElementById('talents');
  if (!talentsContainer) {
    talentsContainer = document.createElement('div');
    talentsContainer.id = 'talents';
    document.body.appendChild(talentsContainer);
  }

  talents.forEach(talentName => {
    const talentEl = document.createElement('div');
    talentEl.id = talentName;
    talentEl.setAttribute('value', '0');
    talentEl.setAttribute('points', '0');
    talentEl.className = 'talent';
    talentsContainer.appendChild(talentEl);
  });

  // Add talent points remaining element
  const pointsEl = document.createElement('span');
  pointsEl.id = 'talent-points-remaining';
  pointsEl.textContent = '51';
  talentsContainer.appendChild(pointsEl);
}

function initializeTalentState(document) {
  const talents = document.querySelectorAll('.talent');
  talents.forEach(talent => {
    talent.setAttribute('value', '0');
    talent.setAttribute('points', '0');
  });
}

export function setTalent(talentName, value) {
  if (!global.document) {
    throw new Error('Test environment not initialized. Call setupFullTestEnv() first.');
  }

  const el = global.document.getElementById(talentName);
  if (el) {
    el.setAttribute('value', String(value));
    el.setAttribute('points', String(value));
  }
}

export function setRotationAbility(ability, enabled, rage = 60) {
  if (!global.document) {
    throw new Error('Test environment not initialized. Call setupFullTestEnv() first.');
  }

  const useEl = global.document.getElementById(`use-${ability}`);
  const rageEl = global.document.getElementById(`${ability}-rage`);

  if (useEl) useEl.checked = enabled;
  if (rageEl) rageEl.value = String(rage);
}

export function toggleAura(auraName, active) {
  if (!global.document) {
    throw new Error('Test environment not initialized. Call setupFullTestEnv() first.');
  }

  const el = global.document.getElementById(`${auraName}-aura-img`);
  if (el) {
    if (active) {
      el.classList.add('aura-toggle-active');
    } else {
      el.classList.remove('aura-toggle-active');
    }
  }
}

export function setGearItem(slot, itemId) {
  if (!global.document) {
    throw new Error('Test environment not initialized. Call setupFullTestEnv() first.');
  }

  const el = global.document.getElementById(`${slot}-slot`);
  if (el) {
    el.setAttribute('itemid', String(itemId));
  }
}
