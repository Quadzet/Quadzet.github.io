"use strict";
function sleep(ms) { return new Promise((r) => 
    setTimeout(r, ms)); }

function average(array) {
    if (array) return array.reduce((a, b) => a + b) / array.length;
    else return 0;
};
const range = (length) =>
  Array.from({ length }, (_, i) => i)

function linspace(start, end, length = Math.max(Math.round(end-start) + 1, 1)) {
    if(length < 2) { return length === 1 ? [start] : [] ; }
    var i, ret = Array(length);
    length--;
    for(i = length; i >= 0; i--) { ret[i] = (i*end+(length-i)*start)/length; }
    return ret;
}

const asc = arr => arr.sort((a, b) => a - b);

// sample standard deviation
const std = (arr) => {
    const mu = average(arr);
    const diffArr = arr.map(a => (a - mu) ** 2);
    return Math.sqrt(diffArr.reduce((a, b) => a + b) / (arr.length - 1));
};

const quantile = (arr, q) => {
    const sorted = asc(arr);
    const pos = (sorted.length - 1) * q;
    const base = Math.floor(pos);
    const rest = pos - base;
    if (sorted[base + 1] !== undefined) {
        return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
    } else {
        return sorted[base];
    }
};

function getAmount(event, ability, type) {
    if (event[`${type}`] && event.ability == ability) return event[`${type}`];
    else return 0;
}

// Fill the progressbar
async function updateProgressbar(progressPerc) {
    document.querySelector("#progressBar").style.width = `${progressPerc}%`
    await sleep(0);
}

function saveInput()
{
    // Tank Settings
    localStorage.setItem("AP", document.querySelector("#AP").value);
    localStorage.setItem("crit", document.querySelector("#crit").value)
    localStorage.setItem("hit", document.querySelector("#hit").value)
    localStorage.setItem("MHWepSkill", document.querySelector("#MHWepSkill").value)
    localStorage.setItem("OHWepSkill", document.querySelector("#OHWepSkill").value)
    localStorage.setItem("MHMin", document.querySelector("#MHMin").value)
    localStorage.setItem("MHMax", document.querySelector("#MHMax").value)
    localStorage.setItem("MHSwing", document.querySelector("#MHSwing").value)
    localStorage.setItem("OHMin", document.querySelector("#OHMin").value)
    localStorage.setItem("OHMax", document.querySelector("#OHMax").value)
    localStorage.setItem("OHSwing", document.querySelector("#OHSwing").value)
    localStorage.setItem("parry", document.querySelector("#parry").value)
    localStorage.setItem("dodge", document.querySelector("#dodge").value)
    localStorage.setItem("defense", document.querySelector("#defense").value)
    localStorage.setItem("tankarmor", document.querySelector("#tankarmor").value)
    localStorage.setItem("startRage", document.querySelector("#startRage").value)
    localStorage.setItem("deathwish", document.querySelector("#deathwish").checked)
    localStorage.setItem("crusaderMH", document.querySelector("#crusaderMH").checked)
    localStorage.setItem("crusaderOH", document.querySelector("#crusaderOH").checked)
    localStorage.setItem("thunderfuryMH", document.querySelector("#thunderfuryMH").checked)
    localStorage.setItem("thunderfuryOH", document.querySelector("#thunderfuryOH").checked)
    localStorage.setItem("windfury", document.querySelector("#windfury").checked)
    localStorage.setItem("wcb", document.querySelector("#wcb").checked)
    localStorage.setItem("dmf", document.querySelector("#dmf").checked)

    // Talents 
    localStorage.setItem("impHS", document.querySelector("#impHS").value) 
    localStorage.setItem("impSA", document.querySelector("#impSA").value) 
    localStorage.setItem("impale", document.querySelector("#impale").value) 
    localStorage.setItem("defiance", document.querySelector("#defiance").value) 
    localStorage.setItem("dwspec", document.querySelector("#dwspec").value) 

    // Trinkets
    localStorage.setItem("none", document.querySelector("#none").checked)
    localStorage.setItem("kots", document.querySelector("#kots").checked)
    localStorage.setItem("earthstrike", document.querySelector("#earthstrike").checked)
    localStorage.setItem("diamondflask", document.querySelector("#diamondflask").checked)
    localStorage.setItem("jomgabbar", document.querySelector("#jomgabbar").checked)
    localStorage.setItem("slayerscrest", document.querySelector("#slayerscrest").checked)

    // Boss Settings
    localStorage.setItem("swingMin", document.querySelector("#swingMin").value)
    localStorage.setItem("swingMax", document.querySelector("#swingMax").value)
    localStorage.setItem("swingTimer", document.querySelector("#swingTimer").value)
    localStorage.setItem("bossarmor", document.querySelector("#bossarmor").value)
    localStorage.setItem("debuffdelay", document.querySelector("#debuffdelay").value)
    
    // Other Bonuses
    localStorage.setItem("twoPieceDreadnaught", document.querySelector("#twoPieceDreadnaught").checked)
    localStorage.setItem("fivePieceWrath", document.querySelector("#fivePieceWrath").checked)
    localStorage.setItem("threatenchant", document.querySelector("#threatenchant").checked)

    // Calc Settings
    localStorage.setItem("iterations", document.querySelector("#iterations").value)
    localStorage.setItem("fightLength", document.querySelector("#fightLength").value)
    localStorage.setItem("TBPvalue", document.querySelector("#TBPvalue").value)
    localStorage.setItem("TBPtime", document.querySelector("#TBPtime").value)
    localStorage.setItem("lineSelect", document.querySelector("#lineSelect").selectedIndex)

}

