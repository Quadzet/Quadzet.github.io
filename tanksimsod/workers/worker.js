const range = (length) =>
    Array.from({ length }, (_, i) => i)

self.addEventListener('message', function(e) {
    let globals = e.data.globals;
    let iterations = e.data.iterations;

    importScripts('../logging.js', '../abilities.js', '../rotation.js', '../actor.js', '../attacktable.js', '../auras.js', '../procs.js', '../eventHelpFuncs.js');

    // let TankAuras = [...defaultTankAuras]
    // let BossAuras = [...defaultBossAuras]
    // addOptionalAuras(TankAuras, BossAuras, globals); // Adds crusader/thunderfury etc auras to tank/boss if they are set in config.

    let TankProcs = getTankProcs(globals);
    let BossProcs = getBossProcs(globals);

    globals.config = globals.config;

    function handleEvent(event, eventList, futureEvents)
    {
      if(event.type == "combatStart") {
          let source = Actors["Tank"];
          let target = Actors["Boss"];

          handleCombatStart(source, target, eventList, futureEvents)
          handleCombatStart(target, source, eventList, futureEvents)
      }
      else if(event.type == "swingTimer") {
          let source = Actors[event.source];
          let target = Actors[event.target];
          source.abilities[event.name].use(event.timestamp, source, target, eventList, futureEvents); // source and target are just names, find them in the global actor list.
      }
      else if(event.type == "GCD") {
          let source = Actors[event.source];
          let target = source.target;
          source.onGCD = false
          performAction(event.timestamp, source, target, eventList, futureEvents)
      }
      else if(event.type == "cooldownFinish") {
        Actors[event.source].handleEvent(event, eventList, futureEvents)
      }
      else if(event.type == "auraExpire") {
        // Actors[event.owner].auras[event.name].expire(event.timestamp, eventList, futureEvents)
        Actors[event.source].handleEvent(event, eventList, futureEvents)
      }
      else if(event.type == "rage") {
        eventList.push(event);
        Actors[event.source].handleEvent(event, eventList, futureEvents)
      }
      else if(event.type == "damage") {
        eventList.push(event);
        Actors[event.source].handleEvent(event, eventList, futureEvents)
      }

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
    }
    // *** MAIN LOOP *** 
    for(let i in range(iterations)) {
        let eventList = []
        let FutureEvents = [{timestamp: 0, type: "combatStart"}]
        Actors.Tank.reset()
        Actors.Boss.reset()
        while(true)
        {
            let event = FutureEvents.pop()
            let timestamp = event.timestamp
            if(timestamp > globals.config.simDuration*1000)
                break
            handleEvent(event, eventList, FutureEvents)
            
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
                        if (!results.tpsBreakdown[`${event.name}`][i]) results.tpsBreakdown[`${event.name}`][i] = {tps: 0, dps: 0, hits: 0, casts: 0};

                        results.tpsBreakdown[`${event.name}`][i].tps += event.threat/globals.config.simDuration;
                        if (event.amount && event.type == "damage")
                          results.tpsBreakdown[`${event.name}`][i].dps += event.amount/globals.config.simDuration;
                        results.tpsBreakdown[`${event.name}`][i].casts += 1; // TODO make cast events but ignore them when writing out the results
                        if (event.hit)
                          results.tpsBreakdown[`${event.name}`][i].hits += ["miss", "dodge", "parry"].includes(event.hit) ? 0 : 1;//event.hit == "hit" ? 1 : 0;//
                      }
                    }
                }
              if (event.name == "Rend") {
                let x = 15;
              }
            }
        });
        results.tps.push(threat/globals.config.simDuration)
        results.dps.push(damage/globals.config.simDuration)
        results.dtps.push(damageTaken/globals.config.simDuration)

        if(i == iterations - 1)
            exampleList = eventList
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