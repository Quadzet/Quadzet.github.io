"use strict";

function formatEvent(event) {
    let output = `${(Math.round(event["timestamp"])/1000).toFixed(3)}:\t`
    let name = event.name;
    if (event.rank != null && event.rank > 0)
      name += ' (Rank ' + event.rank + ')';
    if (["swingTimer", "cooldownFinish", "GCD"].includes(event.type))
      return;
    else if (event.type == "combatStart") {
      output += `Combat Starts.`;
    }
    else if(event["type"] == "damage") {
            output += `${event["source"]}'s ${name} `;
            
            if (['dodge', 'parry', 'miss'].includes(event.hit)) {
              output += `${event["hit"] == "parry" ? `is parried by` : event["hit"] == "dodge" ? `is dodged by` : `misses`} ${event["target"]}!`
            } else {
              if (event.hit == 'hit') output += ' hits ';
              else if (event.hit == 'crush') output += ' crushes ';
              else if (event.hit == 'tick') output += ' ticks on ';
              else if (event.hit == 'block') output += ' hits ';
              else if (event.hit == 'crit') output += ' crits ';
              else if (event.hit == 'crit block') output += ' crits ';
              else if (event.hit == 'glance') output += ' glances ';
              else if (event.hit == 'dodge') output += ' is dodged ';
              else if (event.hit == 'glance') output += ' glances ';
              else if (event.hit == 'glance') output += ' glances ';

              output += `${event["target"] } for ${event["amount"].toFixed(2)} damage`
              if (event.resist || 0 > 0) output += ` (${event.resist.toFixed(2)} resisted)!`;
              else if (event.blockAmount && event.blockAmount > 0) output += ` (${event.blockAmount.toFixed(2)} blocked)!`
              else output += '!'
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
        output += `${event["source"]} casts ${name}.`
    } else if(event["type"] == "extra attack") {
        output += `${event["source"]} gains an extra attack from ${name}!`
    } else if(event["type"] == "rage") {
        output += `Tank gains ${(event["amount"]).toFixed(2)} rage from ${event["source"]}'s ${name} (${event.currentAmount.toFixed(2)} -> ${Math.min(100, event.currentAmount + event.amount).toFixed(2)})!`
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
    log_message(LOG_LEVEL.WARNING, "Missing " + name + suffix);
}

function clearFutureTicks(name, futureEvents) {
  while (true) {
    let index = futureEvents.findIndex(e => {return (e.type == "damage" && e.name == name)})
    if(index >= 0) {
      futureEvents.splice(index, 1)
    }
    else 
      break;
  }
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
  input.type = "damage";
  return input; 
}

function generateTickEvents(input) {
  let name = input.name || "Unknown";
  let suffix = " when generating damage_event for " + name + ".";
  checkInput('timestamp', input.timestamp, suffix);
  checkInput('duration', input.duration, suffix);
  checkInput('interval', input.interval, suffix);
  let events = [];
  input.hit = 'hit';  
  let timestamp = input.timestamp;
  for (let i = 1; i < ~~(input.duration / input.interval); i++) {
    let inputCopy = { ...input };
    inputCopy.timestamp = timestamp + i * input.interval;
    events.push(generateDamageEvent(inputCopy));
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