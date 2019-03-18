import { Routes, GET, EmptyResponse, int, DELETE } from "../Decorators";
import parseCrew from './parsing/crew';

@Routes('crews')
export default class Crews {
  constructor(private req: any) {}

  /**
   * Fetch crew information by name
   * @param name The name of the crew you'd like to fetch
   */
  @GET('names/:name')
  byName(name: string) {
    return this.req(`https://scapi.rockstargames.com/crew/byname?name=${name}`, {
      format: parseCrew
    })
  }

  @GET(':id')
  fetch(@int id: number) {
    return this.req(`https://scapi.rockstargames.com/crew/byid?crewId=${id}`, {
      format: (data: any) => parseCrew(data)
    })
  }

  /**
   * Fetch the emblems of a certain crew
   * @param id The ID of the crew
   * @param page The page number
   */
  @GET(':id/emblems/:page')
  emblems(@int id: number, @int page: number) {
    const url = `https://scapi.rockstargames.com/crew/emblems?crewId=${id}&pageIndex=${page}&pageSize=6`;
    return this.req(url, {
      format: (data: any) => data.emblems.map((e: any) => ({
        id: e.emblemId,
        permissions: {
          report: e.allowReport,
          delete: e.allowDelete,
          activate: e.allowActivate
        },
        author: {
          name: e.authorNickname,
          id: e.authorId,
        }
      }))
    })
  }

  /**
   * Fetch the crew feed, limited to 20 activities
   * Note: Feeds and activities are not supported! You can fetch them, but you'll have to parse them yourself!
   * @param id The ID of the crew
   */
  @GET(':id/feed')
  fetchFeed(@int id: number) {
    return this.req(`https://scapi.rockstargames.com/feed/crew?crewId=${id}&offset=0&limit=20&group=all`, {
      format: (data: any) => data.actvities
    })
  }

  /**
   * Remove an activity from a crew feed
   * @param id The crewID. Fun fact: this can be any number, since it's not being used
   * @param activity The activityID
   */
  @EmptyResponse
  @DELETE(':id/feed/activities/:activity')
  deleteActivity(@int id: number, @int activity: number) {
    return this.req(`https://scapi.rockstargames.com/feed/deletePost?postId=${activity}`, { method:'DELETE' })
  }

  @GET(':id/players')
  fetchPlayers(@int id: number) {
    return this.req(`https://scapi.rockstargames.com/crew/ranksWithMembership?crewId=${id}&onlineService=sc&memberCountToRetrieve=250`, {
      format: (data: any) => data.crewRanks.map((r: any) => ({
        id: r.rankOrder,
        name: ['Leader', 'Commissioners', 'Lieutenants', 'Representatives', 'Muscle'][r.rankOrder],
        permissions: {
          deleteFromWall: r.rankPermissions.canDeleteFromWall,
          demote: r.rankPermissions.canDemote,
          editSettings: r.rankPermissions.canEditSettings,
          invite: r.rankPermissions.canInvite,
          kick: r.rankPermissions.canKick,
          mangeRanks: r.rankPermissions.canManageRanks,
          postMessages: r.rankPermissions.canPostMessages,
          promote: r.rankPermissions.canPromote,
          publishMultipleEmblems: r.rankPermissions.canPublishMultipleEmblems,
          updateStatus: r.rankPermissions.canUpdateStatus,
          viewSettings: r.rankPermissions.canViewSettings,
          writeOnWall: r.rankPermissions.canWriteOnWall,
        },
        players: r.rankMembers.map((m: any) => ({
          avatarURL: m.avatarUrl,
          name: m.nickname,
          id: m.rockstarId,
          joinedAt: m.dateJoined,
          rank: m.rankOrder,
          tag: m.gamerTag,
          primaryCrew: {
            id: m.primaryClan.id,
            name : m.primaryClan.name,
            tag: m.primaryClan.tag,
            color: m.primaryClan.color,
            private: m.primaryClan.isPrivateClan
          }
        }))
      }))
    })
  }

  @GET('search/:query')
  search(query: string) {
    return this.req(`https://scapi.rockstargames.com/search/crew?sort=&crewtype=all&includeCommentCount=true&pageSize=30&searchTerm=${query}`, {
      format: (data: any) => data.crews.map((c: any) => parseCrew(c))
    })
  }
}

export interface CrewsFetch {
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
}

export interface CrewsByName extends CrewsFetch {}
export interface CrewsSearch extends CrewsFetch {}

export interface CrewsEmblems {
  id: number,
    permissions: {
      report: boolean,
      delete: boolean,
      activate: boolean
    },
    author: {
      name: string,
      id: number
    }
}

export interface CrewsFetchPlayers {
  id: number,
  name: "Leader | Commissioners | Lieutenants | Representatives | Muscle",
  permissions: {
    deleteFromWall: boolean,
    demote: boolean,
    editSettings: boolean,
    invite: boolean,
    kick: boolean,
    mangeRanks: boolean,
    postMessages: boolean,
    promote: boolean,
    publishMultipleEmblems: boolean,
    updateStatus: boolean,
    viewSettings: boolean,
    writeOnWall: boolean
  },
  players: [{
    avatarURL: string,
    name: string,
    id: number,
    joinedAt: string,
    rank: number,
    tag: string,
    primaryCrew: {
      id: number,
      name : string,
      tag: string,
      color: string,
      private: boolean
    }
  }]
}
