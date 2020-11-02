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


async function main() {

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
                _thunderfury: _thunderfury,
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


