function talentPointCap() {
  return Number(document.querySelector("#level").value) - 9;
}

const ARMS_TALENTS = [
    {
      name: "improved-heroic-strike",
      max: 3,
      ids: [12282, 12663, 12664],
      row: 1,
      col: 1,
    },
    {
      name: "deflection",
      max: 5,
      ids: [16462, 16463, 16464, 16465, 16466],
      row: 1,
      col: 2,
    },
    {
      name: "improved-rend",
      max: 3,
      ids: [12286, 12658, 12659],
      row: 1,
      col: 3,
    },
    {
      name: "improved-charge",
      max: 2,
      ids: [12285, 12697],
      row: 2,
      col: 1,
    },
    {
      name: "tactical-mastery",
      max: 5,
      ids: [12295, 12676, 12677, 12678, 12679],
      row: 2,
      col: 2,
    },
    {
      name: "improved-thunderclap",
      max: 3,
      ids: [12287, 12665, 12666],
      row: 2,
      col: 4,
    },
    {
      name: "improved-overpower",
      max: 2,
      ids: [12290, 12963],
      row: 3,
      col: 1,
    },
    {
      name: "anger-management",
      max: 1,
      ids: [12296],
      row: 3,
      col: 2,
    },
    {
      name: "deep-wounds",
      max: 3,
      ids: [12834, 12849, 12867],
      row: 3,
      col: 3,
    },
    {
      name: "two-handed-weapon-specialization",
      max: 5,
      ids: [12163, 12711, 12712, 12713, 12714],
      row: 4,
      col: 2,
    },
    {
      name: "impale",
      max: 2,
      ids: [16493, 16494],
      row: 4,
      col: 3,
    },
    {
      name: "axe-specialization",
      max: 5,
      ids: [12700, 12781, 12783, 12784, 12785],
      row: 5,
      col: 1,
    },
    {
      name: "sweeping-strikes",
      max: 1,
      ids: [12292],
      row: 5,
      col: 2,
    },
    {
      name: "mace-specialization",
      max: 5,
      ids: [12284, 12701, 12702, 10703, 12704],
      row: 5,
      col: 3,
    },
    {
      name: "sword-specialization",
      max: 5,
      ids: [12281, 12812, 12813, 12814, 12815],
      row: 5,
      col: 4,
    },
    {
      name: "polearm-specialization",
      max: 5,
      ids: [12165, 12830, 12831, 12832, 12833],
      row: 6,
      col: 1,
    },
    {
      name: "improved-hamstring",
      max: 2,
      ids: [12289, 12668, 23695],
      row: 6,
      col: 3,
    },
    {
      name: "mortal-strike",
      max: 1,
      ids: [12294],
      row: 7,
      col: 2,
    },
];

