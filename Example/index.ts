import { createInterface } from 'readline';
import { Client } from '../Wrapper';

// Make sure you enter the same SocialClub username as the Server is logged in
const client = new Client('DennisTest', 3000);
client.on('ready', () => console.log('Ready!'));
client.on('error', console.error);
process.on('unhandledRejection', console.error);

createInterface({
  input: process.stdin,
  output: process.stdout
}).on('line', async line => {
  const args = line.split(/ +/);
  const cmd = args.shift().toLowerCase();

  // members {crewName}
  if(cmd === 'members') {
    const crew = await client.crews.byName(args.join(' '));
    return crew.fetchMembers().then(console.log);
  }
  if(cmd === 'crew') {
    const crew = await client.crews.byName(args.join(' ')).catch(() => null);
    if(!crew) return console.log('Crew not found!');
    return console.log(crew);
  }
  if(['modder', 'financial', 'criminal'].includes(cmd)) {
    const player = await client.players.byName(args[0]).catch(() => null);
    if(!player) return console.log('Player not found!');
    if(!player.statsOpen){
      // Uncache the player, so he is re-fetched when retrying this command
      this.client.sc.players.delete(player.id);
      return console.log('Stats seem to be closed. Please open your stats and try again.');
    }
    let record;
    if(cmd === 'modder')
      record = await client.records.modderRecord(player.name);
    else if(cmd === 'financial')
      record = await client.records.financialRecord(player.name);
    else
      record = await client.records.criminalRecord(player.name);
    return console.log(record);
  }
  console.log('Command not recognized');
})
