export class UserFollowedEvent {
  constructor(
    public readonly followerId: string,
    public readonly followerUsername: string,
    public readonly followingId: string,
  ) {}
}

export class UserUnfollowedEvent {
  constructor(
    public readonly followerId: string,
    public readonly followingId: string,
  ) {}
}
