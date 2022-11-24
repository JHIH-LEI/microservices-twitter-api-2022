import { Queue } from "./queue";

export interface FollowshipCreatedContent {
  followerId: string;
  followingId: string;
  createdAt: string;
}

export interface FollowshipCreatedEvent {
  queue: Queue.FollowshipCreated;
  content: FollowshipCreatedContent;
}
