import { Queue } from "./queue";
import { NotificationCreatedContent } from "./types/notification";

export interface NotificationCreatedEvent {
  queue: Queue.NotificationCreated;
  content: NotificationCreatedContent;
}
