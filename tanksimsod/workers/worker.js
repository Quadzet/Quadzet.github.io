const range = (length) =>
    Array.from({ length }, (_, i) => i)


self.addEventListener('message', function(e) {
    let globals = e.data.globals;
    let iterations = e.data.iterations;

    importScripts('../logging.js', '../abilities.js', '../rotation.js', '../actor.js', '../attacktable.js', '../auras.js', '../procs.js', '../eventHelpFuncs.js');

    let TankProcs = getTankProcs(globals);
    let BossProcs = getBossProcs(globals);

    globals.config = globals.config;

    function handleEvent(event, futureEvents)
    {
      let newEvents = [];
      // let newFutureEvents = []; 
      let reactiveEvents = [event]; // slightly inefficient
      do {
        // event = reactiveEvents.pop();
        event = reactiveEvents.shift();
        if(event.type == "combatStart") {
          let source = Actors["Tank"];
          let target = Actors["Boss"];

          handleCombatStart(source, target, reactiveEvents, futureEvents);
          handleCombatStart(target, source, reactiveEvents, futureEvents);
        }
        else if (event.type == "scheduledEvent") {
          let source = Actors["Tank"];
          let target = Actors["Boss"];
          handleScheduledEvent(event, source, target, reactiveEvents, futureEvents);
        }
        else if(event.type == "swingTimer") {
          let source = Actors[event.source];
          let target = Actors[event.target];
          source.abilities[event.name].use(event.timestamp, source, target, reactiveEvents, futureEvents); // source and target are just names, find them in the global actor list.
        }
        else if(event.type == "GCD") {
          let source = Actors[event.source];
          let target = source.target;
          source.onGCD = false
          performAction(event.timestamp, source, target, reactiveEvents, futureEvents)
        }
        else if(event.type == "cooldownFinish") {
          Actors["Tank"].handleEvent(event, reactiveEvents, futureEvents)
        }
        else if(event.type == "auraExpire") {
          Actors["Tank"].handleEvent(event, reactiveEvents, futureEvents)
          Actors["Boss"].handleEvent(event, reactiveEvents, futureEvents)
        }
        else if(event.type == "auraApply") {
          Actors["Tank"].handleEvent(event, reactiveEvents, futureEvents)
          Actors["Boss"].handleEvent(event, reactiveEvents, futureEvents)
        }
        else if(event.type == "rage") {
          Actors["Tank"].handleEvent(event, reactiveEvents, futureEvents)
        }
        else if(event.type == "extra attack") {
          Actors["Tank"].handleEvent(event, reactiveEvents, futureEvents)
        }
        else if(event.type == "damage") {
          Actors["Tank"].handleEvent(event, reactiveEvents, futureEvents)
          Actors["Boss"].handleEvent(event, reactiveEvents, futureEvents)
        }
        else if (event.type == "spellCast") {
          Actors["Tank"].handleEvent(event, reactiveEvents, futureEvents)
          Actors["Boss"].handleEvent(event, reactiveEvents, futureEvents)
        }
        if (event.type == "damage" && event.hit == "parry") {
          handleParryHaste(event, Actors[event.target], futureEvents)
        }
        
        newEvents.push(event);
      } while (reactiveEvents.length > 0)

      sortDescending(futureEvents);
      return newEvents;
    }

    function generatePrePullEvents(Tank, Boss, eventList, FutureEvents) {
      // Prepull Death Wish
      if (Tank.abilities["Death Wish"] && Tank.stats.rotation['death-wish'].use)
        FutureEvents.push({timestamp: -1500, type: "scheduledEvent", ability: "Death Wish"});

      FutureEvents.push({timestamp: 0, type: "combatStart"});
      sortDescending(FutureEvents);
    }

    Actors = {
        "Tank": new Actor("Tank", globals.tankStats, TankAbilities(globals.tankStats), TankProcs, TankAuras(globals)),
        "Boss": new Actor("Boss", globals.bossStats, BossAbilities, BossProcs, BossAuras(globals)),
    }
    Actors["Tank"].target = Actors["Boss"];
    Actors["Boss"].target = Actors["Tank"];
    
    exampleList = []
    let results = {
        tps: [],
        dps: [],
        dtps: [],
        tpsBreakdown: {},
        casts: {},
        auras: {},
    }
    let progressPerc = 0;
    // *** MAIN LOOP *** 
    for(let i in range(iterations)) {
        let eventList = [];
        let FutureEvents = [];
        Actors.Tank.reset();
        Actors.Boss.reset();
        generatePrePullEvents(Actors.Tank, Actors.Boss, eventList, FutureEvents);
        while(true)
        {
            let event = FutureEvents.pop();
            let timestamp = event.timestamp;
            if(timestamp > globals.config.simDuration*1000)
                break;
            let newEvents = handleEvent(event, FutureEvents);
            // TODO: Better perf to concat? Probably not
            newEvents.forEach(event => {
              eventList.push(event);
            })
        }

        let threat = 0
        let damage = 0
        let damageTaken = 0

        eventList.forEach(event => {
          if (event) {
            if (event.source == "Boss") {
              if (event.amount && event.type == "damage") damageTaken += event.amount
            } else if ("threat" in event) { 
              threat += event.threat
              if (event.type == "damage") {
                if (event.amount) damage += event.amount
              }
              if (event.threat != 0 || event.type == "damage") { // Don't allow non-damage events with zero threat
                if (event.name) {
                  if(!results.tpsBreakdown[`${event.name}`]) results.tpsBreakdown[`${event.name}`] = []
                  if (!results.tpsBreakdown[`${event.name}`][i]) results.tpsBreakdown[`${event.name}`][i] = {tps: 0, dps: 0, casts: 0, hits: 0, crits: 0, glances: 0, misses: 0, dodges: 0, parries: 0, blocks: 0};

                  results.tpsBreakdown[`${event.name}`][i].tps += event.threat/globals.config.simDuration;
                  if (event.amount && event.type == "damage")
                    results.tpsBreakdown[`${event.name}`][i].dps += event.amount/globals.config.simDuration;
                  results.tpsBreakdown[`${event.name}`][i].casts += 1; // TODO make cast events but ignore them when writing out the results
                  if (event.hit) {
                    results.tpsBreakdown[`${event.name}`][i].hits    += event.hit == "hit" || event.hit == 'tick' ? 1 : 0;
                    results.tpsBreakdown[`${event.name}`][i].crits   += event.hit == "crit" || event.hit == "crit block" ? 1 : 0;
                    results.tpsBreakdown[`${event.name}`][i].misses  += event.hit == "miss" ? 1 : 0;
                    results.tpsBreakdown[`${event.name}`][i].dodges  += event.hit == "dodge" ? 1 : 0;
                    results.tpsBreakdown[`${event.name}`][i].parries += event.hit == "parry" ? 1 : 0;
                    results.tpsBreakdown[`${event.name}`][i].blocks  += event.hit == "block" ? 1 : 0;
                    results.tpsBreakdown[`${event.name}`][i].glances += event.hit == "glance" ? 1 : 0;
                  }
                }
              }
            }
            if (event.type == "auraApply") {
              let obj = results.auras[`${event.name}`];
              if (obj == null) obj = { uptime: Array(iterations).fill(0), active: Array(iterations).fill(false), };
              if (!obj.active[i]) { // Don't double count refreshes
                obj.uptime[i] += 1 - Math.max(event.timestamp, 0)/(globals.config.simDuration*1000);
                obj.active[i] = true;
                results.auras[`${event.name}`] = obj;
              }
            }
            if (event.type == "auraExpire") {
              let obj = results.auras[`${event.name}`];
              if (obj.active[i]) {
                obj.uptime[i] -= 1 - Math.max(event.timestamp, 0)/(globals.config.simDuration*1000);
                obj.active[i] = false;
                results.auras[`${event.name}`] = obj;
              }
            }
          }
        });
        results.tps.push(threat/globals.config.simDuration)
        results.dps.push(damage/globals.config.simDuration)
        results.dtps.push(damageTaken/globals.config.simDuration)

        if(i == iterations - 1)
            exampleList = eventList
        if (i/iterations >= progressPerc/100) {
            progressPerc += 1;
            postMessage({
                        type: 'progressUpdate',
                        progressPerc: 1});
        }
    }
/*
    tps
    dps
    dtps

    rageGain
    cpm
*/

    postMessage({
        'events': exampleList,
        'results': results,
    });
    close();
})