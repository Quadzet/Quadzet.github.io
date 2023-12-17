"use strict";

function formatEvent(event) {
    let output = `${(Math.round(event["timestamp"])/1000).toFixed(3)}:\t`
    if(event["type"] == "damage") {
        if(!["dodge", "parry", "miss", "block"].includes(event["hit"])) {
            output += `${event["source"]}'s ${event["name"]} ${ event["hit"] == 'crush' ? `crushes` : event["hit"] + "s"} ${event["target"]} for ${Math.round(event["amount"])} damage!`
        } else if(["crit block", "block"].includes(event["hit"])) {
            output += `${event["source"]}'s ${event["name"]} ${event["hit"] == "block" ? `hits` : `crits`} ${event["target"] } for ${Math.round(event["amount"])} damage (${Math.round(event.blockAmount)} blocked)!`
        } else {
            output += `${event["source"]}'s ${event["name"]} ${event["hit"] == "parry" ? `is parried by` : event["hit"] == "dodge" ? `is dodged by` : `misses`} ${event["target"]}!`
        }
    } else if(event["type"] == "auraExpire") {    
        output += `${event.source}'s ${event.name}${event.stacks == 0 ? "" : `(${event.stacks})`} fades from ${event.owner}.`
    } else if(event["type"] == "auraApply") {    
        output += `${event.owner} gains ${event.name}${event.stacks == 0 ? "" : `(${event.stacks})`} from ${event.source}.`
    } else if(event["type"] == "auraRefresh") {    
        output += `${event.owner}'s ${event.name}${event.stacks == 0 ? "" : `(${event.stacks})`} is refreshed by ${event.source}.`
    } else if(event["type"] == "spellCast") {
        output += `${event["source"]} casts ${event["name"]}.`
    } else if(event["type"] == "extra attack") {
        output += `${event["source"]} gains an extra attack from ${event["name"]}!`
    } else if(event["type"] == "rage") {
        output += `Tank gains ${(event["amount"]).toFixed(2)} rage from ${event["source"]}'s ${event["name"]}!`
    }

    return output
}

function getAmount(event, ability, type) {
    if (event[`${type}`] && event.ability == ability) return event[`${type}`];
    else return 0;
}

function statRound(val) {
  let floor_val = Math.floor(val);
  let remainder = val - floor_val;
  let rng = Math.random();
  if (rng < remainder) {
    return floor_val + 1;
  } else {
    return floor_val;
  }
}

function sortDescending(futureEvents) {
    futureEvents.sort( (a,b) => b.timestamp - a.timestamp )
}

function registerFutureEvent(event, futureEvents) {
    futureEvents.push(event)
    sortDescending(futureEvents)
}