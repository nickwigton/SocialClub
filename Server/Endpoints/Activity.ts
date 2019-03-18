import { Routes, GET } from "../Decorators";

@Routes('')
export default class Activity {
  constructor(public req: any) {}

  /**
   * Fetch the activitycounts for the logged in player. This is a way to check for new notifications, since the SocialClub Websocket is not yet supported
   * Note: Consider doing this every 5 minutes
   */
  @GET('activity')
  public activityCounts() {
    return this.req('https://scapi.rockstargames.com/notification/activityCounts?includeNotificationCount=false')
  }
}

export interface ActivityActivityCounts {
  crewInvites: number,
  friendInvites: number,
  unreadMessages: number,
  total: number,
  status: boolean,
  error?: any
}
