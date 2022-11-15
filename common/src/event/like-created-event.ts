import { Queue } from "./queue";

export interface LikeCreatedContent {
  id: string;
  tweetId: string;
  userId: string;
  name: string;
  avatar: string;
  createdAt: string;
}

export interface LikeCreatedEvent {
  queue: Queue.LikeCreated;
  content: LikeCreatedContent;
}
