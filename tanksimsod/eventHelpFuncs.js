"use strict";

function formatEvent(event) {
    let output = `${(Math.round(event["timestamp"])/1000).toFixed(3)}:\t`
    if (["swingTimer", "cooldownFinish", "GCD"].includes(event.type))
      return;
    else if (event.type == "combatStart") {
      output += `Combat Starts.`;
    }
    else if(event["type"] == "damage") {
        if(!["dodge", "parry", "miss", "block"].includes(event["hit"])) {
            output += `${event["source"]}'s ${event["name"]} ${ event["hit"] == 'crush' ? `crushes` : event["hit"] + "s"} ${event["target"]} for ${Math.round(event["amount"])} damage!`
        } else if(["crit block", "block"].includes(event["hit"])) {
            output += `${event["source"]}'s ${event["name"]} ${event["hit"] == "block" ? `hits` : `crits`} ${event["target"] } for ${Math.round(event["amount"])} damage (${Math.round(event.blockAmount)} blocked)!`
        } else {
            output += `${event["source"]}'s ${event["name"]} ${event["hit"] == "parry" ? `is parried by` : event["hit"] == "dodge" ? `is dodged by` : `misses`} ${event["target"]}!`
        }
    } else if(event["type"] == "auraExpire") {    
        output += `${event.source}'s ${event.name}${event.stacks == 0 ? "" : `(${event.stacks})`} fades from ${event.owner}.`
    } else if(event["type"] == "auraRemoveStack") {    
        output += `${event.source}'s ${event.name} on ${event.owner} loses a stack (${event.stacks}->${event.stacks - 1}).`
    } else if(event["type"] == "auraApply") {    
        output += `${event.owner} gains ${event.name}${event.stacks == 0 ? "" : `(${event.stacks})`} from ${event.source}.`
    } else if(event["type"] == "auraRefresh") {    
        output += `${event.owner}'s ${event.name}${event.stacks == 0 ? "" : `(${event.stacks})`} is refreshed by ${event.source}.`
    } else if(event["type"] == "spellCast") {
        output += `${event["source"]} casts ${event["name"]}.`
    } else if(event["type"] == "extra attack") {
        output += `${event["source"]} gains an extra attack from ${event["name"]}!`
    } else if(event["type"] == "rage") {
        output += `Tank gains ${(event["amount"]).toFixed(2)} rage from ${event["source"]}'s ${event["name"]} (${event.currentAmount.toFixed(2)} -> ${Math.min(100, event.currentAmount + event.amount).toFixed(2)})!`
    }
    else {
      output += `Unknown event type: ${event.type}: ${JSON.stringify(event)}`;
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
function checkInput(name, val, suffix) {
  if (!val)
    log_message("Missing " + name + suffix);
}

function generateDamageEvent(input) {
  let name = input.name || "Unknown";
  let suffix = " when generating damage_event for " + name + ".";
  checkInput('name', input.name, suffix);
  checkInput('timestamp', input.timestamp, suffix);
  checkInput('hit', input.hit, suffix);
  checkInput('amount', input.amount, suffix);
  checkInput('source', input.source, suffix);
  checkInput('target', input.target, suffix);
  checkInput('threat', input.threat, suffix);
  checkInput('trigger', input.trigger, suffix);
  return {
    name: input.name,
    timestamp: input.timestamp,
    type: "damage",
    hit: input.hit,
    amount: input.amount,
    source: input.source,
    target: input.target,

    threat: input.threat,
    trigger: input.trigger,
  }
}

function generateTickEvents(input) {
  let name = input.name || "Unknown";
  let suffix = " when generating damage_event for " + name + ".";
  checkInput('timestamp', input.timestamp, suffix);
  checkInput('duration', input.duration, suffix);
  checkInput('interval', input.interval, suffix);
  let events = [];
  for (let i = 1; i < ~~(input.duration/input.interval); i++) {
    events.push(
      generateDamageEvent({
        name: input.name,
        timestamp: input.timestamp + i*input.interval,
        hit: "tick",
        amount: input.amount,
        source: input.source,
        target: input.target,
        trigger: input.trigger,
        threat: input.threat,
      })
    );
  }
  return events;
}

function sortDescending(futureEvents) {
    futureEvents.sort( (a,b) => b.timestamp - a.timestamp )
}


function registerFutureEvents(events, futureEvents) {
  events.forEach(event => {
    futureEvents.push(event)
  });
  sortDescending(futureEvents)
}