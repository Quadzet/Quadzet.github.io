import { ITEMS, ENCHANT_IDS } from './constants.js'
import { ENCHANT_DATA } from './stats.js';
import { ENCHANT_SLOTS } from './constants.js';
import { refreshLinks } from './wowhead.js'
import { updateRotation } from './rotation.js'

export function showEnchantDropdown(event, slot) {
  event.preventDefault();
  event.stopPropagation();
  const dropdown = document.getElementById(slot + '-enchant-dropdown-content');
  const dropdowns = document.getElementsByClassName('dropdown-content')

  let enchantSlot = slot
  // Select correct enchant list depending on 2h, mh, oh or shield
  if (enchantSlot == 'mainhand' || enchantSlot == 'offhand' || enchantSlot == 'onehand') {
    var gearElement = document.getElementById(enchantSlot + '-slot');
    let itemID = gearElement.getAttribute('itemid');
    if (ITEMS[`${itemID} `].slot == "twohand") enchantSlot = 'twohand';
    else if (['offhand', 'onehand'].includes(ITEMS[`${itemID} `].slot) && ITEMS[`${itemID} `].type == "Shield") enchantSlot = 'shield';
    else if (['offhand', 'onehand'].includes(ITEMS[`${itemID} `].slot)) enchantSlot = 'mainhand';
  }
  // Clear any existing content
  dropdown.innerHTML = '';

  // Create a link for each id in the array
  ENCHANT_IDS[enchantSlot].forEach(id => {
    const link = document.createElement('a');
    if (id != 0)
      link.href = `https://www.wowhead.com/classic/spell=${id}`;
    else
      link.innerHTML = `${ENCHANT_DATA[`${id}`].name}`;

    link.addEventListener('click', function(event) {
      event.preventDefault();
      selectEnchant(id, slot);
      hideEnchantDropdown(slot);
      updateStats();
    })
    dropdown.appendChild(link);
  });

  // Hide any already opened dropdown
  for (let i = 0; i < dropdowns.length; i++) {
    dropdowns.item(i).style.display = 'none';
  }
  dropdown.style.display = 'block';
  refreshLinks();
}

export function hideEnchantDropdown(slot) {
  const dropdown = document.getElementById(slot + '-enchant-dropdown-content');
  dropdown.style.display = 'none';
}

export function generateGearList(slot) {
  const dropdownContent = document.getElementById(slot + '-slot-dropdown-content');
  const dropdownList = document.getElementById(slot + '-dropdown-gear-list');
  dropdownList.innerHTML = ''; // Reset current list if any

  // Filters
  const allowedSlots = [];
  const filterSlots = ['twohand', 'onehand', 'mainhand', 'offhand'];
  filterSlots.forEach(filter => {
    if (document.getElementById(slot + '-filter-' + filter) && document.getElementById(slot + '-filter-' + filter).checked)
      allowedSlots.push(filter);
  });

  const bannedTypes = [];
  const filterTypes = ['Shield', 'Plate', 'Mail', 'Leather'];
  filterTypes.forEach(filter => {
    if (document.getElementById(slot + '-filter-' + filter) && !document.getElementById(slot + '-filter-' + filter).checked) {
      bannedTypes.push(filter);
    }
  });

  let filterString;
  if (document.getElementById(slot + '-dropdown-search'))
    filterString = document.getElementById(slot + '-dropdown-search').value;


  // Add an Unequip option
  var unequip = document.createElement('a');
  unequip.href = '#';
  unequip.id = '0';
  var span = document.createElement('span');
  var spanText = document.createTextNode('Unequip');
  span.appendChild(spanText);
  unequip.appendChild(span);
  unequip.addEventListener('click', function(event) {
    event.preventDefault();
    event.stopPropagation();
    selectItem('0', slot);
    hideItemDropdown(slot);
    let globals = updateStats();
    updateRotation(globals);
  });
  dropdownList.appendChild(unequip);

  let slotFilter = slot
  if (slot == 'finger1' || slot == 'finger2')
    slotFilter = 'finger';
  if (slot == 'trinket1' || slot == 'trinket2')
    slotFilter = 'trinket';
  if (!(document.getElementById(slot + '-filter-' + slotFilter) && !document.getElementById(slot + '-filter-' + slotFilter).checked))
    allowedSlots.push(slotFilter);

  // Create a link for each id in the array
  let allowShields = document.getElementById(slot + '-filter-Shield') && document.getElementById(slot + '-filter-Shield').checked;
  let slotItemIDs = []
  Object.keys(ITEMS).forEach(id => {
    if (!allowedSlots.includes(ITEMS[`${id}`].slot)) {
      if (!(ITEMS[`${id}`].type == 'Shield' && allowShields)) { // If it's a shield, only filter if the type Shield is banned. Otherwise slot offhand removes both oh weps and shields
        return;
      }
    }
    if (bannedTypes.includes(ITEMS[`${id}`].type))
      return;
    if (filterString != null)
      if (!ITEMS[`${id}`].name.toLowerCase().includes(filterString.toLowerCase()))
        return;
    slotItemIDs.push(id);
  });

  slotItemIDs.sort((a, b) => ITEMS[`${b}`].ilvl - ITEMS[`${a}`].ilvl);
  slotItemIDs.forEach(id => {
    const link = document.createElement('a');
    link.href = `https://www.wowhead.com/classic/item=${id}`;

    link.addEventListener('click', function(event) {
      event.preventDefault();
      event.stopPropagation();
      selectItem(id, slot);
      hideItemDropdown(slot);
      let globals = updateStats();
      updateRotation(globals);
    })
    dropdownList.appendChild(link);
  });
  dropdownContent.appendChild(dropdownList);
  refreshLinks();
}

