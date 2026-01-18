import { LOG_LEVEL, log_message } from './logging.js';
import { onUseData } from './stats.js'
import { sortDescending, clearFutureTicks } from './eventHelpFuncs.js'
import { LANDED_HITS, ATTRIBUTES, MULT_ATTRIBUTES, EventType, HitType } from './constants.js'
import { checkAuraToggle } from './config.js'


/* The Aura class is used for runtime auras, ie those that get applied and/or
 * removed during the course of an encounter. Auras that are permanent are
 * implemented mainly in config.js, or using the Proc class in some cases,
 * for example the Thorns auras.
 */

function applyAuraStack(owner, aura) {

    // TODO: Check if rounding should be done here.
    // TODO: E.g. strength is not affected by owner.strengthMod here.

    // No need to take scalingStacks into consideration
    // since we apply one stack at a time.
    for (const attribute of ATTRIBUTES) {
        if (aura[`${attribute}`]) {
            if (MULT_ATTRIBUTES.includes(attribute))
                owner[`${attribute}`] *= aura[`${attribute}`];
            else
                owner[`${attribute}`] += aura[`${attribute}`];
        }
    }
}

function removeAuraStack(owner, aura) {

    // TODO: Check if rounding should be done here.
    // TODO: E.g. strength is not affected by owner.strengthMod here.

    // No need to take scalingStacks into consideration
    // since we apply one stack at a time.
    for (const attribute of ATTRIBUTES) {
        if (aura[`${attribute}`]) {
            if (MULT_ATTRIBUTES.includes(attribute))
                owner[`${attribute}`] /= aura[`${attribute}`];
            else
                owner[`${attribute}`] -= aura[`${attribute}`];
        }
    }
}

function expireAura(owner, aura) {

    // TODO: Check if rounding should be done here.
    // TODO: E.g. strength is not affected by owner.strengthMod here.
    let factor = 1;
    if (aura.scalingStacks)
        factor = aura.stacks;
    for (const attribute of ATTRIBUTES) {
        if (aura[`${attribute}`]) {
            if (MULT_ATTRIBUTES.includes(attribute))
                owner[`${attribute}`] /= factor * aura[`${attribute}`];
            else
                owner[`${attribute}`] -= factor * aura[`${attribute}`];
        }
    }
}

function updateEventLists(type, owner, aura, timestamp, reactiveEvents, futureEvents) {

    let event = {
        type: type,
        name: aura.name,
        owner: owner.name,
        source: aura.source,
        stacks: aura.stacks,
        auraType: aura.type,
        timestamp: timestamp,
    };

    if (type == EventType.AURA_EXPIRE) {

        let index = futureEvents.findIndex(e => {
            return (e.type == type && e.name == aura.name && e.owner == owner.name)
        });
        if (index >= 0)
            futureEvents.splice(index, 1);
        event.timestamp += aura.maxDuration;
        futureEvents.push(event);
    } else if ([EventType.AURA_APPLY, EventType.AURA_REFRESH].includes(type)) {
        event.threat = aura.threat;
        reactiveEvents.push(event)
    } else {
        reactiveEvents.push(event)
    }
}

export class Aura {
    constructor(input = {}) {
        Object.assign(this, {
            damage: 0,
            threat: 0,
            duration: 0,
            maxDuration: 0,
            stacks: 0,
            startStacks: 1,
            maxStacks: -1,
            scalingStacks: false,
            trackUptime: false,
            ...input
        });
        this.validate();
    }

    validate() {
        const required = [
            'type', 'name', 'target', 'source', 'maxStacks', 'duration',
            'maxDuration', 'damage', 'scalingStacks', 'trackUptime',
            'startStacks', 'stacks', 'threat',
        ];

        const missing = required.filter(field =>
            this[field] === undefined || this[field] === null || this[field] === ''
        );

        if (missing.length > 0) {
            log_message(LOG_LEVEL.WARNING,
                `Aura validation failed: ${this.name}: missing or empty fields: ${missing.join(', ')}.`)
            return false;
        }
        return true;
    }

    apply(timestamp, owner, source, reactiveEvents, futureEvents) {
        if (this.duration > 0) {
            this.refresh(timestamp, owner, reactiveEvents, futureEvents);
            return;
        }

        if (this.maxStacks > 0)
            this.stacks = this.startStacks;
        this.duration = this.maxDuration;
        this.source = source; // TODO: Why is this needed?

        applyAuraStack(owner, this);
        updateEventLists(
            EventType.AURA_APPLY, owner, this,
            timestamp, reactiveEvents, futureEvents);
        updateEventLists(
            EventType.AURA_EXPIRE, owner, this,
            timestamp, reactiveEvents, futureEvents);
    }

