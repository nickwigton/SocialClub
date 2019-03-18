import { StatsFetch as Stats } from '../../Server/Endpoints/Stats';
import Client from '../Client';

/**
 * Class to get different records from players
 */
export default class Records {
  public client: Client;

  constructor(client: Client){
    Reflect.defineProperty(this, 'client', { value: client })
  }

  /**
   * Get the modder record of a player
   * @param nameOrStats The name of player, or his stats
   */
  public async modderRecord(nameOrStats: string | Stats): Promise<string> {
    const info = typeof nameOrStats === 'string' ? await this.client.players.byName(nameOrStats).then(p => p.fetchStats()) : nameOrStats;
    let msg = '';
    // First check if pickedup + expenses - income is more than 55M
    let tmp = this.parseToInt(info.career['Overall expenses']) - this.parseToInt(info.career['Overall income']);
    if(this.parseToInt(info.cash['Picked up']) + tmp > 55000000){
      // If so, he should be marked for modding for more than 25M per catogory
      // Check for money they picked up
      msg += (this.parseToInt(info.cash['Picked up']) > 25000000)?'[X] Modded money picked up': '[   ] Modded money picked up';
      msg += ' (' + info.cash['Picked up'] + ')\n';

      // Check for income outcome
      msg += (tmp > 25000000)?'[X] Modded money income-outcome': '[   ] Modded money income-outcome';
      msg += ' (' + info.career['Overall income']+' - ' + info.career['Overall expenses'] + ')\n';
    } else {
      // Otherwise, he isn't modding based on combined stats, so let's just check the 50M
      // Check for money they picked up
      msg += (this.parseToInt(info.cash['Picked up']) > 50000000)?'[X] Modded money picked up': '[   ] Modded money picked up';
      msg += ' (' + info.cash['Picked up'] + ')\n';

      // Check for income outcome
      msg += (tmp > 50000000)?'[X] Modded money income-outcome': '[   ] Modded money income-outcome';
      msg += ' (' + info.career['Overall income']+' - ' + info.career['Overall expenses'] + ')\n';
    }

    // Check for to much cash
    tmp = this.parseToInt(info.extra.bank) + this.parseToInt(info.extra.cash);
    msg += (tmp > 100000000 && parseInt(info.extra.level) < 400 || tmp > 200000000)?'[X] Modded money possession': '[   ] Modded money possession';
    msg += ' (' + info.extra.bank + ' + ' + info.extra.cash + ')\n';

    // Check for aimbot by accuracy
    msg += (this.parseToInt(info.combat.Accuracy) > 60)?'[X] Aimbot by accuracy': '[   ] Aimbot by accuracy';
    msg += ' (' + info.combat.Accuracy + ')\n';

    // Check for aimbot by headshots players
    msg += (this.parseToInt(info.combat['Player headshot kills']) > 0.7*this.parseToInt(info.combat['Player kills']))?'[X] Aimbot by heashot players': '[   ] Aimbot by headshots players';
    msg += ' (' + info.combat['Player headshot kills'] + '/' + info.combat['Player kills'] + ')\n';

    // Check for aimbot by headshots total
    msg += (this.parseToInt(info.combat['Headshot kills']) > 0.7*this.parseToInt(info.combat.Kills))?'[X] Aimbot by overall headshots': '[   ] Aimbot by overall headshots';
    msg += ' (' + info.combat['Headshot kills'] + '/' + info.combat.Kills + ')\n';

    // Check for K/D, if someone has an absurd K/D of 15 plus we can flag him for griefing or godmode
    msg += (this.parseToInt(info.career['Player vs Player Kill / Death ratio']) > 15)?'[X] Godmode based on K/D':'[   ] Godmode based on K/D';
    msg += ' (' + info.career['Player vs Player Kill / Death ratio'] + ')\n';

    // Check modded stats
    tmp = this.sumSkills(info.skills);
    msg += (parseInt(info.extra.level) < 75 && tmp >= 700)? '[X] Modded stats' : '[   ] Modded stats';
    msg += ' (' + tmp + '/800' + ')\n';

    // Check modded lvl
    const time = info.career['Time spent in GTA Online'];
    const hourss: string = (time.split('h')[0] === '') ? '0' : time.split('h')[0];
    let hours: number = (hourss.split('d ')[1] === '') ? 0 : parseInt(hourss.split('d ')[1]);
    hours += 24 * ((time.split('d')[0] === '') ? 0 : parseInt(time.split('d')[0]));
    msg += ((parseInt(info.extra.level) > 100 && hours < 75 ) || (parseInt(info.extra.level) >= 100 && parseInt(info.extra.level) > (hours*1.5)))?'[X] Modded level':'[   ] Modded level';
    msg += ' (level ' + parseInt(info.extra.level) + ' in ' + info.career['Time spent in GTA Online'] + ')\n';

    return msg;
  }