const FURY_TALENTS = [
    {
      name: "booming-voice",
      max: 5,
      ids: [12321, 12835, 12836, 12837, 12838],
      row: 1,
      col: 2,
    },
    {
      name: "cruelty",
      max: 5,
      ids: [12320, 12852, 12853, 12855, 12856],
      row: 1,
      col: 3,
    },
    {
      name: "improved-demoralizing-shout",
      max: 5,
      ids: [12324, 12876, 12877, 12878, 12879],
      row: 2,
      col: 2,
    },
    {
      name: "unbridled-wrath",
      max: 5,
      ids: [12322, 12999, 13000, 13001, 13002],
      row: 2,
      col: 3,
    },
    {
      name: "improved-cleave",
      max: 3,
      ids: [12329, 12950, 20496],
      row: 3,
      col: 1,
    },
    {
      name: "piercing-howl",
      max: 1,
      ids: [12323],
      row: 3,
      col: 2,
    },
    {
      name: "blood-craze",
      max: 3,
      ids: [16487, 16489, 16492],
      row: 3,
      col: 3,
    },
    {
      name: "improved-battle-shout",
      max: 5,
      ids: [12318, 12857, 12858, 12860, 12861],
      row: 3,
      col: 4,
    },
    {
      name: "dual-wield-specialization",
      max: 5,
      ids: [23584, 23585, 23586, 23587, 23588],
      row: 4,
      col: 1,
    },
    {
      name: "improved-execute",
      max: 2,
      ids: [20502, 20503],
      row: 4,
      col: 2,
    },
    {
      name: "enrage",
      max: 5,
      ids: [12317, 13045, 13046, 13047, 13048],
      row: 4,
      col: 3,
    },
    {
      name: "improved-slam",
      max: 5,
      ids: [12862, 12330, 20497, 20498, 20499],
      row: 5,
      col: 1,
    },
    {
      name: "death-wish",
      max: 1,
      ids: [12328],
      row: 5,
      col: 2,
    },
    {
      name: "improved-intercept",
      max: 2,
      ids: [20504, 20505],
      row: 5,
      col: 4,
    },
    {
      name: "improved-berserker-rage",
      max: 2,
      ids: [20500, 20501],
      row: 6,
      col: 1,
    },
    {
      name: "flurry",
      max: 5,
      ids: [12319, 12971, 12972, 12973, 12974],
      row: 6,
      col: 3,
    },
    {
      name: "bloodthirst",
      max: 1,
      ids: [23881],
      row: 7,
      col: 2,
    },
];

const PROT_TALENTS = [
    {
      name: "shield-specialization",
      max: 5,
      ids: [12298, 12724, 12725, 12726, 12727],
      row: 1,
      col: 2,
    },
    {
      name: "anticipation",
      max: 5,
      ids: [12297, 12750, 12751, 12752, 12752],
      row: 1,
      col: 3,
    },
    {
      name: "improved-bloodrage",
      max: 2,
      ids: [12301, 12818],
      row: 2,
      col: 1,
    },
    {
      name: "toughness",
      max: 5,
      ids: [12299, 12761, 12762, 12763, 12764],
      row: 2,
      col: 3,
    },
    {
      name: "iron-will",
      max: 5,
      ids: [12300, 12959, 12960, 12961, 12962],
      row: 2,
      col: 4,
    },
    {
      name: "last-stand",
      max: 1,
      ids: [12975],
      row: 3,
      col: 1,
    },
    {
      name: "improved-shield-block",
      max: 3,
      ids: [12945, 12307, 12944],
      row: 3,
      col: 2,
    },
    {
      name: "improved-revenge",
      max: 3,
      ids: [12797, 12799, 12800],
      row: 3,
      col: 3,
    },
    {
      name: "defiance",
      max: 5,
      ids: [12303, 12788, 12789, 12791, 12792],
      row: 3,
      col: 4,
    },
    {
      name: "improved-sunder-armor",
      max: 3,
      ids: [12308, 12810, 12811],
      row: 4,
      col: 1,
    },
    {
      name: "improved-disarm",
      max: 3,
      ids: [12313, 12804, 12807],
      row: 4,
      col: 2,
    },
    {
      name: "improved-taunt",
      max: 2,
      ids: [12302, 12765],
      row: 4,
      col: 3,
    },
    {
      name: "improved-shield-wall",
      max: 2,
      ids: [12312, 12803],
      row: 5,
      col: 1,
    },
    {
      name: "concussion-blow",
      max: 1,
      ids: [12809],
      row: 5,
      col: 2,
    },
    {
      name: "improved-shield-bash",
      max: 2,
      ids: [12311, 12958],
      row: 5,
      col: 3,
    },
    {
      name: "one-handed-specialization",
      max: 5,
      ids: [16538, 16539, 16540, 16541, 16542],
      row: 6,
      col: 3,
    },
    {
      name: "shield-slam",
      max: 1,
      ids: [23922],
      row: 7,
      col: 2,
    },
];

