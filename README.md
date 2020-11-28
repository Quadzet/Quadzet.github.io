## TankSim

### What can I use this sim for?
The main purpose of this sim is to analyze pull variance using different threat metrics such standard deviation, average threat, 1st and 5th percentile worst threat. You can also set threat goals (say, 3000 threat at 3 seconds into the fight) and sim how often the goal is failed/passed.
One can also use the sim as a general tank tps and dps simulation, although cooldowns and trinkets will only be used at pull so fight lengths over 2-3 minutes become unreliable.
The goal is for the calculations to be as accurate as possible and to not draw conclusions for the user. Pull variance is not black and white, there will always be nuances. Thus it is up to the user to draw their own conclusions from the results to suit the needs of their situation.

### Calculations
The majority of the calculations and formulas are based on information found in the Fight Club discord, and also notably from https://github.com/magey/classic-warrior/wiki as well as to a lesser extent my own testing. At some point I would want to document all of it, for now its documentation is within the code itself.

### Rotation
At this time, the simulation follows a set pre-defined priority system that's been calibrated by hand to yield as high tps as possible. Of course in reality it would depend on gear and buffs.

# Dual Wielding
1. Bloodthirst if rage above cost.
2. Revenge if available rage above cost.
3. Sunder Armor if rage above cost + 15.
o Queue Heroic Strike if rage above cost.

# Mainhand + Shield
1. Bloodthirst if rage above cost.
2. Revenge if available rage above cost.
3. Sunder Armor if rage above cost + 10.
o Queue Heroic Strike if rage above cost + 60.

### Contact
If you have questions or suggestions you can find me on Discord, Quadzet#4824.
You can also create issues on this Github page.