export function showItemDropdown(event, slot) {
  event.preventDefault();
  event.stopPropagation();
  var dropdownContent = document.getElementById(slot + '-slot-dropdown-content');

  dropdownContent.innerHTML = `<input type="text" class="gear-dropdown-search" id="${slot}-dropdown-search" oninput="generateGearList('${slot}')" placeholder="Search..."></input>`;
  if (slot == "mainhand")
    dropdownContent.innerHTML += `
        <input type="checkbox" class="dropdown-filter-checkbox" id="${slot}-filter-twohand" checked="true" onclick="generateGearList('${slot}')">Twohand</input>
        <input type="checkbox" class="dropdown-filter-checkbox" id="${slot}-filter-mainhand" checked="true" onclick="generateGearList('${slot}')">Mainhand</input>
        <input type="checkbox" class="dropdown-filter-checkbox" id="${slot}-filter-onehand" checked="true" onclick="generateGearList('${slot}')">Onehand</input>
        `
  else if (slot == "offhand")
    dropdownContent.innerHTML += `
        <input type="checkbox" class="dropdown-filter-checkbox" id="${slot}-filter-offhand" checked="true" onclick="generateGearList('${slot}')">Offhand</input>
        <input type="checkbox" class="dropdown-filter-checkbox" id="${slot}-filter-onehand" checked="true" onclick="generateGearList('${slot}')">Onehand</input>
        <input type="checkbox" class="dropdown-filter-checkbox" id="${slot}-filter-Shield" checked="true" onclick="generateGearList('${slot}')">Shield</input>
        `;
  else if (['head', 'shoulder', 'chest', 'wrist', 'legs', 'feet', 'hands', 'waist'].includes(slot))
    dropdownContent.innerHTML += `
        <input type="checkbox" class="dropdown-filter-checkbox" id="${slot}-filter-Leather" checked="true" onclick="generateGearList('${slot}')">Leather</input>
        <input type="checkbox" class="dropdown-filter-checkbox" id="${slot}-filter-Mail" checked="true" onclick="generateGearList('${slot}')">Mail</input>
        <input type="checkbox" class="dropdown-filter-checkbox" id="${slot}-filter-Plate" checked="true" onclick="generateGearList('${slot}')">Plate</input>
        `;
  const dropdownList = document.createElement('div');
  dropdownList.classList.add('gear-dropdown-list');
  dropdownList.setAttribute('id', slot + '-dropdown-gear-list')
  dropdownContent.appendChild(dropdownList);
  generateGearList(slot);

  const dropdown = document.getElementById(slot + '-slot-dropdown-content');
  const dropdowns = document.getElementsByClassName('dropdown-content')
  // Hide any already opened dropdown
  for (let i = 0; i < dropdowns.length; i++) {
    dropdowns.item(i).style.display = 'none';
  }
  dropdown.style.display = 'block';
}

