import { Routes, GET, Body, EmptyResponse, int, POST } from "../Decorators";
import parsePlayer from './parsing/player';

@Routes('players')
export default class Players {
  constructor(private req: any) {}

  /**
   * Fetch a player by ID
   * @param id PlayerID
   */
  @GET(':id')
  fetch(@int id: number) {
    return this.req(`https://scapi.rockstargames.com/profile/getprofile?rockstarId=${id}&maxFriends=1`, {
      format: (data: any) => parsePlayer(data)
    })
  }

  /**
   * Get a player by name
   * @param name Player name
   */
  @GET('names/:name')
  byName(name: string) {
    return this.req(`https://scapi.rockstargames.com/profile/getprofile?nickname=${name}&maxFriends=1`, {
      format: (data: any) => parsePlayer(data)
    })
  }

  /**
   * Search through the SocialClub players
   * @param query Search query
   */
  @GET('search/:query')
  search(query: string) {
    return this.req(`https://scapi.rockstargames.com/search/user?includeCommentCount=true&searchTerm=${query}`, {
      format: (data: any) => data.accounts.map((a: any) => ({
        name: a.nickname,
        id: a.rockstarId,
        relation: a.relationship,
      }))
    })
  }

  /**
   * Alternative find user by ID
   * @param id Rockstar ID to look up
   */
  @GET('findById/:id')
  findById(id: number) {
    return this.req(`https://scapi.rockstargames.com/feed/member?rockstarId=${id}&offset=1&limit=10000000&title=&platform=&group=all`, {
        format: (data: any) => {
            return data.activities.filter((a: any) => a.type == 'account_registered')[0].actor;
        }
    })
  }

  /**
   * Fetch the stats of a given player
   * @param id ID of the player
   */
  @GET(':id/bulkstats')
  conversations(@int id: number) {
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
   * Fetch the player feed, limited to 30 activities
   * Note: feeds are not supported, so you'll have to parse the response yourself
   * @param id ID of the player
   */
  @GET(':id/feed')
  fetchFeed(@int id: number) {
    return this.req(`https://scapi.rockstargames.com/feed/member?rockstarId=${id}&offset=0&limit=30&group=all`, {
      format: (data: any) => data.actvities
    })
  }

  /**
   * Fetch the friendslist of some player
   * @param id PlayerID
   * @param page Page number
   */
  @GET(':id/friends/pages/:page')
  fetchFriends(@int id: number, @int page: number) {
    return this.req(`https://scapi.rockstargames.com/friends/getFriends?rockstarId=${id}&pageIndex=${page}&pageSize=50`, {
      format: (data: any) => data.rockstarAccountList.rockstarAccounts.map((acc: any) => ({
        id: acc.rockstarId,
        name: acc.name,
        relation: acc.relationship,
        blockable: acc.allowBlock,
        statsOpen: acc.allowStatCompare,
        profileHidden: acc.profileHidden,
        wallHidden: acc.wallHidden,
        crewMate: acc.isClanMate,
        primaryCrew: {
          id: acc.primaryClanId,
          name: acc.primaryClanName,
          color: acc.primaryClanColor,
          tag: acc.primaryClanTag,
          rank: acc.primaryClanRankOrder
        }
      }))
    })
  }

  /**
   * Fetch the message conversation with some player
   * @param id PlayerID
   */
  @GET(':id/messages')
  fetchMessages(@int id: number) {
    return this.req(`https://socialclub.rockstargames.com/Message/GetMessages?reset=true&rockstarId=${id}`, {
      reqToken: true,
      format: (data: any) => data.Messages.map((m: any) => ({
        author: {
          id: m.Author,
          name: m.ScNickname,
          avatarURL: `https://a.rsg.sc/${m.AvatarUrl}`,
        },
        id: m.ID,
        read: m.Read,
        content: m.Text
      }))
    })
  }

  /**
   * Send a message to a given player
   * @param name The player name
   * @param body must look like { content 'message to send' }
   */
  @Body
  @EmptyResponse
  @POST(':name/messages')
  sendMessage(name: string, body: { content: string } ) {
    return this.req(`https://socialclub.rockstargames.com/Message/AddMessage`,{
      method: 'POST',
      reqToken: true,
      body: { content: body.content, nickname: name }
    })
  }

  /**
   * Fetch the mugshot of a given player
   */
  @GET(':id/mugshot')
  fetchMugshot(@int id: number) {
    return this.req(`https://socialclub.rockstargames.com/games/gtav/ajax/charnav?areSpCharsGrouped=false&spCharsShown=true&mpCharsShown=true&rockstarId=${id}&character=Freemode`, {
      reqToken: true,
      json: false,
      format: (data: any) => {
        const url = data.match(/mugshotFreemode" src="([^"]+)"/)[1];
        return { url };
      }
    })
  }
}

export interface PlayersFetch {
  id: number,
  name: string,
  relation: string,
  blockable: boolean,
  statsOpen: boolean,
  profileHidden: boolean,
  wallHidden: boolean,
  country: string,
  friendCount: number,
  crewMate: boolean,
  gamesOwned: [{ not: 'yet added' }],
  primaryCrew: {
    id: number,
    name: string,
    color: string,
    tag: string,
    rank: number
  },
  crews: [{
    permissions: {
      join: boolean,
      leave: boolean,
      invite: boolean,
      recruit: boolean,
      requestInvite: boolean
    },
    createdAt: string,
    color: string,
    id: number,
    motto: string,
    name: string,
    tag: string,
    type: string,
    division: string,
    memberCount: number,
    open: boolean,
    primary: boolean,
    private: boolean
  }]
}

export interface PlayersByName extends PlayersFetch {}

export interface PlayersFetchFriends {
  id: number,
  name: string,
  relation: string,
  blockable: boolean,
  statsOpen: boolean,
  profileHidden: boolean,
  wallHidden: boolean,
  crewMate: boolean,
  primaryCrew: {
    id: number,
    name: string,
    color: string,
    tag: string,
    rank: number
  }
}

export interface PlayersFetchMessages {
  author: {
    id: number,
    name: string,
    avatarURL: string
  },
  id: number,
  read: boolean,
  content: string
}

export interface PlayersFetchMugshot {
  url: string
}

export interface PlayersSearch {
  name: string,
  id: number,
  relation: string
}
