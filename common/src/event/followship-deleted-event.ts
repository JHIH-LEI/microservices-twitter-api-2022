import { Queue } from "./queue";

export interface FollowshipDeletedContent {
  followerId: string;
  followingId: string;
}

export interface FollowshipDeletedEvent {
  queue: Queue.FollowshipDeleted;
  content: FollowshipDeletedContent;
}
