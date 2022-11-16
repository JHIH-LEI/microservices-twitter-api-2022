import { Queue } from "./queue";

export interface LikeCreatedContent {
  id: string;
  tweetId: string;
  userId: string;
  createdAt: string;
}

export interface LikeCreatedEvent {
  queue: Queue.LikeCreated;
  content: LikeCreatedContent;
}
