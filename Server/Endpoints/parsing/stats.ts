export default function (page: string, overviewPage: string, garagePage: string) {
  try{
    if(page.includes("This member is not sharing game stats"))
      throw new Error('CLOSED_PROFILE');
    if(page.substr(page.indexOf('<td>Time spent in GTA Online</td>')+33, 250).split('<td>')[1].split('</td>')[0] == '0')
      throw new Error('INVALID_PLAYER');

    const data: any = {};
    for(const a of page.substr(page.indexOf('<div class="tab-content">')+8).split('<div id="')) {
      if(a.substr(0,6) != 'skills'){
        const key = a.substr(0,20).split('"')[0];
        data[key] = {};
        const b = a.split("<td>");
        for(let j = 1; j < b.length - 1; j += 2)
          data[key][b[j].split("<")[0]] = b[j+1].split("<")[0];
      }
    }

    // Let's add the skills
    data.skills = {};
    for(const a of page.substr(page.indexOf('<div id="skills" class="tab-pan')+8).split('<div class="left">')){
      let percentage = 0;
      const b = a.split('<span style="width:');
      for(let j = 1; j < b.length; j++){
        const c = b[j].substr(0,10).split("%")[0];
        if(c != '')
          percentage += parseInt(c)/5;
      }
      if(!a.substr(0,20).split('<')[0].includes('class'))
        data.skills[a.substr(0,20).split('<')[0]] = percentage;
    }

    // Let's add another source as well
    const extra = parseSecondPage(overviewPage);
    if(!extra) throw 'PARSING_FAILED';
    data.extra = extra;

    // Collect Garage information
    const garage = parseGarage(garagePage);
    data.garage = garage;

    delete data['ss='];
    data.timestamp = Date.now();
    return data;
  } catch(e){
    if(e !== 'CLOSED_PROFILE') console.log('Error in getInfo', new Error(e))
    throw e === 'CLOSED_PROFILE' ? e : 'PARSING_FAILED';
  }
}

function parseSecondPage(page: string) {
  try{
    const crew = page.includes('<h3><a href="/crew/')
      ? page.substr(page.indexOf('<h3><a href="/crew/') + 19, 50).split(">")[1].split('<')[0]
      : 'Not yet in a crew';
    
    return {
      level: Number(page.substr(page.indexOf('<h3 style="font-size:') + 20, 15).split(">")[1].split("<")[0]),
      playTime: page.substr(page.indexOf('<h4>Play Time: ') + 15, 20).split("<")[0],
      cash: page.substr(page.indexOf('<span id="cash-value">') + 22, 25).split("<")[0],
      bank: page.substr(page.indexOf('<span id="bank-value">') + 22, 25).split("<")[0],
      jobs: page.substr(page.indexOf('<span>Jobs</span></h5><p>') + 25, 25).split("<")[0],
      pickup: page.substr(page.indexOf('<span>Picked Up</span></h5><p>') + 30, 25).split("<")[0],
      earned: page.substr(page.indexOf('<h5>Total Earned</h5><p>') + 24, 25).split("<")[0],
      spend: page.substr(page.indexOf('<h5>Total Spent</h5> <p>') + 24, 25).split("<")[0],
      copskilled: page.substr(page.indexOf('<li><h5>Cops killed</h5><p>') + 27, 25).split("<")[0],
      wantedStars: page.substr(page.indexOf('<li><h5>Wanted stars attained</h5><p>') + 37, 25).split("<")[0],
      timeWanted: page.substr(page.indexOf('<li><h5>Time Wanted</h5><p>') + 27, 25).split("<")[0],
      storeHoldUps: page.substr(page.indexOf('<li><h5>Store Hold Ups</h5><p>') + 30, 25).split("<")[0],
      crew: crew
    }
  } catch(e){
    console.log('Error in getMoreInfo', new Error(e))
    return false;
  }
}

function parseGarage(page: string) {
  try {
    page = page.replace('/*</sl:translate_json>*/', '');
    const garageData = page.substring(page.indexOf('"VehicleCollections":') + 21, page.indexOf('};', page.indexOf('"VehicleCollections":') + 21));
    const vehicles = JSON.parse(garageData);
    const parsedVehicles = [];
    for (const veh of vehicles) {
        parsedVehicles.push(veh.grg[0]);
    }
    return parsedVehicles;
}
catch (e) {
    console.log('Error in parseGarage', new Error(e));
    return false;
}
}

