self.addEventListener('message', function(e) {
    let globals = e.data.globals;
    let iterations = e.data.iterations;

    importScripts('../abilities.js', '../actor.js', '../attacktable.js', '../auras.js', '../procs.js');

    function performAction(events, ms, attacker, defender) {
        attacker.auras.forEach(aura => aura.handleGameTick(ms, attacker, events, globals.config));
        attacker.abilities.forEach(ability => {
            if (ability.isUsable(attacker)) {
                let abilityEvent = ability.use(attacker, defender);
    
                // TODO: Move these into Ability.use()
                abilityEvent.timestamp = ms;
                abilityEvent.target = defender.name;
                abilityEvent.source = attacker.name;

                events.push(abilityEvent);
                ability.currentCooldown = ability.baseCooldown;
                if (ability.onGCD) attacker.GCD = 1500;

                // Update Actor Auras if the event applies to the Aura
                attacker.auras.forEach(aura => aura.handleEvent(attacker, abilityEvent, events, globals.config));
                defender.auras.forEach(aura => aura.handleEvent(defender, abilityEvent, events, globals.config));
                attacker.procs.forEach(proc => proc.handleEvent(attacker, defender, abilityEvent, events, globals.config));
                
                if (abilityEvent.type == "damage" && abilityEvent.hit == "parry") defender.addParryHaste();
            }
        })
    
        // Ability cds and aura durations tick down
        attacker.abilities.forEach(ability => {
            if (["MH Swing", "OH Swing", "Auto Attack"].includes(ability.name))
                ability.currentCooldown = ability.currentCooldown - globals.config.timeStep*(1+attacker.hastePerc/100);
            else ability.currentCooldown = ability.currentCooldown - globals.config.timeStep;
        });
    
        attacker.GCD = attacker.GCD - globals.config.timeStep;
    }

    const range = (length) =>
        Array.from({ length }, (_, i) => i)

    let playerAbilities = [
        new Bloodthirst("Bloodthirst", 6000, 30, true),
        new Revenge("Revenge", 5000, 5, true, 273, 2.25),
        new HeroicStrike("Heroic Strike", 0, 15 - globals.tankStats.talents.impHS, false, 175),
        new SunderArmor("Sunder Armor", 0, 15 - globals.tankStats.talents.impSA, true, 260),
    ];
    if(globals.tankStats.dualWield) {
        playerAbilities.push(new OHSwing("OH Swing", globals.tankStats.OHSwing, 0, false))
    }
    playerAbilities.push(new MHSwing("MH Swing", globals.tankStats.MHSwing, 0, false))

    let bossAbilities = [new MHSwing("Auto Attack", globals.bossStats.MHSwing, 0, false)];

    let TankAuras = [...defaultTankAuras]
    let BossAuras = [...defaultBossAuras]
    addOptionalAuras(TankAuras, BossAuras, globals); // Adds crusader/thunderfury etc auras to tank/boss if they are set in config.

    let TankProcs = getTankProcs(globals);
    let BossProcs = getBossProcs(globals);

    let Tank = new Actor("Tank", "Boss", playerAbilities, globals.tankStats, TankAuras, TankProcs)
    let Boss = new Actor("Boss", "Tank", bossAbilities,   globals.bossStats, BossAuras, BossProcs)

    let results = {};
    let tps = [];
    let dps = [];
    let dtps = [];
    let rageGained = [];
    let rageSpent = [];
    let uptimes = {};
    let breaches = 0;
    // snapshots are used to graph the threat percentiles
    let snapshots = [];
    let progressPerc = 0;
    let bossSwings = 0; 
    for (let _i in range(globals.config.simDuration*1000/globals.config.snapshotLen+1)) snapshots.push([]);
    for (let i in range(iterations)) {
        // Reset buffs, GCD, cooldowns...
        Tank.reset();
        Boss.reset();
        
        let snapshot = 0;
        let events = [];
        let ms = 0;
        let threat = 0;
        let damage = 0;
        let dmgTaken = 0;
        let debuffsApplied = false;
        while(ms <= globals.config.simDuration*1000) {
            // Set armor debuffs...
            if (ms >= globals.config.debuffDelay && !debuffsApplied) {
                Boss.auras.forEach(aura => {
                    if (aura.name == "Sunder Armor") {
                        for (let _j in range(5)) { 
                            aura.handleEvent(Boss, { "type": "damage", "ability": "Sunder Armor", "hit": "hit", "timestamp": ms}, events, globals.config);
                        }
                    }
                    if (aura.name == "Faerie Fire") aura.handleEvent(Boss, { "type": "damage", "ability": "Faerie Fire", "hit": "hit", "timestamp": ms}, events, globals.config);
                    if (aura.name == "Curse of Recklessness") aura.handleEvent(Boss, { "type": "damage", "ability": "Curse of Recklessness", "hit": "hit", "timestamp": ms}, events, globals.config);
                });
                debuffsApplied = true;
            }
            
            let iterationEvents = [];
            performAction(iterationEvents, ms, Tank, Boss);
            performAction(iterationEvents, ms, Boss, Tank);
            
            events = events.concat(iterationEvents);

            if (ms == snapshot*globals.config.snapshotLen) {
                let snapshotThreat = 0;
                events.forEach(event => {
                    if (event.threat) snapshotThreat += event.threat;
                })
                snapshots[snapshot].push(snapshotThreat);
                snapshot += 1;
            }

            if (ms == globals.config.breakpointTime) {
                let breakpointThreat = 0;
                events.forEach(event => {
                    if (event.threat) breakpointThreat += event.threat;
                })
                breaches += breakpointThreat < globals.config.breakpointValue ? 1 : 0;
            }

            ms+=globals.config.timeStep
        }

        events.forEach(event => {
            if (event) {
                if (event.source == "Boss") {
                    if (event.damage) dmgTaken += event.damage;
                    if (event.ability == "MH Swing") bossSwings += 1;
                } else {
                    if (event.threat) threat += event.threat;
                    if (event.damage) damage += event.damage;
                    if (event.threat && event.ability) {
                        if(!results[`${event.ability}`]) results[`${event.ability}`] = [];
                        if(results[`${event.ability}`][i]) results[`${event.ability}`][i] += event.threat/globals.config.simDuration
                        else results[`${event.ability}`][i] = event.threat/globals.config.simDuration
                    }
                }
            }
        });

        for (let ability in Tank.uptimes) {
            if(!uptimes[`${ability}`]) uptimes[`${ability}`] = []
            //console.log(`${ability}: ${Tank.uptimes[`${ability}`]}`)
            uptimes[`${ability}`].push(Tank.uptimes[`${ability}`]/(globals.config.simDuration*10)) // divide by 1000 due to ms, multiply by 100 due to decimal to percentage => divide by 10.
        }

        tps.push(threat/globals.config.simDuration)
        dps.push(damage/globals.config.simDuration)
        rageGained.push(Tank.rageGained/globals.config.simDuration)
        Tank.rageGained = 0
        rageSpent.push(Tank.rageSpent/globals.config.simDuration)
        Tank.rageSpent = 0
        dtps.push(dmgTaken/globals.config.simDuration)
        events.forEach(event => {
            //console.log(formatEvent(event))
        })
        if (i/iterations >= progressPerc/100) {
            progressPerc += 1;
            postMessage({
                        type: 'progressUpdate',
                        progressPerc: 1})
        }
    }
    ret = {
        tps: tps,
        dps: dps,
        dtps: dtps,
        rageGained: rageGained,
        rageSpent: rageSpent,
        results: results,
        breaches: breaches,
        snapshots: snapshots,
        bossSwings: bossSwings,
        uptimes: uptimes,
    }

    postMessage(ret);
    close();

})