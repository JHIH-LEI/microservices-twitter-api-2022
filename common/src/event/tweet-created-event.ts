import { Queue } from "./queue";

export interface TweetCreatedContent {
  id: string;
  userId: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface TweetCreatedEvent {
  queue: Queue.TweetCreated;
  content: TweetCreatedContent;
}
