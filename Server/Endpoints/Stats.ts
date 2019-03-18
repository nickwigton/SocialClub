import { Routes, GET, int } from "../Decorators";

@Routes('players')
export default class Stats {
  constructor(private req: any) {}

  /**
   * Fetch the bulkstats of a given player
   * Warning: Interface for this endpoint is still missing
   * @param id ID of the player
   */
  @GET(':id/bulkstats')
  fetchBulk(@int id: number) {
    return this.req(`https://socialclub.rockstargames.com/games/gtav/career/overviewCompare?character=Freemode&nickname=&slot=Freemode&gamerHandle=&gamerTag=&rockstarIds=${id}`, {
      reqToken: true,
      format: (data: any) => {
        const categories: any = {}
        for(const [ Name ] of data.Categories)
          categories[Name] = {}
    
        const players = data.SelectedUsers.map((p: any) => ({
          ...categories,
          name: p.Nickname,
          id: p.Rockstarid,
        }))
        
        for(const r of data.Rows) {
          r.Values.forEach((v: any, i: number) => {
            players[i][r.Category][r.RowNameLocalized] = v.FormattedValue;
          })
        }
        return players;
      }
    })
  }

  /**
   * Fetch the stats of some player
   * @param name Name of the player
   */
  @GET(':name/stats')
  fetch(name: string) {
    return this.req(`stats/${name}`)
  }
}

export interface StatsFetch {
  name: string,
  timestamp: number,

  career: CareerStats,
  general: GeneralStats,
  crimes: CrimeStats,
  vehicles: VehicleStats,
  cash: CashStats,
  combat: CombatStats,
  weapons: WeaponStats,
  skills: SkillStats,
  extra: ExtraStats
}

export interface CareerStats {
  "Overall income": string,
  "Overall expenses": string,
  "Total players killed": string,
  "Total deaths by players": string,
  "Player vs Player Kill / Death ratio": string,
  "Distance traveled": string,
  "Favorite radio station": string,
  "Time spent in GTA Online": string,
  "Time played in first person": string,
  "Time spent in Deathmatches": string,
  "Time spent in Races": string,
  "Time spent in the Creator": string,
  "Deathmatches Published": string,
  "Races Published": string,
  "Captures Published": string,
  "Last Team Standings Published": string,
  "Community plays of your published content": string,
  "Thumbs up for your published content": string
}

export interface GeneralStats {
  "Time played as character": string,
  "Character created": string,
  "Last ranked up": string,
  "Longest single game session": string,
  "Average time per session": string,
  "Total deaths": string,
  "Deaths by explosion": string,
  "Deaths by falling": string,
  "Deaths by fire": string,
  "Deaths by traffic": string,
  "Deaths by drowning": string,
  "Time swimming": string,
  "Distance traveled swimming": string,
  "Time underwater": string,
  "Time walking": string,
  "Distance traveled walking": string,
  "Distance traveled running": string,
  "Farthest free-fall survived": string,
  "Time in cover": string,
  "Photos taken": string,
  "Private dances": string,
  "Sex acts purchased": string,
  "Bounties placed on others": string,
  "Bounties placed on you": string,
  "Highest Survival wave reached": string
}

export interface CrimeStats {
  "Cops killed": string,
  "NOOSE killed": string,
  "Times Wanted": string,
  "Wanted stars attained": string,
  "Wanted stars evaded": string,
  "Time spent with a Wanted Level": string,
  "Last Wanted Level duration": string,
  "Longest Wanted Level duration": string,
  "Time spent with a 5 star Wanted Level": string,
  "Drive-by kills as driver": string,
  "Drive-by kills as passenger": string,
  "Tires shot out": string,
  "Vehicular kills": string,
  "Cars stolen": string,
  "Motorcycles stolen": string,
  "Helicopters stolen": string,
  "Planes stolen": string,
  "Boats stolen": string,
  "ATVs stolen": string,
  "Bicycles stolen": string,
  "Cop vehicles stolen": string,
  "Store Hold Ups": string
}

export interface VehicleStats {
  "Time driving cars": string,
  "Distance traveled in cars": string,
  "Time riding motorcycles": string,
  "Distance traveled on motorcycles": string,
  "Time flying helicopters": string,
  "Distance traveled in helicopters": string,
  "Time flying planes": string,
  "Distance traveled in planes": string,
  "Time sailing boats": string,
  "Distance traveled in boats": string,
  "Time riding ATVs": string,
  "Distance traveled on ATVs": string,
  "Time riding bicycles": string,
  "Distance traveled on bicycles": string,
  "Highest speed in a road vehicle": string,
  "Road vehicle driven fastest": string,
  "Farthest stoppie": string,
  "Farthest wheelie": string,
  "Farthest driven without crashing": string,
  "Car crashes": string,
  "Motorcycle crashes": string,
  "ATV crashes": string,
  "Bailed from a moving vehicle": string,
  "Farthest vehicle jump": string,
  "Highest vehicle jump": string,
  "Most flips in one vehicle jump": string,
  "Most spins in one vehicle jump": string,
  "Unique Stunt Jumps found": string,
  "Unique Stunt Jumps completed": string,
  "Near misses": string,
  "Cop cars blown up": string,
  "Cars blown up": string,
  "Motorcycles blown up": string,
  "Helicopters blown up": string,
  "Planes blown up": string,
  "Boats blown up": string,
  "ATVs blown up": string,
  "Vehicles repaired": string,
  "Vehicles resprayed": string,
  "Cars exported": string,
  "Highest Hydraulic Jump": string
}

