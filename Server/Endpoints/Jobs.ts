import { Routes, GET } from "../Decorators";

@Routes('jobs')
export default class Jobs {
  constructor(public req: any) {}

  /**
   * Search for a job
   */
  @GET('search/:query')
  public search(query: string) {
    return this.req(`https://scapi.rockstargames.com/search/mission?dateRange=last7&sort=likes&platform=pc&title=gtav&includeCommentCount=true&pageSize=25&searchTerm=${query}`,  {
      format: (data: any) => data.content.items.map((i: any) => ({
        createdAt: i.createdDate,
        category: i.category,
        description: i.desc,
        dislikes: i.dislikeCount,
        id: i.id,
        image: i.imgSrc,
        likes: i.likeCount,
        name: i.name,
        platform: i.platform,
        timesPlayed: i.playedCount,
        title: i.title,
        type: i.type,
        userID: i.userID
      }))
    })
  }
}

export interface JobsSearch {
  id: string,
  createdAt: string,
  category: string,
  description: string,
  likes: number,
  dislikes: number,
  image: string,
  name: string,
  platform: string,
  timesPlayed: number,
  title: string,
  type: string,
  userID: number
}