const ARROW_REQS = [
  {
    tree: 'arms',
    name: "deep-wounds",
    requires: "improved-rend",
  },
  {
    tree: 'arms',
    name: "impale",
    requires: "deep-wounds",
  },
  {
    tree: 'arms',
    name: "anger-management",
    requires: "tactical-mastery",
  },
  {
    tree: 'arms',
    name: "mortal-strike",
    requires: "sweeping-strikes",
  },
  {
    tree: 'fury',
    name: "flurry",
    requires: "enrage",
  },
  {
    tree: 'fury',
    name: "bloodthirst",
    requires: "death-wish",
  },
  {
    tree: 'prot',
    name: "improved-shield-block",
    requires: "shield-specialization",
  },
  {
    tree: 'prot',
    name: "last-stand",
    requires: "improved-bloodrage",
  },
  {
    tree: 'prot',
    name: "shield-slam",
    requires: "concussion-blow",
  },
]

function getTree(name) {
  if (name == 'arms')
    return ARMS_TALENTS;
  else if (name == 'fury')
    return FURY_TALENTS;
  else if (name == 'prot')
    return PROT_TALENTS;
}

function getTreeName(talentName) {
  ret = '';
  ARMS_TALENTS.forEach(talent => {
    if (talent.name == talentName)
      ret = 'arms';
  });
  FURY_TALENTS.forEach(talent => {
    if (talent.name == talentName)
      ret = 'fury';
  });
  PROT_TALENTS.forEach(talent => {
    if (talent.name == talentName)
      ret = 'prot';
  });
  return ret;
}

function createTalentArrows() {
  const armsTree = document.getElementById('arms-tree');
  let arrow = document.createElement('div');
  arrow.classList.add('arrow-1');
  arrow.id = 'impale-arrow';
  armsTree.appendChild(arrow);

  arrow = document.createElement('div');
  arrow.classList.add('arrow-2');
  arrow.id = 'deep-wounds-arrow';
  armsTree.appendChild(arrow);

  arrow = document.createElement('div');
  arrow.classList.add('arrow-1');
  arrow.id = 'anger-management-arrow';
  armsTree.appendChild(arrow);
  
  arrow = document.createElement('div');
  arrow.classList.add('arrow-2');
  arrow.id = 'mortal-strike-arrow';
  armsTree.appendChild(arrow);

  const furyTree = document.getElementById('fury-tree');
  arrow = document.createElement('div');
  arrow.classList.add('arrow-2');
  arrow.id = 'flurry-arrow';
  furyTree.appendChild(arrow);

  arrow = document.createElement('div');
  arrow.classList.add('arrow-2');
  arrow.id = 'bloodthirst-arrow';
  furyTree.appendChild(arrow);

  const protTree = document.getElementById('prot-tree');
  arrow = document.createElement('div');
  arrow.classList.add('arrow-2');
  arrow.id = 'improved-shield-block-arrow';
  protTree.appendChild(arrow);

  arrow = document.createElement('div');
  arrow.classList.add('arrow-1');
  arrow.id = 'last-stand-arrow';
  protTree.appendChild(arrow);

  arrow = document.createElement('div');
  arrow.classList.add('arrow-2');
  arrow.id = 'shield-slam-arrow';
  protTree.appendChild(arrow);
}

function createTalentTree(talentTree, name) {
  let container = document.createElement('div');
  container.classList.add('talent-tree-container');
  let header = document.createElement('div');
  header.classList.add('talent-header');
  const displayName = name == 'arms' ? 'Arms' : name == 'fury' ? 'Fury' : 'Protection';
  header.innerHTML = `<span>${displayName}</span><span class="talent-tree-counter" id="${name}-talent-counter">0</span>`;

  let tree = document.createElement('div');
  tree.classList.add('talent-tree');
  tree.id = `${name}-tree`;
  talentTree.forEach(talent => {
    let cell = document.createElement('div');
    cell.classList.add('talent');
    cell.setAttribute('id', `${talent.name}`);
    cell.setAttribute('value', '0');
    cell.style.gridArea = `${talent.row}/${talent.col}`;
    if (talent.row > 1)
      cell.classList.add('talent-unavailable');

    let innerHTML = `
      <a href=https://classic.wowhead.com/spell=${talent.ids[0]} data-wh-rename-link="false" onclick="selectTalent(event, '${talent.name}')" oncontextmenu="deselectTalent(event, '${talent.name}')">
        <img src="img/${talent.name}.jpg"/>
        <span class="talent-counter">0/${talent.max}</span>
      </a>`;
    cell.innerHTML = innerHTML;
    tree.appendChild(cell);
  });
  let element = document.getElementById('talents');
  container.appendChild(header);
  container.appendChild(tree);
  element.appendChild(container);
}

