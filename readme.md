#SocialClub
WARNING: I am NOT affiliated with Rockstar Games or SocialClub in any way. Use on your own risk.
WARNING: This is a work in progress

#Installation
Clone this repository and run `tsc` to compile (you need TypeScript installed, `npm i -g typescript`).

#Server
The GTA V SocialClub server has a terriblem, undocumented API. The `Server` in this repository has very clean endpoints, and will be documented when I have the time. The server is basicly node between you and the SocialClub server.
You can start the server with `npm run server`. You will see a chromium browser popup with the login page of SocialClub. After manually logging in, a new tab will open automaticly. Please do not touch this browser instance anymore.
From now on, you are ready to go! Endpoints can not be access via `http://localhost:3000/{endpoint}` (no `https` support yet).

#Wrapper
Accessing the Server with a webbrowser or an application like postman is of course not desirable. You will need some sort of wrapper for the server. You can make this is any programming language, but his module contains a wrapper build for NodeJS (also in TypeScript). An example command line application can be found in the `Example` folder.

#Example
Make sure the server is running, and start the example (please change the username to your username). The amount of commands is still very limited.
Example:
```
> modder dennisv2809
[   ] Modded money picked up ($2.6M)
[   ] Modded money income-outcome ($222.1M - $213.3M)
[   ] Modded money possession ($11,480,869 + $28,100)
[   ] Aimbot by accuracy (22.48%)
[   ] Aimbot by headshots players (591/3,203)
[   ] Aimbot by overall headshots (17.6K/38.8K)
[   ] Godmode based on K/D (1.90)
[   ] Modded stats (696/800)
[   ] Modded level (level 260 in 39d 0h 56m 50s)

> financial dennisv2809
Level: 260
Cash: $28,100
Bank: $11,480,869
Income: $222.1M
Expenses: $213.3M
Cash picked up: $2.6M
Job earnings: $97.4M
Time played: 39d 0h 56m 50s

> criminal dennisv2809
**Capital offenses**
Cops killed: 9,067
NOOSE killed: 1,322
Kills: 38.8K (17.6K headshots)
Player kills: 3,203 (591 headshots)
Overall accuracy: 22.48%
Kill Death Ratio: 1.90
Store hold ups: 39
Cars stolen: 882

**Other**
Top speeding-ticket: 173.47 mph (Tyrus)
Farthest wheelie: 3,238.29 ft
Farthest stoppie: 283.42 ft
Hit & run's: 39
Time wanted: 2d 13h 24m 4s

**Psychological report**
Sociopath
Psychopath
Weapon of choice: Marksman Rifle MK II

**WANTED DEAD OR ALIVE**
1172000
```

#Contributing
Please send a PR! I'd love to have a look at that!
