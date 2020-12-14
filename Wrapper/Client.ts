import MainPlayerStore from './structures/stores/MainPlayerStore';
import MainCrewStore from './structures/stores/MainCrewStore';
import MyPlayer from './structures/MyPlayer';
import Records from './records/Records.js';
import Request from './request/Request';
import { EventEmitter } from 'events';
import { JobsSearch as Job } from '../Server/Endpoints/Jobs';

/**
 * The main Client to interact with the SocialClubAPI
 */
export default class Client extends EventEmitter {
  public records: Records = new Records(this);
  public players = new MainPlayerStore(this, 0);
  public crews = new MainCrewStore(this, 0);
  public api: Request;
  public me: MyPlayer;

  /**
   * Constructor of the main Client
   * @param name Your SocialClub account name
   */
  constructor(name: string, port = 3003) {
    super();
    this.api = new Request(this, port);
    this.me = new MyPlayer(this, name);

    this.me.refresh()
      .then(() => this.emit('ready'))
      .catch(() => this.emit('error', new Error('Failed to fetch MyPlayer info on startup')))
  }

  public reloadEndpoints(): Promise<void> {
    return this.api.get('reload');
  }

  public screenshot(url: string): Promise<Buffer> {
    return this.api.post('screenshot', { url })
      .then(({ base64 }) => Buffer.from(base64, 'base64'));
  }

  public searchJobs(query: string): Promise<Job[]> {
    return this.api.get(`jobs/${query}/search`);
  }
}
