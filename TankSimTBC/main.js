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
    // Player Stats
    localStorage.setItem("playerstrength", document.getElementById("playerstrength").value)
    localStorage.setItem("playeragility", document.getElementById("playeragility").value)
    localStorage.setItem("playerhit", document.getElementById("playerhit").value)
    localStorage.setItem("playerexpertise", document.getElementById("playerexpertise").value)
    localStorage.setItem("playercrit", document.getElementById("playercrit").value)
    localStorage.setItem("playerattackpower", document.getElementById("playerattackpower").value)
    localStorage.setItem("playerarmor", document.getElementById("playerarmor").value)
    localStorage.setItem("playerdefense", document.getElementById("playerdefense").value)
    localStorage.setItem("playerresilience", document.getElementById("playerresilience").value)
    localStorage.setItem("playerdodge", document.getElementById("playerdodge").value)
    localStorage.setItem("playerparry", document.getElementById("playerparry").value)
    localStorage.setItem("playerblock", document.getElementById("playerblock").value)
    localStorage.setItem("playerblockvalue", document.getElementById("playerblockvalue").value)
    localStorage.setItem("playerwepmin", document.getElementById("playerwepmin").value)
    localStorage.setItem("playerwepmax", document.getElementById("playerwepmax").value)
    localStorage.setItem("playerswing", document.getElementById("playerswing").value)


    localStorage.setItem("startRage", document.querySelector("#startRage").value)
    localStorage.setItem("windfury", document.querySelector("#windfury").checked)

    localStorage.setItem("TF", document.getElementById("TF").checked)

    // Consumes
    localStorage.setItem("fortification", document.getElementById("fortification").checked)
    localStorage.setItem("ironshield", document.getElementById("ironshield").checked)

    // Talents 
    localStorage.setItem("impHS", document.getElementById("impHS").value)
    localStorage.setItem("impSA", document.getElementById("impSA").value)
    localStorage.setItem("focusedrage", document.getElementById("focusedrage").value)
    localStorage.setItem("1hspec", document.getElementById("1hspec").value)
    localStorage.setItem("vitality", document.getElementById("vitality").value)
    localStorage.setItem("shieldspec", document.getElementById("shieldspec").value)
    localStorage.setItem("shieldmastery", document.getElementById("shieldmastery").value)
    localStorage.setItem("AM", document.getElementById("AM").value)
    
    // Buffs
    localStorage.setItem("inspiration", document.getElementById("inspiration").checked);
    localStorage.setItem("devo", document.getElementById("devo").checked);
    localStorage.setItem("imploh", document.getElementById("imploh").checked);

    localStorage.setItem("bloodlust", document.getElementById("bloodlust").checked);
    localStorage.setItem("sealofcrusader", document.getElementById("sealofcrusader").checked);
    localStorage.setItem("unleashedrage", document.getElementById("unleashedrage").checked);
    localStorage.setItem("sanctityaura", document.getElementById("sanctityaura").checked);
    localStorage.setItem("heroicpresence", document.getElementById("heroicpresence").checked);
    localStorage.setItem("impfaeriefire", document.getElementById("impfaeriefire").checked);
    localStorage.setItem("bloodfrenzy", document.getElementById("bloodfrenzy").checked);
    localStorage.setItem("drums", document.getElementById("drums").value);
    localStorage.setItem("ferociousinspiration", document.getElementById("ferociousinspiration").value);

    localStorage.setItem("bshout", document.getElementById("bshout").checked);
    localStorage.setItem("pack", document.getElementById("pack").checked);
    localStorage.setItem("trueshot", document.getElementById("trueshot").checked);
    localStorage.setItem("mark", document.getElementById("mark").checked);
    localStorage.setItem("kings", document.getElementById("kings").checked);
    localStorage.setItem("might", document.getElementById("might").checked);
    localStorage.setItem("windfury", document.getElementById("windfury").checked);
    localStorage.setItem("strofearth", document.getElementById("strofearth").checked);
    localStorage.setItem("graceofair", document.getElementById("graceofair").checked);
    localStorage.setItem("impweptotems", document.getElementById("impweptotems").checked);

    // Boss Settings
    localStorage.setItem("swingMin", document.querySelector("#swingMin").value)
    localStorage.setItem("swingMax", document.querySelector("#swingMax").value)
    localStorage.setItem("swingTimer", document.querySelector("#swingTimer").value)
    localStorage.setItem("bossarmor", document.querySelector("#bossarmor").value)

    localStorage.setItem("curseofrecklessness", document.querySelector("#curseofrecklessness").checked)
    localStorage.setItem("faeriefire", document.querySelector("#faeriefire").checked)
    localStorage.setItem("iea", document.querySelector("#iea").checked)

    // Calc Settings
    localStorage.setItem("iterations", document.querySelector("#iterations").value)
    localStorage.setItem("fightLength", document.querySelector("#fightLength").value)
}

