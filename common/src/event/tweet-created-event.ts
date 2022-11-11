import { Queue } from "./queue";

export interface TweetCreatedContent {
  tweetId: string;
  description: string;
  userId: string;
  name: string;
  avatar: string;
}

export interface TweetCreatedEvent {
  queue: Queue.TweetCreated;
  content: TweetCreatedContent;
}