export function hideItemDropdown(slot) {
  const dropdown = document.getElementById(slot + '-slot-dropdown-content');
  dropdown.style.display = 'none';
}

const GEAR_ROWS = [['head', 'hands'], ['neck', 'waist'], ['shoulder', 'legs'], ['back', 'feet'], ['chest', 'finger1'], ['wrist', 'finger2'], ['mainhand', 'trinket1'], ['offhand', 'trinket2'], ['ranged']];

export function createGearRows() {
  const gearSelect = document.getElementById('gear-select');
  GEAR_ROWS.forEach(row => {
    if (row.length == 2) {
      const element = document.createElement('div');
      element.classList.add('gear-row');
      element.style.display = 'flex';
      element.innerHTML = `
        <div>
          <div class="gear-slot gear-slot-left" id="${row[0]}-slot" >
            <img id="${row[0]}-slot-img" itemId='0' src="img/${row[0]}.jpg" onclick="showItemDropdown(event, '${row[0]}')"/>
            <div id="${row[0]}-slot-icon" class="slot-icon" onclick="showItemDropdown(event, '${row[0]}')"></div>
            <div class="slot-text" id="${row[0]}-slot-text">
              <a class="gear-text" id="${row[0]}-text" onclick="showItemDropdown(event, '${row[0]}')"></a>
              <a onclick="showEnchantDropdown(event, '${row[0]}')" class="gear-enchant" id="${row[0]}-enchant" data-wh-rename-link="false" href="#">${ENCHANT_SLOTS.includes(row[0]) ? 'Add Enchant' : ''}</a>
            </div>
          </div>
          <div id="${row[0]}-slot-dropdown-content" class="dropdown-content"></div>
          <div id="${row[0]}-enchant-dropdown-content" class="dropdown-content"></div>
        </div>
        <div>
          <div class="gear-slot gear-slot-right" id="${row[1]}-slot">
            <img id="${row[1]}-slot-img" itemId='0' src="img/${row[1]}.jpg" onclick="showItemDropdown(event, '${row[1]}')"/>
            <div class="slot-text" id="${row[1]}-slot-text">
              <a class="gear-text" id="${row[1]}-text" onclick="showItemDropdown(event, '${row[1]}')"></a>
              <a onclick="showEnchantDropdown(event, '${row[1]}')" class="gear-enchant" id="${row[1]}-enchant" data-wh-rename-link="false" href="#">${ENCHANT_SLOTS.includes(row[1]) ? 'Add Enchant' : ''}</a>
            </div>
            <div id="${row[1]}-slot-icon" class="slot-icon" onclick="showItemDropdown(event, '${row[1]}')"></div>
          </div>
          <div id="${row[1]}-slot-dropdown-content" class="dropdown-content"></div>
          <div id="${row[1]}-enchant-dropdown-content" class="dropdown-content"></div>
        </div>
      `;
      gearSelect.appendChild(element);
    } else { // length == 1
      const element = document.createElement('div');
      element.classList.add('gear-row');
      element.style.display = 'flex';
      element.innerHTML = `
        <div>
          <div class="gear-slot gear-slot-left" id="${row[0]}-slot" >
            <img id="${row[0]}-slot-img" itemId='0' src="img/${row[0]}.jpg" onclick="showItemDropdown(event, '${row[0]}')"/>
            <div id="${row[0]}-slot-icon" class="slot-icon" onclick="showItemDropdown(event, '${row[0]}')"></div>
            <div class="slot-text" id="${row[0]}-slot-text">
              <a class="gear-text" id="${row[0]}-text" onclick="showItemDropdown(event, '${row[0]}')"></a>
              <a onclick="showEnchantDropdown(event, '${row[0]}')" class="gear-enchant" id="${row[0]}-enchant" data-wh-rename-link="false" href="#">${ENCHANT_SLOTS.includes(row[0]) ? 'Add Enchant' : ''}</a>
            </div>
          </div>
          <div id="${row[0]}-slot-dropdown-content" class="dropdown-content"></div>
          <div id="${row[0]}-enchant-dropdown-content" class="dropdown-content"></div>
        </div>
      `;
      gearSelect.appendChild(element);
    }
  });
}

