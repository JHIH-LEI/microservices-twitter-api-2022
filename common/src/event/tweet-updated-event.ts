import { Queue } from "./queue";

export interface TweetUpdatedContent {
  id: string;
  userId: string;
  description: string;
  updatedAt: string;
  version: number;
}

export interface TweetUpdatedEvent {
  queue: Queue.TweetUpdated;
  content: TweetUpdatedContent;
}