function addTalentFooter() {
  let footer = document.createElement('div');
  footer.classList.add('talent-footer');
  footer.innerHTML = `<div>Points left: <span id="talent-points-remaining">${talentPointCap()}</span></div><span id="talent-reset-button" onclick="resetTalents()">Reset</span>`;

  const talents = document.getElementById('talents-container');
  talents.appendChild(footer);
}

// *** INIT *** //
function createTalentTrees() {
  createTalentTree(ARMS_TALENTS, 'arms');
  createTalentTree(FURY_TALENTS, 'fury');
  createTalentTree(PROT_TALENTS, 'prot');
  createTalentArrows();
  addTalentFooter();
}



// *** RUNTIME *** //

function getTalentData(treeName, name) {
  ret = {};
  getTree(treeName).forEach(talent => {
    if (talent.name == name)
      ret = talent;
  });
  return ret;
}

function getTalentPointsSpentInRow(treeName, row) {
  let count = 0;
  getTree(treeName).forEach(talent => {
    if (talent.row == row) {
      const element = document.getElementById(`${talent.name}`);
      count += Number(element.getAttribute('value'));
    }
  });
  return count;
}

function getTalentsSpent(tree) {
  let count = 0;
  tree.forEach(talent => {
    const element = document.getElementById(`${talent.name}`);
    count += Number(element.getAttribute('value'));
  });
  return count;
}

function getTotalTalentsSpent() {
  return getTalentsSpent(ARMS_TALENTS) + getTalentsSpent(FURY_TALENTS) + getTalentsSpent(PROT_TALENTS);
}

function updateArrows() {
  // Grey them all out when no points are left
  if (getTotalTalentsSpent() == talentPointCap()) {
    ARROW_REQS.forEach(arrow => {
      const target = document.getElementById(`${arrow.name}`);
      if (Number(target.getAttribute('value')) > 0)
        return;
      const element = document.getElementById(`${arrow.name}-arrow`);
      element.classList.remove('arrow-active');
    });
    return;
  }

  ARROW_REQS.forEach(arrow => {
    const req = document.getElementById(`${arrow.requires}`);
    const reqData = getTalentData(`${arrow.tree}`, `${arrow.requires}`);
    const maxed = Number(req.getAttribute('value')) == reqData.max;
    const talentData = getTalentData(`${arrow.tree}`, `${arrow.name}`);

    let pointsSpent = 0;
    for (let row = 1; row < talentData.row; row++) {
      pointsSpent += getTalentPointsSpentInRow(`${arrow.tree}`, row);
    }

    const arrowElement = document.getElementById(`${arrow.name}-arrow`);
    const talentElement = document.getElementById(`${arrow.name}`);
    if (maxed && (pointsSpent >= (talentData.row - 1) * 5)) {
      arrowElement.classList.add('arrow-active');
      talentElement.classList.remove('talent-unavailable');
    } else {
      arrowElement.classList.remove('arrow-active');
      talentElement.classList.add('talent-unavailable');
    }
  });
}

function talentActive(treeName, row) {
  let ret = false;
  getTree(treeName).forEach(talent => {
    if (talent.row != row)
     return; 
    const element = document.getElementById(`${talent.name}`);
    let val = Number(element.getAttribute('value'));
    if (val > 0)
      ret = true;
  });
  return ret; 
}

