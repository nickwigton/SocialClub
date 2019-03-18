import { Routes, GET, PUT, EmptyResponse, int, DELETE } from "../Decorators";

@Routes('players/@me')
export default class Invites {
  constructor(private req: any) {}

    /**
   * Fetch the crew invites you've got
   */
  @GET('crews/invites')
  fetchCrewInvites() {
    return this.req('https://scapi.rockstargames.com/crew/crewInvites', {
      format: (data: any) => data.crewInvites.map((acc: any) => ({
        id: acc.crewId,
        name: acc.crewName,
        message: acc.message,
        type: 'crewInvite'
      }))
    })
  }

  /**
   * Accept a crew invite
   * @param id ID of the crew
   */
  @EmptyResponse
  @PUT('crews/invites/:id')
  acceptCrewInvite(@int id: number) {
    return this.req(`https://scapi.rockstargames.com/crew/acceptInvite?crewId=${id}`, {
      method: 'POST'
    })
  }

  /**
   * Reject a crew invite you've got
   * @param id ID of the crew
   */
  @EmptyResponse
  @DELETE('crews/invites/:id')
  rejectCrewInvite(@int id: number) {
    return this.req(`https://scapi.rockstargames.com/crew/declineInvite?crewId=${id}`, {
      method: 'POST'
    })
  }

  /**
   * Fetch friend request you've got
   */
  @GET('friends/invites')
  fetchFriendInvites() {
    return this.req('https://scapi.rockstargames.com/friends/getInvites', {
      format: (data: any) => data.rockstarAccountList.rockstarAccounts.map((acc: any) => ({
        id: acc.rockstarId,
        name: acc.displayName,
        message: acc.message,
        type: 'friendInvite'
      }))
    })
  }

  /**
   * Accept a friend request
   * @param id PlayerID
   */
  @EmptyResponse
  @PUT('friends/invites/:id')
  acceptFriendInvite(@int id: number) {
    return this.req(`https://scapi.rockstargames.com/friends/acceptInvite?rockstarId=${id}`, {
      method: 'POST'
    })
  }

  /**
   * Decline a friend invite
   * @param id PlayerID
   */
  @EmptyResponse
  @DELETE('friends/invites/:id')
  declineFriendInvite(@int id: number) {
    return this.req(`https://scapi.rockstargames.com/friends/cancelInvite?rockstarId=${id}`, {
      method: 'DELETE'
    })
  }
}

export interface InvitesFetchCrewInvites {
  id: number,
  name: string,
  message: string,
  type: 'crewInvite'
}

export interface InvitesFetchFriendInvites {
  id: number,
  name: string,
  message: string,
  type: 'friendInvite'
}
