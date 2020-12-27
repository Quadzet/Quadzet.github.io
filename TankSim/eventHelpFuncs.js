"use strict";

function formatEvent(event) {
    let output = ``
    if(event["type"] == "damage") {
        if(!["dodge", "parry", "miss"].includes(event["hit"])) {
            output += `${event["timestamp"]/1000}: ${event["source"]}'s ${event["ability"]} ${ event["hit"]}s ${event["target"]} for ${event["damage"]} damage!`
        } else {
            output += `${event["timestamp"]/1000}: ${event["source"]}'s ${event["ability"]} is ${event["hit"] == "parry" ? `parried` : `dodged`} by ${event["target"]}!`
        }
    } else if(event["type"] == "buff gained") {
        output += `${event["timestamp"]/1000}: ${event["target"]} gains ${event["name"]}${event["stacks"] != 0 ? `(${event["stacks"]})`  : ``}.`
    } else if( event["type"] == "buff lost") {
        output += `${event["timestamp"]/1000}: ${event["name"]}${event["stacks"] != 0 ? `(${event["stacks"]})`  : ``} fades from ${event["target"]}.`
    } else if(event["type"] == "spell cast") {
        output += `${event["timestamp"]/1000}: ${event["source"]} casts ${event["name"]}.`
    }
    return output
}

function getAmount(event, ability, type) {
    if (event[`${type}`] && event.ability == ability) return event[`${type}`];
    else return 0;
}