function canRemoveTalentPoint(treeName, row, name) {
  // Need to check for each row above the row we are trying to deselect on
  for (let r_check = 7; r_check > row; r_check--) {
    if (!talentActive(treeName, r_check))
      continue;
    let talentsSpent = 0;
    // How many talent points are spent up to the row we are checking:
    for (let r_count = 1; r_count < r_check; r_count++) {
      talentsSpent += getTalentPointsSpentInRow(treeName, r_count);
    }
    // If removing the talent point would put us below the threshold, don't allow it
    if (talentsSpent - 1 < (r_check-1) * 5)
      return false;
  }

  // We are pointing at something that has points spent in it
  let ret = true;
  ARROW_REQS.forEach(arrow => {
    if (name == arrow.requires) {
      const targetElement = document.getElementById(`${arrow.name}`);
      if (Number(targetElement.getAttribute('value')) > 0)
        ret = false;
    }
  });
  return ret;
}

function setUnavailable(talentName) {
  const element = document.getElementById(`${talentName}`);
  if (Number(element.getAttribute('value')) == 0)
    element.classList.add('talent-unavailable');
  // else
  //   element.classList.add('talent-maxed'); // eg when you have 2/3 and spend all your points elsewhere
}

function setAvailable(talentName) {
  const element = document.getElementById(`${talentName}`);
  const treeName = getTreeName(talentName)
  const data = getTalentData(treeName, talentName)

  if (data.max == Number(element.getAttribute('value'))) {
    element.classList.remove('talent-unavailable');
    element.classList.add('talent-maxed');
  } else {
    element.classList.remove('talent-unavailable');
    element.classList.remove('talent-maxed'); // eg when you have 2/3 and spend all your points elsewhere
  }
}

function requirementsMet(tree, talent) {
  let pointsSpent = 0;
  let treeName = getTreeName(talent.name);
  for (let row = 1; row < talent.row; row++) {
    pointsSpent += getTalentPointsSpentInRow(treeName, row);
  }
  if (pointsSpent < (talent.row - 1) * 5)
    return false;

  let ret = true;
  ARROW_REQS.forEach(arrow => {
    if (arrow.name == talent.name) {
      const req = document.getElementById(`${arrow.requires}`);
      const treeName = getTreeName(`${arrow.requires}`)
      const reqData = getTalentData(treeName, `${arrow.requires}`)
      if (reqData.max > Number(req.getAttribute('value')))
        ret = false;
    }
  });

  return ret;
}

function setTreeUnavailable(tree) {
  tree.forEach(talent => {
      setUnavailable(`${talent.name}`)
  });
}

function setTreesUnavailable() {
  setTreeUnavailable(ARMS_TALENTS);
  setTreeUnavailable(FURY_TALENTS);
  setTreeUnavailable(PROT_TALENTS);
  updateArrows();
}
function updateTalentTreeAvailability(tree) {
  const pointsSpent = getTalentsSpent(tree);
  tree.forEach(talent => {
    if (pointsSpent < (talent.row - 1) * 5) {
      setUnavailable(talent.name);
    } else if (requirementsMet(tree, talent)) {
      setAvailable(talent.name);
    } else {
      setUnavailable(talent.name);
    }
  });
}

function updateTalentAvailability() {
  if (getTotalTalentsSpent() >= talentPointCap()) {
    setTreesUnavailable();
    return;
  }

  updateTalentTreeAvailability(ARMS_TALENTS);
  updateTalentTreeAvailability(FURY_TALENTS);
  updateTalentTreeAvailability(PROT_TALENTS);
  updateArrows();
}

function setTalentPointCount(name, val, data) {
  const element = document.getElementById(`${name}`);
  element.setAttribute('value', `${val}`);
  const a = document.querySelector(`#${name} > a`)
  a.setAttribute('href', `https://classic.wowhead.com/spell=${data.ids[val == 0 ? 0 : val - 1]}`);
  const span = document.querySelector(`#${name} .talent-counter`)
  span.innerHTML = `${val}/${data.max}`;

  if (val == data.max) {
    element.classList.add('talent-maxed');
  } else {
    element.classList.remove('talent-maxed');
  }
}