function loadInput()
{
    // Tank Settings
    document.querySelector("#AP").value = localStorage.getItem("AP") ? localStorage.getItem("AP") : 2000;
    document.querySelector("#crit").value = localStorage.getItem("crit") ? localStorage.getItem("crit") : 40;
    document.querySelector("#hit").value = localStorage.getItem("hit") ? localStorage.getItem("hit") : 6;
    document.querySelector("#MHWepSkill").value = localStorage.getItem("MHWepSkill") ? localStorage.getItem("MHWepSkill") : 309;
    document.querySelector("#OHWepSkill").value = localStorage.getItem("OHWepSkill") ? localStorage.getItem("OHWepSkill") : 309;
    document.querySelector("#MHMin").value = localStorage.getItem("MHMin") ? localStorage.getItem("MHMin") : 60;
    document.querySelector("#MHMax").value = localStorage.getItem("MHMax") ? localStorage.getItem("MHMax") : 145;
    document.querySelector("#MHSwing").value = localStorage.getItem("MHSwing") ? localStorage.getItem("MHSwing") : 1.9;
    document.querySelector("#OHMin").value = localStorage.getItem("OHMin") ? localStorage.getItem("OHMin") : 86;
    document.querySelector("#OHMax").value = localStorage.getItem("OHMax") ? localStorage.getItem("OHMax") : 162;
    document.querySelector("#OHSwing").value = localStorage.getItem("OHSwing") ? localStorage.getItem("OHSwing") : 2.2;
    document.querySelector("#parry").value = localStorage.getItem("parry") ? localStorage.getItem("parry") : 7;
    document.querySelector("#dodge").value = localStorage.getItem("dodge") ? localStorage.getItem("dodge") : 24;
    document.querySelector("#defense").value = localStorage.getItem("defense") ? localStorage.getItem("defense") : 330;
    document.querySelector("#tankarmor").value = localStorage.getItem("tankarmor") ? localStorage.getItem("tankarmor") : 6000;
    document.querySelector("#startRage").value = localStorage.getItem("startRage") ? localStorage.getItem("startRage") : 70;
    document.querySelector("#deathwish").checked = localStorage.getItem("deathwish") == "false" ? false : true;
    document.querySelector("#crusaderMH").checked = localStorage.getItem("crusaderMH") == "false" ? false : true;
    document.querySelector("#crusaderOH").checked = localStorage.getItem("crusaderOH") == "true" ? true : false;
    document.querySelector("#thunderfuryMH").checked = localStorage.getItem("thunderfuryMH") == "false" ? false : true;
    document.querySelector("#thunderfuryOH").checked = localStorage.getItem("thunderfuryOH") == "true" ? true : false;
    document.querySelector("#windfury").checked = localStorage.getItem("windfury") == "true" ? true : false;
    document.querySelector("#wcb").checked = localStorage.getItem("wcb") == "true" ? true : false;
    document.querySelector("#dmf").checked = localStorage.getItem("dmf") == "true" ? true : false;

    // Talents 
    document.querySelector("#impHS").value = localStorage.getItem("impHS") ? localStorage.getItem("impHS") : 3; 
    document.querySelector("#impSA").value = localStorage.getItem("impSA") ? localStorage.getItem("impSA") : 0; 
    document.querySelector("#impale").value = localStorage.getItem("impale") ? localStorage.getItem("impale") : 0; 
    document.querySelector("#defiance").value = localStorage.getItem("defiance") ? localStorage.getItem("defiance") : 5; 
    document.querySelector("#dwspec").value = localStorage.getItem("dwspec") ? localStorage.getItem("dwspec") : 5; 

    // Trinkets
    document.querySelector("#none").checked = localStorage.getItem("none") == "true" ? true : false;
    document.querySelector("#kots").checked = localStorage.getItem("kots") == "true" ? true : false;
    document.querySelector("#earthstrike").checked = localStorage.getItem("earthstrike") == "true" ? true : false;
    document.querySelector("#diamondflask").checked = localStorage.getItem("diamondflask") == "true" ? true : false;
    document.querySelector("#jomgabbar").checked = localStorage.getItem("jomgabbar") == "true" ? true : false;
    document.querySelector("#slayerscrest").checked = localStorage.getItem("slayerscrest") == "true" ? true : false;

    // Boss Settings
    document.querySelector("#swingMin").value = localStorage.getItem("swingMin") ? localStorage.getItem("swingMin") : 4000;
    document.querySelector("#swingMax").value = localStorage.getItem("swingMax") ? localStorage.getItem("swingMax") : 4000;
    document.querySelector("#swingTimer").value = localStorage.getItem("swingTimer") ? localStorage.getItem("swingTimer") : 2;
    document.querySelector("#bossarmor").value = localStorage.getItem("bossarmor") ? localStorage.getItem("bossarmor") : 3731;
    document.querySelector("#debuffdelay").value = localStorage.getItem("debuffdelay") ? localStorage.getItem("debuffdelay") : 0;
    
    // Other Bonuses
    document.querySelector("#twoPieceDreadnaught").checked = localStorage.getItem("twoPieceDreadnaught") == "true" ? true : false;
    document.querySelector("#fivePieceWrath").checked = localStorage.getItem("fivePieceWrath") == "true" ? true : false;
    document.querySelector("#threatenchant").checked = localStorage.getItem("threatenchant") == "true" ? true : false;

    // Calc Settings
    document.querySelector("#iterations").value = localStorage.getItem("iterations") ? localStorage.getItem("iterations") : 10000;
    document.querySelector("#fightLength").value = localStorage.getItem("fightLength") ? localStorage.getItem("fightLength") : 12;
    document.querySelector("#TBPvalue").value = localStorage.getItem("TBPvalue") ? localStorage.getItem("TBPvalue") : 3000;
    document.querySelector("#TBPtime").value = localStorage.getItem("TBPtime") ? localStorage.getItem("TBPtime") : 3;
    document.querySelector("#lineSelect").selectedIndex = localStorage.getItem("lineSelect") ? localStorage.getItem("lineSelect") : 0;
}  