    refresh(timestamp, owner, reactiveEvents, futureEvents) {
        if (this.stacks < this.maxStacks) {
            // Either add one stack, such as for sunder, or set to max stacks, such as for flurry/consumed by rage
            this.stacks = Math.min(Math.max(this.stacks + 1, this.startStacks), this.maxStacks);
            updateEventLists(
                EventType.AURA_APPLY, owner, this,
                timestamp, reactiveEvents, futureEvents);

            // TODO: Only applies one stack, some auras have scaling stacks
            // and also startStacks > 1?
            if (this.scalingStacks)
                applyAuraStack(owner, this);

        } else {
            updateEventLists(
                EventType.AURA_REFRESH, owner, this,
                timestamp, reactiveEvents, futureEvents);
        }
        futureEvents.forEach(e => {
            if (e.type == EventType.AURA_EXPIRE && e.name == this.name)
                e.timestamp = timestamp + this.maxDuration;
        })
        sortDescending(futureEvents)
    }

    removeStack(event, owner, reactiveEvents, futureEvents) {
        if (this.duration == 0)
            return;
        if (this.stacks == 1)
            this.expire(event, owner, reactiveEvents, futureEvents, true)
        else {
            updateEventLists(
                EventType.AURA_REMOVE_STACK, owner, this,
                event.timestamp, reactiveEvents, futureEvents);

            this.stacks -= 1
            if (this.scalingStacks) {
                removeAuraStack(owner, this);
            }
        }
    }

    expire(event, owner, reactiveEvents, futureEvents, addEvent) {
        // Add all modifiers here, remember scalingstacks
        if (this.duration == 0)
            return;

        expireAura(owner, this);

        this.stacks = 0
        this.duration = 0;
        //TODO: This should not be needed: delete owner.buffs[this.name]
        let index = futureEvents.findIndex(e => { return (e.type == EventType.AURA_EXPIRE && e.name == this.name) })
        if (index >= 0)
            futureEvents.splice(index, 1)
        if (addEvent)
            reactiveEvents.push({
                type: EventType.AURA_EXPIRE,
                name: this.name,
                owner: owner.name,
                source: this.source,
                stacks: this.stacks,
                auraType: this.type,
                timestamp: event.timestamp,
            })
    }

    handleEvent(event, owner, source, reactiveEvents, futureEvents) {
        log_message(LOG_LEVEL.ERROR, "handleEvent not implemented for aura " + this.name + ".");
    }
}


export class SunderArmorAura extends Aura {
    constructor() {
        super({
            type: "debuff",
            name: "Sunder Armor",

            maxDuration: 30000,
            maxStacks: 5,
            scalingStacks: true,
            armor: 0//-520, Apply full stacks at pull instead
        })
    }

    handleEvent(event, owner, source, reactiveEvents, futureEvents) {
        // Here we would apply the the debuff on Sunder Armor spellcast.
        // But it is not used at the moment.
    }
}


export class DefensiveState extends Aura {
    constructor() {
        super({
            type: "buff",
            name: "Defensive State",

            maxDuration: 5000,
        })
    }

    handleEvent(event, owner, source, reactiveEvents, futureEvents) {

        // Add aura after a dodge/block/parry
        if (event.type == EventType.DAMAGE && event.target == owner.name && [HitType.BLOCK, HitType.PARRY, HitType.DODGE].includes(event.hit)) {
            this.apply(event.timestamp, owner, event.target, reactiveEvents, futureEvents)
        }

        // Expire after casting Revenge.
        if (event.source == this.name && event.name == "Revenge") {
            this.expire(event, owner, reactiveEvents, futureEvents, true)
        }

        if (event.type == EventType.AURA_EXPIRE && event.name == this.name && event.owner == owner.name) {
            this.expire(event, owner, reactiveEvents, futureEvents, false)
        }

    }
}

export class ShieldBlockAura extends Aura {
    constructor(impSB) {
        super({
            type: "buff",
            name: "Shield Block",

            maxStacks: 1 + (impSB > 0 ? 1 : 0),
            startStacks: 1 + (impSB > 0 ? 1 : 0),
            maxDuration: 6000 + impSB * 0.5,

            block: 75,
        })
    }

    handleEvent(event, owner, source, reactiveEvents, futureEvents) {

        // Apply the aura after Shield Block has been cast.
        if (event.type == EventType.SPELL_CAST && event.name == this.name) {
            this.apply(event.timestamp, owner, event.source, reactiveEvents, futureEvents);
        }

        //  Remove a stack after blocking.
        else if (event.type == EventType.DAMAGE && event.target == "Tank" && event.hit == HitType.BLOCK) {
            this.removeStack(event, owner, reactiveEvents, futureEvents)
        }

        else if (event.type == EventType.AURA_EXPIRE && event.name == this.name && event.owner == owner.name) {
            this.expire(event, owner, reactiveEvents, futureEvents, false);
        }
    }
}

