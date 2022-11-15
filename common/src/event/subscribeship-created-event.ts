import { Queue } from "./queue";

export interface SubscribeshipCreatedContent {
  subscriberId: string;
  subscribingId: string;
  name: string;
  avatar: string;
  createdAt: string;
}

export interface SubscribeshipCreatedEvent {
  queue: Queue.SubscribeshipCreated;
  content: SubscribeshipCreatedContent;
}
