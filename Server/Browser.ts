import * as puppeteer from 'puppeteer';
import Server from './index';
import { RequestOptions } from './Request';
import * as config from './config.json';

// See https://github.com/DefinitelyTyped/DefinitelyTyped/issues/24419
declare module 'puppeteer' {
  interface Element { }
  interface Node { }
  interface NodeListOf<TNode = Node> { }
}

// Let TypeScript shut up about fetch and window not being defined
const fetch: any = null;
const window: any = null;

/**
 * Browser utilizes puppeteer to create the needed tabs, and fetch the data via page.evaluate
 */
export default class Browser {
  public ready: boolean = false;
  protected page: puppeteer.Page;
  private browser: puppeteer.Browser;
  private reloadPage: puppeteer.Page;

  /**
   * Constructor of the Browser
   * @param server Refrense to the server
   * @param launchOptions Optional puppeteer launch options
   */
  constructor(protected server: Server, launchOptions: puppeteer.LaunchOptions = { userDataDir: 'C:\\etc\\puppeteercache' }) {
    this.init(launchOptions);
    this.setInterval();
  }

  /**
   * Private async method to launch the browser to the login page
   * @param launchOptions The puppeteer launch options from the constructor function
   */
  private async init(launchOptions: puppeteer.LaunchOptions) {
    this.browser = await puppeteer.launch({ headless: false, ...launchOptions });
    this.reloadPage = await this.browser.newPage();
    await this.reloadPage.goto('https://signin.rockstargames.com/signin/user-form?cid=socialclub', { waitUntil: 'networkidle2' });
    await this.wait(1000);
    if (await this.reloadPage.$('[data-ui-name="googleSignInLink"]') !== null) {
      await this.reloadPage.click('[data-ui-name="googleSignInLink"]');
      await this.reloadPage.waitForNavigation({
        waitUntil: 'networkidle0',
      });
      await this.wait(3000);
      if (await this.reloadPage.$('input[type="email"]') !== null) {
        await this.reloadPage.type('input[type="email"]', config.SC_USERNAME);
        await this.reloadPage.keyboard.press(String.fromCharCode(13));
        await this.reloadPage.waitForSelector('input[type="password"]');
        await this.reloadPage.waitFor(2000);
        await this.reloadPage.type('input[type="password"]', config.SC_PASSWORD);
        await this.reloadPage.keyboard.press(String.fromCharCode(13));
        await this.reloadPage.waitForNavigation({
          waitUntil: 'networkidle0',
        }).then(() => this.waitForLogin());
      } else {
        this.waitForLogin();
      }        
    } else {
        this.waitForLogin();
    }
  }

  /**
   * Small helper wait method. Promise resolves after t seconds
   * @param t time in ms
   */
  public wait(t: number): Promise<void> {
    return new Promise(r => setTimeout(r, t));
  }

  /**
   * Perform an actual request to the SocialClub servers.
   * @param url The URL to request
   * @param options The request options
   * @param json Whether or not the response should be parsed to an object
   */
  public fetch(url: string, options: RequestOptions, json: boolean): Promise<{ status: boolean, e?: Error, code: number, body: any }> {
    return this.page.evaluate(async (url: string, options: any, json: any) => {
      console.log('Incoming', url, json, options);
      try {
        const res = await fetch(url, options);
        if(res.status > 250 || res.status < 200) {
          return { status: false, e: res, code: res.status }
        }
        const body = await ( json ? res.json() : res.text() );
        const obj = { status: true, body };
        if(json && (body.status === false || body.Status === false)) return { status: false, body: obj, e: 'FALSE_STATUS' }
        return obj;
      } catch(e){
        return { status: false, e: e && e.toString() }
      }
    }, url, options as any, json) as any
  }

  /**
   * Screetshot a given page. A new tab will opened to the given url, a screenshot will be made, and the tab will close
   * @param url The url to screenshot
   * @param options Optional additional binarySreenShotOptions
   */
  public async screenshot(url: string, options: puppeteer.BinaryScreenShotOptions = {}): Promise<Buffer> {
    const page = await this.browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2" });
    await this.wait(500);
    const buffer = await page.screenshot({ encoding: 'binary', ...options });
    page.close();
    return buffer;
  }

  /**
   * Private method that checks every 1.5 second if the login is successfull
   */
  private waitForLogin(): void {
    if(this.reloadPage.url().includes('https://socialclub.rockstargames.com/'))
      this.wait(2000).then(() => this.setup())
    else setTimeout(() => this.waitForLogin(), 1500);
  }
  
  /**
   * Private method to setup the second tab after a SocialClub login
   */
  private async setup(): Promise<void> {
    this.page = await this.browser.newPage();
    await this.page.goto('https://socialclub.rockstargames.com/', { waitUntil: 'networkidle2' });
    await this.wait(2000);
    this.ready = true;
    this.server.emit('ready');
  }

  /**
   * Private method that reload the first tab every 10 minutes, for sake of the AuthBlocker
   */
  private setInterval(): void {
    setInterval(() => {
      if(this.ready) {
        this.reloadPage.evaluate(() => window.location.reload()).catch(() => null);
      }
    }, 10 * 60 * 1000)
  }

  /**
   * Destroy the browser
   */
  public destroy(): Promise<void> {
    return this.browser.close();
  }
}