export interface CashStats {
  "Spent on weapons & armor": string,
  "Spent on vehicles & maintenance": string,
  "Spent on style & entertainment": string,
  "Spent on property & utilities": string,
  "Spent on Job & Activity entry fees": string,
  "Spent on betting": string,
  "Spent on contact services": string,
  "Spent on healthcare": string,
  "Dropped or stolen": string,
  "Given to others": string,
  "Earned from Jobs": string,
  "Earned from selling vehicles": string,
  "Earned from betting": string,
  "Earned from Good Sport reward": string,
  "Picked up": string,
  "Received from others": string
}

export interface CombatStats {
  "Shots": string,
  "Hits": string,
  "Accuracy": string,
  "Kills": string,
  "Headshot kills": string,
  "Armed kills": string,
  "Free Aim kills": string,
  "Stealth kills": string,
  "Counter attacks": string,
  "Player kills": string,
  "Player headshot kills": string,
  "Survival kills": string,
  "Gang Attack kills": string,
  "Highest killstreak in Deathmatch": string,
  "Archenemy": string,
  "Times killed by Archenemy": string,
  "Victim": string,
  "Victim kills": string
}

export interface WeaponStats {
  "Pistol kills": string,
  "Combat Pistol kills": string,
  "AP Pistol kills": string,
  "Heavy Revolver kills": string,
  "Micro SMG kills": string,
  "SMG kills": string,
  "Assault SMG kills": string,
  "Combat PDW kills": string,
  "Compact Rifle kills": string,
  "Battle Axe kills": string,
  "Sweeper Shotgun kills": string,
  "Compact Grenade Launcher kills": string,
  "Assault Rifle kills": string,
  "Carbine Rifle kills": string,
  "Advanced Rifle kills": string,
  "Special Carbine kills": string,
  "Marksman Rifle kills": string,
  "MG kills": string,
  "Combat MG kills": string,
  "Pump Shotgun kills": string,
  "Sawed-Off Shotgun kills": string,
  "Assault Shotgun kills": string,
  "Bullpup Shotgun kills": string,
  "Sniper Rifle kills": string,
  "Heavy Sniper kills": string,
  "Grenade Launcher kills": string,
  "RPG kills": string,
  "Homing Launcher kills": string,
  "Minigun kills": string,
  "Grenade kills": string,
  "Tear Gas kills": string,
  "Sticky Bomb kills": string,
  "Proximity Mine kills": string,
  "Molotov kills": string,
  "Knife kills": string,
  "Nightstick kills": string,
  "Crowbar kills": string,
  "Baseball Bat kills": string,
  "Golf Club kills": string,
  "Unarmed kills": string,
  "Knuckle Dusters kills": string,
  "Rhino Gun kills": string,
  "Buzzard Minigun kills": string,
  "Buzzard Rocket kills": string,
  "Lazer Cannon kills": string,
  "Lazer Missile kills": string,
  "Annihilator Minigun kills": string,
  "Hydra Missile kills": string,
  "Hydra Cannon kills": string,
  "Insurgent Machine Gun kills": string,
  "Savage Missile kills": string,
  "Technical Machine Gun kills": string,
  "Valkyrie Cannon kills": string,
  "Valkyrie Machine Gun kills": string,
  "Pistol MK II kills": string,
  "SMG MK II kills": string,
  "Heavy Sniper MK II kills": string,
  "Combat MG MK II kills": string,
  "Assualt Rifle MK II kills": string,
  "Carbine Rifle MK II kills": string,
  "Double-Action Revolver kills": string,
  "Marksman Rifle MK II kills": string,
  "Special Carbine MK II kills": string,
  "Stone Hatchet kills": string
}

export interface SkillStats {
  "Stamina": number,
  "Shooting": number,
  "Strength": number,
  "Stealth": number,
  "Flying": number,
  "Driving": number,
  "Lung Capacity": number,
  "Mental State": number
}

export interface ExtraStats {
  "level": string,
  "playTime": string,
  "cash": string,
  "bank": string,
  "jobs": string,
  "pickup": string,
  "earned": string,
  "spend": string,
  "copskilled": string,
  "wantedStars": string,
  "timeWanted": string,
  "storeHoldUps": string,
  "crew": string
}