import { Routes, GET, PUT, EmptyResponse, int, DELETE, PATCH } from "../Decorators";

@Routes('crews')
export default class MyCrews {
  constructor(private req: any) {}

  /**
   * Fetch the players that have requested to join a given crew
   * @param id crewID
   * @param page Page number
   */
  @GET(':id/invites/pages/:page')
  fetchInvites(@int id: number, @int page: number) {
    return this.req(`https://scapi.rockstargames.com/crew/joinRequests?crewId=${id}&onlineService=sc&searchTerm=&pageIndex=${page}&pageSize=25`, {
      format: (data: any) => data.crewRequests.map((r: any) => ({
        id: r.requestId,
        player: {
          name: r.nickname,
          avatarURL: r.avatarUrl,
          id: r.rockstarId,
          tag: r.gamertag,
          primaryCrew: {
            id: r.primaryClan.id,
            name : r.primaryClan.name,
            tag: r.primaryClan.tag,
            color: r.primaryClan.color,
            private: r.primaryClan.isPrivateClan
          }
        }
      }))
    })
  }

  /**
   * Invite a player to a crew
   * @param crewId ID of the crew to invite the player to
   * @param rockstarId ID of the player to invite
   */
  @EmptyResponse
  @PUT(':crewID/invites/:playerID')
  sendInvite(@int crewID: number, @int playerID: number) {
    return this.req(`https://socialclub.rockstargames.com/crewsapi/UpdateCrew`, {
      reqToken: true,
      method: 'PUT',
      body: {
        crewId: crewID,
        inviteMsg: '',
        op: "invite",
        role: 4,
        rockstarId: playerID
      }
    })
  }

  /**
   * Update the rank of a player in a certain crew
   * @param crewID ID of the crew
   * @param playerID ID of the player to promote/demote
   * @param rank Updated rank (leader: 0, commissioners: 1, lieutenants: 2, representatives: 4, muscle: 5)
   */
  @EmptyResponse
  @PATCH(':crewID/players/:playerID/rank/:rank')
  updatePlayerRank(@int crewID: number, @int playerID: number, @int rank: number) {
    return this.req(`https://scapi.rockstargames.com/crew/promote?crewId=${crewID}&rockstarIds=${playerID}&newRankOrder=${rank}`, {
      method: 'POST'
    })
  }

  @EmptyResponse
  @DELETE(':crewID/players/:playerID')
  kickPlayer(@int crewID: number, @int playerID: number) {
    return this.req(`https://scapi.rockstargames.com/crew/kick?crewId=${crewID}&rockstarIds=${playerID}&rankOrder=4`, {
      method: 'POST'
    })

  }
}

export interface MyCrewFetchInvites {
  id: number,
  player: {
    name: string,
    avatarURL: string,
    id: number,
    tag: string,
    primaryCrew: {
      id: number,
      name : string,
      tag: string,
      color: string,
      private: boolean
    }
  }
}