export function selectEnchant(id, slot) {
  const slotText = document.getElementById(slot + '-enchant');
  if (id != 0) {
    slotText.href = `https://classic.wowhead.com/spell=${id}`;
    slotText.classList.add('enchanted');
  } else {
    slotText.href = '';
    slotText.classList.remove('enchanted');
  }
  slotText.setAttribute('enchantID', `${id}`)
  slotText.innerHTML = ENCHANT_DATA[`${id}`].description;
}

function toggleOffhandBuffs(show) {
  const ohStones = document.getElementById('aura-row-oh-wep-buffs');
  const ohHeader = document.getElementById('oh-wep-buffs-header');
  if (show) {
    ohStones.style.display = 'flex';
    ohHeader.style.display = 'block';
  } else {
    ohStones.style.display = 'none';
    ohHeader.style.display = 'none';
  }
}

export function selectItem(id, slot) {
  if (id != 0) {
    // set text
    const slotText = document.getElementById(slot + '-text');
    slotText.href = `https://classic.wowhead.com/item=${id}`;

    // set icon
    const slotIcon = document.getElementById(slot + '-slot-icon');
    slotIcon.innerHTML = `
      <a href="https://classic.wowhead.com/item=${id}" data-wh-rename-link="false" data-wh-icon-size="large"></a>`;

    const element = document.getElementById(slot + '-slot');
    element.setAttribute('itemid', `${id}`);
    const textElement = document.getElementById(slot + '-slot-text');
    textElement.style.display = 'flex';
    const iconElement = document.getElementById(slot + '-slot-icon');
    iconElement.style.display = 'flex';

    element.setAttribute('itemid', `${id}`);
    const slotImg = document.getElementById(slot + '-slot-img');
    slotImg.style.display = 'none';
    if (ITEMS[id].slot == "twohand") {
      selectItem(0, 'offhand');
      selectEnchant(0, 'offhand');
    }
    if (slot == "offhand") {
      const mhElement = document.getElementById('mainhand-slot');
      const mhitemid = mhElement.getAttribute('itemid');
      if (parseInt(mhitemid) != 0 && ITEMS[mhitemid].slot == "twohand") {
        selectItem(0, 'mainhand');
        selectEnchant(0, 'mainhand');
      }
      if (ITEMS[id].type == "Shield") {
        toggleOffhandBuffs(false);
      } else {
        toggleOffhandBuffs(true);
      }
    }
  } else {
    // set text
    const slotText = document.getElementById(slot + '-text');
    slotText.href = `https://classic.wowhead.com/item=${id}`;

    // set icon
    const slotIcon = document.getElementById(slot + '-slot-icon');
    slotIcon.innerHTML = `
      <a href="https://classic.wowhead.com/item=${id}" data-wh-rename-link="false" data-wh-icon-size="large"></a>`;

    const element = document.getElementById(slot + '-slot');
    element.setAttribute('itemid', `${id}`);
    const textElement = document.getElementById(slot + '-slot-text');
    textElement.style.display = 'none';
    const iconElement = document.getElementById(slot + '-slot-icon');
    iconElement.style.display = 'none';

    const slotImg = document.getElementById(slot + '-slot-img');
    slotImg.style.display = 'flex';

    if (slot == "offhand") {
      toggleOffhandBuffs(false);
    }
  }
  refreshLinks();
}