export interface StatsFirstPage {
  career: {
    'Overall income': string;
    'Overall expenses': string;
    'Total players killed': string;
    'Total deaths by players': string;
    'Player vs Player Kill / Death ratio': string; // "1.90",
    'Distance traveled': string; // "13,964.18 miles",
    'Favorite radio station': string; // "Non-Stop-Pop FM",
    'Time spent in GTA Online': string; // "38d 23h 3m 51s",
    'Time played in first person': string; // "0d 15h 11m 39s",
    'Time spent in Deathmatches': string; // "0d 0h 50m 15s",
    'Time spent in Races': string; // "0d 2h 55m 34s",
    'Time spent in the Creator': string; // "0d 0h 10m 15s",
    'Deathmatches Published': string;
    'Races Published': string;
    'Captures Published': string;
    'Last Team Standings Published': string;
    'Community plays of your published content': string;
    'Thumbs up for your published content': string;
  },
  general: {
    'Time played as character': string;
    'Character created': string;
    'Last ranked up': string;
    'Longest single game session': string;
    'Average time per session': string;
    'Total deaths': string;
    'Deaths by explosion': string;
    'Deaths by falling': string;
    'Deaths by fire': string;
    'Deaths by traffic': string;
    'Deaths by drowning': string;
    'Time swimming': string;
    'Distance traveled swimming': string;
    'Time underwater': string;
    'Time walking': string;
    'Distance traveled walking': string;
    'Distance traveled running': string;
    'Farthest free-fall survived': string;
    'Time in cover': string;
    'Photos taken': string;
    'Private dances': string;
    'Sex acts purchased': string;
    'Bounties placed on others': string;
    'Bounties placed on you': string;
    'Highest Survival wave reached': string;
  },
  crimes: {
    'Cops killed': string;
    'NOOSE killed': string;
    'Times Wanted': string;
    'Wanted stars attained': string;
    'Wanted stars evaded': string;
    'Time spent with a Wanted Level': string;
    'Last Wanted Level duration': string;
    'Longest Wanted Level duration': string;
    'Time spent with a 5 star Wanted Level': string;
    'Drive-by kills as driver': string;
    'Drive-by kills as passenger': string;
    'Tires shot out': string;
    'Vehicular kills': string;
    'Cars stolen': string;
    'Motorcycles stolen': string;
    'Helicopters stolen': string;
    'Planes stolen': string;
    'Boats stolen': string;
    'ATVs stolen': string;
    'Bicycles stolen': string;
    'Cop vehicles stolen': string;
    'Store Hold Ups': string;
  },
  vehicles: {
    'Time driving cars': string;
    'Distance traveled in cars': string;
    'Time riding motorcycles': string;
    'Distance traveled on motorcycles': string;
    'Time flying helicopters': string;
    'Distance traveled in helicopters': string;
    'Time flying planes': string;
    'Distance traveled in planes': string;
    'Time sailing boats': string;
    'Distance traveled in boats': string;
    'Time riding ATVs': string;
    'Distance traveled on ATVs': string;
    'Time riding bicycles': string;
    'Distance traveled on bicycles': string;
    'Highest speed in a road vehicle': string;
    'Road vehicle driven fastest': string;
    'Farthest stoppie': string;
    'Farthest wheelie': string;
    'Farthest driven without crashing': string;
    'Car crashes': string;
    'Motorcycle crashes': string;
    'ATV crashes': string;
    'Bailed from a moving vehicle': string;
    'Farthest vehicle jump': string;
    'Highest vehicle jump': string;
    'Most flips in one vehicle jump': string;
    'Most spins in one vehicle jump': string;
    'Unique Stunt Jumps found': string;
    'Unique Stunt Jumps completed': string;
    'Near misses': string;
    'Cop cars blown up': string;
    'Cars blown up': string;
    'Motorcycles blown up': string;
    'Helicopters blown up': string;
    'Planes blown up': string;
    'Boats blown up': string;
    'ATVs blown up': string;
    'Vehicles repaired': string;
    'Vehicles resprayed': string;
    'Cars exported': string;
    'Highest Hydraulic Jump': string;
  },
  'cash': {
    'Spent on weapons & armor': string;
    'Spent on vehicles & maintenance': string;
    'Spent on style & entertainment': string;
    'Spent on property & utilities': string;
    'Spent on Job & Activity entry fees': string;
    'Spent on betting': string;
    'Spent on contact services': string;
    'Spent on healthcare': string;
    'Dropped or stolen': string;
    'Given to others': string;
    'Earned from Jobs': string;
    'Earned from selling vehicles': string;
    'Earned from betting': string;
    'Earned from Good Sport reward': string;
    'Picked up': string;
    'Received from others': string;
  },
  combat: {
    'Shots': string;
    'Hits': string;
    'Accuracy': string;
    'Kills': string;
    'Headshot kills': string;
    'Armed kills': string;
    'Free Aim kills': string;
    'Stealth kills': string;
    'Counter attacks': string;
    'Player kills': string;
    'Player headshot kills': string;
    'Survival kills': string;
    'Gang Attack kills': string;
    'Highest killstreak in Deathmatch': string;
    'Archenemy': string;
    'Times killed by Archenemy': string;
    'Victim': string;
    'Victim kills': string;
  },
  weapons: {
    'Pistol kills': string;
    'Combat Pistol kills': string;
    'AP Pistol kills': string;
    'Heavy Revolver kills': string;
    'Flare Gun kills': string;
    'Micro SMG kills': string;
    'SMG kills': string;
    'Assault SMG kills': string;
    'Combat PDW kills': string;
    'Compact Rifle kills': string;
    'Battle Axe kills': string;
    'Sweeper Shotgun kills': string;
    'Compact Grenade Launcher kills': string;
    'Assault Rifle kills': string;
    'Carbine Rifle kills': string;
    'Advanced Rifle kills': string;
    'Special Carbine kills': string;
    'Marksman Rifle kills': string;
    'MG kills': string;
    'Combat MG kills': string;
    'Pump Shotgun kills': string;
    'Sawed-Off Shotgun kills': string;
    'Assault Shotgun kills': string;
    'Bullpup Shotgun kills': string;
    'Sniper Rifle kills': string;
    'Heavy Sniper kills': string;
    'Grenade Launcher kills': string;
    'RPG kills': string;
    'Homing Launcher kills': string;
    'Minigun kills': string;
    'Grenade kills': string;
    'Tear Gas kills': string;
    'Sticky Bomb kills': string;
    'Proximity Mine kills': string;
    'Molotov kills': string;
    'Knife kills': string;
    'Nightstick kills': string;
    'Crowbar kills': string;
    'Baseball Bat kills': string;
    'Golf Club kills': string;
    'Unarmed kills': string;
    'Knuckle Dusters kills': string;
    'Rhino Gun kills': string;
    'Buzzard Minigun kills': string;
    'Buzzard Rocket kills': string;
    'Lazer Cannon kills': string;
    'Lazer Missile kills': string;
    'Annihilator Minigun kills': string;
    'Hydra Missile kills': string;
    'Hydra Cannon kills': string;
    'Insurgent Machine Gun kills': string;
    'Savage Missile kills': string;
    'Technical Machine Gun kills': string;
    'Valkyrie Cannon kills': string;
    'Valkyrie Machine Gun kills': string;
    'Pistol MK II kills': string;
    'SMG MK II kills': string;
    'Heavy Sniper MK II kills': string;
    'Combat MG MK II kills': string;
    'Assualt Rifle MK II kills': string;
    'Carbine Rifle MK II kills': string;
    'Double-Action Revolver kills': string;
    'Marksman Rifle MK II kills': string;
    'Special Carbine MK II kills': string;
    'Stone Hatchet kills': string;
  },
  skills: {
    Stamina: number;
    Shooting: number;
    Strength: number;
    Stealth: number;
    Flying: number;
    Driving: number;
    'Lung Capacity': number;
    'Mental State': number;
  },
}

export interface StatsSecondPage {
  level: number;
  playTime: string; //"38d 22h 49m",
  cash: string;
  bank: string;
  jobs: string;
  pickup: string;
  earned: string;
  spend: string;
  copskilled: string;
  wantedStars: string;
  timeWanted: string;
  storeHoldUps: string;
  crew: string;
}

export interface PlayerStats extends StatsFirstPage {
  extra: StatsSecondPage;
  name: string;
}