  /**
   * Get the financial record of a player
   * @param nameOrStats The name of player, or his stats
   */
  public async financialRecord(nameOrStats: string | Stats): Promise<string> {
    const info = typeof nameOrStats === 'string' ? await this.client.players.byName(nameOrStats).then(p => p.fetchStats()) : nameOrStats;
    let msg = 'Level: ' + info.extra.level + '\n';
    msg += 'Cash: ' + info.extra.cash + '\n';
    msg += 'Bank: ' + info.extra.bank + '\n';
    msg += 'Income: ' + info.career['Overall income'] +'\n';
    msg += 'Expenses: '+info.career['Overall expenses']+'\n';
    msg += 'Cash picked up: ' + info.cash['Picked up'] + '\n';
    msg += 'Job earnings: ' + info.cash['Earned from Jobs']+'\n';
    msg += 'Time played: '+ info.career['Time spent in GTA Online']+'\n';
    return msg;
  }

  /**
   * Get the criminal record of a player
   * @param nameOrStats The name of player, or his stats
   */
  public async criminalRecord(nameOrStats: string | Stats): Promise<string> {
    const info = typeof nameOrStats === 'string' ? await this.client.players.byName(nameOrStats).then(p => p.fetchStats()) : nameOrStats;   
    let msg = '**Capital offenses**\n';
    msg += 'Cops killed: ' +info.crimes['Cops killed'] + '\n';
    msg += 'NOOSE killed: ' +info.crimes['NOOSE killed'] + '\n';
    msg += 'Kills: ' +info.combat.Kills + ' (' + info.combat['Headshot kills'] + ' headshots)\n';
    msg += 'Player kills: ' +info.combat['Player kills'] + ' (' + info.combat['Player headshot kills'] + ' headshots)\n';
    msg += 'Overall accuracy: ' +info.combat.Accuracy + '\n';
    msg += 'Kill Death Ratio: ' + info.career['Player vs Player Kill / Death ratio'] + '\n';
    msg += 'Store hold ups: ' +info.crimes['Store Hold Ups'] + '\n';
    msg += 'Cars stolen: ' +info.crimes['Cars stolen'] + '\n';
    msg += (this.parseToInt(info.general['Sex acts purchased']) > 0)?(info.general['Sex acts purchased'] + ' counts of solicitation\n'):'';
    msg += '\n';
    msg += '**Other**\n';
    msg += (this.parseToInt(info.general['Private dances']) > 100)?'Pervert\n':'';
    msg += 'Top speeding-ticket: ' +info.vehicles['Highest speed in a road vehicle'] + ' (' + info.vehicles['Road vehicle driven fastest'] + ')\n';
    msg += 'Farthest wheelie: ' +info.vehicles['Farthest wheelie'] + '\n';
    msg += 'Farthest stoppie: ' +info.vehicles['Farthest stoppie'] + '\n';
    msg += 'Hit & run\'s: ' +info.crimes['Store Hold Ups'] + '\n';
    msg += 'Time wanted: ' +info.crimes['Time spent with a Wanted Level'] + '\n';
    msg += '\n';
    msg += '**Psychological report**\n'
    msg += (this.parseToInt(info.general['Photos taken']) > 150)?'Sociopath\n':'';
    msg += (this.parseToInt(info.combat['Player kills']) > 2000)?'Psychopath\n':'';
    msg += (this.parseToInt(info.general['Private dances']) > 25)?'Pervert\n':'';
    msg += (this.parseToInt(info.career['Player vs Player Kill / Death ratio']) < 1)?'Pussy\n':'';
    msg += (this.parseToInt(info.general['Deaths by drowning']) > 30)?'Can\'t swim\n':'';
    msg += (this.parseToInt(info.general['Deaths by falling']) > 200)?'Clumsy\n':'';
    msg += 'Weapon of choice: '+ this.getFavWeapon(info.weapons);
    msg += '\n\n**WANTED DEAD OR ALIVE**\n';
    msg += this.parseToInt(info.general['Bounties placed on you'])*4000;
    return msg;
  }

  /**
   * Parse a string to a number
   * @param string
   */
  private parseToInt(str: string): number {
    if(str === undefined) return 0;
    if(str.endsWith('%')) return parseInt(str.substr(0, str.length - 1));
    if(str.endsWith('h')) str = str.substr(0, str.length - 4);

    if(str.endsWith('K')){
      str = str.substr(0, str.length - 1);
      str += str.includes('.') ? '00' : '000';
      str = str.replace('.', '');
    } else if(str.endsWith('M')){
      str = str.substr(0, str.length - 1);
      str += str.includes('.') ? '00000' : '000000';
      str = str.replace('.', '');
    }
    str = str.replace(/,/g, '');
    if(str.startsWith('$')) str = str.substr(1);
    return parseInt(str);
  }

  /**
   * Get the favorite weapon
   * @param list weapon stats
   */
  private getFavWeapon(list: Stats['weapons']): string {
    return Object.entries(list).sort((a, b) => parseInt(b[1]) - parseInt(a[1]))[0][0].slice(0, -6);
  }

  /**
   * Sum the skills to a single number
   * @param skills The skills to sum
   */
  private sumSkills(skills: Stats['skills']): number {
    return Object.values(skills).reduce((acc, val) => acc + val, 0);
  }
}
