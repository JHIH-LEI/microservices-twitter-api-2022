import { Queue } from "./queue";

export interface TweetDeletedContent {
  id: string;
  version: number;
}

export interface TweetDeletedEvent {
  queue: Queue.TweetDeleted;
  content: TweetDeletedContent;
}
