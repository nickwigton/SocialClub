export default function(data: any) {
  return {
    id: data.crewId,
    name: data.crewName,
    tag: data.crewTag,
    motto: data.crewMotto,
    memberCount: data.memberCount,
    private: data.isPrivate,
    open: data.isOpen,
    color: data.crewColour,
    division: data.devision,
    joinDisabled: data.canJoinDisabled,
    me: {
      primary: data.isPrimary,
      rank: data.rankOrder,
      founder: data.isFounderCrew,
      pending: data.isJoinRequestPending,
      member: data.isMember
    },
    permissions: {
      invite: data.canInvite,
      leave: data.canLeave,
      join: data.canJoin,
    },
    createdAt: data.createdAt
  }
}