export class FlurryAura extends Aura {
    constructor(points) {
        super({
            type: "buff",
            name: "Flurry",

            maxDuration: 12000,

            maxStacks: 3,
            startStacks: 3,
            haste: 5 + 5 * points,

        })
    }

    handleEvent(event, owner, source, reactiveEvents, futureEvents) {

        const triggerAbilities = [
            "MH Swing", "OH Swing", "Heroic Strike", "Ravenge", "Bloodthirst",
            "Shield Slam", "Slam", "Execute", "Whirlwind", "Mortal Strike"
        ];
        if (event.type == EventType.DAMAGE
                && [HitType.CRIT, HitType.CRIT_BLOCK].includes(event.hit)
                && triggerAbilities.includes(event.name)
                && event.source == owner.name) {
            this.apply(event.timestamp, owner, owner.name, reactiveEvents, futureEvents);
        }
        if (event.type == EventType.DAMAGE
                && ["MH Swing", "OH Swing", "Heroic Strike"].includes(event.name)
                && event.source == owner.name) {
            this.removeStack(event, owner, reactiveEvents, futureEvents);
        }
    }
}

export class EnrageAura extends Aura {
    constructor() {
        super({
            type: "buff",
            name: "Enrage",

            maxStacks: 12,
            startStacks: 12,
            maxDuration: 12000,

            physDamageMod: 1.1,

        })
    }

    handleEvent(event, owner, source, reactiveEvents, futureEvents) {

        if (owner.stats.talents.enrage > 0
                && event.type == EventType.DAMAGE
                && event.target == owner.name
                && event.hit == 'crit') {
            this.expire(event, owner, reactiveEvents, futureEvents, true);
            this.physDamageMod = owner.stats.talents.enrage * 0.05 + 1;
            this.apply(event.timestamp, owner, owner.name, reactiveEvents, futureEvents);
        }

        //  Remove a stack after successfully hitting a target
        if (event.type == EventType.DAMAGE 
            && event.source == owner.name 
            && ["MH Swing", "OH Swing", "Devastate", "Heroic Strike", "Rend", "Revenge"].includes(event.name)) {
            this.removeStack(event, owner, reactiveEvents, futureEvents)
        }

        if (event.type == EventType.AURA_EXPIRE && event.name == this.name && event.owner == owner.name) {
            this.expire(event, owner, reactiveEvents, futureEvents, false)
        }

    }
}

export class DeathWishAura extends Aura {
    constructor() {
        super({
            type: "debuff",
            name: "Death Wish",

            maxDuration: 30000,
            physDamageMod: 1.2,
            armorMod: 0.8,
        })
    }
    handleEvent(event, owner, source, reactiveEvents, futureEvents) {

        // Add aura after rage goes from below 80 to above 80, and the aura is not already active.
        if (event.type == EventType.SPELL_CAST && event.name == "Death Wish") {
            this.apply(event.timestamp, owner, owner.name, reactiveEvents, futureEvents);
        }

        if (event.type == EventType.AURA_EXPIRE && event.name == this.name && event.owner == owner.name) {
            this.expire(event, owner, reactiveEvents, futureEvents, false)
        }

    }
}

export class BloodrageAura extends Aura {
    constructor() {
        super({
            type: "buff",
            name: "Bloodrage",

            maxDuration: 10000,
        })
    }
    handleEvent(event, owner, source, reactiveEvents, futureEvents) {

        if (event.type == EventType.SPELL_CAST && event.name == "Bloodrage") {
            this.apply(event.timestamp, owner, owner.name, reactiveEvents, futureEvents);
            for (let i = 0; i < 10; i++) {
                futureEvents.push({
                    timestamp: event.timestamp + (i + 1) * 1000,
                    type: "rage",
                    source: owner.name,
                    name: this.name,

                    amount: 1,
                    threat: 5, // TODO: threat even when rage-capped..
                });
            }
        }

        if (event.type == EventType.AURA_EXPIRE && event.name == this.name && event.owner == owner.name) {
            this.expire(event, owner, reactiveEvents, futureEvents, false)
        }

    }
}


export class RendAura extends Aura {
    constructor() {
        super({
            type: "debuff",
            name: "Rend",

            maxDuration: 15000,
        })
    }
    handleEvent(event, owner, source, reactiveEvents, futureEvents) {

        if (event.type == EventType.DAMAGE && event.name == "Rend" && event.hit == HitType.HIT) {

            this.apply(event.timestamp, owner, owner.name, reactiveEvents, futureEvents);
        }

        if (event.type == EventType.AURA_EXPIRE && event.name == this.name && event.owner == owner.name) {
            this.expire(event, owner, reactiveEvents, futureEvents, false)
        }
    }

