import { Queue } from "./queue";

/**
 * id is mongodb id
 */
export interface ReplyCreatedContent {
  id: string;
  tweetId: string;
  comment: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface ReplyCreatedEvent {
  queue: Queue.ReplyCreated;
  content: ReplyCreatedContent;
}