async function main() {

    // Cache the user input locally
    saveInput();
    // Fetch and set all user input settings
    fetchSettings()

    let start = Date.now()
    let results = {
        "MH Swing": [],
        "OH Swing": [],
        "Heroic Strike": [],
        "Bloodthirst": [],
        "Sunder Armor": [],
        "Revenge": [],
        "Thunderfury": [],
    };
    let tps = []
    let dps = []
    let dtps = []
    let rageGained = []
    let rageSpent = []
    let flurryUptime = []
    let crusaderUptime = []
    let snapshots = []
    let breaches = 0

    updateProgressbar(0)
    document.querySelector("#progressBar").style.display = `block`;
    document.querySelector("#barContainer").style.display = `block`;

    let numWorkers = window.navigator.hardwareConcurrency;
    let remainderIterations = _iterations - Math.floor(_iterations/numWorkers)*numWorkers
    let numWorkersDone = 0;
    let progressPerc = 0;
    for (var i = 0; i < numWorkers; i++) {
        var worker = new Worker('./workers/worker.js');
        let iterations = i == 0 ? Math.floor(_iterations/numWorkers) + remainderIterations : Math.floor(_iterations/numWorkers);
        if (iterations <= 0) {
            numWorkersDone++;
            continue;
        }
        worker.postMessage({
            globals: {
                _simDuration: _simDuration,
                _iterations: iterations,
                _timeStep: _timeStep,
                _snapshotLen: _snapshotLen,
                _config: _config,
                _breakpointValue: _breakpointValue,
                _breakpointTime: _breakpointTime,
                
                _startRage: _startRage,
                _deathwish: _deathwish,
                _crusaderMH: _crusaderMH,
                _crusaderOH: _crusaderOH,
                _thunderfuryMH: _thunderfuryMH,
                _thunderfuryOH: _thunderfuryOH,
                _windfury: _windfury,
                _wcb: _wcb,
                _dmf: _dmf,

                _impHS: _impHS,
                _impSA: _impSA,
                _defiance: _defiance,
                _dwspec: _dwspec,

                _kots: _kots,
                _diamondflask: _diamondflask,
                _earthstrike: _earthstrike,
                _slayerscrest: _slayerscrest,
                _jomgabbar: _jomgabbar,
                _lgg: _lgg,

                _landedHits: _landedHits,
            },
        })
        worker.addEventListener('error', function(e)  {
            console.log(`Error: Line ${e.lineno} in ${e.filename}: ${e.message}`)
        })
        worker.addEventListener('message', function(e) {
            if (e.data.type == 'progressUpdate') {
                progressPerc += e.data.progressPerc / numWorkers;
                updateProgressbar(progressPerc);
            } else {
                for (let ability in results) {
                    results[`${ability}`] = results[`${ability}`].concat(e.data.results[`${ability}`]);
                }
                tps = tps.concat(e.data.tps);
                dps = dps.concat(e.data.dps);
                dtps = dtps.concat(e.data.dtps);
                rageGained = rageGained.concat(e.data.rageGained);
                rageSpent = rageSpent.concat(e.data.rageSpent);
                flurryUptime = flurryUptime.concat(e.data.flurryUptime);
                crusaderUptime = crusaderUptime.concat(e.data.crusaderUptime);
                snapshots = snapshots.concat(e.data.snapshots);
                breaches += e.data.breaches;
                if (++numWorkersDone === numWorkers) {
                    postResults();
                }
            }
        })
    }
    
    function postResults() {

        let end = Date.now()

        // Some console logging...
        let ret = `Calculated ${_iterations} iterations of ${_simDuration}s. fights with timestep ${_timeStep} ms using ${numWorkers} threads in ${(end-start)/1000} seconds.`;
        console.log(ret);
        console.log(`TPS: ${average(tps)}`);
        console.log(`DPS: ${average(dps)}`);
        console.log(`DTPS: ${average(dtps)}`);
        for (let ability in results)
            console.log(`${ability}: ${average(results[`${ability}`])}`);
        console.log(`gainRPS: ${average(rageGained)}`);
        console.log(`spentRPS: ${average(rageSpent)}`);

        // Make the result table
        let abilityVec = [];
        for (let ability in results) {
            abilityVec.push(`<td>${ability}:</td><td>${Math.round(average(results[`${ability}`])*100)/100}</td>`);
        }
        let threatStatsVec = [];
        threatStatsVec.push(`<td>TPS standard deviation:</td><td>${Math.round(std(tps)*100)/100}</ts><td> (${Math.round(std(tps)/average(tps)*10000)/100}%)</td>`)
        threatStatsVec.push(`<td>DPS standard deviation:</td><td>${Math.round(std(dps)*100)/100}</ts><td> (${Math.round(std(dps)/average(dps)*10000)/100}%)</td>`)
        threatStatsVec.push(`<td>Threshold failed:</td><td>${breaches}</ts><td> (${Math.round(breaches/_iterations*10000)/100}%)</td>`)

        let el_div = document.querySelector("#resultContainer");
        el_div.innerHTML = `<h3>Results</h3>
        <table>
            <tr><th>General Stats</th><th></th><th>Ability TPS</th><th/><th>Threat Stats</th></tr>
            <tr><td>TPS: </td><td>${Math.round(average(tps)*100)/100}</td>${abilityVec[0]}${threatStatsVec[0]}</tr>
            <tr><td>DPS: </td><td>${Math.round(average(dps)*100)/100}</td>${abilityVec[1]}${threatStatsVec[1]}</tr>
            <tr><td>DTPS: </td><td>${Math.round(average(dtps)*100)/100}</td>${abilityVec[2]}${threatStatsVec[2]}</tr>
            <tr><td>RPS gained: </td><td>${Math.round(average(rageGained)*100)/100}</td>${abilityVec[3]}</tr>
            <tr><td>RPS spent: </td><td>${Math.round(average(rageSpent)*100)/100}</td>${abilityVec[4]}</tr>
            <tr><td>Flurry uptime: </td><td>${Math.round(average(flurryUptime)*100)/100}%</td>${abilityVec[5]}</tr>
            <tr><td>Crusader uptime: </td><td>${Math.round(average(crusaderUptime)*100)/100}%</td>${abilityVec[6]}</tr>
        </table>`;

        var x = linspace(0, _simDuration, _simDuration*1000/_snapshotLen + 1);

        let lineShape = document.querySelector("#lineSelect").options[document.querySelector("#lineSelect").selectedIndex].value

        // Make the graph
        var y_avg = [];
        var y_99 = [];
        var y_95 = [];
        var y_05 = [];
        var y_01 = [];
        snapshots.forEach(snapshot => {
            y_avg.push(Math.round(average(snapshot)));
            y_99.push(Math.round(quantile(snapshot, 0.99)));
            y_95.push(Math.round(quantile(snapshot, 0.95)));
            y_05.push(Math.round(quantile(snapshot, 0.05)));
            y_01.push(Math.round(quantile(snapshot, 0.01)));
        });

        var traceAvg = {
            x: x,
            y: y_avg,
            mode: 'lines+markers',
            name: "Average Threat",
            line: {
                color: '#939C56',
                shape: `${lineShape}`,
            },
            marker: {
                size: 4,
            }
        }

        var trace99 = {
            x: x,
            y: y_99,
            mode: 'lines+markers',
            name: "99th percentile",
            line: {
                color: '#569C81',
                shape: `${lineShape}`,
            },
            marker: {
                size: 4,
            }
        }

        var trace95 = {
            x: x,
            y: y_95,
            mode: 'lines+markers',
            name: "95th percentile",
            line: {
                color: '#569B65',
                shape: `${lineShape}`,
            },
            marker: {
                size: 4,
            }
        }

        var trace05 = {
            x: x,
            y: y_05,
            mode: 'lines+markers',
            name: "5th percentile",
            line: {
                color: '#966C44',
                shape: `${lineShape}`,
            },
            marker: {
                size: 4,
            }
        }
        var trace01 = {
            x: x,
            y: y_01,
            mode: 'lines+markers',
            name: "1st percentile",
            line: {
                color: '#964343',
                shape: `${lineShape}`,
            },
            marker: {
                size: 4,
            }
        }

    // BG grey 222629
    // dark grey 474b4f
    // medium grey 6b6e70
    // light gray c8ced1


        var plotData = [ trace99, trace95, traceAvg, trace05, trace01 ];
        var layout = {
            title: 'Threat Distribution',
            width: 1440,
            height: 810,

            plot_bgcolor: "#222629",
            paper_bgcolor: "#222629",
            
            titlefont: {color: "#c8ced1"}, 
            xaxis:{
                title:"Time (s)", 
                titlefont: {color: "#c8ced1"},
                tickfont: {color: "#c8ced1"}, 
                rangemode: "tozero",
                gridcolor: "#474b4f",
                linecolor: "#c8ced1",
                autotick: false,
                ticks: 'outside',
                tick0: 0,
                dtick: 1.5,
            },
            yaxis:{
                title:"Threat",
                titlefont: {color: "#c8ced1"},
                tickcolor: "#c8ced1",
                tickfont: {color: "#c8ced1"},
                rangemode: "tozero",
                gridcolor: "#474b4f",
                linecolor: "#c8ced1"},
            legend: {font: {color: "#c8ced1"}},
        }
        Plotly.newPlot('plotContainer', plotData, layout);

        document.querySelector("#progressBar").style.display = `none`;
        document.querySelector("#barContainer").style.display = `none`;
        document.querySelector("#plotContainer").style.display = `block`;
        document.querySelector("#resultContainer").style.display = `block`;
    }
}