    duration(rank) {
        if (rank == 1) return 9000;
        if (rank == 2) return 12000;
        if (rank == 3) return 15000;
        if (rank == 4) return 18000;
        else if (rank < 8) return 21000;
        else log_message(LOG_LEVEL.ERROR, "Invalid rank of " + this.name + ": " + rank);
    }
}

export class DeepWoundsAura extends Aura {
    constructor() {
        super({
            type: "debuff",
            name: "Deep Wounds",

            maxDuration: 12000,
        })
    }
    handleEvent(event, owner, source, reactiveEvents, futureEvents) {

        if (event.type == EventType.DAMAGE && event.hit == HitType.CRIT && event.target == owner.name) {

            this.apply(event.timestamp, owner, source.name, reactiveEvents, futureEvents);
            let weaponDmg = (source.stats.mainhand.mindmg + source.stats.mainhand.maxdmg) / 2;
            weaponDmg += source.getAP() * source.stats.mainhand.swingtimer / 14000;
            weaponDmg += source.flatDamage;
            weaponDmg *= source.getPhysDamageMod();
            let totalDmg = source.stats.talents.deepWounds * 0.2 * weaponDmg;

            clearFutureTicks(this.name, futureEvents);

            // Add new Deep Wounds ticks to futureEvents.
            for (let i = 1; i < 5; i++) {
                futureEvents.push({
                    timestamp: event.timestamp + i * 3000,
                    type: EventType.DAMAGE,
                    source: source.name,
                    target: event.target,
                    name: this.name,
                    hit: "tick",
                    threat: totalDmg * source.stats.threatMod / 4,

                    amount: totalDmg / 4,
                    trigger: false,
                });
            }
        }

        if (event.type == EventType.AURA_EXPIRE && event.name == this.name && event.owner == owner.name) {
            this.expire(event, owner, reactiveEvents, futureEvents, false)
        }
    }
}


export class GoaAura extends Aura {
    constructor(threatMod) {
        super({
            type: "debuff",
            name: "Gift of Arthas",

            maxDuration: 180000,

            flatArmor: -8,
            threat: 90 * threatMod,
        })
    }

    handleEvent(event, owner, source, reactiveEvents, futureEvents) {

        if (event.type == EventType.DAMAGE && LANDED_HITS.includes(event.hit) && event.source == owner.name) {
            let rng = Math.random();
            if (rng < 0.3*0.83) // 17% chance to resist
                this.apply(event.timestamp, owner, source.name, reactiveEvents, futureEvents);
        }

        if (event.type == EventType.AURA_EXPIRE && event.name == this.name && event.owner == owner.name) {
            this.expire(event, owner, reactiveEvents, futureEvents, false)
        }
    }
}

export class OnUseAura extends Aura {
    constructor(data) {
        super(data)
    }
    handleEvent(event, owner, source, reactiveEvents, futureEvents) {

        if (event.type == EventType.SPELL_CAST && event.name == this.name) {
            this.apply(event.timestamp, owner, owner.name, reactiveEvents, futureEvents);
        }
    }
}


export function getOnUseAuras(gear) {
    let ret = [];
    Object.keys(gear).forEach(slot => {
        let id = gear[slot];
        if (onUseData[id] != null) {
            ret.push(new OnUseAura(onUseData[id]));
        }
    });
    return ret;
}

// Globals
export const Debuffs = {
    "Sunder Armor": new SunderArmorAura(),
}

export const Buffs = {
    "Defensive State": new DefensiveState(),
    "Shield Block": new ShieldBlockAura(),
    "Enrage": new EnrageAura(),
    "Bloodrage": new BloodrageAura(),
}

export function TankAuras(globals) {
    let ret = [
        new DefensiveState(),
        new BloodrageAura(),
    ]
    if (globals.tankStats.talents.enrage > 0)
        ret.push(new EnrageAura());
    if (globals.tankStats.talents.flurry > 0)
        ret.push(new FlurryAura(globals.tankStats.talents.flurry));
    if (globals.tankStats.talents.deathwish)
        ret.push(new DeathWishAura());
    if (!globals.tankStats.dualWield && !globals.tankStats.twohand)
        ret.push(new ShieldBlockAura(globals.tankStats.talents.impSB));
    ret = ret.concat(getOnUseAuras(globals.tankStats.gear))

    return ret;
}

export function BossAuras(globals) {

    let ret = [
        new SunderArmorAura(),
        new RendAura(),
    ]
    if (globals.tankStats.talents.deepWounds > 0) {
        ret.push(new DeepWoundsAura())
    }
    if (globals.tankStats.bonuses.goa) {
        ret.push(new GoaAura(globals.tankStats.threatMod))
    }
    return ret;
}