function loadInput()
{
    // Tank Stats
    document.getElementById("playerstrength").value = localStorage.getItem("playerstrength") ? localStorage.getItem("playerstrength") : 200;
    document.getElementById("playeragility").value = localStorage.getItem("playeragility") ? localStorage.getItem("playeragility") : 200;
    document.getElementById("playerhit").value = localStorage.getItem("playerhit") ? localStorage.getItem("playerhit") : 9;
    document.getElementById("playerexpertise").value = localStorage.getItem("playerexpertise") ? localStorage.getItem("playerexpertise") : 6;
    document.getElementById("playercrit").value = localStorage.getItem("playercrit") ? localStorage.getItem("playercrit") : 15;
    document.getElementById("playerattackpower").value = localStorage.getItem("playerattackpower") ? localStorage.getItem("playerattackpower") : 1200;
    document.getElementById("playerarmor").value = localStorage.getItem("playerarmor") ? localStorage.getItem("playerarmor") : 14000;
    document.getElementById("playerdefense").value = localStorage.getItem("playerdefense") ? localStorage.getItem("playerdefense") : 490;
    document.getElementById("playerresilience").value = localStorage.getItem("playerresilience") ? localStorage.getItem("playerresilience") : 34;
    document.getElementById("playerdodge").value = localStorage.getItem("playerdodge") ? localStorage.getItem("playerdodge") : 18;
    document.getElementById("playerparry").value = localStorage.getItem("playerparry") ? localStorage.getItem("playerparry") : 12;
    document.getElementById("playerblock").value = localStorage.getItem("playerblock") ? localStorage.getItem("playerblock") : 11;
    document.getElementById("playerblockvalue").value = localStorage.getItem("playerblockvalue") ? localStorage.getItem("playerblockvalue") : 240;
    document.getElementById("playerwepmin").value = localStorage.getItem("playerwepmin") ? localStorage.getItem("playerwepmin") : 120;
    document.getElementById("playerwepmax").value = localStorage.getItem("playerwepmax") ? localStorage.getItem("playerwepmax") : 140;
    document.getElementById("playerswing").value = localStorage.getItem("playerswing") ? localStorage.getItem("playerswing") : 1.7;

    document.querySelector("#startRage").value = localStorage.getItem("startRage") ? localStorage.getItem("startRage") : 70;
    document.querySelector("#windfury").checked = localStorage.getItem("windfury") == "true" ? true : false;

    document.getElementById("TF").checked = localStorage.getItem("TF") == "true" ? true : false;

    // Consumes
    document.getElementById("fortification").checked = localStorage.getItem("fortification") == "true" ? true : false;
    document.getElementById("ironshield").checked = localStorage.getItem("ironshield") == "true" ? true : false;

    // Talents 
    //document.getElementById("deflection").value = localStorage.getItem("deflection") ? localStorage.getItem("deflection") : 0;
    //document.getElementById("cruelty").value = localStorage.getItem("cruelty") ? localStorage.getItem("cruelty") : 5;
    //document.getElementById("anticipation").value = localStorage.getItem("anticipation") ? localStorage.getItem("anticipation") : 0;
    //document.getElementById("toughness").value = localStorage.getItem("toughness") ? localStorage.getItem("toughness") : 3;
    document.querySelector("#impHS").value = localStorage.getItem("impHS") ? localStorage.getItem("impHS") : 0; 
    document.querySelector("#impSA").value = localStorage.getItem("impSA") ? localStorage.getItem("impSA") : 0; 
    document.getElementById("focusedrage").value = localStorage.getItem("focusedrage") ? localStorage.getItem("focusedrage") : 0;
    document.getElementById("1hspec").value = localStorage.getItem("1hspec") ? localStorage.getItem("1hspec") : 0;
    document.getElementById("vitality").value = localStorage.getItem("vitality") ? localStorage.getItem("vitality") : 0;
    document.getElementById("shieldspec").value = localStorage.getItem("shieldspec") ? localStorage.getItem("shieldspec") : 0;
    document.getElementById("shieldmastery").value = localStorage.getItem("shieldmastery") ? localStorage.getItem("shieldmastery") : 0;
    document.getElementById("AM").value = localStorage.getItem("AM") ? localStorage.getItem("AM") : 0;
    //document.querySelector("#defiance").value = localStorage.getItem("defiance") ? localStorage.getItem("defiance") : 5; 

    // Buffs
    document.getElementById("inspiration").checked = localStorage.getItem("inspiration") == "true" ? true : false;
    document.getElementById("devo").checked = localStorage.getItem("devo") == "true" ? true : false;
    document.getElementById("imploh").checked = localStorage.getItem("imploh") == "true" ? true : false;

    document.getElementById("bshout").checked = localStorage.getItem("bshout") == "true" ? true : false;
    document.getElementById("pack").checked = localStorage.getItem("pack") == "true" ? true : false;
    document.getElementById("trueshot").checked = localStorage.getItem("trueshot") == "true" ? true : false;
    document.getElementById("mark").checked = localStorage.getItem("mark") == "true" ? true : false;
    document.getElementById("kings").checked = localStorage.getItem("kings") == "true" ? true : false;
    document.getElementById("might").checked = localStorage.getItem("might") == "true" ? true : false;
    document.getElementById("windfury").checked = localStorage.getItem("windfury") == "true" ? true : false;
    document.getElementById("strofearth").checked = localStorage.getItem("strofearth") == "true" ? true : false;
    document.getElementById("graceofair").checked = localStorage.getItem("graceofair") == "true" ? true : false;
    document.getElementById("impweptotems").checked = localStorage.getItem("impweptotems") == "true" ? true : false;

    document.getElementById("sealofcrusader").checked = localStorage.getItem("sealofcrusader") == "true" ? true : false;
    document.getElementById("bloodlust").checked = localStorage.getItem("bloodlust") == "true" ? true : false;
    document.getElementById("unleashedrage").checked = localStorage.getItem("unleashedrage") == "true" ? true : false;
    document.getElementById("sanctityaura").checked = localStorage.getItem("sanctityaura") == "true" ? true : false;
    document.getElementById("heroicpresence").checked = localStorage.getItem("heroicpresence") == "true" ? true : false;
    document.getElementById("impfaeriefire").checked = localStorage.getItem("impfaeriefire") == "true" ? true : false;
    document.getElementById("bloodfrenzy").checked = localStorage.getItem("bloodfrenzy") == "true" ? true : false;

    document.getElementById("drums").value = localStorage.getItem("drums") ? localStorage.getItem("drums") : 0;
    document.getElementById("ferociousinspiration").value = localStorage.getItem("ferociousinspiration") ? localStorage.getItem("ferociousinspiration") : 0;

    // Boss Settings
    document.querySelector("#swingMin").value = localStorage.getItem("swingMin") ? localStorage.getItem("swingMin") : 4000;
    document.querySelector("#swingMax").value = localStorage.getItem("swingMax") ? localStorage.getItem("swingMax") : 4000;
    document.querySelector("#swingTimer").value = localStorage.getItem("swingTimer") ? localStorage.getItem("swingTimer") : 2;
    document.querySelector("#bossarmor").value = localStorage.getItem("bossarmor") ? localStorage.getItem("bossarmor") : 3731;
    document.querySelector("#curseofrecklessness").checked = localStorage.getItem("curseofrecklessness") == "true" ? true : false;
    document.querySelector("#faeriefire").checked = localStorage.getItem("faeriefire") == "true" ? true : false;
    document.querySelector("#iea").checked = localStorage.getItem("iea") == "true" ? true : false;

    // Calc Settings
    document.querySelector("#iterations").value = localStorage.getItem("iterations") ? localStorage.getItem("iterations") : 10000;
    document.querySelector("#fightLength").value = localStorage.getItem("fightLength") ? localStorage.getItem("fightLength") : 12;
}  

