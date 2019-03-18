export default function(data: any) {
  const { rockstarAccount: acc, crews } = data.accounts[0];
  return {
    id: acc.rockstarId,
    name: acc.name,
    relation: acc.relationship,
    blockable: acc.allowBlock,
    statsOpen: acc.allowStatCompare,
    profileHidden: acc.profileHidden,
    wallHidden: acc.wallHidden,
    country: acc.countryCode,
    friendCount: acc.friendCount,
    crewMate: acc.isClanMate,
    gamesOwned: acc.gamesOwned,
    primaryCrew: {
      id: acc.primaryClanId,
      name: acc.primaryClanName,
      color: acc.primaryClanColor,
      tag: acc.primaryClanTag,
      rank: acc.primaryClanRankOrder
    },
    crews: !crews ? [] : crews.map((c: any) => ({
      permissions: {
        join: c.canJoin,
        leave: c.canLeave,
        invite: c.canInvite,
        recruit: c.canRecruit,
        requestInvite: c.canRequestInvite
      },
      createdAt: c.createdAt,
      color: c.crewColour,
      id: c.crewId,
      motto: c.crewMotto,
      name: c.crewName,
      tag: c.crewTag,
      type: c.crewType,
      division: c.division,
      memberCount: c.memberCount,
      open: c.isOpen,
      primary: c.isPrimary,
      private: c.isPrivate
    }))
  }
}
