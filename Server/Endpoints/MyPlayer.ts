import { Routes, GET, PUT, EmptyResponse, int, DELETE } from "../Decorators";

@Routes('players/@me')
export default class MyPlayer {
  constructor(private req: any) {}

  /**
   * Fetch the conversation list
   * @param page page number
   */
  @GET('conversations/:page')
  conversations(@int page: number) {
    const url = `https://socialclub.rockstargames.com/Message/GetConversationList?pageIndex=${page}`;
    return this.req(url, {
      reqToken: true,
      format: (data: any) => ({
        more: data.HasMore,
        page: data.NextPageIndex - 1,
        players: data.Users.map((c: any) => ({
          avatarURL: c.AvatarUrl,
          newMessages: c.HasNewMessages,
          lastReceived: c.LastReceivedOn,
          id: c.RockstarId,
          name: c.ScNickname,
          amount: c.Total
        }))
      })
    })
  }

  /**
   * Remove an activity from your player feed
   * @param id Activity ID
   */
  @EmptyResponse
  @DELETE('feed/activities/:id')
  deleteActivity(@int id: number) {
    return this.req(`https://scapi.rockstargames.com/feed/deletePost?postId=${id}`, {
      method: 'DELETE'
    })
  }

  /**
   * Send a friend request to a given player
   * @param id PlayerID
   */
  @EmptyResponse
  @PUT('friends/:id')
  sendFriendRequest(@int id: number) {
    return this.req(`https://socialclub.rockstargames.com/friends/UpdateFriend`, {
      method: 'PUT',
      reqToken: true,
      body: { id, op: 'addfriend' }
    })
  }
}

export interface MyPlayerConversations {
  more: boolean,
  page: number,
  players: [{
    avatarURL: string,
    newMessages: boolean,
    lastReceived: string,
    id: number,
    name: string,
    amount: number
  }]
}
