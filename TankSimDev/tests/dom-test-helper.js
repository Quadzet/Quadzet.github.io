import { JSDOM } from 'jsdom';
import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export async function setupTestDOM() {
  const htmlPath = join(__dirname, '..', 'index.html');
  const html = await readFile(htmlPath, 'utf-8');

  const dom = new JSDOM(html, {
    url: 'http://localhost',
    pretendToBeVisual: true,
    resources: 'usable'
  });

  const { window } = dom;
  const { document } = window;


  const playerLevel = document.getElementById('player-level');
  if (playerLevel) playerLevel.value = '60';
  const race = document.getElementById('race');
  if (race) race.value = 'Human';

  const extraStats = [
    'playerextrahealth', 'playerextrastrength', 'playerextrastamina',
    'playerextraagility', 'playerextrahit', 'playerextracrit',
    'playerextraattackpower', 'playerextraarmor', 'playerextradefense',
    'playerextradodge', 'playerextraparry', 'playerextrablock',
    'playerextrablockvalue', 'playerextramhskill', 'playerextraohskill',
    'playerextrahaste'
  ];
  extraStats.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '0';
  });

  const startRage = document.getElementById('startRage');
  if (startRage) startRage.value = '70';

  const rotationAbilities = [
    'revenge', 'death-wish', 'shield-slam', 'bloodthirst', 'mortal-strike',
    'rend', 'heroic-strike', 'shield-block', 'sunder-armor'
  ];
  rotationAbilities.forEach(ability => {
    const useCheckbox = document.getElementById(`use-${ability}`);
    const rageInput = document.getElementById(`${ability}-rage`);

    if (useCheckbox) {
      useCheckbox.checked = false;
      useCheckbox.style = '';
    }
    if (rageInput) {
      rageInput.value = '60';
    }
  });

  const bossLevel = document.getElementById('bossLevel');
  if (bossLevel) bossLevel.value = '3';

  const swingMin = document.getElementById('swingMin');
  if (swingMin) swingMin.value = '4000';

  const swingMax = document.getElementById('swingMax');
  if (swingMax) swingMax.value = '4000';

  const swingTimer = document.getElementById('swingTimer');
  if (swingTimer) swingTimer.value = '2';

  const bossArmor = document.getElementById('bossArmor');
  if (bossArmor) bossArmor.value = '3731';

  const fightLength = document.getElementById('fightLength');
  if (fightLength) fightLength.value = '60';

  const iterations = document.getElementById('iterations');
  if (iterations) iterations.value = '1000';

  // Manually create gear slots (normally created by createGearRows() in gear.js)
  const gearSelect = document.getElementById('gear-select');
  if (gearSelect) {
    const gearSlots = [
      ['head', 'hands'], ['neck', 'waist'], ['shoulder', 'legs'], ['back', 'feet'],
      ['chest', 'finger1'], ['wrist', 'finger2'], ['mainhand', 'trinket1'],
      ['offhand', 'trinket2'], ['ranged']
    ];

    gearSlots.forEach(row => {
      const rowDiv = document.createElement('div');
      rowDiv.classList.add('gear-row');

      row.forEach(slot => {
        const slotContainer = document.createElement('div');
        slotContainer.innerHTML = `
          <div class="gear-slot" id="${slot}-slot" itemid="0">
            <img id="${slot}-slot-img" itemId='0' src="img/${slot}.jpg"/>
            <div id="${slot}-slot-icon" class="slot-icon"></div>
            <div class="slot-text" id="${slot}-slot-text">
              <a class="gear-text" id="${slot}-text"></a>
              <a class="gear-enchant" id="${slot}-enchant" enchantID="0">Add Enchant</a>
            </div>
          </div>
        `;
        rowDiv.appendChild(slotContainer);
      });

      gearSelect.appendChild(rowDiv);
    });
  }

  return { window, document, dom };
}

/**
 * Cleans up the DOM after tests.
 */
export function cleanupDOM(dom) {
  if (dom) {
    dom.window.close();
  }
}

/**
 * Sets a gear item in the test DOM.
 * @param {Document} document - The jsdom document
 * @param {string} slot - The gear slot (e.g., 'mainhand', 'head')
 * @param {number} itemId - The item ID from ITEMS
 */
export function setGearItem(document, slot, itemId) {
  const el = document.getElementById(`${slot}-slot`);
  if (el) {
    el.setAttribute('itemid', String(itemId));
  }
}

/**
 * Sets an enchant in the test DOM.
 * @param {Document} document - The jsdom document
 * @param {string} slot - The enchant slot (e.g., 'mainhand', 'head')
 * @param {number} enchantId - The enchant ID from ENCHANT_DATA
 */
export function setEnchant(document, slot, enchantId) {
  const el = document.getElementById(`${slot}-enchant`);
  if (el) {
    el.setAttribute('enchantID', String(enchantId));
  }
}

/**
 * Toggles an aura (buff/debuff/consume/world buff) in the test DOM.
 * @param {Document} document - The jsdom document
 * @param {string} auraName - The aura name (e.g., 'battle-shout', 'gift-of-arthas')
 * @param {boolean} active - Whether to activate or deactivate
 */
export function toggleAura(document, auraName, active) {
  const el = document.getElementById(`${auraName}-aura-img`);
  if (el) {
    if (active) {
      el.classList.add('aura-toggle-active');
    } else {
      el.classList.remove('aura-toggle-active');
    }
  }
}

/**
 * Sets a talent value in the test DOM.
 * Note: This requires the talent tree to be initialized first.
 * @param {Document} document - The jsdom document
 * @param {string} talentName - The talent name
 * @param {number} points - Number of points (0-5)
 */
export function setTalent(document, talentName, points) {
  const el = document.getElementById(`talent-${talentName}`);
  if (el) {
    el.setAttribute('points', String(points));
  }
}
