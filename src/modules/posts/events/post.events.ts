export class PostCreatedEvent {
  constructor(
    public readonly postId: string,
    public readonly userId: string,
    public readonly username: string,
  ) {}
}

export class PostDeletedEvent {
  constructor(
    public readonly postId: string,
    public readonly userId: string,
  ) {}
}

export class PostLikedEvent {
  constructor(
    public readonly postId: string,
    public readonly postOwnerId: string,
    public readonly likerId: string,
    public readonly likerUsername: string,
  ) {}
}

export class PostUnlikedEvent {
  constructor(
    public readonly postId: string,
    public readonly userId: string,
  ) {}
}

export class CommentAddedEvent {
  constructor(
    public readonly commentId: string,
    public readonly postId: string,
    public readonly postOwnerId: string,
    public readonly commenterId: string,
    public readonly commenterUsername: string,
  ) {}
}