function onLoadPage()
{
    loadInput();
    //updateStats();
}

async function main() {

    // Cache the user input locally
    saveInput();
    // Fetch and set all user input settings
    //fetchSettings()
    const globals = updateStats();
    
    document.getElementById("errorContainer").innerHTML = ""
    /*
    if(Number(document.getElementById("fightLength").value) > 120){
        document.getElementById("errorContainer").innerHTML = "Please choose a fight duration below 120."
        return;
    }*/

    let start = Date.now()
    let results = {};
    let uptimes = {};
    let tps = []
    let dps = []
    let dtps = []
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
    let remainderIterations = globals.config.iterations - Math.floor(globals.config.iterations/numWorkers)*numWorkers
    let numWorkersDone = 0;
    let progressPerc = 0;
    /*
    var worker = new Worker('./workers/worker.js')
    worker.postMessage({
        globals: globals,
        iterations: globals.config.iterations,//iterations,
    })
    worker.addEventListener('error', function(e)  {
        console.log(`Error: Line ${e.lineno} in ${e.filename}: ${e.message}`)
    })
    worker.addEventListener('message', function(e) {
        let end = Date.now()
        let ret = `Calculated ${globals.config.iterations} iterations of ${globals.config.simDuration}s. fights using ${numWorkers} threads in ${(end-start)/1000} seconds.`;
        console.log(ret);
        console.log(`Example fight:`)
        e.data.events.forEach( e => console.log(formatEvent(e)))
    })*/
    for (var i = 0; i < numWorkers; i++) {
        var worker = new Worker('./workers/worker.js');
        let iterations = i == 0 ? Math.floor(globals.config.iterations/numWorkers) + remainderIterations : Math.floor(globals.config.iterations/numWorkers);
        if (iterations <= 0) {
            numWorkersDone++;
            continue;
        }
        worker.postMessage({
            globals: globals,
            iterations: iterations,
        })
        worker.addEventListener('error', function(e)  {
            console.log(`Error: Line ${e.lineno} in ${e.filename}: ${e.message}`)
        })
        worker.addEventListener('message', function(e) {
            if (e.data.type == 'progressUpdate') {
                progressPerc += e.data.progressPerc / numWorkers;
                updateProgressbar(progressPerc);
            } else {
                for (let ability in e.data.results.breakdown) {
                    if(!results[`${ability}`]) results[`${ability}`] = [];
                    results[`${ability}`] = results[`${ability}`].concat(e.data.results.breakdown[`${ability}`]);
                }
                //for (let ability in e.data.uptimes) {
                //    if(!uptimes[`${ability}`]) uptimes[`${ability}`] = [];
                //    uptimes[`${ability}`] = uptimes[`${ability}`].concat(e.data.uptimes[`${ability}`]);
                //}
                tps = tps.concat(e.data.results.tps);
                dps = dps.concat(e.data.results.dps);
                dtps = dtps.concat(e.data.results.dtps);
                //rageGained = rageGained.concat(e.data.rageGained);
                //rageSpent = rageSpent.concat(e.data.rageSpent);
                //snapshots = snapshots.concat(e.data.snapshots);
                //breaches += e.data.breaches;
                //bossSwings += e.data.bossSwings;
                if (++numWorkersDone === numWorkers) {
                    exampleEvents = e.data.events
                    postResults();
                }
            }
        })
    }
    
    function postResults() {

        let end = Date.now()
        //console.log(`Boss swingtimer: ${(globals.config.simDuration * globals.config.iterations)/bossSwings}`)
        // Some console logging...
        /*console.log(ret);
        console.log(`Example fight:`)
        exampleEvents.forEach( e => console.log(formatEvent(e)))
        console.log(`TPS: ${Math.round(average(tps)*100)/100}`);
        console.log(`DPS: ${Math.round(average(dps)*100)/100}`);
        console.log(`DTPS: ${Math.round(average(dtps)*100)/100}`);
        for (let ability in results)
            console.log(`${ability}: ${Math.round(average(results[`${ability}`])*100)/100}`);*/
        //console.log(`gainRPS: ${Math.round(average(rageGained)*100)/100}`);
        //console.log(`spentRPS: ${Math.round(average(rageSpent)*100)/100}`);

        for(let result in results) {
            results[`${result}`] = [...Array(globals.config.iterations - results[`${result}`].length)].map((_, i) => 0).concat(results[`${result}`])
        }
        let sortedResults = Object.keys(results).map(key => [key, results[key]])
        sortedResults.sort((a,b) => average(b[1]) - average(a[1]))

        let resultTable = `<table><tr><th>Ability TPS</th></tr>`;
        for (let i in sortedResults) {
            resultTable = resultTable.concat(`<tr><td>${sortedResults[i][0]}:</td><td>${Math.round(average(sortedResults[i][1])*100)/100}</td></tr>`)
        }
        resultTable = resultTable.concat(`</table>`)
        let statsTable = 
        `<table>
        <tr><th>Statistics</th></tr>
        <tr><td>TPS standard deviation:</td><td>${Math.round(std(tps)*100)/100}</ts><td> (${Math.round(std(tps)/average(tps)*10000)/100}%)</td></tr>
        <tr><td>DPS standard deviation:</td><td>${Math.round(std(dps)*100)/100}</ts><td> (${Math.round(std(dps)/average(dps)*10000)/100}%)</td></tr>
        <tr><td>DTPS standard deviation:</td><td>${Math.round(std(dtps)*100)/100}</ts><td> (${Math.round(std(dtps)/average(dtps)*10000)/100}%)</td></tr>
        </table>`

        let generalTable = 
        `<table>
        <tr><th>General Stats</th></tr>
        <tr><td>TPS: </td><td>${Math.round(average(tps)*100)/100}</td></tr>
        <tr><td>DPS: </td><td>${Math.round(average(dps)*100)/100}</td></tr>
        <tr><td>DTPS: </td><td>${Math.round(average(dtps)*100)/100}</td></tr>
        `
/*
        for(let ability in uptimes) {
            uptimes[`${ability}`] = [...Array(globals.config.iterations - uptimes[`${ability}`].length)].map((_, i) => 0).concat(uptimes[`${ability}`])
        }
        let sortedUptimes = Object.keys(uptimes).map(key => [key, uptimes[key]])
        sortedUptimes.sort((a,b) => average(b[1]) - average(a[1]))
        for (let i in sortedUptimes) {
            //sortedUptimes[i][1] = sortedUptimes[i][1].concat([...Array(globals.config.iterations - sortedUptimes[i][1].length)].map((_, i) => 0)) // fill with zeros
            generalTable = generalTable.concat(`<tr><td>${sortedUptimes[i][0]} uptime:</td><td>${Math.round(average(sortedUptimes[i][1])*100)/100}%</td></tr>`)
        }
        generalTable = generalTable.concat(`</table>`)
*/

        document.getElementById("resultsHeader").innerHTML = `<h2>Results</h2>`
        document.getElementById("generalStats").innerHTML = generalTable;
        document.getElementById("abilitytps").innerHTML = resultTable;
        document.getElementById("statistics").innerHTML = statsTable;

        let timelineHeaderDOM = document.querySelector("#timeline>div")
        timelineHeaderDOM.innerHTML = `Calculated ${globals.config.iterations} iterations of ${globals.config.simDuration}s. fights using ${numWorkers} threads in ${(end-start)/1000} seconds.`
        timelineHeaderDOM.innerHTML += "</br>"
        timelineHeaderDOM.innerHTML += "Example fight:"
        timelineHeaderDOM.innerHTML += "</br>"

        let timelineDOM = document.querySelector("#timeline>pre>code")
        timelineDOM.innerHTML = ""
        exampleEvents.forEach( e => {
            timelineDOM.innerHTML += formatEvent(e)
            timelineDOM.innerHTML += "</br>"
        })



        /*
        var x = linspace(0, globals.config.simDuration, globals.config.simDuration*1000/globals.config.snapshotLen + 1);

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
        Plotly.newPlot('plotContainer', plotData, layout);*/

        document.querySelector("#progressBar").style.display = `none`;
        document.querySelector("#barContainer").style.display = `none`;
        document.querySelector("#plotContainer").style.display = `block`;
        document.querySelector("#resultContainer").style.display = `block`;
        document.querySelector("#timeline").style.display = `block`;
    }
}


