
## Action Priority List (APL)

A scripting language for defining action priorities in the
simulator. The APL evaluates rules top-to-bottom, executing the
first action whose condition is met.

### Syntax
---
Each statement follows the format:
  <action> [if <condition>];

### Comments:
  // Single-line comment
  /* Multi-line comment *[sic]/

### Actions:
  use <ability_name>    - Attempts to use the specified ability
  wait                  - Skips this evaluation cycle (waits for next event)

### Conditions:
---
  <variable|attribute> <operator> <variable|attribute> [condition]

### Operators
---
Comparison:  ==  !=  <  >  <=  >=
Logical:     &  (AND)    |  (OR)

### Variables
---
Literals:
  - Numbers: 50, 0.5, 100
  - Strings: "some_string"

Globals:
  - time              Current simulation time (in milliseconds)

### Player/Target Attributes
---
Access via: player.<attribute> or target.<attribute>

  - armor
  - attackpower
  - blockvalue
  - dodge                   Percentage
  - parry                   Percentage
  - defense
  - swingtimer              Milliseconds
  - ohswingtimer            Milliseconds
  - stamina
  - strength
  - agility
  - hit                     Percentage
  - crit                    Percentage
  - haste                   Percentage
  - health
  - rage
  - on_gcd                  Bool
  - heroic_strike_queued    Bool

### Ability Attributes
---
Access via: <ability_name>.<attribute>

  cooldown     - Time remaining until ability is ready (ms)
  ragecost     - Rage cost of the ability

### Aura Attributes
---
Access via: <aura_name>.<attribute>

  stacks       - Current stacks
  duration     - Remaining duration (ms)
  active       - Whether the aura is active (boolean, 0 or 1)

### Available Abilities
---
  mainhand_swing
  heroic_strike
  bloodrage
  rend
  revenge
  battle_shout
  offhand_swing     - Dual wield only
  shield_slam       - Requires Shield Slam talent
  shield_block      - Shield equipped only
  bloodthirst       - Requires Bloodthirst talent
  mortal_strike     - Requires Mortal Strike talent
  death_wish        - Requires Death Wish talent
  sunder_armor      - When IEA (Improved Expose Armor) is disabled

### Example Script
---
```
  // Use cooldowns first
  use death_wish;

  use bloodthirst;
  use revenge;

  // Use HS as an off-gcd rage dump
  use heroic_strike if player.rage > 50;

  // Wait for Bloodthirst if it's almost ready
  wait if bloodthirst.cooldown < 0.5;

  // Use SA as a filler rage dump
  use sunder_armor if player.rage > 60;
```
