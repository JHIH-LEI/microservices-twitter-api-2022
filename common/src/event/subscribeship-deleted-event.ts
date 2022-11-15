import { Queue } from "./queue";

export interface SubscribeshipDeletedContent {
  subscriberId: string;
  subscribingId: string;
}

export interface SubscribeshipDeletedEvent {
  queue: Queue.SubscribeshipDeleted;
  content: SubscribeshipDeletedContent;
}