function updateCounters(treeName, change) {
  const treeCounter = document.getElementById(`${treeName}-talent-counter`)
  let currentCount = parseInt(treeCounter.innerHTML);
  treeCounter.innerHTML = `${currentCount + change}`;
  
  const remainingCounter = document.getElementById('talent-points-remaining');
  let currentRemaining = parseInt(remainingCounter.innerHTML);
  remainingCounter.innerHTML = `${currentRemaining - change}`;
}

function resetCounters() {
  const armsCounter = document.getElementById(`arms-talent-counter`)
  armsCounter.innerHTML = `${0}`;
  const furyCounter = document.getElementById(`fury-talent-counter`)
  furyCounter.innerHTML = `${0}`;
  const protCounter = document.getElementById(`prot-talent-counter`)
  protCounter.innerHTML = `${0}`;
  
  const remainingCounter = document.getElementById('talent-points-remaining');
  let currentRemaining = parseInt(remainingCounter.innerHTML);
  remainingCounter.innerHTML = `${talentPointCap()}`;
}

function deselectTalent(event, name) {
  event.preventDefault();
  let treeName = getTreeName(name);
  let data = getTalentData(treeName, name);
  if (!canRemoveTalentPoint(treeName, data.row))
    return;
  const element = document.getElementById(`${name}`);
  let val = Number(element.getAttribute('value'));
  if (val == 0)
    return;
  
  val -= 1;

  setTalentPointCount(name, val, data);
  updateCounters(treeName, -1);
  updateTalentAvailability();

  updateStats();
}

function selectTalent(event, name) {
  event.preventDefault();
  if (getTotalTalentsSpent() >= talentPointCap())
    return;
  let element = document.getElementById(`${name}`);
  let treeName = getTreeName(name);
  let data = getTalentData(treeName, name);
  let val = Number(element.getAttribute('value'));
  if (val == data.max)
    return;
  if (element.classList.contains('talent-unavailable'))
    return;
  
  val += 1;

  setTalentPointCount(name, val, data);
  updateCounters(treeName, 1);

  updateTalentAvailability();
  updateStats();
}

function resetTalents() {
  ARMS_TALENTS.forEach(talent => {
    const data = getTalentData('arms', talent.name);
    setTalentPointCount(talent.name, 0, data);
  });
  FURY_TALENTS.forEach(talent => {
    const data = getTalentData('fury', talent.name);
    setTalentPointCount(talent.name, 0, data);
  });
  PROT_TALENTS.forEach(talent => {
    const data = getTalentData('prot', talent.name);
    setTalentPointCount(talent.name, 0, data);
  });

  resetCounters();
  updateTalentAvailability();
  updateStats();
}

function loadTalents(talents) {
  resetTalents();
  Object.keys(talents).forEach(talentName => {
    const treeName = getTreeName(talentName);
    const data = getTalentData(treeName, talentName);
    setTalentPointCount(talentName, talents[`${talentName}`], data);
    updateCounters(treeName, talents[`${talentName}`]);
  });
  // Need this to activate the talents, before potentially shutting the off..
  updateTalentTreeAvailability(ARMS_TALENTS);
  updateTalentTreeAvailability(FURY_TALENTS);
  updateTalentTreeAvailability(PROT_TALENTS);
  updateTalentAvailability();
}

function getTalentsFromTree(tree) {
  let ret = {};
  tree.forEach(talent => {
    const element = document.getElementById(`${talent.name}`);
    const value = Number(element.getAttribute('value'));
    if (value > 0) {
      ret[`${talent.name}`] = value;
    }
  });
  return ret;
}

function getTalents() {
  let ret = {
    ...getTalentsFromTree(ARMS_TALENTS),
    ...getTalentsFromTree(FURY_TALENTS),
    ...getTalentsFromTree(PROT_TALENTS)};
  return ret;
}
